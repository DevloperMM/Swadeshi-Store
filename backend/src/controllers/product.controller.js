import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import redis from "../lib/redis.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../lib/cloudinary.js";
import mongoose from "mongoose";

export const getAllProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({});
    return res
      .status(200)
      .json(
        new ApiResponse(200, products, "All products fetched successfully")
      );
  } catch (err) {
    throw new ApiError(
      500,
      err?.message || "Try fetching all products in a moment again"
    );
  }
});

export const getFeaturedProducts = asyncHandler(async (req, res) => {
  try {
    let featuredProducts = await redis.get("featured_products");
    if (featuredProducts) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            featuredProducts,
            "Featured products fetched successfully"
          )
        );
    }

    featuredProducts = await Product.find({ isFeatured: true }).lean();
    if (!featuredProducts) {
      throw new ApiError(404, "No featured products found");
    }

    await redis.set("featured_products", JSON.stringify(featuredProducts), {
      ex: 1800,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          featuredProducts,
          "Featured products fetched successfully"
        )
      );
  } catch (err) {
    throw new ApiError(
      err.statusCode || 500,
      err?.message || "Try fetching featured products in a moment again"
    );
  }
});

export const createProduct = asyncHandler(async (req, res) => {
  try {
    const { title, description, price, category } = req.body;
    if (!(title && description && price && category)) {
      throw new ApiError(400, "All fields are required");
    }

    const imagePath = req.file?.path;
    if (!imagePath) {
      throw new ApiError(400, "Product image can't be empty");
    }

    const image = await uploadOnCloudinary(imagePath);

    const product = await Product.create({
      title,
      description,
      price,
      image: image.secure_url,
      category,
    });

    if (!product) {
      await deleteFromCloudinary(image.secure_url);
      throw new ApiError(500, "Failed to create product");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, product, "Product listed successfully"));
  } catch (err) {
    throw new ApiError(
      err.statusCode || 500,
      err?.message || "Try creating product in a moment again"
    );
  }
});

export const deleteProduct = asyncHandler(async (req, res) => {
  try {
    const { productId } = req.params;
    if (!mongoose.isValidObjectId(productId)) {
      throw new ApiError(400, "Product ID is not valid");
    }

    const product = await Product.findByIdAndDelete(productId);
    if (!product) {
      throw new ApiError(402, "No such product exist");
    }

    await deleteFromCloudinary(product.image);

    return res
      .status(200)
      .json(new ApiResponse(200, product, "Product unlisted successfully"));
  } catch (err) {
    throw new ApiError(
      err.statusCode || 500,
      err?.message || "Try deleting product in a moment again"
    );
  }
});

export const toggleFeatured = asyncHandler(async (req, res) => {
  try {
    const { productId } = req.params;
    const isProduct = await Product.findById(productId);
    if (!isProduct) {
      throw new ApiError(400, "No such product exist");
    }

    const product = await Product.findByIdAndUpdate(
      productId,
      { $set: { isFeatured: !isProduct.isFeatured } },
      { new: true }
    );

    const featuredProducts = await Product.find({ isFeatured: true }).lean();
    await redis.set("featured_products", JSON.stringify(featuredProducts), {
      ex: 1800,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, product, "Feature status toggled successfully")
      );
  } catch (err) {
    throw new ApiError(
      err.statusCode || 500,
      err?.message || "Try toggle featuring in a moment again"
    );
  }
});

export const getProductsByCategory = asyncHandler(async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category });
    if (!products) {
      throw new ApiError(404, "No products found for this category");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          products,
          "This category products fetched successfully"
        )
      );
  } catch (err) {
    throw new ApiError(
      err.statusCode || 500,
      err?.message || "Try getting category products in a moment again"
    );
  }
});

export const getRecommendedProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.aggregate([
      { $sample: { size: 3 } },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          image: 1,
          price: 1,
        },
      },
    ]);

    return res
      .status(200)
      .json(
        new ApiResponse(200, products, "Similar products fetched successfully")
      );
  } catch (err) {
    throw new ApiError(
      500,
      err?.message || "Try getting other products in a moment again"
    );
  }
});
