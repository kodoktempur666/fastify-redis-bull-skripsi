import { getOrderStatus } from '../models/order.model.js';
import { checkoutQueue } from "../queues/checkout.queue.js";
import { handleResponse } from "../utils/response.js";


export const checkout = async (req, res, next) => {
  const { cartId } = req.params;
  const userId = req.userId;

  await checkoutQueue.add(
    "checkout",
    { cartId, userId },
    { jobId: `checkout-${cartId}` } // idempotency
  );

  return handleResponse(res, 202, "Checkout processing");
};

export const getOrder = async (req, res, next) => {
  const { orderId } = req.params;
  try {
    const order = await getOrderStatus(orderId);
    if (!order) return handleResponse(res, 404, 'Order not found');
    handleResponse(res, 200, 'Order fetched', order);
  } catch (err) {
    next(err);
  }
};