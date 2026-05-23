import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, Alert, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MotiView, AnimatePresence } from "moti";

import { useCartStore } from "../../store/cart";
import { getRestaurantById } from "../../lib/mock/restaurants";
import { formatINR, pluralize, formatEta } from "../../lib/format";
import { haptics } from "../../lib/haptics";
import { promos, type Promo } from "../../lib/mock/promos";

import { Header } from "../../components/ui/Header";
import { EmptyState } from "../../components/ui/EmptyState";
import { PressableScale } from "../../components/ui/PressableScale";
import { Button } from "../../components/ui/Button";
import { FadeInImage } from "../../components/ui/FadeInImage";
import { AnimatedListItem } from "../../components/ui/AnimatedListItem";
import { BillBreakdown } from "../../components/order/BillBreakdown";

import { CartItemRow } from "../../components/cart/CartItemRow";
import { CookingInstructions } from "../../components/cart/CookingInstructions";
import { CouponSection } from "../../components/cart/CouponSection";
import {
  SuggestionsSection,
  type Suggestion,
} from "../../components/cart/SuggestionsSection";
import {
  DeliveryTypeToggle,
  type DeliveryType,
} from "../../components/cart/DeliveryTypeToggle";
import { TipSection } from "../../components/cart/TipSection";

const DELIVERY_FEE_PAISE = 4900;
const TAX_RATE = 0.05;

const SUGGESTION_POOL: Suggestion[] = [
  {
    id: "sugg-coke",
    name: "Coca-Cola (500ml)",
    pricePaise: 6000,
    imageUrl: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400",
    isVeg: true,
  },
  {
    id: "sugg-gulab",
    name: "Gulab Jamun (2 pcs)",
    pricePaise: 8000,
    imageUrl: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400",
    isVeg: true,
  },
  {
    id: "sugg-papad",
    name: "Masala Papad",
    pricePaise: 5000,
    imageUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400",
    isVeg: true,
  },
];

const computeDiscount = (promo: Promo | null, subtotalPaise: number) => {
  if (!promo) return 0;
  if (subtotalPaise < promo.minOrderPaise) return 0;
  if (promo.discount.type === "flat") return promo.discount.value;
  const pct = Math.round((subtotalPaise * promo.discount.value) / 100);
  return promo.discount.maxOffPaise ? Math.min(pct, promo.discount.maxOffPaise) : pct;
};

