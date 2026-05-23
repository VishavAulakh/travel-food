import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AnimatePresence, MotiView } from "moti";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
} from "react-native-reanimated";

import { useCartStore } from "../store/cart";
import {
  PressableScale,
  Button,
  Chip,
  FadeInImage,
  Stepper,
  AnimatedListItem,
  AddressCard,
  PaymentMethodRow,
  BillBreakdown,
  EmptyState,
  SectionHeader,
} from "../components";
import { addresses } from "../lib/mock/addresses";
import { paymentMethods } from "../lib/mock/payments";
import { promos, type Promo } from "../lib/mock/promos";
import { formatINR } from "../lib/format";
import { haptics } from "../lib/haptics";

const DELIVERY_FEE_PAISE = 4900; // ₹49
const PLATFORM_FEE_PAISE = 500; // ₹5
const TAX_RATE = 0.05; // 5%

function calcDiscount(promo: Promo, subtotal: number): number {
  if (subtotal < promo.minOrderPaise) return 0;
  if (promo.discount.type === "flat") return promo.discount.value;
  const pct = (subtotal * promo.discount.value) / 100;
  return promo.discount.maxOffPaise ? Math.min(pct, promo.discount.maxOffPaise) : pct;
}

export default function CheckoutScreen() {
  const { items, total, restaurantId, restaurantName, updateQty, clearCart } = useCartStore() as any;

  const [selectedPayment, setSelectedPayment] = useState(paymentMethods[0].id);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<Promo | null>(null);
  const [promoError, setPromoError] = useState("");
  const [instructions, setInstructions] = useState("");
  const [instructionsExpanded, setInstructionsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const promoInputRef = useRef<TextInput>(null);

  // Bill math
  const subtotal = total; // in paise
  const discountPaise = appliedPromo ? Math.round(calcDiscount(appliedPromo, subtotal)) : 0;
  const effectiveDelivery = appliedPromo?.code === "FREEDEL" ? 0 : DELIVERY_FEE_PAISE;
  const taxPaise = Math.round((subtotal - discountPaise) * TAX_RATE);
  const grandTotal = Math.max(0, subtotal - discountPaise + effectiveDelivery + taxPaise + PLATFORM_FEE_PAISE);

  const handleApplyPromo = useCallback(() => {
    const code = promoCode.trim().toUpperCase();
    if (!code) return;
    const found = promos.find((p) => p.code === code);
    if (!found) {
      setPromoError("Invalid promo code. Try WELCOME60, FLAT100, FREEDEL or UPI50.");
      haptics.error();
      return;
    }
    if (subtotal < found.minOrderPaise) {
      setPromoError(`Minimum order ${formatINR(found.minOrderPaise)} required for this code.`);
      haptics.error();
      return;
    }
    setAppliedPromo(found);
    setPromoError("");
    haptics.medium();
  }, [promoCode, subtotal]);

  const handleRemovePromo = useCallback(() => {
    setAppliedPromo(null);
    setPromoCode("");
    setPromoError("");
  }, []);

  const handlePlaceOrder = useCallback(async () => {
    if (items.length === 0 || loading) return;
    haptics.success();
    setLoading(true);
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 1200));
    clearCart();
    const rName = encodeURIComponent(restaurantName ?? "the restaurant");
    router.replace(`/order-placed?restaurantName=${rName}&estimatedMinutes=35-40` as any);
  }, [items, loading, clearCart, restaurantName]);

  const isEmpty = items.length === 0;

  return (
    <SafeAreaView className="flex-1 bg-surface-sunken" edges={["top"]}>
      {/* Header */}
      <View
        className="flex-row items-center px-4 py-3 bg-white border-b border-ink-100"
        style={{ shadowColor: "#1F1408", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 }}
      >
        <PressableScale onPress={() => router.back()} scaleTo={0.9} haptic="light" className="mr-3 w-9 h-9 rounded-full bg-ink-50 items-center justify-center">
          <Ionicons name="close" size={22} color="#0A0A0A" />
        </PressableScale>
        <Text className="text-ink-900 text-lg font-bold flex-1">Checkout</Text>
        <Text className="text-ink-400 text-sm">{items.length} item{items.length !== 1 ? "s" : ""}</Text>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {isEmpty ? (
            <EmptyState
              icon="cart-outline"
              title="Your cart is empty"
              description="Add items from a restaurant to place an order."
              ctaLabel="Browse restaurants"
              onCtaPress={() => router.replace("/(tabs)")}
            />
          ) : (
            <>
              {/* Delivery Address */}
              <AnimatedListItem index={0} className="mx-4 mt-4">
                <View className="bg-white rounded-2xl p-4 border border-ink-100">
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center">
                      <Ionicons name="location" size={16} color="#FC5F30" />
                      <Text className="text-ink-900 font-bold text-sm ml-1.5">Delivering to</Text>
                    </View>
                    <PressableScale
                      onPress={() => router.push("/profile/addresses" as any)}
                      scaleTo={0.94}
                      haptic="light"
                    >
                      <Text className="text-brand text-xs font-bold uppercase">Change</Text>
                    </PressableScale>
                  </View>
                  <AddressCard address={addresses[0]} selected compact />
                </View>
              </AnimatedListItem>

              {/* Order Items */}
              <AnimatedListItem index={1} className="mx-4 mt-3">
                <View className="bg-white rounded-2xl p-4 border border-ink-100">
                  <Text className="text-ink-900 font-bold text-sm mb-3">Order Summary</Text>
                  {items.map((item: any, idx: number) => (
                    <View
                      key={item.productId}
                      className={`flex-row items-center py-3 ${idx < items.length - 1 ? "border-b border-ink-50" : ""}`}
                    >
                      {item.imageUrl ? (
                        <View className="w-14 h-14 rounded-xl overflow-hidden mr-3">
                          <FadeInImage uri={item.imageUrl} style={{ width: 56, height: 56 }} borderRadius={12} />
                        </View>
                      ) : (
                        <View className="w-10 h-10 rounded-xl bg-brand-50 items-center justify-center mr-3">
                          <Ionicons name="restaurant-outline" size={20} color="#FC5F30" />
                        </View>
                      )}
                      <View className="flex-1">
                        <Text className="text-ink-900 text-sm font-semibold" numberOfLines={1}>{item.name}</Text>
                        <Text className="text-ink-500 text-xs mt-0.5">{formatINR(item.price)} each</Text>
                      </View>
                      <View className="items-end ml-2">
                        <Stepper
                          qty={item.qty}
                          size="sm"
                          onIncrement={() => updateQty(item.productId, item.qty + 1)}
                          onDecrement={() => updateQty(item.productId, item.qty - 1)}
                        />
                        <Text className="text-ink-900 text-sm font-bold mt-1.5">
                          {formatINR(item.price * item.qty)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </AnimatedListItem>

              {/* Cooking Instructions */}
              <AnimatedListItem index={2} className="mx-4 mt-3">
                <View className="bg-white rounded-2xl border border-ink-100 overflow-hidden">
                  <PressableScale
                    onPress={() => setInstructionsExpanded((v) => !v)}
                    scaleTo={0.99}
                    haptic="light"
                    className="flex-row items-center px-4 py-3.5"
                  >
                    <Ionicons name="pencil-outline" size={16} color="#737373" />
                    <Text className="text-ink-700 text-sm font-semibold ml-2 flex-1">Cooking instructions</Text>
                    <Ionicons
                      name={instructionsExpanded ? "chevron-up" : "chevron-down"}
                      size={16}
                      color="#A3A3A3"
                    />
                  </PressableScale>
                  <AnimatePresence>
                    {instructionsExpanded && (
                      <MotiView
                        from={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 100 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ type: "timing", duration: 220 }}
                        className="overflow-hidden"
                      >
                        <View className="px-4 pb-4">
                          <TextInput
                            className="bg-surface-sunken rounded-xl p-3 text-ink-800 text-sm min-h-[72px]"
                            placeholder="e.g. Less spicy, extra onions, no garlic..."
                            placeholderTextColor="#A3A3A3"
                            value={instructions}
                            onChangeText={setInstructions}
                            multiline
                            maxLength={200}
                            textAlignVertical="top"
                          />
                          <Text className="text-ink-300 text-2xs mt-1 text-right">
                            {instructions.length}/200
                          </Text>
                        </View>
                      </MotiView>
                    )}
                  </AnimatePresence>
                </View>
              </AnimatedListItem>

              {/* Promo Code */}
              <AnimatedListItem index={3} className="mx-4 mt-3">
                <View className="bg-white rounded-2xl p-4 border border-ink-100">
                  <View className="flex-row items-center mb-3">
                    <Ionicons name="pricetag" size={16} color="#FC5F30" />
                    <Text className="text-ink-900 font-bold text-sm ml-1.5">Promo Code</Text>
                  </View>

                  <AnimatePresence>
                    {appliedPromo ? (
                      <MotiView
                        key="applied"
                        from={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.88 }}
                        transition={{ type: "spring", damping: 14, stiffness: 200 }}
                        className="flex-row items-center bg-success/10 rounded-xl px-3 py-2.5"
                      >
                        <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
                        <View className="flex-1 ml-2">
                          <Text className="text-success text-sm font-bold">{appliedPromo.code}</Text>
                          <Text className="text-success/80 text-2xs mt-0.5">{appliedPromo.title}</Text>
                        </View>
                        <PressableScale onPress={handleRemovePromo} scaleTo={0.88} haptic="light">
                          <Ionicons name="close-circle" size={20} color="#16A34A" />
                        </PressableScale>
                      </MotiView>
                    ) : (
                      <MotiView
                        key="input"
                        from={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <View className="flex-row gap-2">
                          <TextInput
                            ref={promoInputRef}
                            className="flex-1 bg-surface-sunken rounded-xl px-3 py-2.5 text-ink-900 text-sm font-semibold uppercase"
                            placeholder="Enter promo code"
                            placeholderTextColor="#A3A3A3"
                            value={promoCode}
                            onChangeText={(t) => { setPromoCode(t); setPromoError(""); }}
                            autoCapitalize="characters"
                            returnKeyType="done"
                            onSubmitEditing={handleApplyPromo}
                          />
                          <Button
                            label="Apply"
                            size="sm"
                            variant={promoCode.trim() ? "primary" : "outline"}
                            onPress={handleApplyPromo}
                            haptic="none"
                          />
                        </View>
                        {promoError ? (
                          <Text className="text-danger text-2xs mt-1.5 ml-1">{promoError}</Text>
                        ) : null}
                      </MotiView>
                    )}
                  </AnimatePresence>
                </View>
              </AnimatedListItem>

              {/* Payment Methods */}
              <AnimatedListItem index={4} className="mx-4 mt-3">
                <View className="bg-white rounded-2xl p-4 border border-ink-100">
                  <View className="flex-row items-center mb-1">
                    <Ionicons name="card" size={16} color="#FC5F30" />
                    <Text className="text-ink-900 font-bold text-sm ml-1.5">Payment Method</Text>
                  </View>
                  {paymentMethods.map((method, idx) => (
                    <PaymentMethodRow
                      key={method.id}
                      method={method}
                      selected={selectedPayment === method.id}
                      onPress={() => { setSelectedPayment(method.id); haptics.selection(); }}
                      showDivider={idx < paymentMethods.length - 1}
                    />
                  ))}
                </View>
              </AnimatedListItem>

              {/* Bill Breakdown */}
              <AnimatedListItem index={5} className="mx-4 mt-3">
                <BillBreakdown
                  itemsTotalPaise={subtotal}
                  deliveryFeePaise={effectiveDelivery}
                  taxPaise={taxPaise + PLATFORM_FEE_PAISE}
                  discountPaise={discountPaise}
                  totalPaise={grandTotal}
                />
              </AnimatedListItem>

              {/* Safe delivery note */}
              <AnimatedListItem index={6} className="mx-4 mt-3 mb-2">
                <View className="flex-row items-center bg-surface-tint rounded-xl px-3 py-2.5 border border-brand-100">
                  <Ionicons name="shield-checkmark-outline" size={16} color="#FC5F30" />
                  <Text className="text-ink-600 text-xs ml-2 flex-1">
                    Safe & contactless delivery. Your order is insured.
                  </Text>
                </View>
              </AnimatedListItem>
            </>
          )}
        </ScrollView>

        {/* Sticky Bottom Bar */}
        {!isEmpty && (
          <Animated.View
            entering={FadeInDown.springify().damping(18).stiffness(220)}
            className="absolute bottom-0 left-0 right-0 bg-white border-t border-ink-100 px-4 pt-3 pb-8"
            style={{ shadowColor: "#1F1408", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 10 }}
          >
            <View className="flex-row items-center mb-3">
              <View className="flex-1">
                <Text className="text-ink-400 text-2xs">Total payable</Text>
                <Text className="text-ink-900 text-xl font-extrabold">{formatINR(grandTotal)}</Text>
              </View>
              {discountPaise > 0 && (
                <View className="bg-success/10 px-2.5 py-1 rounded-full">
                  <Text className="text-success text-xs font-semibold">
                    Saving {formatINR(discountPaise)}
                  </Text>
                </View>
              )}
            </View>
            <Button
              label={loading ? "Placing Order..." : "Place Order"}
              icon={loading ? undefined : "checkmark-circle"}
              iconPosition="right"
              size="lg"
              variant="primary"
              fullWidth
              loading={loading}
              disabled={loading || isEmpty}
              onPress={handlePlaceOrder}
              haptic="none"
            />
          </Animated.View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
