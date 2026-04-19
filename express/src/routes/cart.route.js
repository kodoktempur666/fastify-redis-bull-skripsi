import express from "express";
import {
  createCartHandler,
  addCartItem,
  updateCartItem,
  getCart,
} from "../controllers/cart.controller.js";
import { authMiddleware, requireAuth } from "../middleware/auth.middleware.js";

const route = express.Router();

route.post("/carts", createCartHandler);
route.post("/carts/:cartId/items", addCartItem);
route.patch("/carts/:cartId/items/:itemId", updateCartItem);
route.get("/carts/:cartId", getCart);

export default route;
