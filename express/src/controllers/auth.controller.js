import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createUser, findUserByEmail } from "../models/user.model.js";
import { emailQueue } from "../queues/email.queue.js";

const JWT_SECRET = "123";

export const register = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(400).json({
        status: 400,
        message: "Email already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await createUser(email, passwordHash, name, false);

    await emailQueue.add("sendEmail", {
      email: user.email,
      name: user.name,
    });

    return res.status(201).json({
      status: 201,
      message: "User registered",
      data: user,
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: err.message,
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        status: 401,
        message: "Invalid credentials",
      });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({
        status: 401,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.status(200).json({
      status: 200,
      message: "Login success",
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: err.message,
    });
  }
};