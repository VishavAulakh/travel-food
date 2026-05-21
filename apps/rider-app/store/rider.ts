import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { createMMKV } from "react-native-mmkv";

const mmkv = createMMKV({ id: "rider-auth" });
const mmkvStorage = {
  getItem: (key: string) => mmkv.getString(key) ?? null,
  setItem: (key: string, value: string) => mmkv.set(key, value),
  removeItem: (key: string) => mmkv.remove(key),
};

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
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
