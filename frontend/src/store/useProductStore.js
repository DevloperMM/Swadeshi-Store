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
      toast.error(err.response.data.message || "Failed to create product");
    }
  },

  fetchAllProducts: async () => {
    set({ loading: true });
    try {
      const res = await axios.get("/products");
      set({ products: res.data.data, loading: false });
      // try using await in case of any error
    } catch (err) {
      set({ loading: false });
      toast.error(err.response.data.message || "Failed to fetch products");
    }
  },

  deleteProduct: async (productId) => {
    set({ loading: true });
    try {
      const res = await axios.delete(`/products/${productId}`);
      set((prevState) => ({
        products: prevState.products.filter(
          (product) => product._id !== productId
        ),
        loading: false,
      }));
      toast.success(res.data.message);
    } catch (err) {
      set({ loading: false });
      toast.error(err.response.data.message || "Failed to delete prodcut");
    }
  },

  toggleFeaturedProduct: async (productId) => {
    set({ loading: true });
    try {
      const res = await axios.patch(`/products/${productId}`);
      set((prevState) => ({
        products: prevState.products.map((product) =>
          product._id === productId
            ? { ...product, isFeatured: res.data.data.isFeatured }
            : product
        ),
        loading: false,
      }));
      toast.success(res.data.message);
    } catch (err) {
      set({ loading: false });
      toast.error(err.response.data.message || "Failed to update product");
    }
  },
}));
