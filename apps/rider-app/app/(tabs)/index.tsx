import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MotiView, AnimatePresence } from "moti";
import { useQuery } from "@tanstack/react-query";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useRiderStore } from "../../store/rider";
import { formatINR } from "../../lib/format";
import { haptics } from "../../lib/haptics";
import { shadows } from "../../lib/theme";
import {
  DeliveryRequestCard,
  OnlineToggleButton,
  EarningsCard,
  AnimatedListItem,
  EmptyState,
  Avatar,
} from "../../components";
import {
  pendingRequests,
  type DeliveryRequest,
} from "../../lib/mock/deliveryRequests";
import { earningsSummary } from "../../lib/mock/riderEarnings";
import { riderProfile } from "../../lib/mock/riderProfile";

const HOTSPOTS = ["Koramangala", "Indiranagar", "HSR Layout", "Whitefield"];
const HOTSPOT_DISTANCES = [0.8, 1.3, 2.1, 0.5];

const GOAL_PAISE = 50_000; // ₹500 daily goal

export default function OrdersScreen() {
  const { isOnline, toggleOnline, setActiveOrder, rider } = useRiderStore();
  const [showToast, setShowToast] = useState(false);
  const [dismissed, setDismissed] = useState<string[]>([]);

  const { data: requests = [], refetch } = useQuery<DeliveryRequest[]>({
    queryKey: ["pending-requests"],
    queryFn: async () => pendingRequests.filter((r) => !dismissed.includes(r.id)),
    refetchInterval: isOnline ? 15_000 : false,
    enabled: isOnline,
  });

  const visibleRequests = requests.filter((r) => !dismissed.includes(r.id));

  const handleToggle = () => {
    toggleOnline();
    if (!isOnline) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    }
  };

  const handleAccept = useCallback(
    (req: DeliveryRequest) => {
      haptics.success();
      setActiveOrder(req.id);
      router.push(`/delivery/${req.id}`);
    },
    [setActiveOrder]
  );

  const handleDecline = useCallback((id: string) => {
    haptics.light();
    setDismissed((prev) => [...prev, id]);
  }, []);

  const displayName = rider?.name ?? riderProfile.name;

  // Daily goal progress animation
  const goalProgress = Math.min(earningsSummary.todayPaise / GOAL_PAISE, 1);
  const progressWidth = useSharedValue(0);
  useEffect(() => {
    progressWidth.value = withTiming(goalProgress, { duration: 900 });
  }, [goalProgress]);
  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%` as unknown as number,
  }));
  const todayRupees = Math.round(earningsSummary.todayPaise / 100);
  const remainingRupees = Math.max(500 - todayRupees, 0);
  const goalReached = earningsSummary.todayPaise >= GOAL_PAISE;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Toast */}
      <AnimatePresence>
        {showToast ? (
          <MotiView
            key="toast"
            from={{ opacity: 0, translateY: -20 }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0, translateY: -20 }}
            transition={{ type: "spring", damping: 16, stiffness: 200 }}
            className="absolute top-0 left-0 right-0 z-50 items-center pt-2"
          >
            <View className="bg-success px-5 py-3 rounded-full flex-row gap-2 items-center shadow-md">
              <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
              <Text className="text-white font-semibold text-sm">
                You're now online!
              </Text>
            </View>
          </MotiView>
        ) : null}
      </AnimatePresence>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={refetch} tintColor="#FC5F30" />
        }
      >
        {/* Header row */}
        <View className="flex-row items-center px-4 pt-4 pb-3">
          {/* Avatar + name */}
          <View className="flex-row items-center gap-3">
            <Avatar
              uri={riderProfile.avatarUrl}
              name={displayName}
              size={40}
            />
            <View>
              <Text className="text-ink-400 text-xs">Hello,</Text>
              <Text className="text-ink-900 font-bold text-base">{displayName}</Text>
            </View>
          </View>

          {/* Streak chip (centered spacer) */}
          <View className="flex-1 items-center">
            {earningsSummary.totalDeliveries > 5 && (
              <View className="bg-warning/10 px-2 py-1 rounded-full flex-row items-center gap-1">
                <Text className="text-xs">🔥</Text>
                <Text
                  className="text-xs font-bold"
                  style={{ color: "#F59E0B" }}
                >
                  3
                </Text>
              </View>
            )}
          </View>

          {/* Online status chip */}
          <View
            className={`px-3 py-1.5 rounded-full flex-row gap-1.5 items-center ${
              isOnline ? "bg-success/10" : "bg-ink-100"
            }`}
          >
            <View
              className={`w-2 h-2 rounded-full ${
                isOnline ? "bg-online" : "bg-offline"
              }`}
            />
            <Text
              className={`text-xs font-semibold ${
                isOnline ? "text-success" : "text-ink-400"
              }`}
            >
              {isOnline ? "Online" : "Offline"}
            </Text>
          </View>
        </View>

        {/* Today's summary strip */}
        <View className="mx-4 mb-4 bg-surface-sunken rounded-2xl px-4 py-3 flex-row justify-between items-center">
          <View>
            <Text className="text-2xs text-ink-400 font-medium uppercase tracking-wide">
              Today
            </Text>
            <Text className="text-ink-900 font-bold text-lg">
              {formatINR(earningsSummary.todayPaise)}
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-2xs text-ink-400 font-medium uppercase tracking-wide">
              Deliveries
            </Text>
            <Text className="text-ink-900 font-bold text-lg">
              {earningsSummary.totalDeliveries}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-2xs text-ink-400 font-medium uppercase tracking-wide">
              Online
            </Text>
            <Text className="text-ink-900 font-bold text-lg">
              {earningsSummary.onlineHoursToday.toFixed(1)}h
            </Text>
          </View>
        </View>

        {/* Daily Goal Progress Card (offline only) */}
        {!isOnline && (
          <View
            className="bg-white rounded-2xl px-4 py-3 mx-4 mb-4"
            style={shadows.card}
          >
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-ink-900 font-bold text-sm">Daily Goal</Text>
              <Text className="text-ink-400 text-xs">₹500 target</Text>
            </View>
            {/* Progress track */}
            <View className="h-1.5 bg-ink-100 rounded-full overflow-hidden my-2">
              <Animated.View
                style={[
                  progressStyle,
                  { height: "100%", borderRadius: 99, backgroundColor: "#FC5F30" },
                ]}
              />
            </View>
            {/* Label below bar */}
            {goalReached ? (
              <Text className="text-success text-xs font-semibold">
                🎯 Goal reached!
              </Text>
            ) : (
              <Text className="text-ink-400 text-xs">
                ₹{todayRupees} earned · ₹{remainingRupees} to go
              </Text>
            )}
          </View>
        )}

        {/* Online toggle */}
        <View className="mx-4 mb-5">
          <OnlineToggleButton isOnline={isOnline} onToggle={handleToggle} />
        </View>

        {/* Content by state */}
        {!isOnline ? (
          <AnimatedListItem index={0} className="mx-4">
            <EarningsCard
              todayPaise={earningsSummary.todayPaise}
              weekPaise={earningsSummary.weekPaise}
              onlineHoursToday={earningsSummary.onlineHoursToday}
            />
            <View className="mt-6">
              <EmptyState
                icon="bicycle"
                title="Go online to start earning"
                description="Toggle the button above to start receiving delivery requests"
              />
            </View>
          </AnimatedListItem>
        ) : visibleRequests.length === 0 ? (
          <AnimatedListItem index={0} className="mx-4">
            {/* Pulsing spinner */}
            <View className="items-center py-10">
              <MotiView
                from={{ scale: 1, opacity: 0.8 }}
                animate={{ scale: 1.15, opacity: 0.4 }}
                transition={{ type: "timing", duration: 900, loop: true }}
                className="w-20 h-20 rounded-full bg-brand-50 items-center justify-center mb-4"
              >
                <Ionicons name="search" size={36} color="#FC5F30" />
              </MotiView>
              <Text className="text-ink-900 font-bold text-lg mb-1">
                Looking for orders...
              </Text>
              <Text className="text-ink-400 text-sm text-center">
                Stay in high-demand zones for faster orders
              </Text>

              {/* Hotspot chips */}
              <View className="flex-row flex-wrap gap-2 justify-center mt-5">
                {HOTSPOTS.map((zone, idx) => (
                  <View
                    key={zone}
                    className="bg-white rounded-xl px-3 py-2 flex-row items-center gap-1.5"
                    style={shadows.pill}
                  >
                    <Ionicons name="location" size={12} color="#FC5F30" />
                    <Text className="text-ink-900 text-xs font-semibold">
                      {zone}
                    </Text>
                    <Text className="text-ink-400 text-2xs">
                      ~{HOTSPOT_DISTANCES[idx]} km
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </AnimatedListItem>
        ) : (
          <View className="px-4">
            <Text className="text-ink-900 font-bold text-base mb-3">
              {visibleRequests.length} Request{visibleRequests.length > 1 ? "s" : ""} Nearby
            </Text>
            {visibleRequests.map((req, i) => (
              <AnimatedListItem key={req.id} index={i} from="bottom">
                <DeliveryRequestCard
                  request={req}
                  onAccept={() => handleAccept(req)}
                  onDecline={() => handleDecline(req.id)}
                />
              </AnimatedListItem>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
