import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useCartStore = create((set, get) => ({
  cart: [],
  coupon: null,
  total: 0,
  subTotal: 0,
  isCouponApplied: false,
  loading: false,

  calcTotals: () => {
    const { cart, coupon } = get();
    const subTotal = cart?.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    let total = subTotal;
    if (coupon && get().isCouponApplied) {
      const discount = subTotal * (coupon.discount / 100);
      total = subTotal - discount;
    }

    set({ subTotal, total });
  },

  //basic operations on cart

  getCartItems: async () => {
    set({ loading: true });
    try {
      const res = await axios.get("/cart");
      set({ cart: res.data.data });
      get().calcTotals();
    } catch (err) {
      set({ cart: [] });
      toast.error(err.response.data.message || "Failed to fetch cart items");
    } finally {
      set({ loading: false });
    }
  },

  clearCart: () => {
    set({ cart: [], coupon: null, total: 0, subTotal: 0 });
  },

  addToCart: async (product) => {
    try {
      const res = await axios.post("/cart", { productId: product._id });
      toast.success(res.data.message);
      set((prevState) => {
        const isItemExist = prevState.cart.find(
          (item) => item._id === product._id
        );
        const newCart = isItemExist
          ? prevState.cart.map((item) =>
              item._id === product._id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          : [...prevState.cart, { ...product, quantity: 1 }];
        return { cart: newCart };
      });
      get().calcTotals();
    } catch (err) {
      toast.error(err.response.data.message || "Failed adding to cart");
    }
  },

  removeFromCart: async (productId) => {
    try {
      await axios.delete("/cart", { data: { productId } });
      set((prevState) => ({
        cart: prevState.cart.filter((item) => item._id !== productId),
      }));
      get().calcTotals();
    } catch (err) {
      toast.error(err.response.data.message || "Failed removing from cart");
    }
  },

  updateQty: async (productId, qty) => {
    if (qty == 0) return get().removeFromCart(productId);

    await axios.put(`/cart/${productId}`, qty);
    set((prevState) => ({
      cart: prevState.cart.map((item) =>
        item._id === productId ? { ...item, quantity: qty } : item
      ),
    }));
    get().calcTotals();
  },

  // basic operations on coupons

  getMyCoupon: async () => {
    try {
      const res = await axios.get("/coupons");
      set({ coupon: res.data.data });
    } catch (err) {
      console.log("Failed to fetch Coupon: ", err.response.data);
    }
  },

  applyCoupon: async (code) => {
    try {
      const res = await axios.post("/coupons/validate", { code });
      set({ coupon: res.data.data, isCouponApplied: true });
      get().calcTotals();
      toast.success("Coupon applied successfully");
    } catch (err) {
      toast.error(err.response.data.message || "Failed to apply coupon");
    }
  },

  removeCoupon: () => {
    set({ coupon: null, isCouponApplied: false });
    get().calcTotals();
    toast.success("Coupon removed");
  },
}));
