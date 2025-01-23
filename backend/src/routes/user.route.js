import { Router } from "express";
import {
  signup,
  login,
  logout,
  refreshAccessToken,
  getProfile,
} from "../controllers/user.controller.js";
import { authProtect } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/refresh-token", refreshAccessToken);

//secured routes
router.post("/logout", logout);
router.get("/profile", authProtect, getProfile);

export default router;
