import React, { useEffect, useRef, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
  interpolateColor,
} from "react-native-reanimated";
import { MotiView } from "moti";
import { type DeliveryRequest } from "../../lib/mock/deliveryRequests";
import { formatINR } from "../../lib/format";
import { shadows } from "../../lib/theme";
import { PressableScale } from "../ui/PressableScale";

const TIMER_SECONDS = 45;

type Props = {
  request: DeliveryRequest;
  onAccept: () => void;
  onDecline: () => void;
};

export function DeliveryRequestCard({ request, onAccept, onDecline }: Props) {
  const progress = useSharedValue(1);
  const secondsLeft = useSharedValue(TIMER_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // JS-side seconds for re-render of countdown chip
  const [displaySeconds, setDisplaySeconds] = useState(TIMER_SECONDS);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%` as any,
    backgroundColor: interpolateColor(
      progress.value,
      [0, 0.33, 1],
      ["#DC2626", "#F59E0B", "#FC5F30"]
    ),
  }));

  useEffect(() => {
    progress.value = withTiming(0, {
      duration: TIMER_SECONDS * 1000,
      easing: Easing.linear,
    });

    let remaining = TIMER_SECONDS;
    timerRef.current = setInterval(() => {
      remaining -= 1;
      secondsLeft.value = remaining;
      runOnJS(setDisplaySeconds)(remaining);
      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        runOnJS(onDecline)();
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const totalItems = request.items.reduce((s, i) => s + i.qty, 0);
  const pickupDist = request.restaurant.distanceFromRiderKm;
  const dropDist = request.customer.distanceFromRestaurantKm;
  const totalDist = (pickupDist + dropDist).toFixed(1);

  // Countdown chip color
  const countdownColor =
    displaySeconds <= 5
      ? "#DC2626"
      : displaySeconds <= 15
      ? "#F59E0B"
      : "#0A0A0A";

  // Item name pills — up to 3, then "+N more"
  const previewItems = request.items.slice(0, 3);
  const extraCount = request.items.length - previewItems.length;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 16 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "spring", damping: 18, stiffness: 220, mass: 1 }}
    >
      <View
        className="bg-white rounded-2xl mb-4 overflow-hidden"
        style={shadows.cardHover}
      >
        {/* Timer bar + countdown chip row */}
        <View className="flex-row items-center bg-brand-50">
          <View className="flex-1 h-1.5 bg-brand-100">
            <Animated.View className="h-1.5" style={progressStyle} />
          </View>
          <View
            className="mx-2 my-1 px-2.5 py-0.5 rounded-full bg-white flex-row items-center gap-1"
            style={shadows.pill}
          >
            <Text style={{ fontSize: 10 }}>⏱</Text>
            <Text
              className="text-2xs font-bold"
              style={{ color: countdownColor }}
            >
              {displaySeconds}s
            </Text>
          </View>
        </View>

        <View className="p-4">
          {/* Restaurant header */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-2">
              <View className="w-9 h-9 rounded-xl bg-brand-50 items-center justify-center">
                <Ionicons name="restaurant" size={18} color="#FC5F30" />
              </View>
              <View>
                <Text className="text-ink-900 font-bold text-base">
                  {request.restaurant.name}
                </Text>
                <Text className="text-ink-400 text-xs">
                  {pickupDist.toFixed(1)} km away
                </Text>
              </View>
            </View>
            <View className="bg-surface-tint px-3 py-1 rounded-full">
              <Text className="text-brand text-xs font-semibold">
                {request.estimatedDeliveryMinutes} mins
              </Text>
            </View>
          </View>

          {/* Route — thicker dashed connector + distance badge */}
          <View className="flex-row mb-3">
            {/* Connector column */}
            <View className="items-center mr-3 pt-1">
              <View className="w-3.5 h-3.5 rounded-full bg-brand" />
              {/* Dashed line — rendered as stacked small dots */}
              <View className="items-center my-1 gap-0.5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <View key={i} className="w-0.5 h-1 bg-ink-300 rounded-full" />
                ))}
              </View>
              <View className="w-3.5 h-3.5 rounded-full bg-success" />
            </View>

            <View className="flex-1 gap-2">
              <View>
                <Text
                  className="text-ink-900 font-semibold text-sm"
                  numberOfLines={1}
                >
                  {request.restaurant.name}
                </Text>
                <Text
                  className="text-ink-400 text-xs mt-0.5"
                  numberOfLines={1}
                >
                  {request.restaurant.address}
                </Text>
              </View>

              {/* Distance badge between stops */}
              <View className="flex-row items-center gap-1 self-start">
                <Ionicons name="arrow-forward" size={10} color="#737373" />
                <Text className="text-ink-400 text-2xs font-medium">
                  {totalDist} km total
                </Text>
              </View>

              <View>
                <Text
                  className="text-ink-900 font-semibold text-sm"
                  numberOfLines={1}
                >
                  {request.customer.name}
                </Text>
                <Text
                  className="text-ink-400 text-xs mt-0.5"
                  numberOfLines={1}
                >
                  {request.customer.address}
                </Text>
              </View>
            </View>

            <View className="items-end justify-center ml-2">
              <Text className="text-xs text-ink-400">
                {dropDist.toFixed(1)} km
              </Text>
            </View>
          </View>

          {/* Payout & items */}
          <View className="flex-row items-center justify-between bg-surface-sunken rounded-xl px-4 py-3 mb-2">
            <View>
              <Text className="text-2xs text-ink-400 font-medium uppercase tracking-wide">
                Your earnings
              </Text>
              <Text className="text-success text-xl font-bold mt-0.5">
                {formatINR(request.payoutPaise)}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-2xs text-ink-400 font-medium uppercase tracking-wide">
                Items
              </Text>
              <Text className="text-ink-900 text-base font-semibold mt-0.5">
                {totalItems} {totalItems === 1 ? "item" : "items"}
              </Text>
            </View>
          </View>

          {/* Item name pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-4"
            contentContainerStyle={{ gap: 6, paddingVertical: 4 }}
          >
            {previewItems.map((item, i) => (
              <View
                key={i}
                className="bg-ink-50 rounded-full px-2.5 py-0.5"
              >
                <Text className="text-ink-600 text-2xs font-medium">
                  {item.name}
                </Text>
              </View>
            ))}
            {extraCount > 0 && (
              <View className="bg-ink-100 rounded-full px-2.5 py-0.5">
                <Text className="text-ink-500 text-2xs font-medium">
                  +{extraCount} more
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Action buttons */}
          <View className="flex-row gap-3">
            <PressableScale
              onPress={onDecline}
              className="flex-1 border border-danger/20 bg-danger/5 rounded-xl py-3.5 items-center justify-center"
              haptic="light"
            >
              <Text className="text-danger font-semibold text-sm">Decline</Text>
            </PressableScale>
            <PressableScale
              onPress={onAccept}
              className="flex-1 bg-brand rounded-xl py-3.5 items-center justify-center"
              haptic="success"
            >
              <Text className="text-white font-bold text-sm">Accept</Text>
            </PressableScale>
          </View>
        </View>
      </View>
    </MotiView>
  );
}
