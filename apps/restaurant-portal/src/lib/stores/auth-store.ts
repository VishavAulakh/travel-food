import { create } from "zustand";
import { persist } from "zustand/middleware";

type Restaurant = {
  id: string;
  name: string;
  phone: string;
  branchId: string;
};

type AuthState = {
  token: string | null;
  restaurant: Restaurant | null;
  setAuth: (token: string, restaurant: Restaurant) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      restaurant: null,
      setAuth: (token, restaurant) => set({ token, restaurant }),
      logout: () => {
        set({ token: null, restaurant: null });
        if (typeof window !== "undefined") {
          localStorage.removeItem("restaurant-auth");
          window.location.href = "/auth";
        }
      },
    }),
    {
      name: "restaurant-auth",
    }
  )
);
