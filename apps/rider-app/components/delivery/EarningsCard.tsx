import React, { useEffect, useRef, useState } from "react";
import { View, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { formatINR } from "../../lib/format";
import { shadows } from "../../lib/theme";
import { timing } from "../../lib/animations";

type Props = {
  todayPaise: number;
  weekPaise: number;
  onlineHoursToday: number;
  // 7 bar heights in arbitrary units (0–100) for Mon→Sun
  barValues?: number[];
  streakDays?: number;
  avgPerDelivery?: number; // paise, default 42000
};

const DEFAULT_BARS = [72, 85, 61, 90, 55, 78, 100];
const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

// Daily goal in paise (₹500)
const DAILY_GOAL_PAISE = 50000;

// --- Animated count-up amount display ---
function AnimatedAmount({
  targetPaise,
  className,
}: {
  targetPaise: number;
  className?: string;
}) {
  const [displayed, setDisplayed] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef(0);

  useEffect(() => {
    const DURATION = 900;
    fromRef.current = displayed;
    startRef.current = null;

    const step = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const t = Math.min(elapsed / DURATION, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.round(fromRef.current + (targetPaise - fromRef.current) * eased);
      setDisplayed(value);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [targetPaise]);

  return (
    <Text className={className ?? "text-ink-900 text-3xl font-bold"}>
      {formatINR(displayed)}
    </Text>
  );
}

// --- Animated bar ---
function Bar({ value, isToday }: { value: number; isToday: boolean }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(value / 100, { duration: 700 });
  }, [value]);

  const animStyle = useAnimatedStyle(() => ({
    height: interpolate(progress.value, [0, 1], [4, 48]),
  }));

  return (
    <Animated.View
      style={animStyle}
      className={`w-5 rounded-sm ${isToday ? "bg-brand" : "bg-ink-100"}`}
    />
  );
}

// --- Daily goal bar ---
function DailyGoalBar({ todayPaise }: { todayPaise: number }) {
  const progress = useSharedValue(0);
  const clampedRatio = Math.min(todayPaise / DAILY_GOAL_PAISE, 1);
  const goalReached = todayPaise >= DAILY_GOAL_PAISE;

  useEffect(() => {
    progress.value = withTiming(clampedRatio, timing.slow);
  }, [clampedRatio]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%` as any,
  }));

  return (
    <View className="mt-4 pt-4 border-t border-ink-100">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-ink-400 text-2xs font-medium uppercase tracking-wide">
          Daily Goal
        </Text>
        {goalReached ? (
          <Text className="text-success text-2xs font-bold">
            🎯 Goal reached!
          </Text>
        ) : (
          <Text className="text-ink-400 text-2xs">
            {formatINR(todayPaise)} / {formatINR(DAILY_GOAL_PAISE)}
          </Text>
        )}
      </View>

      {/* Track */}
      <View className="h-1.5 bg-ink-100 rounded-full overflow-hidden">
        <Animated.View
          className="h-1.5 bg-brand rounded-full"
          style={barStyle}
        />
      </View>

      {/* Edge labels */}
      <View className="flex-row justify-between mt-1">
        <Text className="text-ink-300 text-2xs">₹0</Text>
        <Text className="text-ink-300 text-2xs">₹500 goal</Text>
      </View>
    </View>
  );
}

export function EarningsCard({
  todayPaise,
  weekPaise,
  onlineHoursToday,
  barValues = DEFAULT_BARS,
  streakDays = 3,
  avgPerDelivery = 42000,
}: Props) {
  const todayIdx = new Date().getDay();
  // getDay() returns 0=Sun...6=Sat, our bars are Mon(0)...Sun(6)
  const todayBarIdx = todayIdx === 0 ? 6 : todayIdx - 1;

  return (
    <View className="bg-white rounded-2xl p-4" style={shadows.card}>
      {/* Header row: label + streak badge */}
      <View className="flex-row items-start justify-between mb-1">
        <Text className="text-ink-400 text-xs font-medium uppercase tracking-wide">
          Today's Earnings
        </Text>
        {streakDays >= 2 && (
          <View
            className="flex-row items-center gap-1 px-2.5 py-0.5 rounded-full"
            style={{ backgroundColor: "rgba(245,158,11,0.12)" }}
          >
            <Text style={{ fontSize: 11 }}>🔥</Text>
            <Text
              className="text-xs font-semibold"
              style={{ color: "#F59E0B" }}
            >
              {streakDays}-day streak
            </Text>
          </View>
        )}
      </View>

      {/* Animated main amount */}
      <View className="mb-4">
        <AnimatedAmount targetPaise={todayPaise} />
      </View>

      {/* Stats row — This Week | Avg/Order */}
      <View className="flex-row gap-4 mb-5">
        <View className="flex-1 bg-surface-sunken rounded-xl px-3 py-2.5">
          <Text className="text-ink-400 text-2xs font-medium">This Week</Text>
          <Text className="text-ink-900 font-bold text-sm mt-0.5">
            {formatINR(weekPaise)}
          </Text>
        </View>
        <View className="flex-1 bg-surface-sunken rounded-xl px-3 py-2.5">
          <Text className="text-ink-400 text-2xs font-medium">Avg/Order</Text>
          <Text className="text-ink-900 font-bold text-sm mt-0.5">
            {formatINR(avgPerDelivery)}
          </Text>
        </View>
      </View>

      {/* Bar chart */}
      <View className="flex-row items-end justify-between">
        {barValues.slice(0, 7).map((v, i) => (
          <View key={i} className="items-center gap-1">
            <Bar value={v} isToday={i === todayBarIdx} />
            <Text
              className={`text-2xs font-medium ${
                i === todayBarIdx ? "text-brand" : "text-ink-300"
              }`}
            >
              {DAY_LABELS[i]}
            </Text>
          </View>
        ))}
      </View>

      {/* Daily goal progress */}
      <DailyGoalBar todayPaise={todayPaise} />
    </View>
  );
}
