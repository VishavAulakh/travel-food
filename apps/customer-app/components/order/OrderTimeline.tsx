import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import type { OrderStatus } from "../../lib/mock/orders";
import { ORDER_STATUS_FLOW, ORDER_STATUS_META } from "../../lib/mock/orders";

type Props = {
  current: OrderStatus;
};

export function OrderTimeline({ current }: Props) {
  const currentIndex = ORDER_STATUS_FLOW.indexOf(current);

  return (
    <View className="bg-white rounded-2xl p-4 border border-ink-100">
      {ORDER_STATUS_FLOW.map((s, i) => {
        const isPast = i < currentIndex;
        const isActive = i === currentIndex;
        const isFuture = i > currentIndex;
        const meta = ORDER_STATUS_META[s];

        return (
          <View key={s} className="flex-row">
            {/* Indicator column */}
            <View className="items-center" style={{ width: 32 }}>
              <MotiView
                from={isActive ? { scale: 0.9 } : { scale: 1 }}
                animate={isActive ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                transition={{ type: "timing", duration: 1500, loop: isActive }}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: isPast || isActive ? "#FC5F30" : "#F0EFEC",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons
                  name={isPast ? "checkmark" : (meta.icon as any)}
                  size={isPast ? 16 : 14}
                  color={isPast || isActive ? "#fff" : "#A3A3A3"}
                />
              </MotiView>
              {i < ORDER_STATUS_FLOW.length - 1 ? (
                <View
                  className="w-px flex-1 my-1"
                  style={{
                    backgroundColor: i < currentIndex ? "#FC5F30" : "#E5E5E5",
                    minHeight: 32,
                  }}
                />
              ) : null}
            </View>

            {/* Text column */}
            <View className="flex-1 ml-3 pb-6">
              <Text
                className={`text-sm font-bold ${
                  isFuture ? "text-ink-300" : "text-ink-900"
                }`}
              >
                {meta.label}
              </Text>
              <Text
                className={`text-2xs mt-0.5 ${
                  isFuture ? "text-ink-300" : "text-ink-500"
                }`}
              >
                {meta.description}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
