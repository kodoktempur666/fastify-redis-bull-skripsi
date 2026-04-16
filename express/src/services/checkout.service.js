import { createOrder, updateOrderToPaid } from "../models/order.model.js";

import { getCartById, updateCartStatus } from "../models/cart.model.js";

import { getCartItemsByCartId } from "../models/cartItem.model.js";
import { insertOrderItem } from "../models/orderItem.model.js";
import { stockQueue } from "../queues/stock.queue.js";

export const processCheckout = async ({ cartId, userId }) => {
  const cart = await getCartById(cartId);
  if (!cart || cart.status !== "active") return;

  const items = await getCartItemsByCartId(cartId);
  if (items.length === 0) return;

  let total = 0;
  for (const item of items) {
    total += item.price_at_add * item.quantity;
  }

  const order = await createOrder(userId, cartId, total);

  // mock payment
  await new Promise((r) => setTimeout(r, 20));

  await updateOrderToPaid(order.id);
  await updateCartStatus(cartId, "checked_out");

  for (const item of items) {
    await insertOrderItem(
      order.id,
      item.product_id,
      item.quantity,
      item.price_at_add,
    );

    await stockQueue.add("reduceStock", {
      productId: item.product_id,
      quantity: item.quantity,
    });
  }

  console.log("Checkout success:", order.id);
};


