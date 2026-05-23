import React from "react";
import { Text, View } from "react-native";
import { router } from "expo-router";
import { PressableScale } from "../ui/PressableScale";
import { FadeInImage } from "../ui/FadeInImage";
import type { Cuisine } from "../../lib/mock/cuisines";

type Props = {
  cuisine: Cuisine;
};

export function CuisineTile({ cuisine }: Props) {
  return (
    <PressableScale
      onPress={() => router.push(`/search?cuisine=${cuisine.id}`)}
      haptic="selection"
      scaleTo={0.92}
      className="items-center mr-1"
      style={{ width: 84 }}
    >
      <View
        className="w-20 h-20 rounded-full overflow-hidden bg-surface-muted"
        style={{
          shadowColor: "#1F1408",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <FadeInImage uri={cuisine.imageUrl} style={{ width: "100%", height: "100%" }} />
      </View>
      <Text className="text-ink-700 text-xs font-semibold mt-2 text-center" numberOfLines={1}>
        {cuisine.name}
      </Text>
    </PressableScale>
  );
}
