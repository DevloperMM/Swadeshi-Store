import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useCartStore = create((set, get) => ({
  cart: [],
  coupon: null,
  total: 0,
  subTotal: 0,
  isCouponApplied: false,

  getCartItems: async () => {
    try {
      const res = await axios.get("/cart");
      set({ cart: res.data.data });
      get().calcTotals();
    } catch (err) {
      set({ cart: [] });
      toast.error(err.response.data.message || "Failed to fetch cart items");
    }
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
    const res = await axios.delete("/cart", { data: { productId } });
    set((prevState) => ({
      cart: prevState.cart.filter((item) => item._id !== productId),
    }));
    get().calcTotals();
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

  calcTotals: () => {
    const { cart, coupon } = get();
    const subTotal = cart?.reduce(
      (sum, item) => (sum + item.price * item.quantity, 0)
    );

    let total = subTotal;
    if (coupon) {
      const discount = subTotal * (coupon.discount / 100);
      total = subTotal - discount;
    }

    set({ subTotal, total });
  },
}));
