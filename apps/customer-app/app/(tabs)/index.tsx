import { View, Text, FlatList, TextInput, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// TODO: replace with real API client
async function fetchRestaurants() {
  // GET /delivery/restaurants
  return [] as Restaurant[];
}

type Restaurant = {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  deliveryMinutes: number;
  deliveryFee: number;
  imageUrl?: string;
};

function RestaurantCard({ item }: { item: Restaurant }) {
  return (
    <TouchableOpacity
      onPress={() => router.push(`/restaurant/${item.id}`)}
      className="bg-surface rounded-2xl mb-4 overflow-hidden"
      activeOpacity={0.85}
    >
      <View className="h-40 bg-card items-center justify-center">
        <Ionicons name="restaurant" size={48} color="#374151" />
      </View>
      <View className="p-4">
        <Text className="text-white font-semibold text-base">{item.name}</Text>
        <Text className="text-muted text-sm mt-1">{item.cuisine}</Text>
        <View className="flex-row items-center mt-2 gap-4">
          <View className="flex-row items-center gap-1">
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text className="text-white text-xs">{item.rating.toFixed(1)}</Text>
          </View>
          <Text className="text-muted text-xs">{item.deliveryMinutes} min</Text>
          <Text className="text-muted text-xs">£{(item.deliveryFee / 100).toFixed(2)} delivery</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const { data: restaurants = [], isLoading } = useQuery({
    queryKey: ["restaurants"],
    queryFn: fetchRestaurants,
  });

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-4 pt-2 pb-4">
        <Text className="text-white text-2xl font-bold">Travel Food</Text>
        <Text className="text-muted text-sm mt-1">Delivering to your location</Text>

        <View className="flex-row items-center bg-surface rounded-xl px-4 mt-4">
          <Ionicons name="search" size={18} color="#6B7280" />
          <TextInput
            className="flex-1 text-white py-3 ml-2"
            placeholder="Search restaurants or dishes..."
            placeholderTextColor="#6B7280"
          />
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted">Loading restaurants...</Text>
        </View>
      ) : (
        <FlatList
          data={restaurants}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <RestaurantCard item={item} />}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          ListEmptyComponent={
            <View className="items-center py-16">
              <Ionicons name="restaurant-outline" size={64} color="#374151" />
              <Text className="text-muted mt-4">No restaurants available yet</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
