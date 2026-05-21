import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useCartStore } from "../../store/cart";
import { Ionicons } from "@expo/vector-icons";

export default function CartScreen() {
  const { items, removeItem, updateQty, total } = useCartStore();

  if (items.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <Ionicons name="bag-outline" size={64} color="#374151" />
        <Text className="text-white text-lg font-semibold mt-4">Your cart is empty</Text>
        <Text className="text-muted mt-2 text-sm">Add items from a restaurant to get started</Text>
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)")}
          className="mt-6 bg-brand rounded-xl px-6 py-3"
        >
          <Text className="text-white font-semibold">Browse restaurants</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-4 py-4">
        <Text className="text-white text-2xl font-bold">Cart</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.productId}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 160 }}
        renderItem={({ item }) => (
          <View className="flex-row items-center bg-surface rounded-2xl p-4 mb-3">
            <View className="flex-1">
              <Text className="text-white font-semibold">{item.name}</Text>
              <Text className="text-muted text-sm">£{(item.price / 100).toFixed(2)}</Text>
            </View>
            <View className="flex-row items-center gap-3">
              <TouchableOpacity
                onPress={() => updateQty(item.productId, item.qty - 1)}
                className="w-8 h-8 bg-card rounded-full items-center justify-center"
              >
                <Ionicons name="remove" size={16} color="white" />
              </TouchableOpacity>
              <Text className="text-white w-4 text-center">{item.qty}</Text>
              <TouchableOpacity
                onPress={() => updateQty(item.productId, item.qty + 1)}
                className="w-8 h-8 bg-brand rounded-full items-center justify-center"
              >
                <Ionicons name="add" size={16} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <View className="absolute bottom-0 left-0 right-0 bg-surface border-t border-card px-4 py-4">
        <View className="flex-row justify-between mb-3">
          <Text className="text-muted">Total</Text>
          <Text className="text-white font-bold text-lg">£{(total / 100).toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/checkout")}
          className="bg-brand rounded-xl py-4 items-center"
          activeOpacity={0.8}
        >
          <Text className="text-white font-semibold text-base">Proceed to checkout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
