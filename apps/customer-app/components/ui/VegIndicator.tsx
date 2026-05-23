import React from "react";
import { View } from "react-native";

type Props = {
  isVeg: boolean;
  size?: number;
};

// Standard Indian food safety indicator — green square w/ dot = veg, red = non-veg.
// Required by FSSAI regulations; instantly recognizable to Indian users.
export function VegIndicator({ isVeg, size = 14 }: Props) {
  const color = isVeg ? "#2E7D32" : "#C62828";
  return (
    <View
      style={{
        width: size,
        height: size,
        borderWidth: 1.5,
        borderColor: color,
        padding: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          width: size * 0.55,
          height: size * 0.55,
          borderRadius: size / 2,
          backgroundColor: color,
        }}
      />
    </View>
  );
}
