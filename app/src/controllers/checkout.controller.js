import {
  getCheckout,
} from "../models/checkout.models.js";

import { createQueue, editQueue, patchQueue } from "../queue/checkout.queue.js";
import connection from "../config/redis.js";

const handleResponse = (reply, status, message, data = null) => {
  reply.code(status).send({
    status,
    message,
    data,
  });
};

export const createCheckoutController = async (request, reply) => {
  await createQueue.add("create", request.body);

  return reply.code(202).send({
    success: true,
    message: "Create checkout queued",
  });
};

export const getCheckoutController = async (request, reply) => {
  try {
    const { id } = request.params;
    // const cacheKey = `checkout:${id}`;

    // const cached = await connection.get(cacheKey);
    // if (cached) {
    //   return handleResponse(reply, 200, "From cache", JSON.parse(cached));
    // }

    const data = await getCheckout(id);

    // if (data) {
    //   await connection.set(cacheKey, JSON.stringify(data), "EX", 60);
    // }

    return handleResponse(reply, 200, "From database", data);
  } catch (error) {
    return handleResponse(reply, 500, error.message);
  }
};

export const editCheckoutController = async (request, reply) => {
  const { id } = request.params;

  await editQueue.add("put", {
    ...request.body,
    id,
  });

  // await connection.del(`checkout:${id}`);

  return reply.code(202).send({
    success: true,
    message: "Checkout update queued",
  });
};

export const patchCheckoutController = async (request, reply) => {
  const { id } = request.params;

  await patchQueue.add("patch", {
    ...request.body,
    id,
  });

  // await connection.del(`checkout:${id}`);

  return reply.code(202).send({
    success: true,
    message: "Checkout patch queued",
  });
};