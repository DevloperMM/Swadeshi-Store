import { create } from "zustand";
import { toast } from "react-hot-toast";
import axios from "../lib/axios.js";

export const useUserStore = create((set, get) => ({
  user: null,
  loading: false,
  checkingAuth: true,

  signup: async ({ name, email, password, confirmPassword }) => {
    set({ loading: true });
    if (password !== confirmPassword) {
      set({ loading: false });
      return toast.error("Passwords must be same");
    }

    try {
      const res = await axios.post("/user/signup", { name, email, password });
      set({ user: res.data.data.user, loading: false });
      toast.success(res.data.message);
    } catch (err) {
      set({ loading: false });
      toast.error(err.response.data.message || "Failed to register");
    }
  },

  login: async (email, password) => {
    set({ loading: true });
    try {
      const res = await axios.post("/user/login", { email, password });
      set({ user: res.data.data.user, loading: false });
      toast.success(res.data.message);
    } catch (err) {
      set({ loading: false });
      toast.error(err.response.data.message || "Failed to login");
    }
  },

  logout: async () => {
    try {
      const res = await axios.post("/user/logout");
      set({ user: null });
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response.data.message || "Failed logging out");
    }
  },

  checkAuth: async () => {
    set({ checkingAuth: true });
    try {
      const res = await axios.get("/user/profile");
      set({ user: res.data.data.user, checkingAuth: false });
    } catch (err) {
      set({ user: null, checkingAuth: false });
    }
  },

  refreshToken: async () => {
    if (get().checkingAuth) return;

    set({ checkingAuth: true });
    try {
      await axios.post("/user/refresh-token");
      set({ checkingAuth: false });
    } catch (error) {
      set({ user: null, checkingAuth: false });
      throw error;
    }
  },
}));
