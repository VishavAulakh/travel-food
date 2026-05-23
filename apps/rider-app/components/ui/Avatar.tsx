import React from "react";
import { Image, Text, View, StyleProp, ViewStyle } from "react-native";

type Props = {
  uri?: string;
  name?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export function Avatar({ uri, name, size = 40, style }: Props) {
  const initials = (name ?? "")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: "#FFE4D9",
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size }} />
      ) : (
        <Text style={{ color: "#C23B14", fontSize: size * 0.4, fontWeight: "700" }}>
          {initials || "?"}
        </Text>
      )}
    </View>
  );
}
