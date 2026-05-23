import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import type { Restaurant } from "../../lib/mock/restaurants";
import { formatEta, formatDistance, formatCostForTwo } from "../../lib/format";
import { Card } from "../ui/Card";
import { RatingPill } from "../ui/RatingPill";
import { FadeInImage } from "../ui/FadeInImage";
import { Chip } from "../ui/Chip";

type Props = {
  restaurant: Restaurant;
  variant?: "feed" | "compact" | "horizontal";
};

export function RestaurantCard({ restaurant, variant = "feed" }: Props) {
  const onPress = () => router.push(`/restaurant/${restaurant.id}`);

  if (variant === "horizontal") {
    return (
      <Card
        onPress={onPress}
        className="w-64 mr-3"
        elevation="card"
      >
        <View className="relative">
          <FadeInImage
            uri={restaurant.imageUrl}
            style={{ width: "100%", height: 140 }}
          />
          {restaurant.promoText ? (
            <View className="absolute bottom-2 left-2">
              <View className="bg-black/80 px-2.5 py-1 rounded-md">
                <Text className="text-white text-2xs font-bold">{restaurant.promoText}</Text>
              </View>
            </View>
          ) : null}
        </View>
        <View className="p-3">
          <Text className="text-ink-900 font-bold text-base" numberOfLines={1}>
            {restaurant.name}
          </Text>
          <View className="flex-row items-center mt-1 gap-2">
            <RatingPill rating={restaurant.rating} size="xs" />
            <Text className="text-ink-500 text-2xs">•</Text>
            <Text className="text-ink-500 text-2xs">{formatEta(restaurant.deliveryMinutes)}</Text>
          </View>
          <Text className="text-ink-500 text-2xs mt-1" numberOfLines={1}>
            {restaurant.cuisines.slice(0, 2).join(", ")}
          </Text>
        </View>
      </Card>
    );
  }

  // Feed variant (default — Swiggy-style large card)
  return (
    <Card onPress={onPress} className="mb-5" elevation="card">
      <View className="relative">
        <FadeInImage
          uri={restaurant.imageUrl}
          style={{ width: "100%", height: 180 }}
        />
        {/* Promo overlay bottom-left */}
        {restaurant.promoText ? (
          <View className="absolute bottom-3 left-3">
            <View
              className="px-3 py-1.5 rounded-md"
              style={{ backgroundColor: "rgba(10,10,10,0.85)" }}
            >
              <Text className="text-white text-xs font-bold uppercase tracking-wide">
                {restaurant.promoText}
              </Text>
            </View>
          </View>
        ) : null}
        {/* Heart button top-right */}
        <View className="absolute top-3 right-3">
          <View className="w-9 h-9 bg-white/95 rounded-full items-center justify-center">
            <Ionicons name="heart-outline" size={20} color="#0A0A0A" />
          </View>
        </View>
        {/* Free delivery ribbon */}
        {restaurant.hasFreeDelivery ? (
          <View className="absolute top-3 left-3">
            <View className="bg-info/95 px-2 py-1 rounded-md flex-row items-center">
              <Ionicons name="bicycle" size={12} color="#fff" />
              <Text className="text-white text-2xs font-bold ml-1">FREE DELIVERY</Text>
            </View>
          </View>
        ) : null}
      </View>

      <View className="p-4">
        <View className="flex-row items-start justify-between">
          <Text className="text-ink-900 font-bold text-lg flex-1 mr-2" numberOfLines={1}>
            {restaurant.name}
          </Text>
          <RatingPill
            rating={restaurant.rating}
            totalRatings={restaurant.totalRatings}
            size="sm"
            showCount
          />
        </View>

        <View className="flex-row items-center mt-2">
          <Text className="text-ink-600 text-sm">
            {formatEta(restaurant.deliveryMinutes)}
          </Text>
          <View className="w-1 h-1 bg-ink-300 rounded-full mx-2" />
          <Text className="text-ink-600 text-sm">{formatCostForTwo(restaurant.costForTwoPaise)}</Text>
        </View>

        <Text className="text-ink-500 text-xs mt-1" numberOfLines={1}>
          {restaurant.cuisines.join(", ")}
        </Text>

        <View className="flex-row items-center justify-between mt-2.5">
          <Text className="text-ink-400 text-2xs">
            {restaurant.area} • {formatDistance(restaurant.distanceMeters)}
          </Text>
        </View>

        {restaurant.offers && restaurant.offers.length > 0 ? (
          <View className="mt-3 pt-3 border-t border-dashed border-ink-200">
            <View className="flex-row items-center">
              <Ionicons name="pricetag" size={12} color="#FC5F30" />
              <Text className="text-brand text-xs font-semibold ml-1.5">
                {restaurant.offers[0]}
              </Text>
            </View>
          </View>
        ) : null}
      </View>
    </Card>
  );
}
