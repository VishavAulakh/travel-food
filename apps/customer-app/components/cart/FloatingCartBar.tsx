import React from "react";
import { Text, View, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { MotiView, AnimatePresence } from "moti";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PressableScale } from "../ui/PressableScale";
import { useCartStore } from "../../store/cart";
import { formatINR, pluralize } from "../../lib/format";
import { haptics } from "../../lib/haptics";

type Props = {
  // override destination; defaults to /cart
  to?: string;
  bottomOffset?: number;
};

// Floating bar that materializes only when cart has items.
// Sits above tab bar / safe area.
export function FloatingCartBar({ to = "/cart", bottomOffset }: Props) {
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total);
  const insets = useSafeAreaInsets();
  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);
  const visible = itemCount > 0;

  const bottom = bottomOffset ?? (Platform.OS === "ios" ? 92 + insets.bottom : 76);

  return (
    <AnimatePresence>
      {visible ? (
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          exit={{ opacity: 0, translateY: 30 }}
          transition={{ type: "spring", damping: 18, stiffness: 220 }}
          style={{
            position: "absolute",
            left: 16,
            right: 16,
            bottom,
            zIndex: 50,
          }}
        >
          <PressableScale
            onPress={() => {
              haptics.medium();
              router.push(to as any);
            }}
            scaleTo={0.98}
            haptic="none"
            className="bg-ink-900 rounded-2xl flex-row items-center px-4 py-3.5"
            style={{
              shadowColor: "#0A0A0A",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.25,
              shadowRadius: 16,
              elevation: 10,
            }}
          >
            <View className="bg-brand w-10 h-10 rounded-xl items-center justify-center">
              <Ionicons name="bag" size={20} color="#fff" />
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-white font-bold text-sm">
                {pluralize(itemCount, "item")}  •  {formatINR(total)}
              </Text>
              <Text className="text-white/70 text-2xs mt-0.5">Extra charges may apply</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-white font-bold text-sm mr-1">View Cart</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </View>
          </PressableScale>
        </MotiView>
      ) : null}
    </AnimatePresence>
  );
}
