import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Rider = { id: string; name: string; phone: string };

type RiderState = {
  token: string | null;
  rider: Rider | null;
  isOnline: boolean;
  activeOrderId: string | null;
  setAuth: (token: string, rider: Rider) => void;
  toggleOnline: () => void;
  setActiveOrder: (orderId: string | null) => void;
  logout: () => void;
};

export const useRiderStore = create<RiderState>()(
  persist(
    (set) => ({
      token: null,
      rider: null,
      isOnline: false,
      activeOrderId: null,
      setAuth: (token, rider) => set({ token, rider }),
      toggleOnline: () => set((s) => ({ isOnline: !s.isOnline })),
      setActiveOrder: (orderId) => set({ activeOrderId: orderId }),
      logout: () => set({ token: null, rider: null, isOnline: false, activeOrderId: null }),
    }),
    {
      name: "rider",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
