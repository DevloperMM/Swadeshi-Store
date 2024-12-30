import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import redis from "../lib/redis.js";
import jwt from "jsonwebtoken";

const options = {
  httpOnly: true,
  cookies: true,
  secure: process.env.NODE_ENV === "production",
};

const generateTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    return { accessToken, refreshToken };
  } catch (err) {
    throw new ApiError(500, "Error occured in generating tokens");
  }
};

export const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const isUser = await User.findOne({ email });
  if (isUser) {
    throw new ApiError(400, "This email is already registered");
  }

  const user = await User.create({ name, email, password });
  if (!user) {
    throw new ApiError(500, "Try registering again in a moment");
  }

  const { accessToken, refreshToken } = await generateTokens(user._id);
  await redis.set(`refreshToken:${user._id}`, refreshToken);

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
    throw new ApiError(404, "User does not exit");
  }

  const isPassValid = await user.isPasswordCorrect(password);

  if (!isPassValid) {
    throw new ApiError(404, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateTokens(user._id);
  await redis.set(`refreshToken:${user._id}`, refreshToken);

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, { user }, "Login successful!"));
});

export const logout = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const userId = decodedToken?._id;

    const userRefToken = await redis.get(`refreshToken:${userId}`);

    if (incomingRefreshToken !== userRefToken) {
      throw new ApiError(401, "Refresh token is expired");
    }

    const user = await User.findById(userId);

    await redis.del(`refreshToken:${userId}`);

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, { user }, "Logout successful!"));
  } catch (error) {
    throw new ApiError(500, "Server error while logging out");
  }
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const userRefToken = await redis.get(`refreshToken:${decodedToken?._id}`);

    if (incomingRefreshToken !== userRefToken) {
      throw new ApiError(401, "Refresh token is expired");
    }

    const { accessToken, refreshToken } = await generateTokens(
      decodedToken?._id
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "Access Token Refreshed"
        )
      );
  } catch (err) {
    throw new ApiError(401, err?.message || "Invalid Refresh Token");
  }
});
