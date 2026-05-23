import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { MenuItem } from "../../lib/mock/menus";
import { formatINR } from "../../lib/format";
import { VegIndicator } from "../ui/VegIndicator";
import { RatingPill } from "../ui/RatingPill";
import { Stepper } from "../ui/Stepper";
import { FadeInImage } from "../ui/FadeInImage";
import { useCartStore } from "../../store/cart";

type Props = {
  item: MenuItem;
  restaurantId: string;
};

export function MenuItemRow({ item, restaurantId }: Props) {
  const cartItem = useCartStore((s) =>
    s.items.find((i) => i.productId === item.id)
  );
  const addItem = useCartStore((s) => s.addItem);
  const updateQty = useCartStore((s) => s.updateQty);

  const qty = cartItem?.qty ?? 0;

  const handleAdd = () =>
    addItem({
      productId: item.id,
      name: item.name,
      price: item.pricePaise,
      qty: 1,
    });

  const handleIncrement = () => updateQty(item.id, qty + 1);
  const handleDecrement = () => updateQty(item.id, qty - 1);

  return (
    <View className="flex-row py-5 border-b border-ink-100">
      <View className="flex-1 pr-4">
        <View className="flex-row items-center">
          <VegIndicator isVeg={item.isVeg} size={14} />
          {item.isBestseller ? (
            <View className="ml-2 bg-warning/15 px-1.5 py-0.5 rounded flex-row items-center">
              <Ionicons name="star" size={9} color="#B8860B" />
              <Text className="text-2xs font-bold ml-0.5" style={{ color: "#B8860B" }}>
                Bestseller
              </Text>
            </View>
          ) : null}
        </View>

        <Text className="text-ink-900 font-semibold text-base mt-2" numberOfLines={2}>
          {item.name}
        </Text>

        <Text className="text-ink-900 font-bold text-sm mt-1">
          {formatINR(item.pricePaise)}
        </Text>

        {item.rating ? (
          <View className="mt-1.5">
            <RatingPill rating={item.rating} totalRatings={item.totalRatings} size="xs" showCount />
          </View>
        ) : null}

        {item.description ? (
          <Text className="text-ink-500 text-xs mt-2 leading-4" numberOfLines={3}>
            {item.description}
          </Text>
        ) : null}

        {item.customizable ? (
          <Text className="text-ink-400 text-2xs mt-1.5">customisable</Text>
        ) : null}
      </View>

      <View className="items-center" style={{ width: 116 }}>
        {item.imageUrl ? (
          <View className="relative">
            <FadeInImage
              uri={item.imageUrl}
              style={{ width: 116, height: 116 }}
              borderRadius={14}
            />
            <View
              className="absolute -bottom-4 left-0 right-0 items-center"
              style={{ paddingHorizontal: 8 }}
            >
              <Stepper
                qty={qty}
                onAdd={handleAdd}
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
                size="md"
              />
            </View>
          </View>
        ) : (
          <Stepper
            qty={qty}
            onAdd={handleAdd}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
            size="md"
          />
        )}
      </View>
    </View>
  );
}
