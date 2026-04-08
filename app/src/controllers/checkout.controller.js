import {
  editCheckout,
  getCheckout,
  patchCheckout,
} from "../models/checkout.models.js";

import checkoutQueue from "../queue/checkout.queue.js";
import connection from "../config/redis.js";

const handleResponse = (reply, status, message, data = null) => {
  reply.code(status).send({
    status,
    message,
    data,
  });
};

// ✅ CREATE → QUEUE (BullMQ)
export const createCheckoutController = async (request, reply) => {
  try {
    const { name, amount, item } = request.body;

    const job = await checkoutQueue.add("createCheckout", {
      name,
      amount,
      item,
    });

    return handleResponse(reply, 202, "Checkout is being processed", {
      jobId: job.id,
    });
  } catch (error) {
    return handleResponse(reply, 500, error.message);
  }
};

// ✅ GET → CACHE (Redis)
export const getCheckoutController = async (request, reply) => {
  try {
    const { id } = request.params;
    const cacheKey = `checkout:${id}`;

    // cek cache
    const cached = await connection.get(cacheKey);
    if (cached) {
      return handleResponse(reply, 200, "From cache", JSON.parse(cached));
    }

    // ambil dari DB
    const data = await getCheckout(id);

    if (data) {
      await connection.set(cacheKey, JSON.stringify(data), "EX", 60);
    }

    return handleResponse(reply, 200, "From database", data);
  } catch (error) {
    return handleResponse(reply, 500, error.message);
  }
};

// ✅ PUT → DIRECT + INVALIDATE CACHE
export const editCheckoutController = async (request, reply) => {
  try {
    const { id } = request.params;
    const { name, amount, item } = request.body;

    const updatedCheckout = await editCheckout(id, name, amount, item);

    // hapus cache
    await connection.del(`checkout:${id}`);

    return handleResponse(reply, 200, "Checkout updated", updatedCheckout);
  } catch (error) {
    return handleResponse(reply, 500, error.message);
  }
};

// ✅ PATCH → DIRECT + INVALIDATE CACHE
export const patchCheckoutController = async (request, reply) => {
  try {
    const { id } = request.params;
    const { name, amount, item } = request.body;

    const patchedCheckout = await patchCheckout(
      id,
      name ?? null,
      amount ?? null,
      item ?? null
    );

    // hapus cache
    await connection.del(`checkout:${id}`);

    return handleResponse(reply, 200, "Checkout patched", patchedCheckout);
  } catch (error) {
    return handleResponse(reply, 500, error.message);
  }
};