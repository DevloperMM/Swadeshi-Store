import { create } from "zustand";
import { toast } from "react-hot-toast";
import axios from "../lib/axios.js";

export const useProductStore = create((set) => ({
  products: [],
  loading: false,

  setProducts: (products) => set({ products }),

  createProduct: async (prodData) => {
    set({ loading: true });
    try {
      const res = await axios.post("/products", prodData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      set((prevState) => ({
        products: [...prevState.products, res.data.data],
        loading: false,
      }));
      toast.success(res.data.message);
    } catch (err) {
      set({ loading: false });
      toast.error(err.response.data.message || "An error occured");
    }
  },
}));
