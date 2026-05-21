import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useRiderStore } from "../../store/rider";

type AvailableOrder = {
  id: string;
  restaurantName: string;
  restaurantAddress: string;
  deliveryAddress: string;
  distanceKm: number;
  estimatedPay: number;
  itemCount: number;
};

export default function AvailableOrdersScreen() {
  const { isOnline, toggleOnline } = useRiderStore();

  const { data: orders = [], isLoading } = useQuery<AvailableOrder[]>({
    queryKey: ["available-orders"],
    queryFn: async () => [], // TODO: GET /delivery/riders/available-orders
    refetchInterval: isOnline ? 10_000 : false,
    enabled: isOnline,
  });

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Online toggle */}
      <View className="flex-row items-center justify-between px-4 py-4 border-b border-card">
        <View>
          <Text className="text-white font-bold text-lg">Available orders</Text>
          <Text className={`text-sm ${isOnline ? "text-online" : "text-muted"}`}>
            {isOnline ? "You are online" : "You are offline"}
          </Text>
        </View>
        <TouchableOpacity
          onPress={toggleOnline}
          className={`px-5 py-2 rounded-full ${isOnline ? "bg-online" : "bg-card"}`}
          activeOpacity={0.8}
        >
          <Text className="text-white font-semibold text-sm">
            {isOnline ? "Go offline" : "Go online"}
          </Text>
        </TouchableOpacity>
      </View>

      {!isOnline ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="power" size={64} color="#374151" />
          <Text className="text-white text-lg font-semibold mt-4">You're offline</Text>
          <Text className="text-muted text-sm mt-2 text-center">
            Go online to start receiving delivery orders
          </Text>
        </View>
      ) : isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted">Waiting for orders...</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/delivery/${item.id}`)}
              className="bg-surface rounded-2xl p-4 mb-3"
              activeOpacity={0.85}
            >
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1">
                  <Text className="text-white font-semibold">{item.restaurantName}</Text>
                  <Text className="text-muted text-sm mt-0.5">{item.itemCount} items</Text>
                </View>
                <Text className="text-success font-bold text-lg">
                  £{(item.estimatedPay / 100).toFixed(2)}
                </Text>
              </View>
              <View className="flex-row items-center gap-2 mb-1">
                <Ionicons name="location" size={14} color="#FF6B35" />
                <Text className="text-muted text-xs flex-1" numberOfLines={1}>
                  {item.restaurantAddress}
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Ionicons name="flag" size={14} color="#10B981" />
                <Text className="text-muted text-xs flex-1" numberOfLines={1}>
                  {item.deliveryAddress}
                </Text>
              </View>
              <Text className="text-muted text-xs mt-2">{item.distanceKm.toFixed(1)} km</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="items-center py-16">
              <Ionicons name="hourglass-outline" size={64} color="#374151" />
              <Text className="text-muted mt-4">No orders right now</Text>
              <Text className="text-muted text-sm mt-1">New orders will appear here</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
