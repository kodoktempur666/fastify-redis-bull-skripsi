import { createOrder, updateOrderToPaid } from "../models/order.model.js";

import { getCartById, updateCartStatus } from "../models/cart.model.js";

import { getCartItemsByCartId } from "../models/cartItem.model.js";
import { insertOrderItem } from "../models/orderItem.model.js";
import { stockQueue } from "../queues/stock.queue.js";


const mockPayment = async (orderId, totalAmount) => {
  const delay = Math.floor(Math.random() * 40) + 10;

  await new Promise((resolve) => setTimeout(resolve, delay));

  const success = true; 
  const mockResponse = {
    status: success ? "success" : "failure",
    transaction_id: `mock_txn_${Date.now()}_${orderId}`,
    amount: totalAmount,
  };

  await createPaymentMock(orderId, mockResponse, delay);

  return success;
};



export const processCheckout = async ({ cartId, userId }) => {
  console.log("🚀 Start checkout:", { cartId, userId });

  const cart = await getCartById(cartId);

  if (!cart) {
    console.log("❌ Cart not found");
    return;
  }

  if (cart.status !== "active") {
    console.log("❌ Cart not active:", cart.status);
    return;
  }

  const items = await getCartItemsByCartId(cartId);

  if (items.length === 0) {
    console.log("❌ Cart empty");
    return;
  }

  console.log("✅ Items found:", items.length);

  let total = 0;
  for (const item of items) {
    total += item.price_at_add * item.quantity;
  }

  const order = await createOrder(userId, cartId, total);

  console.log("✅ Order created:", order.id);

  const paymentSuccess = await mockPayment(order.id, total);

  if (!paymentSuccess) {
    console.log("Payment failed:", order.id);
    return;
  }

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

  console.log("🔥 Checkout success:", order.id);
};