export default function CartScreen() {
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total);
  const restaurantId = useCartStore((s) => s.restaurantId);
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);
  const addItem = useCartStore((s) => s.addItem);
  const clearCart = useCartStore((s) => s.clearCart);

  const [instructions, setInstructions] = useState("");
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("standard");
  const [tipPaise, setTipPaise] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  const restaurant = restaurantId ? getRestaurantById(restaurantId) : null;
  const appliedPromo = appliedCode ? promos.find((p) => p.code === appliedCode) ?? null : null;

  const discountPaise = useMemo(
    () => computeDiscount(appliedPromo, total),
    [appliedPromo, total]
  );
  const taxPaise = Math.round(total * TAX_RATE);
  const grandTotalPaise =
    Math.max(0, total - discountPaise) + DELIVERY_FEE_PAISE + taxPaise + tipPaise;
  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast((c) => (c === msg ? null : c)), 1600);
  };

  if (items.length === 0) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-surface-sunken">
        <Header title="Cart" showBack={false} />
        <EmptyState
          icon="bag-handle-outline"
          title="Your cart is empty"
          description="Add items from your favourite restaurants to get started"
          ctaLabel="Browse restaurants"
          onCtaPress={() => router.push("/(tabs)")}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-surface-sunken">
      <Header
        title="Cart"
        subtitle={restaurant?.name}
        showBack={false}
        rightSlot={
          <PressableScale
            onPress={() => {
              haptics.warning();
              Alert.alert(
                "Clear cart?",
                "All items in your cart will be removed.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Clear",
                    style: "destructive",
                    onPress: () => {
                      clearCart();
                      setAppliedCode(null);
                      setTipPaise(0);
                      setInstructions("");
                    },
                  },
                ]
              );
            }}
            scaleTo={0.92}
            className="px-3 py-1.5"
          >
            <Text className="text-danger text-xs font-bold uppercase tracking-wider">
              Clear
            </Text>
          </PressableScale>
        }
      />

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 180 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Restaurant card */}
        {restaurant ? (
          <AnimatedListItem index={0}>
            <PressableScale
              onPress={() => router.push(`/restaurant/${restaurant.id}` as any)}
              scaleTo={0.99}
              haptic="light"
              className="bg-white rounded-2xl p-3 flex-row items-center border border-ink-100"
            >
              <FadeInImage
                uri={restaurant.imageUrl}
                style={{ width: 52, height: 52, borderRadius: 12 }}
              />
              <View className="flex-1 ml-3">
                <Text className="text-ink-900 font-bold text-sm" numberOfLines={1}>
                  {restaurant.name}
                </Text>
                <Text className="text-ink-500 text-2xs mt-0.5" numberOfLines={1}>
                  {restaurant.area} • {restaurant.city}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-brand text-2xs font-bold mr-0.5">View menu</Text>
                <Ionicons name="chevron-forward" size={14} color="#FC5F30" />
              </View>
            </PressableScale>
          </AnimatedListItem>
        ) : null}

        {/* Delivery ETA badge */}
        <AnimatedListItem index={1}>
          <View className="flex-row items-center mt-3 mb-3 px-1">
            <View className="w-7 h-7 rounded-full bg-success/10 items-center justify-center">
              <Ionicons name="bicycle" size={14} color="#16A34A" />
            </View>
            <Text className="text-ink-700 text-xs ml-2">
              Delivery in{" "}
              <Text className="font-bold text-ink-900">
                {formatEta(restaurant?.deliveryMinutes ?? 30)}
              </Text>
            </Text>
          </View>
        </AnimatedListItem>

        {/* Cart items */}
        <View className="gap-2">
          <AnimatePresence>
            {items.map((it, idx) => (
              <AnimatedListItem index={idx + 2} key={it.productId}>
                <CartItemRow
                  productId={it.productId}
                  name={it.name}
                  pricePaise={it.price}
                  qty={it.qty}
                  isVeg
                  onIncrement={() => updateQty(it.productId, it.qty + 1)}
                  onDecrement={() => {
                    if (it.qty - 1 === 0) showToast(`${it.name} removed`);
                    updateQty(it.productId, it.qty - 1);
                  }}
                  onRemove={() => {
                    showToast(`${it.name} removed`);
                    removeItem(it.productId);
                  }}
                />
              </AnimatedListItem>
            ))}
          </AnimatePresence>
        </View>

        {/* Suggestions */}
        <View className="mt-5 -mx-4">
          <SuggestionsSection
            items={SUGGESTION_POOL}
            onAdd={(s) =>
              addItem({
                productId: s.id,
                name: s.name,
                price: s.pricePaise,
                qty: 1,
              })
            }
          />
        </View>

        {/* Cooking instructions */}
        <View className="mt-4">
          <CookingInstructions value={instructions} onChangeText={setInstructions} />
        </View>

        {/* Coupon */}
        <View className="mt-3">
          <CouponSection
            appliedCode={appliedCode}
            onApply={(p) => setAppliedCode(p.code)}
            onRemove={() => {
              haptics.light();
              setAppliedCode(null);
            }}
            orderTotalPaise={total}
          />
        </View>

        {/* Delivery type */}
        <View className="mt-3">
          <DeliveryTypeToggle
            value={deliveryType}
            onChange={setDeliveryType}
            etaLabel={formatEta(restaurant?.deliveryMinutes ?? 30)}
          />
        </View>

        {/* Tip */}
        <View className="mt-3">
          <TipSection tipPaise={tipPaise} onChange={setTipPaise} />
        </View>

        {/* Bill */}
        <View className="mt-3">
          <BillBreakdown
            itemsTotalPaise={total}
            deliveryFeePaise={DELIVERY_FEE_PAISE}
            taxPaise={taxPaise}
            discountPaise={discountPaise + (tipPaise > 0 ? 0 : 0)}
            totalPaise={grandTotalPaise}
          />
        </View>

        {/* Tip line if present */}
        {tipPaise > 0 ? (
          <View className="mt-2 px-4 flex-row items-center justify-between">
            <Text className="text-ink-500 text-xs">Tip for rider</Text>
            <Text className="text-ink-700 text-xs font-semibold">+ {formatINR(tipPaise)}</Text>
          </View>
        ) : null}

        {/* Cancellation policy */}
        <View className="mt-4 bg-ink-50 rounded-2xl p-4">
          <View className="flex-row items-center mb-1">
            <Ionicons name="shield-checkmark-outline" size={14} color="#525252" />
            <Text className="text-ink-800 text-xs font-bold ml-1.5 uppercase tracking-wider">
              Cancellation policy
            </Text>
          </View>
          <Text className="text-ink-500 text-2xs leading-4">
            100% refund if cancelled before restaurant accepts the order. After that no
            refund — orders are non-refundable once preparation begins.
          </Text>
        </View>
      </ScrollView>

      {/* Toast */}
      <AnimatePresence>
        {toast ? (
          <MotiView
            from={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0, translateY: 12 }}
            transition={{ type: "spring", damping: 18, stiffness: 220 }}
            style={{
              position: "absolute",
              left: 16,
              right: 16,
              bottom: Platform.OS === "ios" ? 180 : 160,
              zIndex: 60,
            }}
          >
            <View className="bg-ink-900 rounded-xl px-4 py-3 flex-row items-center self-center">
              <Ionicons name="checkmark-circle" size={16} color="#fff" />
              <Text className="text-white text-xs font-semibold ml-2">{toast}</Text>
            </View>
          </MotiView>
        ) : null}
      </AnimatePresence>

      {/* Sticky bottom bar */}
      <StickyCheckoutBar
        totalPaise={grandTotalPaise}
        itemCount={itemCount}
        onProceed={() => router.push("/checkout")}
      />
    </SafeAreaView>
  );
}

function StickyCheckoutBar({
  totalPaise,
  itemCount,
  onProceed,
}: {
  totalPaise: number;
  itemCount: number;
  onProceed: () => void;
}) {
  return (
    <View
      className="absolute left-0 right-0 bottom-0 bg-white border-t border-ink-100 px-4 pt-3"
      style={{
        paddingBottom: Platform.OS === "ios" ? 28 : 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 12,
      }}
    >
      <View className="flex-row items-center">
        <View className="flex-1">
          <MotiView
            key={totalPaise}
            from={{ opacity: 0.4, translateY: 4 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 220 }}
          >
            <Text className="text-ink-900 font-extrabold text-lg">
              {formatINR(totalPaise)}
            </Text>
          </MotiView>
          <Text className="text-ink-500 text-2xs mt-0.5">
            TOTAL → {pluralize(itemCount, "item")}
          </Text>
        </View>
        <Button
          label="Proceed to Pay"
          icon="arrow-forward"
          iconPosition="right"
          size="lg"
          onPress={onProceed}
          haptic="medium"
        />
      </View>
    </View>
  );
}
