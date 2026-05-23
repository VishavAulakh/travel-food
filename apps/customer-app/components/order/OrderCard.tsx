import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import type { Order } from "../../lib/mock/orders";
import { formatINR, formatRelativeTime, pluralize } from "../../lib/format";
import { Card } from "../ui/Card";
import { FadeInImage } from "../ui/FadeInImage";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { Button } from "../ui/Button";

type Props = {
  order: Order;
};

export function OrderCard({ order }: Props) {
  const isActive = !["delivered", "cancelled"].includes(order.status);
  const itemsCount = order.items.reduce((sum, i) => sum + i.qty, 0);

  const onPress = () =>
    router.push(isActive ? `/tracking/${order.id}` : `/order/${order.id}`);

  return (
    <Card onPress={onPress} className="mb-3" elevation="card">
      <View className="p-4">
        <View className="flex-row">
          <FadeInImage
            uri={order.restaurantImage}
            style={{ width: 60, height: 60 }}
            borderRadius={14}
          />
          <View className="flex-1 ml-3">
            <Text className="text-ink-900 font-bold text-base" numberOfLines={1}>
              {order.restaurantName}
            </Text>
            <Text className="text-ink-500 text-2xs mt-0.5" numberOfLines={1}>
              {order.restaurantArea}
            </Text>
            <View className="mt-2">
              <OrderStatusBadge status={order.status} />
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#A3A3A3" />
        </View>

        <View className="mt-3 pt-3 border-t border-dashed border-ink-200">
          <Text className="text-ink-600 text-xs" numberOfLines={2}>
            {order.items.map((i) => `${i.qty} × ${i.name}`).join("  •  ")}
          </Text>
        </View>

        <View className="flex-row items-center justify-between mt-3">
          <View>
            <Text className="text-ink-400 text-2xs">
              {pluralize(itemsCount, "item")} • {formatRelativeTime(order.placedAt)}
            </Text>
            <Text className="text-ink-900 font-bold text-base mt-0.5">
              {formatINR(order.totalPaise)}
            </Text>
          </View>

          {isActive ? (
            <Button
              label="Track Order"
              size="sm"
              variant="primary"
              icon="navigate"
              onPress={onPress}
              haptic="medium"
            />
          ) : (
            <Button
              label="Reorder"
              size="sm"
              variant="outline"
              icon="repeat"
              onPress={() => {}}
              haptic="light"
            />
          )}
        </View>
      </View>
    </Card>
  );
}
