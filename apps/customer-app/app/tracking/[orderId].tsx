import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { useEffect, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";

const STATUS_STEPS = ["placed", "confirmed", "preparing", "rider_assigned", "en_route", "delivered"];
const STATUS_LABELS: Record<string, string> = {
  placed: "Order placed",
  confirmed: "Confirmed by restaurant",
  preparing: "Preparing your food",
  rider_assigned: "Rider assigned",
  en_route: "On the way",
  delivered: "Delivered!",
};

export default function TrackingScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const [status, setStatus] = useState("preparing");
  const [riderLocation, setRiderLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    // TODO: connect Socket.io
    // socket.emit("join_order_room", orderId);
    // socket.on(`order:${orderId}:status_change`, ({ status }) => setStatus(status));
    // socket.on(`order:${orderId}:rider_location`, ({ lat, lng }) => setRiderLocation({ lat, lng }));
    // return () => socket.disconnect();
  }, [orderId]);

  const currentStep = STATUS_STEPS.indexOf(status);

  return (
    <View className="flex-1 bg-background">
      {/* Map takes top 60% */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={{ flex: 0.6 }}
        customMapStyle={DARK_MAP_STYLE}
        showsUserLocation
        initialRegion={{
          latitude: 51.5074,
          longitude: -0.1278,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        {riderLocation && (
          <Marker
            coordinate={{ latitude: riderLocation.lat, longitude: riderLocation.lng }}
            title="Your rider"
          >
            <View className="w-10 h-10 bg-brand rounded-full items-center justify-center">
              <Ionicons name="bicycle" size={20} color="white" />
            </View>
          </Marker>
        )}
      </MapView>

      {/* Status panel */}
      <SafeAreaView className="flex-1 bg-background px-4 pt-4" edges={["bottom"]}>
        <TouchableOpacity onPress={() => router.back()} className="absolute top-4 right-4 z-10">
          <Ionicons name="close" size={24} color="#6B7280" />
        </TouchableOpacity>

        <Text className="text-white text-lg font-bold mb-1">
          {STATUS_LABELS[status] ?? status}
        </Text>
        <Text className="text-muted text-sm mb-6">Order #{orderId?.slice(-6).toUpperCase()}</Text>

        {/* Progress bar */}
        <View className="flex-row items-center mb-6">
          {STATUS_STEPS.slice(0, 5).map((step, i) => (
            <View key={step} className="flex-row items-center flex-1">
              <View
                className={`w-3 h-3 rounded-full ${i <= currentStep ? "bg-brand" : "bg-card"}`}
              />
              {i < 4 && (
                <View className={`h-0.5 flex-1 ${i < currentStep ? "bg-brand" : "bg-card"}`} />
              )}
            </View>
          ))}
        </View>

        <Text className="text-muted text-sm text-center">
          Live updates • order will arrive at your door
        </Text>
      </SafeAreaView>
    </View>
  );
}

const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#1d2c4d" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#304a7d" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#2c6675" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e1626" }] },
];
