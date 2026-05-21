import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useRiderStore } from "../../store/rider";
import { Ionicons } from "@expo/vector-icons";

export default function ActiveDeliveryTab() {
  const activeOrderId = useRiderStore((s) => s.activeOrderId);

  if (!activeOrderId) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-6">
        <Ionicons name="bicycle-outline" size={64} color="#374151" />
        <Text className="text-white text-lg font-semibold mt-4">No active delivery</Text>
        <Text className="text-muted text-sm mt-2 text-center">
          Accept an order from the Orders tab to start delivering
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background items-center justify-center">
      <TouchableOpacity
        onPress={() => router.push(`/delivery/${activeOrderId}`)}
        className="bg-brand rounded-2xl px-8 py-4"
      >
        <Text className="text-white font-bold text-base">Open active delivery</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
