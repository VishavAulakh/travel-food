import React from "react";
import { Text, View } from "react-native";

type Props = {
  label?: string;
  className?: string;
  dashed?: boolean;
};

export function Divider({ label, className, dashed }: Props) {
  if (!label) {
    return (
      <View
        className={`h-px bg-ink-100 ${className ?? ""}`}
        style={dashed ? { borderStyle: "dashed", borderBottomWidth: 1, borderColor: "#D4D4D4", height: 0 } : undefined}
      />
    );
  }
  return (
    <View className={`flex-row items-center my-4 ${className ?? ""}`}>
      <View className="flex-1 h-px bg-ink-100" />
      <Text className="text-ink-500 text-2xs font-semibold mx-3 tracking-widest uppercase">
        {label}
      </Text>
      <View className="flex-1 h-px bg-ink-100" />
    </View>
  );
}
