import React, { useState } from "react";
import { Text, View, ScrollView, LayoutAnimation, Platform, UIManager } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { PressableScale } from "../ui/PressableScale";
import { VegIndicator } from "../ui/VegIndicator";
import { FadeInImage } from "../ui/FadeInImage";
import { formatINR } from "../../lib/format";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type CartItem = { productId: string; name: string; price: number; qty: number };

type Props = {
  items: CartItem[];
  restaurantName: string;
  restaurantImage?: string;
};

export function CheckoutOrderSummary({ items, restaurantName, restaurantImage }: Props) {
  const [expanded, setExpanded] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext({
      duration: 260,
      create: { type: "easeInEaseOut", property: "opacity" },
      update: { type: "easeInEaseOut" },
    });
    setExpanded((e) => !e);
  };

  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <View className="bg-white rounded-2xl border border-ink-100 overflow-hidden">
      <View className="px-4 pt-4">
        <View className="flex-row items-center">
          {restaurantImage ? (
            <FadeInImage
              uri={restaurantImage}
              style={{ width: 36, height: 36, borderRadius: 8 }}
            />
          ) : null}
          <View className="ml-3 flex-1">
            <Text className="text-ink-900 font-bold text-sm" numberOfLines={1}>
              {restaurantName}
            </Text>
            <Text className="text-ink-500 text-2xs mt-0.5">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 12, gap: 8 }}
        >
          {items.map((it) => (
            <View key={it.productId} className="items-center">
              <View className="w-14 h-14 rounded-xl bg-ink-50 items-center justify-center">
                <Ionicons name="fast-food" size={22} color="#737373" />
                <View className="absolute -top-1.5 -right-1.5 bg-brand min-w-[20px] h-5 rounded-full px-1 items-center justify-center">
                  <Text className="text-white text-2xs font-extrabold">×{it.qty}</Text>
                </View>
              </View>
              <Text className="text-ink-700 text-2xs mt-1 max-w-[64px]" numberOfLines={1}>
                {it.name}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <PressableScale
        onPress={toggle}
        scaleTo={0.99}
        haptic="light"
        className="flex-row items-center justify-between px-4 py-3 border-t border-ink-100"
      >
        <Text className="text-brand text-xs font-bold">
          {expanded ? "Hide" : "View"} {itemCount} {itemCount === 1 ? "item" : "items"}
        </Text>
        <MotiView
          animate={{ rotate: expanded ? "180deg" : "0deg" }}
          transition={{ type: "spring", damping: 18, stiffness: 220 }}
        >
          <Ionicons name="chevron-down" size={16} color="#FC5F30" />
        </MotiView>
      </PressableScale>

      {expanded ? (
        <View className="px-4 pb-4">
          {items.map((it) => (
            <View
              key={`detail-${it.productId}`}
              className="flex-row items-center py-2"
            >
              <VegIndicator isVeg size={12} />
              <Text className="text-ink-800 text-sm ml-2 flex-1" numberOfLines={1}>
                {it.name}{" "}
                <Text className="text-ink-400 text-xs">× {it.qty}</Text>
              </Text>
              <Text className="text-ink-700 text-sm font-semibold">
                {formatINR(it.price * it.qty)}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
