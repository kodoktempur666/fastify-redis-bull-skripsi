import { createCart, getCartById, updateCartTimestamp } from '../models/cart.model.js';
import { findCartItem, insertCartItem, updateCartItemQuantity, getCartItemsByCartId } from '../models/cartItem.model.js';
import { getProductPrice } from '../models/product.model.js';
import { cartQueue } from "../queues/cart.queue.js";
import { handleResponse } from "../utils/response.js";

export const createCartHandler = async (req, res, next) => {
  const userId = req.userId || null;

  try {
    const cart = await createCart(userId, null);
    return handleResponse(res, 201, "Cart created", { cartId: cart.id });
  } catch (err) {
    next(err);
  }
};

export const addCartItem = async (req, res, next) => {
  const { cartId } = req.params;
  const { productId, quantity } = req.body;

  await cartQueue.add("addItem", { cartId, productId, quantity });

  return handleResponse(res, 202, "Item queued");
};

export const updateCartItem = async (req, res, next) => {
  const { cartId, itemId } = req.params;
  const { quantity } = req.body;
  try {
    await updateCartItemQuantity(itemId, quantity);
    await updateCartTimestamp(cartId);
    handleResponse(res, 200, 'Cart item updated');
  } catch (err) {
    next(err);
  }
};

export const getCart = async (req, res, next) => {
  const { cartId } = req.params;
  try {
    const cart = await getCartById(cartId);
    if (!cart) return handleResponse(res, 404, 'Cart not found');
    const items = await getCartItemsByCartId(cartId);
    handleResponse(res, 200, 'Cart fetched', { cart, items });
  } catch (err) {
    next(err);
  }
};