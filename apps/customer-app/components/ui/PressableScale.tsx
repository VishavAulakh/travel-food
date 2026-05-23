import React from "react";
import { Pressable, PressableProps, ViewStyle, StyleProp } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { haptics } from "../../lib/haptics";
import { spring } from "../../lib/animations";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = PressableProps & {
  scaleTo?: number;
  haptic?: "light" | "medium" | "heavy" | "selection" | "success" | "none";
  style?: StyleProp<ViewStyle>;
  className?: string;
};

// Universal pressable wrapper — scales down on press with spring physics +
// optional haptic feedback. Use everywhere instead of raw TouchableOpacity.
export function PressableScale({
  scaleTo = 0.96,
  haptic: hapticKind = "light",
  onPressIn,
  onPressOut,
  onPress,
  style,
  children,
  className,
  ...rest
}: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      {...rest}
      className={className}
      style={[style, animatedStyle]}
      onPressIn={(e) => {
        scale.value = withSpring(scaleTo, spring.default);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, spring.default);
        onPressOut?.(e);
      }}
      onPress={(e) => {
        if (hapticKind !== "none") haptics[hapticKind]?.();
        onPress?.(e);
      }}
    >
      {children as any}
    </AnimatedPressable>
  );
}
