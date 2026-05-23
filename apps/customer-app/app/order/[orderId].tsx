import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";

import {
  AddressCard,
  AnimatedListItem,
  BillBreakdown,
  Button,
  Card,
  Divider,
  EmptyState,
  FadeInImage,
  Header,
  PaymentMethodRow,
  PressableScale,
  SectionHeader,
  VegIndicator,
} from "../../components";
import { getOrderById, type Order } from "../../lib/mock/orders";
import { getRestaurantById } from "../../lib/mock/restaurants";
import { getDefaultAddress } from "../../lib/mock/addresses";
import { paymentMethods } from "../../lib/mock/payments";
import {
  formatINR,
  formatOrderTime,
  pluralize,
} from "../../lib/format";
import { haptics } from "../../lib/haptics";

export default function OrderDetailScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const order = orderId ? getOrderById(orderId) : undefined;

  // If active order, redirect to live tracking.
  useEffect(() => {
    if (!order) return;
    const isActive = !["delivered", "cancelled"].includes(order.status);
    if (isActive) router.replace(`/tracking/${order.id}`);
  }, [order?.id]);

  if (!order) {
    return (
      <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-background">
        <Header title="Order" />
        <EmptyState
          icon="receipt-outline"
          title="Order not found"
          description="We couldn't find this order. It may have been removed."
          ctaLabel="Back to orders"
          onCtaPress={() => router.replace("/(tabs)/orders")}
        />
      </SafeAreaView>
    );
  }

  // Resolve a payment method to display via PaymentMethodRow.
  const matchedMethod = useMemo(() => {
    const candidate =
      paymentMethods.find((p) => p.label === order.paymentLabel) ??
      paymentMethods.find((p) => p.type === order.paymentMethod);
    if (candidate) return candidate;
    // Fabricate one as a last resort so the row renders something useful.
    return {
      id: "pm-fallback",
      type: order.paymentMethod,
      label: order.paymentLabel,
      subLabel: undefined,
      icon: order.paymentMethod === "cod" ? "cash-outline" : "card",
      iconColor: "#737373",
    } as (typeof paymentMethods)[number];
  }, [order]);

  const restaurant = getRestaurantById(order.restaurantId);
  const address = getDefaultAddress();
  const itemsCount = order.items.reduce((sum, i) => sum + i.qty, 0);

  // Derive delivery duration / distance
  const deliveredInMin = order.deliveredAt
    ? Math.max(
        1,
        Math.round(
          (new Date(order.deliveredAt).getTime() -
            new Date(order.placedAt).getTime()) /
            60_000
        )
      )
    : 35;
  const distanceKm = restaurant
    ? Math.max(0.5, restaurant.distanceMeters / 1000)
    : 2.4;

  const [rating, setRating] = useState(0);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-surface-sunken">
      <Header
        title="Order Details"
        rightSlot={
          <PressableScale
            haptic="light"
            scaleTo={0.9}
            className="w-11 h-11 items-center justify-center rounded-full"
            onPress={() => haptics.selection()}
          >
            <Ionicons name="share-outline" size={22} color="#0A0A0A" />
          </PressableScale>
        }
      />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Success summary */}
        <AnimatedListItem index={0}>
          <SuccessSummary
            order={order}
            rating={rating}
            onRate={(r) => {
              haptics.success();
              setRating(r);
            }}
          />
        </AnimatedListItem>

        {/* Restaurant card */}
        {restaurant ? (
          <AnimatedListItem index={1}>
            <View className="px-4 mt-4">
              <Card elevation="card">
                <PressableScale
                  haptic="light"
                  onPress={() => router.push(`/restaurant/${restaurant.id}`)}
                  className="p-4 flex-row items-center"
                >
                  <FadeInImage
                    uri={restaurant.imageUrl}
                    style={{ width: 56, height: 56 }}
                    borderRadius={14}
                  />
                  <View className="flex-1 ml-3">
                    <Text className="text-ink-900 font-bold text-base" numberOfLines={1}>
                      {restaurant.name}
                    </Text>
                    <Text className="text-ink-500 text-2xs mt-0.5" numberOfLines={1}>
                      {restaurant.area}, {restaurant.city}
                    </Text>
                  </View>
                  <Button
                    label="Visit again"
                    size="sm"
                    variant="outline"
                    onPress={() => router.push(`/restaurant/${restaurant.id}`)}
                    haptic="light"
                  />
                </PressableScale>
              </Card>
            </View>
          </AnimatedListItem>
        ) : null}

        {/* Items */}
        <AnimatedListItem index={2}>
          <View className="px-4 mt-5">
            <View className="flex-row items-center mb-3 px-1">
              <Ionicons name="restaurant" size={14} color="#0A0A0A" />
              <Text className="text-ink-900 font-bold text-sm ml-2">
                {pluralize(order.items.length, "Item")} Ordered
              </Text>
            </View>
            <Card elevation="card">
              <View className="p-4">
                {order.items.map((it, i) => (
                  <View key={it.id}>
                    <View className="flex-row items-center py-2.5">
                      <VegIndicator isVeg={it.isVeg} />
                      <View className="flex-1 ml-3">
                        <Text className="text-ink-900 text-sm font-semibold" numberOfLines={2}>
                          {it.name}
                        </Text>
                        <Text className="text-ink-500 text-2xs mt-0.5">
                          × {it.qty}
                        </Text>
                      </View>
                      <Text className="text-ink-900 text-sm font-semibold">
                        {formatINR(it.pricePaise * it.qty)}
                      </Text>
                    </View>
                    {i < order.items.length - 1 ? <Divider /> : null}
                  </View>
                ))}
              </View>
            </Card>
          </View>
        </AnimatedListItem>

        {/* Delivery details */}
        <AnimatedListItem index={3}>
          <View className="px-4 mt-5">
            <SectionHeader title="Delivery Details" />
            <Card elevation="card">
              <View className="p-4">
                <DeliveryRow
                  icon="storefront"
                  iconColor="#FC5F30"
                  label="From"
                  primary={order.restaurantName}
                  secondary={order.restaurantArea}
                />
                <View className="my-3 ml-5 border-l-2 border-dashed border-ink-200 h-4" />
                <DeliveryRow
                  icon="location"
                  iconColor="#0A0A0A"
                  label="Delivered to"
                  primary={`${address.line1}${
                    address.line2 ? `, ${address.line2}` : ""
                  }`}
                  secondary={`${address.area}, ${address.city} ${address.pincode}`}
                />
                <Divider className="my-3" dashed />
                <View className="flex-row">
                  <Stat
                    icon="time-outline"
                    label="Delivered in"
                    value={`${deliveredInMin} min`}
                  />
                  <Stat
                    icon="navigate-outline"
                    label="Distance"
                    value={`${distanceKm.toFixed(1)} km`}
                  />
                  <Stat
                    icon="bag-check-outline"
                    label="Items"
                    value={String(itemsCount)}
                  />
                </View>
              </View>
            </Card>
          </View>
        </AnimatedListItem>

        {/* Address card (compact) */}
        <AnimatedListItem index={4}>
          <View className="px-4 mt-3">
            <AddressCard address={address} compact />
          </View>
        </AnimatedListItem>

        {/* Payment details */}
        <AnimatedListItem index={5}>
          <View className="px-4 mt-5">
            <SectionHeader title="Payment" />
            <Card elevation="card">
              <View className="px-3">
                <PaymentMethodRow method={matchedMethod} selected />
              </View>
            </Card>
          </View>
        </AnimatedListItem>

        {/* Bill breakdown */}
        <AnimatedListItem index={6}>
          <View className="px-4 mt-5">
            <BillBreakdown
              itemsTotalPaise={order.itemsTotalPaise}
              deliveryFeePaise={order.deliveryFeePaise}
              taxPaise={order.taxPaise}
              discountPaise={order.discountPaise}
              totalPaise={order.totalPaise}
            />
          </View>
        </AnimatedListItem>

        {/* Help section */}
        <AnimatedListItem index={7}>
          <View className="px-4 mt-6">
            <SectionHeader
              title="Need help with this order?"
              uppercase
            />
            <Card elevation="card">
              <HelpRow icon="warning-outline" label="Got a quality issue" />
              <Divider />
              <HelpRow icon="card-outline" label="Payment-related issue" />
              <Divider />
              <HelpRow icon="chatbubble-ellipses-outline" label="Other" />
            </Card>
          </View>
        </AnimatedListItem>

        {/* Order meta */}
        <AnimatedListItem index={8}>
          <View className="px-4 mt-5 mb-2 items-center">
            <Text className="text-ink-400 text-2xs font-semibold tracking-widest uppercase">
              Order ID · {order.shortId}
            </Text>
            <Text className="text-ink-400 text-2xs mt-1">
              Placed on {formatOrderTime(order.placedAt)}
            </Text>
          </View>
        </AnimatedListItem>
      </ScrollView>

      {/* Sticky reorder bar */}
      <ReorderBar order={order} />
    </SafeAreaView>
  );
}

