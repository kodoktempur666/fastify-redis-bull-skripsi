import { createOrder } from "../models/order.model.js";

import { getCartById } from "../models/cart.model.js";

import { getCartItemsByCartId } from "../models/cartItem.model.js";
import { insertOrderItem } from "../models/orderItem.model.js";

import { Queue } from "bullmq";
import redis from "../config/redis.js";

const stockQueue = new Queue("stockQueue", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 1000 },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

export const processCheckout = async ({ cartId }) => {
  const cart = await getCartById(cartId);

  if (!cart) {
    console.log("Cart not found");
    return;
  }

  if (cart.status !== "active") {
    console.log("Cart not active:", cart.status);
    return;
  }

  const items = await getCartItemsByCartId(cartId);

  if (items.length === 0) {
    console.log("Cart empty");
    return;
  }

  let total = 0;
  for (const item of items) {
    total += item.price_at_add * item.quantity;
  }

  const order = await createOrder(cartId, total);

  await insertOrderItem(order.id, items);

  const safeItems = items.map((item) => ({
    product_id: Number(item.product_id),
    quantity: Number(item.quantity),
  }));

  await stockQueue.add("reduceStock", {
    safeItems,
  });

  console.log("Checkout success:", order.id);
};
