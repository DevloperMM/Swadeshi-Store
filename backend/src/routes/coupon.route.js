import { Router } from "express";
import { authProtect } from "../middlewares/auth.middleware.js";
import { getCoupon, validateCoupon } from "../controllers/coupon.controller.js";

const router = Router();

router.get("/", authProtect, getCoupon);
router.post("/validate", authProtect, validateCoupon);

export default router;
