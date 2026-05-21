import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useEffect, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRiderStore } from "../../store/rider";

const STATUS_ACTIONS: Record<string, { label: string; next: string; color: string }> = {
  rider_assigned: { label: "Confirm pickup", next: "picked_up", color: "bg-warning" },
  picked_up: { label: "Start delivery", next: "en_route", color: "bg-brand" },
  en_route: { label: "Mark as delivered", next: "delivered", color: "bg-success" },
};

export default function ActiveDeliveryScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const [status, setStatus] = useState("rider_assigned");
  const [myLocation, setMyLocation] = useState<Location.LocationObject | null>(null);
  const setActiveOrder = useRiderStore((s) => s.setActiveOrder);
  const watchRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    setActiveOrder(orderId ?? null);
    startTracking();
    return () => {
      watchRef.current?.remove();
    };
  }, []);

  const startTracking = async () => {
    const { status: perm } = await Location.requestForegroundPermissionsAsync();
    if (perm !== "granted") return;

    watchRef.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 3000, distanceInterval: 10 },
      (location) => {
        setMyLocation(location);
        // TODO: socket.emit("rider_location_update", { orderId, lat: location.coords.latitude, lng: location.coords.longitude, bearing: location.coords.heading });
      }
    );
  };

  const handleAction = async () => {
    const action = STATUS_ACTIONS[status];
    if (!action) return;

    if (action.next === "delivered") {
      Alert.alert("Confirm delivery", "Mark this order as delivered?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delivered",
          onPress: async () => {
            // TODO: PATCH /delivery/orders/:orderId/delivered
            setActiveOrder(null);
            watchRef.current?.remove();
            router.replace("/(tabs)");
          },
        },
      ]);
      return;
    }
    // TODO: PATCH /delivery/orders/:orderId/status { status: action.next }
    setStatus(action.next);
  };

  const action = STATUS_ACTIONS[status];

  return (
    <View className="flex-1 bg-background">
      <MapView
        provider={PROVIDER_GOOGLE}
        style={{ flex: 0.6 }}
        customMapStyle={DARK_MAP_STYLE}
        showsUserLocation
        followsUserLocation
        initialRegion={{
          latitude: myLocation?.coords.latitude ?? 51.5074,
          longitude: myLocation?.coords.longitude ?? -0.1278,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        }}
      />

      <SafeAreaView className="flex-1 bg-background px-4 pt-4" edges={["bottom"]}>
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute top-4 right-4 z-10"
        >
          <Ionicons name="chevron-down" size={24} color="#6B7280" />
        </TouchableOpacity>

        <Text className="text-white font-bold text-lg mb-1">Active delivery</Text>
        <Text className="text-muted text-sm mb-4">
          Order #{orderId?.slice(-6).toUpperCase()}
        </Text>

        <View className="bg-surface rounded-2xl p-4 mb-4">
          <View className="flex-row items-center gap-3 mb-3">
            <View className="w-8 h-8 bg-brand rounded-full items-center justify-center">
              <Ionicons name="restaurant" size={14} color="white" />
            </View>
            <View>
              <Text className="text-muted text-xs">Pick up from</Text>
              <Text className="text-white font-semibold text-sm">Restaurant name</Text>
            </View>
          </View>
          <View className="flex-row items-center gap-3">
            <View className="w-8 h-8 bg-success rounded-full items-center justify-center">
              <Ionicons name="home" size={14} color="white" />
            </View>
            <View>
              <Text className="text-muted text-xs">Deliver to</Text>
              <Text className="text-white font-semibold text-sm">Customer address</Text>
            </View>
          </View>
        </View>

        {action && (
          <TouchableOpacity
            onPress={handleAction}
            className={`${action.color} rounded-xl py-4 items-center`}
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-base">{action.label}</Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </View>
  );
}

const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#1d2c4d" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#304a7d" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e1626" }] },
];
