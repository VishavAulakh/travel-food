import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PressableScale } from "./PressableScale";
import { MotiView } from "moti";
import { AnimatePresence } from "moti";

type Props = {
  qty: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onAdd?: () => void;
  size?: "sm" | "md" | "lg";
};

// "ADD" button collapses into +/- stepper when qty > 0 — Zomato/Swiggy pattern.
export function Stepper({ qty, onIncrement, onDecrement, onAdd, size = "md" }: Props) {
  const sizeMap = {
    sm: { container: "h-8 min-w-[80px] px-2", text: "text-sm", icon: 14 },
    md: { container: "h-10 min-w-[96px] px-3", text: "text-base", icon: 16 },
    lg: { container: "h-12 min-w-[110px] px-3.5", text: "text-base", icon: 18 },
  } as const;
  const s = sizeMap[size];

  if (qty === 0) {
    return (
      <PressableScale
        onPress={() => {
          onAdd ? onAdd() : onIncrement();
        }}
        scaleTo={0.94}
        haptic="medium"
        className={`bg-white border-2 border-brand rounded-xl ${s.container} items-center justify-center`}
        style={{
          shadowColor: "#FC5F30",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.18,
          shadowRadius: 10,
          elevation: 4,
        }}
      >
        <Text className={`text-brand font-extrabold ${s.text} tracking-wider`}>ADD</Text>
      </PressableScale>
    );
  }

  return (
    <View
      className={`bg-brand rounded-xl ${s.container} flex-row items-center justify-between`}
      style={{
        shadowColor: "#FC5F30",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.28,
        shadowRadius: 10,
        elevation: 6,
      }}
    >
      <PressableScale
        onPress={onDecrement}
        scaleTo={0.85}
        haptic="light"
        className="h-full px-1.5 items-center justify-center"
      >
        <Ionicons name="remove" size={s.icon + 4} color="#fff" />
      </PressableScale>

      <AnimatePresence exitBeforeEnter>
        <MotiView
          key={qty}
          from={{ opacity: 0, scale: 0.7, translateY: -4 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          exit={{ opacity: 0, scale: 0.7, translateY: 4 }}
          transition={{ type: "spring", damping: 14, stiffness: 260 }}
        >
          <Text className={`text-white font-extrabold ${s.text}`}>{qty}</Text>
        </MotiView>
      </AnimatePresence>

      <PressableScale
        onPress={onIncrement}
        scaleTo={0.85}
        haptic="light"
        className="h-full px-1.5 items-center justify-center"
      >
        <Ionicons name="add" size={s.icon + 4} color="#fff" />
      </PressableScale>
    </View>
  );
}
