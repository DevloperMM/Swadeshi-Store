import { Router } from "express";
import { authProtect, adminProtect } from "../middlewares/auth.middleware.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  getAnalytics,
  getDailySales,
} from "../controllers/analytics.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get(
  "/",
  authProtect,
  adminProtect,
  asyncHandler(async (req, res) => {
    try {
      const analyticsData = await getAnalytics();

      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

      const dailySalesData = await getDailySales(startDate, endDate);

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { analyticsData, dailySalesData },
            "Analytics fetched successfully!"
          )
        );
    } catch (err) {
      throw new ApiError(
        500,
        err?.message || "Failed to fetch dashboard! Try again"
      );
    }
  })
);

export default router;
