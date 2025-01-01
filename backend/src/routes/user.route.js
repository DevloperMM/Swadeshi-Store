import { Router } from "express";
import {
  signup,
  login,
  logout,
  refreshAccessToken,
} from "../controllers/user.controller.js";
import { authProtect } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/refresh-token").post(refreshAccessToken);

//secured routes
router.route("/logout").post(authProtect, logout);

export default router;
