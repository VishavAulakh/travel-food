import React from "react";
import { Text, View, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { PressableScale } from "./PressableScale";

type Props = {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightSlot?: React.ReactNode;
  transparent?: boolean;
  centerTitle?: boolean;
};

export function Header({
  title,
  subtitle,
  showBack = true,
  onBack,
  rightSlot,
  transparent = false,
  centerTitle = false,
}: Props) {
  const insets = useSafeAreaInsets();
  const handleBack = onBack ?? (() => router.back());

  return (
    <View
      style={{
        paddingTop: insets.top + 4,
        backgroundColor: transparent ? "transparent" : "#FFFFFF",
      }}
      className={`px-2 pb-3 flex-row items-center ${
        transparent ? "" : "border-b border-ink-100"
      }`}
    >
      {showBack ? (
        <PressableScale
          onPress={handleBack}
          scaleTo={0.88}
          haptic="light"
          className="w-11 h-11 items-center justify-center rounded-full"
        >
          <Ionicons name="arrow-back" size={24} color="#0A0A0A" />
        </PressableScale>
      ) : (
        <View style={{ width: 12 }} />
      )}

      <View className={`flex-1 ${centerTitle ? "items-center" : "px-1"}`}>
        {title ? (
          <Text className="text-ink-900 text-base font-bold" numberOfLines={1}>
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text className="text-ink-500 text-2xs mt-0.5" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {rightSlot ? (
        <View className="flex-row items-center gap-1">{rightSlot}</View>
      ) : (
        <View style={{ width: 44 }} />
      )}
    </View>
  );
}
