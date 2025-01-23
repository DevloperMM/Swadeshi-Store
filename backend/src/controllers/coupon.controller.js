import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Coupon } from "../models/coupon.model.js";
import { ApiError } from "../utils/ApiError.js";

export const getCoupon = asyncHandler(async (req, res) => {
  try {
    const coupon = await Coupon.findOne({
      userId: req.user._id,
      isActive: true,
    });

    if (!coupon) {
      throw new ApiError(400, "No coupon found for this order");
    }

    return res.status(200).json(new ApiResponse(200, coupon, "Coupon found"));
  } catch (err) {
    throw new ApiError(
      err.statusCode || 500,
      err?.message || "Try fetching coupon again"
    );
  }
});

export const validateCoupon = asyncHandler(async (req, res) => {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOne({
      code,
      userId: req.user._id,
      isActive: true,
    });

    if (!coupon) {
      throw new ApiError(400, "No such coupon exists");
    }

    if (coupon.expiryDate < new Date()) {
      coupon.isActive = false;
      await coupon.save();
      throw new ApiError(400, "Coupon has expired");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, coupon, "Coupon is valid"));
  } catch (err) {
    throw new ApiError(
      err.statusCode || 500,
      err?.message || "Try validating coupon again"
    );
  }
});
