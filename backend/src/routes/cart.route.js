import { Router } from "express";
import { authProtect } from "../middlewares/auth.middleware.js";
import {
  addItemToCart,
  getItemsInCart,
  removeItemFromCart,
  updateItemQty,
} from "../controllers/cart.controller.js";

const router = Router();

router.get("/", authProtect, getItemsInCart);
router.post("/", authProtect, addItemToCart);
router.delete("/", authProtect, removeItemFromCart);
router.put("/:productId", authProtect, updateItemQty);

export default router;
