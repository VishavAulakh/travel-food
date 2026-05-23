import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  rating: number;
  totalRatings?: number;
  size?: "xs" | "sm" | "md";
  showCount?: boolean;
};

// Swiggy-style green rating pill — instantly recognizable in the Indian market.
export function RatingPill({ rating, totalRatings, size = "sm", showCount = false }: Props) {
  const color =
    rating >= 4.0 ? "#3D9963" : rating >= 3.0 ? "#DB7C00" : "#C62828";

  const sizeMap = {
    xs: { pad: "px-1 py-0.5", text: "text-2xs", icon: 8 },
    sm: { pad: "px-1.5 py-0.5", text: "text-xs", icon: 10 },
    md: { pad: "px-2 py-1", text: "text-sm", icon: 12 },
  } as const;
  const s = sizeMap[size];

  return (
    <View className="flex-row items-center gap-1">
      <View
        className={`flex-row items-center ${s.pad} rounded`}
        style={{ backgroundColor: color }}
      >
        <Text className={`text-white ${s.text} font-bold`}>{rating.toFixed(1)}</Text>
        <Ionicons name="star" size={s.icon} color="#fff" style={{ marginLeft: 2 }} />
      </View>
      {showCount && totalRatings ? (
        <Text className={`text-ink-500 ${s.text} font-medium`}>
          {totalRatings >= 1000 ? `${(totalRatings / 1000).toFixed(1)}K` : totalRatings}
        </Text>
      ) : null}
    </View>
  );
}
