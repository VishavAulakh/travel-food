import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PressableScale } from "./PressableScale";

type Props = {
  label: string;
  active?: boolean;
  onPress?: () => void;
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  variant?: "filter" | "tag" | "promo";
  size?: "sm" | "md";
};

export function Chip({ label, active, onPress, icon, variant = "filter", size = "md" }: Props) {
  const sizeCls = size === "sm" ? "px-2.5 py-1" : "px-3.5 py-2";
  const textSizeCls = size === "sm" ? "text-2xs" : "text-xs";

  let containerCls = "";
  let textCls = "";

  if (variant === "filter") {
    containerCls = active
      ? "bg-ink-900 border border-ink-900"
      : "bg-white border border-ink-200";
    textCls = active ? "text-white font-semibold" : "text-ink-700 font-medium";
  } else if (variant === "tag") {
    containerCls = "bg-ink-50 border border-transparent";
    textCls = "text-ink-700 font-medium";
  } else {
    containerCls = "bg-brand-50 border border-brand-100";
    textCls = "text-brand-700 font-semibold";
  }

  const content = (
    <View className={`flex-row items-center ${sizeCls} rounded-full ${containerCls}`}>
      {icon ? (
        <Ionicons
          name={icon}
          size={size === "sm" ? 12 : 14}
          color={active ? "#fff" : variant === "promo" ? "#C23B14" : "#262626"}
          style={{ marginRight: 4 }}
        />
      ) : null}
      <Text className={`${textCls} ${textSizeCls}`}>{label}</Text>
    </View>
  );

  if (onPress) {
    return (
      <PressableScale onPress={onPress} haptic="selection" scaleTo={0.94}>
        {content}
      </PressableScale>
    );
  }
  return content;
}
