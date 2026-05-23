import React from "react";
import { View, ViewProps, StyleProp, ViewStyle } from "react-native";
import { shadows } from "../../lib/theme";
import { PressableScale } from "./PressableScale";

type Props = ViewProps & {
  onPress?: () => void;
  className?: string;
  elevation?: "none" | "card" | "hover";
  style?: StyleProp<ViewStyle>;
  haptic?: "light" | "medium" | "selection" | "none";
};

export function Card({
  onPress,
  className,
  elevation = "card",
  style,
  haptic = "light",
  children,
  ...rest
}: Props) {
  const shadowStyle =
    elevation === "card" ? shadows.card : elevation === "hover" ? shadows.cardHover : null;
  const base = "bg-white rounded-2xl overflow-hidden";

  if (onPress) {
    return (
      <PressableScale
        onPress={onPress}
        haptic={haptic}
        scaleTo={0.985}
        style={[shadowStyle, style]}
        className={`${base} ${className ?? ""}`}
      >
        {children}
      </PressableScale>
    );
  }

  return (
    <View
      {...rest}
      style={[shadowStyle, style]}
      className={`${base} ${className ?? ""}`}
    >
      {children}
    </View>
  );
}
