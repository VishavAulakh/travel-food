import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const STATUS_COLOR: Record<string, string> = {
  placed: "text-warning",
  preparing: "text-brand",
  en_route: "text-success",
  delivered: "text-muted",
  cancelled: "text-danger",
};

const STATUS_LABEL: Record<string, string> = {
  placed: "Order placed",
  preparing: "Preparing",
  en_route: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

type Order = { id: string; restaurantName: string; total: number; status: string; createdAt: string };

export default function OrdersScreen() {
  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => [], // TODO: GET /delivery/orders/my
  });

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-4 py-4">
        <Text className="text-white text-2xl font-bold">Your orders</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted">Loading...</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o.id}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="bg-surface rounded-2xl p-4 mb-3"
              onPress={() =>
                item.status !== "delivered" && item.status !== "cancelled"
                  ? router.push(`/tracking/${item.id}`)
                  : null
              }
            >
              <View className="flex-row justify-between items-start">
                <Text className="text-white font-semibold">{item.restaurantName}</Text>
                <Text className={`text-sm font-medium ${STATUS_COLOR[item.status] ?? "text-muted"}`}>
                  {STATUS_LABEL[item.status] ?? item.status}
                </Text>
              </View>
              <Text className="text-muted text-sm mt-1">£{(item.total / 100).toFixed(2)}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="items-center py-16">
              <Ionicons name="receipt-outline" size={64} color="#374151" />
              <Text className="text-muted mt-4">No orders yet</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
