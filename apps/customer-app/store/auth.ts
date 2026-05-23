import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Customer = { id: string; name: string; phone: string; email?: string };

type AuthState = {
  token: string | null;
  customer: Customer | null;
  setAuth: (token: string, customer: Customer) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      customer: null,
      setAuth: (token, customer) => set({ token, customer }),
      logout: () => set({ token: null, customer: null }),
    }),
    {
      name: "auth",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
