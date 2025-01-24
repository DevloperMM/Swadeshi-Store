import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import redis from "../lib/redis.js";
import jwt from "jsonwebtoken";

const options = {
  httpOnly: true,
  cookies: true,
  sameSite: "strict",
  secure: process.env.NODE_ENV === "production",
};

const generateTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    return { accessToken, refreshToken };
  } catch (err) {
    throw new ApiError(
      500,
      err?.message || "Error occured in generating tokens"
    );
  }
};

export const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const isUser = await User.findOne({ email });
  if (isUser) {
    throw new ApiError(400, "This email is already registered");
  }

  const mailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!mailRegex.test(email)) {
    throw new ApiError(400, "Enter valid email address");
  }

  const user = await User.create({ name, email, password });
  if (!user) {
    throw new ApiError(500, "Try registering in a moment again");
  }

  const { accessToken, refreshToken } = await generateTokens(user._id);
  await redis.set(`refreshToken:${user._id}`, refreshToken, {
    ex: eval(process.env.REFRESH_TOKEN_EXPIRY),
  });

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, { user }, "Account created successfully!"));
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "This email is not registered");
  }

  const isPassValid = await user.isPasswordCorrect(password);

  if (!isPassValid) {
    throw new ApiError(404, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateTokens(user._id);
  await redis.set(`refreshToken:${user._id}`, refreshToken, {
    ex: eval(process.env.REFRESH_TOKEN_EXPIRY),
  });

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, { user }, "Login successful!"));
});

export const logout = asyncHandler(async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      await redis.del(`refreshToken:${decoded._id}`);
    }

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, {}, "Logout successful!"));
  } catch (err) {
    throw new ApiError(
      500,
      err?.message || "Try logging out in a moment again"
    );
  }
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(400, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const userRefToken = await redis.get(`refreshToken:${decodedToken?._id}`);

    if (incomingRefreshToken !== userRefToken) {
      throw new ApiError(400, "Refresh token has expired");
    }

    const { accessToken, refreshToken } = await generateTokens(
      decodedToken?._id
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .json(new ApiResponse(200, "Access Token Refreshed"));
  } catch (err) {
    throw new ApiError(
      err.statusCode || 500,
      err?.message || "Try refreshing the token in a moment again"
    );
  }
});

export const getProfile = asyncHandler(async (req, res) => {
  try {
    return res
      .status(200)
      .json(new ApiResponse(200, { user: req.user }, "User profile fetched"));
  } catch (err) {
    throw new ApiError(500, err?.message || "Failed to fetch user profile");
  }
});
