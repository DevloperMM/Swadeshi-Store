import { Router } from "express";
import { createOrder, verifyOrder } from "../controllers/payment.controller.js";
import { authProtect } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/create-order", authProtect, createOrder);
router.post("/verify-order", authProtect, verifyOrder);

export default router;
