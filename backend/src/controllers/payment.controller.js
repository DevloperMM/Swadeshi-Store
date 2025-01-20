import crypto from "crypto";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Coupon } from "../models/coupon.model.js";
import { Order } from "../models/order.model.js";
import { User } from "../models/user.model.js";
import rzp from "../lib/razorpay.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

async function createNewCoupon(userId) {
  await Coupon.findOneAndDelete({ userId });

  const newCoupon = await Coupon.create({
    code: `GIFT${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    discount: 10,
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    userId: userId,
  });

  return newCoupon;
}

export const createOrder = asyncHandler(async (req, res) => {
  try {
    const { products, couponCode } = req.body;
    if (!Array.isArray(products) || products.length === 0) {
      throw new ApiError(400, "Empty cart!! Order can't be placed");
    }

    let totalAmt = 0;
    const cartItems = products.map((item) => {
      totalAmt += item.price * item.quantity;
      return {
        product: item._id,
        quantity: item.quantity,
      };
    });

    let coupon = null;
    if (couponCode) {
      coupon = await Coupon.findOne({
        code: couponCode,
        userId: req.user._id,
        isActive: true,
      });

      if (coupon) {
        totalAmt -= totalAmt * (coupon.discount / 100);
      }
    }

    const options = {
      amount: Math.round(totalAmt * 100),
      currency: "INR",
      receipt: `${Date.now()}`,
    };

    const order = await rzp.orders.create(options);
    const info = {
      userId: req.user._id,
      cartItems,
      coupon,
      amount: totalAmt,
    };
    order.metadata = info;

    return res
      .status(200)
      .json(new ApiResponse(200, order, "Order created successfully"));
  } catch (err) {
    throw new ApiError(500, err?.message || "Try again!! Something went wrong");
  }
});

export const verifyOrder = asyncHandler(async (req, res) => {
  try {
    const { orderId, payId, signature, metadata } = req.body;
    const decryptSignature = crypto
      .createHmac("sha256", process.env.RZP_KEY_SECRET)
      .update(`${orderId}|${payId}`)
      .digest("hex");

    if (decryptSignature === signature) {
      const order = await Order.create({
        buyer: new mongoose.Types.ObjectId(metadata.userId),
        products: metadata.cartItems,
        orderTotal: metadata.amount,
        paymentId: payId,
      });

      await User.findByIdAndUpdate(metadata.userId, { cartItems: [] });

      if (metadata.coupon?.code) {
        await Coupon.findOneAndUpdate(
          { code, userId: metadata.userId },
          { isActive: false }
        );
      }

      if (metadata.amount > 4999) {
        await createNewCoupon(metadata.userId);
      }

      return res
        .status(200)
        .json(new ApiResponse(200, order, "Order placed successfully"));
    } else {
      throw new ApiError(400, "Payment failed!!");
    }
  } catch (err) {
    throw new ApiError(500, err?.message || "Payment failed!! Try again");
  }
});
