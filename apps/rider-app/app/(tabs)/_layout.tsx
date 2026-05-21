import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Text } from "react-native";
import { useRiderStore } from "../../store/rider";

export default function TabsLayout() {
  const isOnline = useRiderStore((s) => s.isOnline);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#1F2937",
          borderTopColor: "#374151",
          paddingBottom: 8,
          height: 64,
        },
        tabBarActiveTintColor: "#FF6B35",
        tabBarInactiveTintColor: "#6B7280",
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Orders",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" size={size} color={color} />
          ),
          tabBarBadge: isOnline ? undefined : "off",
          tabBarBadgeStyle: { backgroundColor: "#6B7280", fontSize: 9 },
        }}
      />
      <Tabs.Screen
        name="active"
        options={{
          title: "Active",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bicycle" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          title: "Earnings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