// ---- pieces ----

function SuccessSummary({
  order,
  rating,
  onRate,
}: {
  order: Order;
  rating: number;
  onRate: (r: number) => void;
}) {
  const isCancelled = order.status === "cancelled";
  return (
    <View className="mx-4 mt-3 rounded-3xl overflow-hidden">
      <View
        className={isCancelled ? "bg-danger/10" : "bg-surface-tint"}
        style={{
          padding: 20,
          borderWidth: 1,
          borderColor: isCancelled ? "#FCA5A5" : "#FFE4D9",
        }}
      >
        <MotiView
          from={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 10, stiffness: 200 }}
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: isCancelled ? "#DC2626" : "#FC5F30",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: isCancelled ? "#DC2626" : "#FC5F30",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
          }}
        >
          <Ionicons
            name={isCancelled ? "close" : "checkmark"}
            size={32}
            color="#fff"
          />
        </MotiView>
        <Text className="text-ink-900 text-2xl font-extrabold mt-4">
          {isCancelled ? "Order Cancelled" : "Order Delivered"}
        </Text>
        <Text className="text-ink-600 text-xs mt-1">
          {isCancelled
            ? "This order didn't go through. No worries — try again!"
            : `Delivered on ${formatOrderTime(
                order.deliveredAt ?? order.placedAt
              )}`}
        </Text>

        {!isCancelled ? (
          <View className="mt-5 bg-white rounded-2xl p-4 border border-ink-100">
            <Text className="text-ink-700 text-xs font-bold uppercase tracking-widest">
              Rate your order
            </Text>
            <View className="flex-row mt-2.5">
              {[1, 2, 3, 4, 5].map((n) => {
                const filled = n <= rating;
                return (
                  <PressableScale
                    key={n}
                    onPress={() => onRate(n)}
                    haptic="medium"
                    scaleTo={0.85}
                    className="mr-2"
                  >
                    <MotiView
                      animate={{ scale: filled ? 1.05 : 1 }}
                      transition={{ type: "spring", damping: 10, stiffness: 220 }}
                    >
                      <Ionicons
                        name={filled ? "star" : "star-outline"}
                        size={30}
                        color={filled ? "#F59E0B" : "#A3A3A3"}
                      />
                    </MotiView>
                  </PressableScale>
                );
              })}
            </View>
            {rating > 0 ? (
              <Text className="text-ink-600 text-xs mt-2">
                Thanks for rating! Your feedback helps us improve.
              </Text>
            ) : (
              <Text className="text-ink-400 text-2xs mt-2">
                Tap to rate · helps our riders & restaurants
              </Text>
            )}
          </View>
        ) : null}
      </View>
    </View>
  );
}

