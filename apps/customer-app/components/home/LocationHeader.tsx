import React from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  SharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { PressableScale } from "../ui/PressableScale";
import { Avatar } from "../ui/Avatar";
import { haptics } from "../../lib/haptics";
import { getDefaultAddress } from "../../lib/mock/addresses";

type Props = {
  scrollY: SharedValue<number>;
  notificationCount?: number;
  onAddressPress?: () => void;
  onBellPress?: () => void;
  onAvatarPress?: () => void;
};

// Sticky top header for the home screen — address picker on the left, bell + avatar on the right.
// Bottom border fades in as the user scrolls (driven by shared scrollY).
export function LocationHeader({
  scrollY,
  notificationCount = 2,
  onAddressPress,
  onBellPress,
  onAvatarPress,
}: Props) {
  const insets = useSafeAreaInsets();
  const address = getDefaultAddress();

  const street = [address.line1, address.area, address.city].filter(Boolean).join(", ");

  const borderStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 24], [0, 1], Extrapolation.CLAMP),
  }));

  return (
    <Animated.View
      style={{
        paddingTop: insets.top + 6,
        backgroundColor: "#FFFFFF",
        zIndex: 20,
      }}
      className="px-4 pb-3"
    >
      {/* Animated bottom border */}
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 1,
            backgroundColor: "#E5E5E5",
          },
          borderStyle,
        ]}
      />

      <View className="flex-row items-center">
        <PressableScale
          onPress={() => {
            haptics.selection();
            onAddressPress?.();
          }}
          scaleTo={0.97}
          haptic="none"
          className="flex-1"
        >
          <View className="flex-row items-center">
            <View className="bg-brand-50 px-2 py-0.5 rounded-md">
              <Text className="text-brand-700 text-2xs font-bold tracking-wider uppercase">
                Delivering to
              </Text>
            </View>
          </View>
          <View className="flex-row items-center mt-1.5">
            <Text className="text-ink-900 font-extrabold text-base mr-1">
              {address.label}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#0A0A0A" />
          </View>
          <Text
            className="text-ink-500 text-2xs mt-0.5"
            numberOfLines={1}
            style={{ maxWidth: 240 }}
          >
            {street}
          </Text>
        </PressableScale>

        <PressableScale
          onPress={() => {
            haptics.light();
            onBellPress?.();
          }}
          scaleTo={0.88}
          haptic="none"
          className="w-11 h-11 items-center justify-center rounded-full bg-surface-sunken mr-1.5"
        >
          <Ionicons name="notifications-outline" size={22} color="#0A0A0A" />
          {notificationCount > 0 ? (
            <View
              className="absolute top-1 right-1 bg-brand rounded-full min-w-[16px] h-[16px] items-center justify-center px-1"
              style={{
                shadowColor: "#FC5F30",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.4,
                shadowRadius: 4,
              }}
            >
              <Text className="text-white text-2xs font-bold" style={{ fontSize: 9 }}>
                {notificationCount > 9 ? "9+" : notificationCount}
              </Text>
            </View>
          ) : null}
        </PressableScale>

        <PressableScale
          onPress={() => {
            haptics.light();
            onAvatarPress?.();
          }}
          scaleTo={0.9}
          haptic="none"
        >
          <Avatar size={36} name="V A" />
        </PressableScale>
      </View>
    </Animated.View>
  );
}
