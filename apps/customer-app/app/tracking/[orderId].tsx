import { View, Text, TouchableOpacity, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { io } from "socket.io-client";
import { useAuthStore } from "../../store/auth";

const STATUS_STEPS = ["placed", "confirmed", "preparing", "rider_assigned", "en_route", "delivered"];
const STATUS_LABELS: Record<string, string> = {
  placed: "Order placed",
  confirmed: "Confirmed by restaurant",
  preparing: "Preparing your food",
  rider_assigned: "Rider assigned",
  en_route: "On the way",
  delivered: "Delivered!",
};

function MapPlaceholder() {
  return (
    <View style={{ flex: 0.6, backgroundColor: "#1F2937", alignItems: "center", justifyContent: "center" }}>
      <Ionicons name="map-outline" size={48} color="#374151" />
      <Text style={{ color: "#6B7280", marginTop: 8 }}>Live map (mobile only)</Text>
    </View>
  );
}

function NativeMap({ riderLocation }: { riderLocation: { lat: number; lng: number } | null }) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const MapView = require("react-native-maps").default;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Marker, PROVIDER_GOOGLE } = require("react-native-maps");
  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={{ flex: 0.6 }}
      customMapStyle={DARK_MAP_STYLE}
      showsUserLocation
      initialRegion={{ latitude: 51.5074, longitude: -0.1278, latitudeDelta: 0.02, longitudeDelta: 0.02 }}
    >
      {riderLocation && (
        <Marker coordinate={{ latitude: riderLocation.lat, longitude: riderLocation.lng }} title="Your rider">
          <View style={{ width: 40, height: 40, backgroundColor: "#FF6B35", borderRadius: 20, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="bicycle" size={20} color="white" />
          </View>
        </Marker>
      )}
    </MapView>
  );
}

export default function TrackingScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const [status, setStatus] = useState("preparing");
  const [riderLocation, setRiderLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const { token } = useAuthStore.getState();
    if (!orderId) return;

    const socket = io('http://localhost:3002', {
      path: '/ws/socket.io',
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      socket.emit('join_order_room', { orderId, token: token ?? '' });
    });
    socket.on('order_status_changed', (data: { status: string }) => {
      setStatus(data.status);
    });
    socket.on('rider_location_update', (data: { lat: number; lng: number }) => {
      setRiderLocation({ lat: data.lat, lng: data.lng });
    });

    return () => { socket.disconnect(); };
  }, [orderId]);

  const currentStep = STATUS_STEPS.indexOf(status);

  return (
    <View style={{ flex: 1, backgroundColor: "#111827" }}>
      {Platform.OS === "web" ? <MapPlaceholder /> : <NativeMap riderLocation={riderLocation} />}

      <SafeAreaView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }} edges={["bottom"]}>
        <TouchableOpacity onPress={() => router.back()} style={{ position: "absolute", top: 16, right: 16, zIndex: 10 }}>
          <Ionicons name="close" size={24} color="#6B7280" />
        </TouchableOpacity>

        <Text style={{ color: "white", fontSize: 18, fontWeight: "bold", marginBottom: 4 }}>
          {STATUS_LABELS[status] ?? status}
        </Text>
        <Text style={{ color: "#6B7280", fontSize: 13, marginBottom: 24 }}>
          Order #{orderId?.slice(-6).toUpperCase()}
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 24 }}>
          {STATUS_STEPS.slice(0, 5).map((step, i) => (
            <View key={step} style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
              <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: i <= currentStep ? "#FF6B35" : "#374151" }} />
              {i < 4 && <View style={{ height: 2, flex: 1, backgroundColor: i < currentStep ? "#FF6B35" : "#374151" }} />}
            </View>
          ))}
        </View>

        <Text style={{ color: "#6B7280", fontSize: 13, textAlign: "center" }}>
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
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e1626" }] },
];