function DeliveryRow({
  icon,
  iconColor,
  label,
  primary,
  secondary,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  iconColor: string;
  label: string;
  primary: string;
  secondary: string;
}) {
  return (
    <View className="flex-row items-start">
      <View
        className="w-9 h-9 rounded-full items-center justify-center"
        style={{ backgroundColor: `${iconColor}15` }}
      >
        <Ionicons name={icon} size={16} color={iconColor} />
      </View>
      <View className="flex-1 ml-3">
        <Text className="text-ink-400 text-2xs font-semibold uppercase tracking-wide">
          {label}
        </Text>
        <Text className="text-ink-900 text-sm font-bold mt-0.5" numberOfLines={1}>
          {primary}
        </Text>
        <Text className="text-ink-500 text-2xs mt-0.5" numberOfLines={2}>
          {secondary}
        </Text>
      </View>
    </View>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
}) {
  return (
    <View className="flex-1 items-center">
      <Ionicons name={icon} size={18} color="#FC5F30" />
      <Text className="text-ink-900 text-sm font-bold mt-1">{value}</Text>
      <Text className="text-ink-400 text-2xs mt-0.5">{label}</Text>
    </View>
  );
}

function HelpRow({
  icon,
  label,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
}) {
  return (
    <PressableScale
      onPress={() => haptics.selection()}
      haptic="none"
      scaleTo={0.995}
      className="flex-row items-center px-4 py-3.5"
    >
      <View className="w-9 h-9 rounded-full bg-ink-50 items-center justify-center">
        <Ionicons name={icon} size={16} color="#404040" />
      </View>
      <Text className="flex-1 ml-3 text-ink-800 text-sm font-medium">
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={18} color="#A3A3A3" />
    </PressableScale>
  );
}

function ReorderBar({ order }: { order: Order }) {
  return (
    <View
      className="absolute left-0 right-0 bottom-0 bg-white border-t border-ink-100"
      style={{
        paddingBottom: 24,
        paddingTop: 12,
        paddingHorizontal: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 10,
      }}
    >
      <View className="flex-row items-center">
        <View className="flex-1">
          <Text className="text-ink-400 text-2xs uppercase tracking-widest font-semibold">
            Order Total
          </Text>
          <Text className="text-ink-900 text-lg font-extrabold mt-0.5">
            {formatINR(order.totalPaise)}
          </Text>
        </View>
        <Button
          label="Reorder"
          icon="repeat"
          size="md"
          variant="primary"
          haptic="medium"
          onPress={() => {
            haptics.success();
            router.push("/(tabs)/cart");
          }}
        />
      </View>
    </View>
  );
}
