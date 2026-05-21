import { View, Text, TouchableOpacity, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/auth";
import { router } from "expo-router";

export default function ProfileScreen() {
  const { customer, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.replace("/(auth)/login");
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-4 py-4">
        <Text className="text-white text-2xl font-bold">Profile</Text>
      </View>

      <View className="mx-4 bg-surface rounded-2xl p-4 mb-4">
        <View className="flex-row items-center gap-4">
          <View className="w-14 h-14 bg-card rounded-full items-center justify-center">
            <Ionicons name="person" size={28} color="#6B7280" />
          </View>
          <View>
            <Text className="text-white font-semibold text-lg">
              {customer?.name ?? "Guest"}
            </Text>
            <Text className="text-muted text-sm">{customer?.phone ?? ""}</Text>
          </View>
        </View>
      </View>

      <View className="mx-4 bg-surface rounded-2xl overflow-hidden mb-4">
        {[
          { icon: "location-outline", label: "Saved addresses" },
          { icon: "card-outline", label: "Payment methods" },
          { icon: "notifications-outline", label: "Notifications" },
          { icon: "help-circle-outline", label: "Help & support" },
        ].map((row) => (
          <TouchableOpacity
            key={row.label}
            className="flex-row items-center px-4 py-4 border-b border-card last:border-0"
            activeOpacity={0.7}
          >
            <Ionicons name={row.icon as any} size={20} color="#6B7280" />
            <Text className="text-white ml-3 flex-1">{row.label}</Text>
            <Ionicons name="chevron-forward" size={16} color="#6B7280" />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        onPress={handleLogout}
        className="mx-4 bg-surface rounded-2xl py-4 items-center"
        activeOpacity={0.8}
      >
        <Text className="text-danger font-semibold">Sign out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
