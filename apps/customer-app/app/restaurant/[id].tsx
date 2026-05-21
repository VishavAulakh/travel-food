import { View, Text, FlatList, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { useCartStore } from "../../store/cart";
import * as Haptics from "expo-haptics";

type MenuItem = { id: string; name: string; description: string; price: number; categoryName: string };

export default function RestaurantScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const addItem = useCartStore((s) => s.addItem);

  const { data: restaurant } = useQuery({
    queryKey: ["restaurant", id],
    queryFn: async () => null as any, // TODO: GET /delivery/restaurants/:id
  });

  const { data: menu = [] } = useQuery<MenuItem[]>({
    queryKey: ["menu", id],
    queryFn: async () => [], // TODO: GET /delivery/restaurants/:id/menu
  });

  const handleAdd = (item: MenuItem) => {
    addItem({ productId: item.id, name: item.name, price: item.price, qty: 1 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center px-4 py-3 border-b border-card">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-semibold flex-1" numberOfLines={1}>
          {restaurant?.name ?? "Restaurant"}
        </Text>
      </View>

      <FlatList
        data={menu}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}
        renderItem={({ item }) => (
          <View className="flex-row items-center bg-surface rounded-2xl p-4 mb-3">
            <View className="flex-1 mr-4">
              <Text className="text-white font-semibold">{item.name}</Text>
              {item.description ? (
                <Text className="text-muted text-sm mt-1" numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}
              <Text className="text-brand font-semibold mt-2">
                £{(item.price / 100).toFixed(2)}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleAdd(item)}
              className="w-10 h-10 bg-brand rounded-full items-center justify-center"
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={22} color="white" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center py-12">
            <Text className="text-muted">Menu not available</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
