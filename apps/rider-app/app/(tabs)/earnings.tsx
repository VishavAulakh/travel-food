import React, { useState, useEffect, useRef } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { MotiView } from "moti";
import { useQuery } from "@tanstack/react-query";
import { useRiderStore } from "../../store/rider";
import { api } from "../../lib/api";
import { type EarningEntry } from "../../lib/mock/riderEarnings";
import { formatINR, formatRelativeTime } from "../../lib/format";
import { shadows } from "../../lib/theme";
import { EmptyState, AnimatedListItem } from "../../components";
import { haptics } from "../../lib/haptics";

type ApiEarnings = {
  todayPaise: number;
  weekPaise: number;
  monthPaise: number;
  totalDeliveries: number;
  avgPerDeliveryPaise: number;
  recentEarnings: Array<{
    id: string;
    orderId: string;
    restaurantName: string;
    amount: number;
    distanceKm: number;
    date: string;
    timeSlot: EarningEntry['timeSlot'];
  }>;
  averageRating?: number;
};

type Period = "today" | "week" | "month";

const PERIODS: { id: Period; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
];

const TIME_SLOT_EMOJI: Record<EarningEntry["timeSlot"], string> = {
  morning: "☀️",
  afternoon: "🌤",
  evening: "🌇",
  night: "🌙",
};

