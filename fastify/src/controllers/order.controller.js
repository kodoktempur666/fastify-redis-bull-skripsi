import {  getOrderStatus } from '../models/order.model.js';

import { handleResponse } from '../utils/response.js';
import { checkoutQueue } from "../queues/checkout.queue.js";

export const checkout = async (request, reply) => {
  const { cartId } = request.params;
  const userId = request.userId;

  await checkoutQueue.add(
    "checkout",
    { cartId, userId },
    { jobId: `checkout-${cartId}` } // idempotency
  );

  return handleResponse(reply, 202, "Checkout processing");
};

export const getOrder = async (request, reply) => {
  const { orderId } = request.params;
  try {
    const order = await getOrderStatus(orderId);
    if (!order) return handleResponse(reply, 404, 'Order not found');
    handleResponse(reply, 200, 'Order fetched', order);
  } catch (err) {
    reply.status(500).send({ status: 500, message: err.message });
  }
};