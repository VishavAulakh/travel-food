import { create } from "zustand";
import { persist } from "zustand/middleware";

type RestaurantUser = {
  id: string;
  name: string;
  phone: string;
  role: string;
  restaurantId: string;
  branchId: string | null;
  restaurantName: string;
};

type AuthState = {
  token: string | null;
  user: RestaurantUser | null;
  setAuth: (token: string, user: RestaurantUser) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => {
        set({ token: null, user: null });
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