function AnimatedAmount({ paise }: { paise: number }) {
  const displayRef = useRef(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const target = paise / 100;
    const duration = 700;
    const start = Date.now();
    const startVal = displayRef.current;

    const tick = () => {
      const elapsed = Date.now() - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = Math.round(startVal + (target - startVal) * eased);
      displayRef.current = current;
      setDisplay(current);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [paise]);

  return (
    <Text className="text-ink-900 text-4xl font-bold">
      ₹{display.toLocaleString("en-IN")}
    </Text>
  );
}

function IncentiveBanner({ todayPaise }: { todayPaise: number }) {
  const GOAL_PAISE = 50000;
  const goalReached = todayPaise >= GOAL_PAISE;
  const todayRupees = Math.round(todayPaise / 100);
  const progress = Math.min(todayPaise / GOAL_PAISE, 1);

  if (goalReached) {
    return (
      <View className="bg-success/5 border border-success/15 rounded-xl px-4 py-3 mb-4 flex-row items-center gap-3">
        <Ionicons name="trophy" size={24} color="#16A34A" />
        <Text className="text-ink-900 font-bold text-sm flex-1">
          🎯 Goal Reached! Great work today.
        </Text>
      </View>
    );
  }

  return (
    <View className="bg-brand/5 border border-brand/15 rounded-xl px-4 py-3 mb-4 flex-row items-center gap-3">
      <Ionicons name="trophy" size={24} color="#FC5F30" />
      <View className="flex-1">
        <Text className="text-ink-900 font-bold text-sm">Daily Goal: ₹500</Text>
        {/* Progress bar */}
        <View className="h-1.5 bg-ink-100 rounded-full mt-1.5 mb-1 overflow-hidden">
          <View
            className="h-full bg-brand rounded-full"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </View>
        <Text className="text-ink-400 text-2xs">
          ₹{todayRupees} / ₹500
        </Text>
      </View>
    </View>
  );
}

function PerformanceCard({ period, averageRating }: { period: Period; averageRating: number }) {
  const periodLabel =
    period === "today" ? "Day" : period === "week" ? "Week" : "Month";

  return (
    <View
      className="bg-white rounded-2xl px-4 py-3 mb-4"
      style={shadows.card}
    >
      <Text className="text-ink-900 font-bold text-sm mb-3">
        This {periodLabel}
      </Text>
      <View className="flex-row">
        {/* Acceptance Rate */}
        <View className="flex-1 items-center">
          <Text className="text-ink-400 text-2xs font-medium uppercase tracking-wide mb-1">
            Acceptance Rate
          </Text>
          <Text className="text-success font-bold text-lg">94%</Text>
        </View>
        {/* Divider */}
        <View className="w-px bg-ink-100 mx-2" />
        {/* Avg Rating */}
        <View className="flex-1 items-center">
          <Text className="text-ink-400 text-2xs font-medium uppercase tracking-wide mb-1">
            Avg Rating
          </Text>
          <Text className="text-gold font-bold text-lg">
            {averageRating.toFixed(1)}★
          </Text>
        </View>
        {/* Divider */}
        <View className="w-px bg-ink-100 mx-2" />
        {/* On-Time % */}
        <View className="flex-1 items-center">
          <Text className="text-ink-400 text-2xs font-medium uppercase tracking-wide mb-1">
            On-Time %
          </Text>
          <Text className="text-success font-bold text-lg">97%</Text>
        </View>
      </View>
    </View>
  );
}

export default function EarningsScreen() {
  const [period, setPeriod] = useState<Period>("today");
  const indicatorLeft = useSharedValue(0);
  const token = useRiderStore((s) => s.token);

  const { data: earningsData } = useQuery<ApiEarnings>({
    queryKey: ['earnings'],
    queryFn: () => api.get<ApiEarnings>('/riders/me/earnings', token ?? undefined),
    enabled: !!token,
  });

  // Filter recentEarnings by period client-side
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 6);
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const allEntries: EarningEntry[] = (earningsData?.recentEarnings ?? []).map((e) => ({
    ...e,
    amount: e.amount, // already in paise from API
  }));

  const todayEntries = allEntries.filter((e) => e.date.startsWith(todayStr));
  const weekEntries = allEntries.filter((e) => new Date(e.date) >= startOfWeek);
  const monthEntries = allEntries.filter((e) => new Date(e.date) >= startOfMonth);

  const periodData: Record<Period, EarningEntry[]> = {
    today: todayEntries,
    week: weekEntries,
    month: monthEntries,
  };

  const periodPaise: Record<Period, number> = {
    today: earningsData?.todayPaise ?? 0,
    week: earningsData?.weekPaise ?? 0,
    month: earningsData?.monthPaise ?? 0,
  };

  const handlePeriod = (id: Period, idx: number) => {
    haptics.selection();
    setPeriod(id);
    indicatorLeft.value = withSpring(idx, { damping: 18, stiffness: 200 });
  };

  const indicatorStyle = useAnimatedStyle(() => ({
    left: `${(indicatorLeft.value / PERIODS.length) * 100}%`,
    width: `${(1 / PERIODS.length) * 100}%`,
  }));

  const entries = periodData[period];
  const totalPaise = periodPaise[period];
  const avgPayout =
    entries.length > 0
      ? Math.round(entries.reduce((s, e) => s + e.amount, 0) / entries.length)
      : 0;
  const totalDist = entries.reduce((s, e) => s + e.distanceKm, 0);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="px-4 pt-4 pb-3 border-b border-ink-50">
        <Text className="text-ink-900 text-2xl font-bold">Earnings</Text>
      </View>

      {/* Period tabs */}
      <View className="mx-4 mt-4 mb-3 bg-surface-sunken rounded-2xl p-1 relative">
        <Animated.View
          style={[
            {
              position: "absolute",
              top: 4,
              bottom: 4,
              borderRadius: 14,
              backgroundColor: "#FFFFFF",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.06,
              shadowRadius: 4,
              elevation: 2,
            },
            indicatorStyle,
          ]}
        />
        <View className="flex-row">
          {PERIODS.map((p, i) => (
            <Pressable
              key={p.id}
              onPress={() => handlePeriod(p.id, i)}
              className="flex-1 py-2.5 items-center"
            >
              <Text
                className={`text-sm font-semibold ${
                  period === p.id ? "text-ink-900" : "text-ink-400"
                }`}
              >
                {p.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <FlatList
        data={entries}
        keyExtractor={(e) => e.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        ListHeaderComponent={
          <>
            {/* Incentive banner — today only */}
            {period === "today" ? (
              <IncentiveBanner todayPaise={earningsData?.todayPaise ?? 0} />
            ) : null}

            {/* Animated total */}
            <MotiView
              key={period}
              from={{ opacity: 0, translateY: 6 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 260 }}
              className="mb-4"
            >
              <AnimatedAmount paise={totalPaise} />
              <Text className="text-ink-400 text-sm mt-1">
                {period === "today" ? "Earned today" : period === "week" ? "Earned this week" : "Earned this month"}
              </Text>
            </MotiView>

            {/* Stats row */}
            <View className="flex-row gap-3 mb-5">
              <View className="flex-1 bg-surface-sunken rounded-xl px-3 py-3">
                <Text className="text-ink-400 text-2xs font-medium uppercase tracking-wide">
                  Deliveries
                </Text>
                <Text className="text-ink-900 font-bold text-lg mt-0.5">
                  {entries.length}
                </Text>
              </View>
              <View className="flex-1 bg-surface-sunken rounded-xl px-3 py-3">
                <Text className="text-ink-400 text-2xs font-medium uppercase tracking-wide">
                  Avg payout
                </Text>
                <Text className="text-ink-900 font-bold text-lg mt-0.5">
                  {formatINR(avgPayout)}
                </Text>
              </View>
              <View className="flex-1 bg-surface-sunken rounded-xl px-3 py-3">
                <Text className="text-ink-400 text-2xs font-medium uppercase tracking-wide">
                  Distance
                </Text>
                <Text className="text-ink-900 font-bold text-lg mt-0.5">
                  {totalDist.toFixed(1)}km
                </Text>
              </View>
            </View>

            {/* Performance summary card */}
            <PerformanceCard period={period} averageRating={earningsData?.averageRating ?? 4.8} />

            {entries.length > 0 ? (
              <Text className="text-ink-900 font-bold text-sm mb-3">
                Delivery history
              </Text>
            ) : null}
          </>
        }
        renderItem={({ item, index }) => (
          <AnimatedListItem index={index} from="bottom">
            <View
              className="flex-row items-center bg-white rounded-2xl p-3.5 mb-3"
              style={shadows.card}
            >
              <View className="w-10 h-10 rounded-xl bg-surface-tint items-center justify-center mr-3">
                <Ionicons name="bicycle" size={18} color="#FC5F30" />
              </View>
              <View className="flex-1">
                <Text className="text-ink-900 font-semibold text-sm" numberOfLines={1}>
                  {item.restaurantName}
                </Text>
                <View className="flex-row gap-2 mt-0.5">
                  <Text className="text-ink-400 text-xs">{item.orderId}</Text>
                  <Text className="text-ink-200 text-xs">·</Text>
                  <Text className="text-ink-400 text-xs">
                    {item.distanceKm.toFixed(1)} km
                  </Text>
                  <Text className="text-ink-200 text-xs">·</Text>
                  <Text className="text-ink-400 text-xs">
                    {TIME_SLOT_EMOJI[item.timeSlot]} {item.timeSlot}
                  </Text>
                </View>
              </View>
              <View className="items-end">
                <Text className="text-success font-bold text-base">
                  {formatINR(item.amount)}
                </Text>
                <Text className="text-ink-300 text-2xs mt-0.5">
                  {formatRelativeTime(item.date)}
                </Text>
              </View>
            </View>
          </AnimatedListItem>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="wallet-outline"
            title={
              period === "today"
                ? "No deliveries yet today"
                : "No deliveries this period"
            }
            description="Your completed deliveries will appear here"
          />
        }
      />
    </SafeAreaView>
  );
}
