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
      toast.error(err.response.data.message, { id: "admin_create" });
    }
  },

  fetchAllProducts: async () => {
    set({ loading: true });
    try {
      const res = await axios.get("/products");
      set({ products: res.data.data, loading: false });
    } catch (err) {
      set({ loading: false });
      toast.error(err.response.data.message);
    }
  },

  fetchProductsByCategory: async (category) => {
    set({ loading: true });
    try {
      const res = await axios.get(`/products/category/${category}`);
      set({ products: res.data.data, loading: false });
    } catch (err) {
      set({ loading: false });
      console.log(`Error in ${category} products: ${err}`);
    }
  },

  fetchRecommendations: async () => {
    set({ loading: true });
    try {
      const res = await axios.get("/products/recommended");
      set({ products: res.data.data, loading: false });
    } catch (err) {
      set({ loading: false });
      console.log("Error while recommending: ", err);
    }
  },

  fetchFeaturedProducts: async () => {
    set({ loading: true });
    try {
      const res = await axios.get("/products/featured");
      set({ products: res.data.data, loading: false });
    } catch (err) {
      set({ loading: false });
      console.log("Error fetching featured: ", err);
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
      toast.error(err.response.data.message, { id: "admin_del" });
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
      toast.error(err.response.data.message, { id: "admin_switch" });
    }
  },
}));
