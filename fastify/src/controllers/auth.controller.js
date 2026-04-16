import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createUser, findUserByEmail } from "../models/user.model.js";
import { handleResponse } from "../utils/response.js";
import { emailQueue } from "../queues/email.queue.js";

const JWT_SECRET = "123";

export const register = async (request, reply) => {
  const { email, password, name } = request.body;

  try {
    const existing = await findUserByEmail(email);
    if (existing) return handleResponse(reply, 400, "Email already exists");

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser(email, passwordHash, name, false);

    await emailQueue.add(
      "sendEmail",
      { email: user.email, name: user.name }
    );

    return handleResponse(reply, 201, "User registered", user);
  } catch (err) {
    reply.status(500).send({ message: err.message });
  }
};

export const login = async (request, reply) => {
  const { email, password } = request.body;

  try {
    const user = await findUserByEmail(email);
    if (!user) return handleResponse(reply, 401, "Invalid credentials");

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return handleResponse(reply, 401, "Invalid credentials");

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    return handleResponse(reply, 200, "Login success", { token });
  } catch (err) {
    reply.status(500).send({ message: err.message });
  }
};