import { View, Text, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";

type EarningEntry = { id: string; orderId: string; amount: number; date: string; restaurantName: string };

export default function EarningsScreen() {
  const { data: earnings = [] } = useQuery<EarningEntry[]>({
    queryKey: ["rider-earnings"],
    queryFn: async () => [], // TODO: GET /delivery/riders/me/earnings
  });

  const totalToday = earnings
    .filter((e) => e.date.startsWith(new Date().toISOString().slice(0, 10)))
    .reduce((s, e) => s + e.amount, 0);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-4 py-4 border-b border-card">
        <Text className="text-white text-2xl font-bold">Earnings</Text>
        <View className="flex-row items-baseline gap-1 mt-2">
          <Text className="text-success text-3xl font-bold">
            £{(totalToday / 100).toFixed(2)}
          </Text>
          <Text className="text-muted text-sm">today</Text>
        </View>
      </View>

      <FlatList
        data={earnings}
        keyExtractor={(e) => e.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View className="flex-row items-center bg-surface rounded-2xl p-4 mb-3">
            <View className="w-10 h-10 bg-card rounded-full items-center justify-center mr-3">
              <Ionicons name="bicycle" size={18} color="#FF6B35" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-semibold text-sm">{item.restaurantName}</Text>
              <Text className="text-muted text-xs">Order #{item.orderId.slice(-6).toUpperCase()}</Text>
            </View>
            <Text className="text-success font-bold">£{(item.amount / 100).toFixed(2)}</Text>
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center py-16">
            <Ionicons name="wallet-outline" size={64} color="#374151" />
            <Text className="text-muted mt-4">No earnings yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
