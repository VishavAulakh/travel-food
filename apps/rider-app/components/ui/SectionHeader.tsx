import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PressableScale } from "./PressableScale";

type Props = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  uppercase?: boolean;
};

export function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onActionPress,
  uppercase = false,
}: Props) {
  return (
    <View className="flex-row items-center justify-between px-4 mb-3">
      <View className="flex-1">
        <Text
          className={`text-ink-900 font-bold ${
            uppercase ? "text-sm tracking-widest uppercase" : "text-lg"
          }`}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text className="text-ink-500 text-2xs mt-0.5">{subtitle}</Text>
        ) : null}
      </View>
      {actionLabel ? (
        <PressableScale onPress={onActionPress} scaleTo={0.95} haptic="light">
          <View className="flex-row items-center">
            <Text className="text-brand text-xs font-semibold">{actionLabel}</Text>
            <Ionicons name="chevron-forward" size={14} color="#FC5F30" />
          </View>
        </PressableScale>
      ) : null}
    </View>
  );
}
