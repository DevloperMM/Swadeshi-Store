import { Router } from "express";
import {
  signup,
  login,
  logout,
  refreshAccessToken,
} from "../controllers/auth.controller.js";

const router = Router();

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/refresh-token").post(refreshAccessToken);

//secured routes
router.route("/logout").post(logout);

export default router;
