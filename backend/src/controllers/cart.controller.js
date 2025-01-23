import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getItemsInCart = asyncHandler(async (req, res) => {
  try {
    const user = req.user;

    const productIds = user.cartItems.map((item) => item.product);
    const products = await Product.find({ _id: { $in: productIds } }).lean();

    const cartItems = products.map((product) => {
      const cartItem = user.cartItems.find((item) =>
        item.product.equals(product._id)
      );

      return { ...product, quantity: cartItem.quantity };
    });

    return res
      .status(200)
      .json(new ApiResponse(200, cartItems, "Cart items fetched successfully"));
  } catch (err) {
    throw new ApiError(
      500,
      err?.message || "Try fetching your cart items again in a moment."
    );
  }
});

export const addItemToCart = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  try {
    const isProduct = await Product.exists({ _id: productId });
    if (!isProduct) {
      throw new ApiError(404, "No such product found");
    }

    const user = req.user;
    const isItemInCart = user.cartItems.find(
      (item) => item.product.toString() === productId
    );

    let response;
    if (isItemInCart) {
      isItemInCart.quantity += 1;
      response = isItemInCart;
    } else {
      response = {
        quantity: 1,
        product: productId,
      };
      user.cartItems.push(response);
    }

    await user.save();

    return res
      .status(200)
      .json(new ApiResponse(200, response, "Item added to cart successfully"));
  } catch (err) {
    throw new ApiError(
      err.statusCode || 500,
      err?.message || "Try adding item to cart in a moment again"
    );
  }
});

export const removeItemFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  try {
    const user = req.user;
    const isItemInCart = user.cartItems.find(
      (item) => item.product.toString() === productId
    );

    if (isItemInCart) {
      user.cartItems = user.cartItems.filter(
        (item) => item.product.toString() !== productId
      );
      await user.save();
    } else {
      throw new ApiError(404, "No such item in cart");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          isItemInCart,
          "Item removed from cart successfully"
        )
      );
  } catch (err) {
    throw new ApiError(
      err.statusCode || 500,
      err?.message || "Try removing item from cart in a moment again"
    );
  }
});

export const updateItemQty = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;
  const user = req.user;

  try {
    const isItemInCart = user.cartItems.find(
      (item) => item.product.toString() === productId
    );

    if (!isItemInCart) {
      throw new ApiError(404, "No such item in cart");
    }

    if (quantity < 0) {
      throw new ApiError(400, "Invalid quantity");
    } else if (quantity === 0) {
      user.cartItems = user.cartItems.filter(
        (item) => item.product.toString() !== productId
      );
    } else {
      isItemInCart.quantity = quantity;
    }

    await user.save();
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          user.cartItems,
          "Item removed from cart successfully"
        )
      );
  } catch (err) {
    throw new ApiError(
      err.statusCode || 500,
      err?.message || "Try updating the item quantity in a moment again"
    );
  }
});
