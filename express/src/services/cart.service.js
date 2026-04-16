import {
  findCartItem,
  insertCartItem,
  updateCartItemQuantity,
} from "../models/cartItem.model.js";

import { getProductPrice } from "../models/product.model.js";
import { updateCartTimestamp } from "../models/cart.model.js";

export const processCartItem = async ({ cartId, productId, quantity }) => {
  const price = await getProductPrice(productId);
  if (!price) return;

  const existing = await findCartItem(cartId, productId);

  if (existing) {
    await updateCartItemQuantity(
      existing.id,
      existing.quantity + quantity
    );
  } else {
    await insertCartItem(cartId, productId, quantity, price);
  }

  await updateCartTimestamp(cartId);

  console.log("Cart updated:", cartId);
};