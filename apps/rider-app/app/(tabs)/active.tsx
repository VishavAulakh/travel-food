import React from "react";
import { View, Text, ScrollView, Pressable, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useQuery } from "@tanstack/react-query";
import { useRiderStore } from "../../store/rider";
import { api } from "../../lib/api";
import { type DeliveryRequest } from "../../lib/mock/deliveryRequests";
import { formatINR } from "../../lib/format";
import { shadows } from "../../lib/theme";
import {
  EmptyState,
  Button,
  NavigationStep,
  AnimatedListItem,
} from "../../components";

export default function ActiveDeliveryTab() {
  const { activeOrderId, token } = useRiderStore();

  const { data: request } = useQuery<DeliveryRequest | null>({
    queryKey: ['delivery-order', activeOrderId],
    queryFn: () =>
      activeOrderId && token
        ? api.get<DeliveryRequest>(`/riders/delivery/${activeOrderId}`, token)
        : Promise.resolve(null),
    enabled: !!activeOrderId && !!token,
    refetchInterval: 10_000,
  });

  const { data: recentDeliveries = [] } = useQuery<DeliveryRequest[]>({
    queryKey: ['recent-deliveries'],
    queryFn: () =>
      token
        ? api.get<DeliveryRequest[]>('/riders/me/delivery-history?limit=3', token)
        : Promise.resolve([]),
    enabled: !!token && !activeOrderId,
  });

  /* ── No active order ── */
  if (!activeOrderId || !request) {
    const recentThree = recentDeliveries.slice(0, 3);

    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        {/* Header */}
        <View className="px-4 py-4">
          <Text className="text-ink-900 text-2xl font-bold">Active</Text>
        </View>

        {/* Empty state */}
        <EmptyState
          icon="bicycle-outline"
          title="No Active Delivery"
          description="Accept an order from the Orders tab"
          ctaLabel="Go to Orders"
          onCtaPress={() => router.push("/(tabs)")}
        />

        {/* Recent deliveries */}
        {recentThree.length > 0 && (
          <View className="px-4 mt-2">
            <Text className="text-ink-900 font-bold text-sm mb-3">
              Recent deliveries
            </Text>
            {recentThree.map((d, i) => (
              <AnimatedListItem key={d.id} index={i}>
                <View
                  className="flex-row items-center justify-between py-3"
                  style={
                    i < recentThree.length - 1
                      ? { borderBottomWidth: 1, borderBottomColor: "#E5E5E5" }
                      : undefined
                  }
                >
                  {/* Left: icon + name */}
                  <View className="flex-row items-center gap-3 flex-1">
                    <View className="w-8 h-8 rounded-full bg-success/10 items-center justify-center">
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color="#16A34A"
                      />
                    </View>
                    <View className="flex-1">
                      <Text
                        className="text-ink-900 font-semibold text-sm"
                        numberOfLines={1}
                      >
                        {d.restaurant.name}
                      </Text>
                      <Text className="text-ink-400 text-xs">
                        {d.orderId}
                      </Text>
                    </View>
                  </View>
                  {/* Right: payout */}
                  <Text className="text-success font-bold text-sm">
                    {formatINR(d.payoutPaise)}
                  </Text>
                </View>
              </AnimatedListItem>
            ))}
          </View>
        )}
      </SafeAreaView>
    );
  }

  /* ── Active order ── */
  const totalItems = request.items.reduce((s, i) => s + i.qty, 0);
  const totalRouteKm = (
    request.restaurant.distanceFromRiderKm +
    request.customer.distanceFromRestaurantKm
  ).toFixed(1);

  const visibleItems = request.items.slice(0, 4);
  const extraItems = request.items.length - 4;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* ── Header ── */}
      <View className="px-4 py-4 flex-row items-center justify-between">
        {/* Left */}
        <View>
          <Text className="text-ink-900 text-2xl font-bold">
            Active Delivery
          </Text>
          <View className="flex-row items-center gap-1.5 mt-0.5">
            {/* Pulsing green dot */}
            <MotiView
              from={{ scale: 1, opacity: 1 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ type: "timing", duration: 900, loop: true }}
              className="w-2 h-2 rounded-full bg-success"
            />
            <Text className="text-success text-xs font-semibold">Ongoing</Text>
          </View>
        </View>
        {/* Right: order ID pill */}
        <View className="bg-success/10 px-3 py-1.5 rounded-full">
          <Text className="text-success text-xs font-bold">
            {request.orderId}
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 1. ETA Card ── */}
        <AnimatedListItem index={0}>
          <View className="bg-surface-tint border border-brand/10 rounded-2xl p-4 mb-3 flex-row items-center">
            {/* Countdown */}
            <View className="flex-1">
              <Text className="text-ink-900 font-bold text-3xl">
                ~{request.estimatedDeliveryMinutes} min
              </Text>
              <Text className="text-ink-400 text-xs mt-0.5">
                Estimated delivery
              </Text>
            </View>
            {/* Vertical divider */}
            <View className="w-px bg-brand/20 self-stretch mx-4" />
            {/* Mini stats */}
            <View className="gap-2">
              <View className="flex-row items-center gap-1">
                <Text className="text-sm">📍</Text>
                <Text className="text-ink-900 font-semibold text-xs">
                  {request.restaurant.distanceFromRiderKm.toFixed(1)} km
                </Text>
                <Text className="text-ink-400 text-2xs">pickup</Text>
              </View>
              <View className="flex-row items-center gap-1">
                <Text className="text-sm">🏠</Text>
                <Text className="text-ink-900 font-semibold text-xs">
                  {request.customer.distanceFromRestaurantKm.toFixed(1)} km
                </Text>
                <Text className="text-ink-400 text-2xs">drop</Text>
              </View>
            </View>
          </View>
        </AnimatedListItem>

        {/* ── 2. Route Card ── */}
        <AnimatedListItem index={1}>
          <View className="bg-white rounded-2xl p-4 mb-3" style={shadows.card}>
            {/* Pickup row */}
            <View className="flex-row items-start gap-3">
              <View className="items-center" style={{ width: 14 }}>
                <View className="w-3 h-3 rounded-full bg-brand mt-0.5" />
              </View>
              <View className="flex-1">
                <Text className="text-ink-900 font-semibold text-sm">
                  {request.restaurant.name}
                </Text>
                <Text
                  className="text-ink-400 text-xs mt-0.5"
                  numberOfLines={1}
                >
                  {request.restaurant.address}
                </Text>
              </View>
            </View>

            {/* Dashed connector */}
            <View className="flex-row" style={{ paddingLeft: 5 }}>
              <View
                style={{
                  width: 4,
                  minHeight: 20,
                  borderLeftWidth: 2,
                  borderLeftColor: "#D4D4D4",
                  borderStyle: "dashed",
                  marginLeft: 2,
                  marginVertical: 4,
                }}
              />
            </View>

            {/* Dropoff row */}
            <View className="flex-row items-start gap-3">
              <View className="items-center" style={{ width: 14 }}>
                <View
                  className="w-3 h-3 rounded-full mt-0.5"
                  style={{ backgroundColor: "#16A34A" }}
                />
              </View>
              <View className="flex-1">
                <Text className="text-ink-900 font-semibold text-sm">
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

            {/* Footer total route */}
            <View className="mt-3 pt-3 border-t border-ink-50 flex-row justify-end">
              <Text className="text-ink-400 text-xs">
                Total route:{" "}
                <Text className="text-ink-700 font-semibold">
                  {totalRouteKm} km
                </Text>
              </Text>
            </View>
          </View>
        </AnimatedListItem>

        {/* ── 3. Delivery Progress ── */}
        <AnimatedListItem index={2}>
          <View className="bg-white rounded-2xl p-4 mb-3" style={shadows.card}>
            <Text className="text-ink-900 font-bold text-sm mb-4">
              Delivery Progress
            </Text>
            <NavigationStep
              step={1}
              label="Head to restaurant"
              sublabel={request.restaurant.name}
              isActive={request.status === "accepted"}
              isCompleted={
                request.status === "picked_up" ||
                request.status === "delivered"
              }
            />
            <NavigationStep
              step={2}
              label="Pick up order"
              sublabel={`${totalItems} items`}
              isActive={request.status === "picked_up"}
              isCompleted={request.status === "delivered"}
            />
            <NavigationStep
              step={3}
              label="Deliver to customer"
              sublabel={request.customer.name}
              isActive={false}
              isCompleted={request.status === "delivered"}
              isLast
            />
          </View>
        </AnimatedListItem>

        {/* ── 4. Order Items Preview ── */}
        <AnimatedListItem index={3}>
          <View className="bg-white rounded-2xl p-4 mb-3" style={shadows.card}>
            {/* Header */}
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-ink-900 font-bold text-sm">
                Order items
              </Text>
              <View className="bg-ink-100 px-2 py-0.5 rounded-full">
                <Text className="text-ink-400 text-xs">{totalItems} items</Text>
              </View>
            </View>
            {/* Item list */}
            {visibleItems.map((item, i) => (
              <View
                key={i}
                className="flex-row items-center justify-between py-1.5"
              >
                <View className="flex-row items-center gap-2 flex-1">
                  <View className="w-1.5 h-1.5 rounded-full bg-brand" />
                  <Text
                    className="text-ink-700 text-sm flex-1"
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                </View>
                <Text className="text-ink-400 text-sm ml-2">×{item.qty}</Text>
              </View>
            ))}
            {extraItems > 0 && (
              <Text className="text-ink-400 text-xs italic mt-1">
                ...and {extraItems} more
              </Text>
            )}
          </View>
        </AnimatedListItem>

        {/* ── 5. Payout Summary ── */}
        <AnimatedListItem index={4}>
          <View className="bg-surface-sunken rounded-2xl px-4 py-4 mb-3 flex-row items-center">
            <View className="flex-1 items-center">
              <Text className="text-ink-400 text-xs mb-0.5">Order value</Text>
              <Text className="text-ink-900 font-bold text-base">
                {formatINR(request.totalPaise)}
              </Text>
            </View>
            <View className="w-px h-10 bg-ink-200" />
            <View className="flex-1 items-center">
              <Text className="text-ink-400 text-xs mb-0.5">Your payout</Text>
              <Text
                className="font-bold text-lg"
                style={{ color: "#16A34A" }}
              >
                {formatINR(request.payoutPaise)}
              </Text>
            </View>
          </View>
        </AnimatedListItem>

        {/* ── 6. Action Buttons ── */}
        <AnimatedListItem index={5}>
          {/* Primary: full map */}
          <Button
            label="Open Full Map & Navigation"
            onPress={() => router.push(`/delivery/${activeOrderId}`)}
            fullWidth
            size="lg"
            icon="map"
          />

          {/* Secondary: call buttons */}
          <View className="flex-row gap-3 mt-3">
            <Pressable
              onPress={() => Linking.openURL("tel:+919880011223")}
              className="flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl border border-brand bg-white"
            >
              <Ionicons name="call" size={16} color="#FC5F30" />
              <Text className="text-brand font-semibold text-sm">
                Call Restaurant
              </Text>
            </Pressable>
            <Pressable
              onPress={() => Linking.openURL("tel:+918765432100")}
              className="flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl border bg-white"
              style={{ borderColor: "#16A34A" }}
            >
              <Ionicons name="call" size={16} color="#16A34A" />
              <Text
                className="font-semibold text-sm"
                style={{ color: "#16A34A" }}
              >
                Call Customer
              </Text>
            </Pressable>
          </View>
        </AnimatedListItem>
      </ScrollView>
    </SafeAreaView>
  );
}
