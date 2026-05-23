import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";

type Props = {
  step: 1 | 2 | 3;
  label: string;
  sublabel?: string;
  isActive: boolean;
  isCompleted: boolean;
  isLast?: boolean;
};

export function NavigationStep({ step, label, sublabel, isActive, isCompleted, isLast }: Props) {
  return (
    <View className="flex-row gap-3">
      {/* Icon + line column */}
      <View className="items-center" style={{ width: 32 }}>
        {isCompleted ? (
          <View className="w-8 h-8 rounded-full bg-success items-center justify-center">
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
          </View>
        ) : isActive ? (
          <MotiView
            from={{ scale: 0.9 }}
            animate={{ scale: 1.05 }}
            transition={{ type: "timing", duration: 700, loop: true }}
            className="w-8 h-8 rounded-full border-2 border-brand bg-surface-tint items-center justify-center"
          >
            <Text className="text-brand font-bold text-sm">{step}</Text>
          </MotiView>
        ) : (
          <View className="w-8 h-8 rounded-full bg-ink-100 items-center justify-center">
            <Text className="text-ink-400 font-semibold text-sm">{step}</Text>
          </View>
        )}

        {!isLast ? (
          <View
            className={`flex-1 w-0.5 my-1 ${isCompleted ? "bg-success" : "bg-ink-100"}`}
            style={{ minHeight: 24 }}
          />
        ) : null}
      </View>

      {/* Labels */}
      <View className="flex-1 pb-5 justify-center">
        <Text
          className={`font-semibold text-sm ${
            isActive ? "text-ink-900" : isCompleted ? "text-ink-400" : "text-ink-300"
          }`}
        >
          {label}
        </Text>
        {sublabel ? (
          <Text className="text-ink-400 text-xs mt-0.5" numberOfLines={1}>
            {sublabel}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
