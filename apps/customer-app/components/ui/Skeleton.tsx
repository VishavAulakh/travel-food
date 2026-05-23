import React, { useEffect } from "react";
import { View, StyleProp, ViewStyle, DimensionValue } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from "react-native-reanimated";

type Props = {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  className?: string;
};

// Shimmer skeleton — animates a moving gradient highlight across the surface.
export function Skeleton({
  width = "100%",
  height = 16,
  borderRadius = 8,
  style,
  className,
}: Props) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
      -1,
      false
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => {
    const translateX = interpolate(progress.value, [0, 1], [-100, 100]);
    return {
      transform: [{ translateX: `${translateX}%` as any }],
    };
  });

  return (
    <View
      className={className}
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: "#F0EFEC",
          overflow: "hidden",
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          {
            ...({ width: "60%", height: "100%" } as any),
            backgroundColor: "#FFFFFF",
            opacity: 0.7,
          },
          shimmerStyle,
        ]}
      />
    </View>
  );
}

// Compose skeletons into common shapes
export function SkeletonRestaurantCard() {
  return (
    <View className="mb-5">
      <Skeleton width="100%" height={180} borderRadius={18} />
      <View className="mt-3 px-1">
        <Skeleton width="70%" height={18} borderRadius={6} />
        <View style={{ height: 8 }} />
        <Skeleton width="50%" height={14} borderRadius={6} />
        <View style={{ height: 12 }} />
        <View className="flex-row gap-3">
          <Skeleton width={60} height={14} borderRadius={6} />
          <Skeleton width={80} height={14} borderRadius={6} />
        </View>
      </View>
    </View>
  );
}

export function SkeletonMenuItem() {
  return (
    <View className="flex-row py-4 border-b border-ink-100">
      <View className="flex-1">
        <Skeleton width={14} height={14} borderRadius={2} />
        <View style={{ height: 10 }} />
        <Skeleton width="75%" height={18} borderRadius={6} />
        <View style={{ height: 8 }} />
        <Skeleton width="40%" height={14} borderRadius={6} />
        <View style={{ height: 14 }} />
        <Skeleton width="90%" height={12} borderRadius={6} />
      </View>
      <Skeleton width={108} height={108} borderRadius={14} style={{ marginLeft: 16 }} />
    </View>
  );
}
