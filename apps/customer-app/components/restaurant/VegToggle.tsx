import React, { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
} from "react-native-reanimated";
import { PressableScale } from "../ui/PressableScale";
import { spring, timing } from "../../lib/animations";

type Props = {
  value: boolean;
  onChange: (value: boolean) => void;
  label?: string;
};

// Custom Reanimated toggle. Green when on, ink-200 when off.
// Thumb slides via spring; track color interpolates via timing.
export function VegToggle({ value, onChange, label = "Veg only" }: Props) {
  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(value ? 1 : 0, timing.base);
  }, [value]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      ["#D4D4D4", "#2E7D32"]
    ),
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withSpring(value ? 22 : 0, spring.default) }],
  }));

  return (
    <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-ink-100">
      <View className="flex-row items-center">
        {/* small veg indicator next to label for context */}
        <View
          style={{
            width: 16,
            height: 16,
            borderWidth: 1.5,
            borderColor: "#2E7D32",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: "#2E7D32",
            }}
          />
        </View>
        <Text className="text-ink-900 text-sm font-semibold ml-2.5">
          {label}
        </Text>
      </View>

      <PressableScale
        onPress={() => onChange(!value)}
        scaleTo={0.9}
        haptic="selection"
        accessibilityRole="switch"
        accessibilityState={{ checked: value }}
      >
        <Animated.View
          style={[
            {
              width: 48,
              height: 26,
              borderRadius: 999,
              padding: 2,
              justifyContent: "center",
            },
            trackStyle,
          ]}
        >
          <Animated.View
            style={[
              {
                width: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: "#FFFFFF",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.18,
                shadowRadius: 2,
                elevation: 2,
              },
              thumbStyle,
            ]}
          />
        </Animated.View>
      </PressableScale>
    </View>
  );
}
