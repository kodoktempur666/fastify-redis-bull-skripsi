import {
  createCart,
  getCartById,
  updateCartTimestamp,
} from "../models/cart.model.js";
import {
  findCartItem,
  insertCartItem,
  updateCartItemQuantity,
  getCartItemsByCartId,
} from "../models/cartItem.model.js";
import { getProductPrice } from "../models/product.model.js";
import { handleResponse } from "../utils/response.js";
import { cartQueue } from "../queues/cart.queue.js";

export const createCartHandler = async (request, reply) => {
  const userId = request.userId || null;

  try {
    const cart = await createCart(userId, null);
    return handleResponse(reply, 201, "Cart created", { cartId: cart.id });
  } catch (err) {
    reply.status(500).send({ message: err.message });
  }
};

export const addCartItem = async (request, reply) => {
  const { cartId } = request.params;
  const { productId, quantity } = request.body;

  await cartQueue.add("addItem", { cartId, productId, quantity });

  return handleResponse(reply, 202, "Item queued");
};


export const updateCartItem = async (request, reply) => {
  const { cartId, itemId } = request.params;
  const { quantity } = request.body;
  try {
    await updateCartItemQuantity(itemId, quantity);
    await updateCartTimestamp(cartId);
    handleResponse(reply, 200, "Cart item updated");
  } catch (err) {
    reply.status(500).send({ status: 500, message: err.message });
  }
};

export const getCart = async (request, reply) => {
  const { cartId } = request.params;
  try {
    const cart = await getCartById(cartId);
    if (!cart) return handleResponse(reply, 404, "Cart not found");
    const items = await getCartItemsByCartId(cartId);
    handleResponse(reply, 200, "Cart fetched", { cart, items });
  } catch (err) {
    reply.status(500).send({ status: 500, message: err.message });
  }
};
