import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useCartStore } from "../store/cart";

export default function CheckoutScreen() {
  const { items, total, restaurantId, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const deliveryFee = 250; // 250p = £2.50

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      // TODO:
      // 1. POST /delivery/orders → { clientSecret, orderId }
      // 2. Open Stripe Payment Sheet
      // 3. On success → router.replace(`/tracking/${orderId}`)
      clearCart();
      router.replace("/(tabs)/orders");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center px-4 py-3 border-b border-card">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-semibold">Checkout</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="text-white font-semibold text-base mb-3">Order summary</Text>
        {items.map((item) => (
          <View key={item.productId} className="flex-row justify-between mb-2">
            <Text className="text-muted">
              {item.qty}× {item.name}
            </Text>
            <Text className="text-white">£{((item.price * item.qty) / 100).toFixed(2)}</Text>
          </View>
        ))}

        <View className="border-t border-card mt-4 pt-4">
          <View className="flex-row justify-between mb-2">
            <Text className="text-muted">Subtotal</Text>
            <Text className="text-white">£{(total / 100).toFixed(2)}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-muted">Delivery fee</Text>
            <Text className="text-white">£{(deliveryFee / 100).toFixed(2)}</Text>
          </View>
          <View className="flex-row justify-between mt-2">
            <Text className="text-white font-bold text-base">Total</Text>
            <Text className="text-white font-bold text-base">
              £{((total + deliveryFee) / 100).toFixed(2)}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View className="px-4 pb-6">
        <TouchableOpacity
          onPress={handlePlaceOrder}
          disabled={loading}
          className="bg-brand rounded-xl py-4 items-center"
          activeOpacity={0.8}
        >
          <Text className="text-white font-semibold text-base">
            {loading ? "Processing..." : `Pay £${((total + deliveryFee) / 100).toFixed(2)}`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
