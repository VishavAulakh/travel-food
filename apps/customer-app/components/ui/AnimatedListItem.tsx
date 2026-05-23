import React from "react";
import { MotiView } from "moti";
import { ViewStyle, StyleProp } from "react-native";
import { staggerDelay } from "../../lib/animations";

type Props = {
  index?: number;
  delay?: number;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
  from?: "bottom" | "right" | "fade";
};

// Wrap list items / sections to get a tasteful stagger-fade entrance.
export function AnimatedListItem({
  index = 0,
  delay,
  children,
  style,
  className,
  from = "bottom",
}: Props) {
  const initial = {
    bottom: { opacity: 0, translateY: 14 },
    right: { opacity: 0, translateX: 20 },
    fade: { opacity: 0 },
  }[from];

  return (
    <MotiView
      from={initial}
      animate={{ opacity: 1, translateY: 0, translateX: 0 }}
      transition={{
        type: "timing",
        duration: 380,
        delay: delay ?? staggerDelay(index),
      }}
      style={style}
      className={className}
    >
      {children}
    </MotiView>
  );
}
