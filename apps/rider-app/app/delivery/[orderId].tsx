import React, { useEffect, useRef, useState } from "react";
import { View, Text, Alert, Platform, ScrollView } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRiderStore } from "../../store/rider";
import { getRequestById } from "../../lib/mock/deliveryRequests";
import { formatINR } from "../../lib/format";
import { haptics } from "../../lib/haptics";
import { shadows } from "../../lib/theme";
import {
  Button,
  NavigationStep,
  OrderHandoffCard,
  PressableScale,
} from "../../components";

const MapView =
  Platform.OS === "web"
    ? () => (
        <View
          style={{ flex: 1, backgroundColor: "#FFF8F5", alignItems: "center", justifyContent: "center" }}
        >
          <Ionicons name="map" size={48} color="#FC5F30" />
          <Text style={{ color: "#737373", marginTop: 8, fontSize: 13 }}>
            Map view available on mobile
          </Text>
        </View>
      )
    : require("react-native-maps").default;

const PROVIDER_GOOGLE =
  Platform.OS !== "web" ? require("react-native-maps").PROVIDER_GOOGLE : undefined;

type Step = 1 | 2 | 3;

const STEP_ACTIONS: Record<Step, string> = {
  1: "I've Arrived at Restaurant",
  2: "Order Picked Up",
  3: "Order Delivered",
};

function stepSubtitle(step: Step, customerName: string, estimatedMinutes: number): string {
  if (step === 1) return `🛵 Head to restaurant · ${estimatedMinutes} min est.`;
  if (step === 2) return "📦 Pick up the order";
  return `🏠 Deliver to ${customerName}`;
}

export default function DeliveryScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const request = getRequestById(orderId ?? "");
  const setActiveOrder = useRiderStore((s) => s.setActiveOrder);

  const [step, setStep] = useState<Step>(1);
  const [myLocation, setMyLocation] = useState<{ latitude: number; longitude: number } | null>(
    null
  );
  const watchRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    startTracking();
    return () => {
      watchRef.current?.remove();
    };
  }, []);

  const startTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;
    watchRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000,
        distanceInterval: 15,
      },
      (loc) => {
        setMyLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      }
    );
  };

  const handleAction = () => {
    if (step < 3) {
      if (step === 2) haptics.success();
      else haptics.medium();
      setStep((s) => (s + 1) as Step);
      return;
    }
    // Step 3 — confirm delivery
    Alert.alert("Confirm Delivery", "Mark this order as delivered?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Mark Delivered",
        onPress: () => {
          haptics.success();
          watchRef.current?.remove();
          setActiveOrder(null);
          router.replace("/(tabs)");
        },
      },
    ]);
  };

  if (!request) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-ink-400">Order not found</Text>
        <Button label="Go Back" onPress={() => router.back()} className="mt-4" />
      </SafeAreaView>
    );
  }

  const mapRegion = {
    latitude: myLocation?.latitude ?? request.restaurant.lat,
    longitude: myLocation?.longitude ?? request.restaurant.lng,
    latitudeDelta: 0.025,
    longitudeDelta: 0.025,
  };

  const totalItems = request.items.reduce((s, i) => s + i.qty, 0);

  return (
    <View className="flex-1 bg-white">
      {/* Map — top 55% */}
      <View style={{ flex: 0.55 }}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={{ flex: 1 }}
          region={mapRegion}
          showsUserLocation
          followsUserLocation={step === 1}
          showsMyLocationButton={false}
        >
          {Platform.OS !== "web" ? (
            <>
              {(() => {
                const { Marker } = require("react-native-maps");
                return (
                  <>
                    <Marker
                      coordinate={{ latitude: request.restaurant.lat, longitude: request.restaurant.lng }}
                      title={request.restaurant.name}
                    >
                      <View
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                          backgroundColor: "#FC5F30",
                          alignItems: "center",
                          justifyContent: "center",
                          borderWidth: 2,
                          borderColor: "#fff",
                          ...shadows.brand,
                        }}
                      >
                        <Ionicons name="restaurant" size={16} color="#fff" />
                      </View>
                    </Marker>
                    <Marker
                      coordinate={{ latitude: request.customer.lat, longitude: request.customer.lng }}
                      title={request.customer.name}
                    >
                      <View
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                          backgroundColor: "#16A34A",
                          alignItems: "center",
                          justifyContent: "center",
                          borderWidth: 2,
                          borderColor: "#fff",
                          ...shadows.card,
                        }}
                      >
                        <Ionicons name="home" size={16} color="#fff" />
                      </View>
                    </Marker>
                  </>
                );
              })()}
            </>
          ) : null}
        </MapView>

        {/* Back button overlay */}
        <View
          style={{
            position: "absolute",
            top: Platform.OS === "ios" ? 56 : 16,
            left: 16,
          }}
        >
          <PressableScale
            onPress={() => router.back()}
            haptic="light"
          >
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.92)",
                borderRadius: 20,
                width: 40,
                height: 40,
                alignItems: "center",
                justifyContent: "center",
                ...shadows.pill,
              }}
            >
              <Ionicons name="chevron-down" size={20} color="#0A0A0A" />
            </View>
          </PressableScale>
        </View>
      </View>

      {/* Bottom sheet — 45% */}
      <SafeAreaView
        edges={["bottom"]}
        style={[{ flex: 0.45 }, shadows.sheet]}
        className="bg-white rounded-t-3xl overflow-hidden"
      >
        {/* Scrollable content */}
        <ScrollView
          className="flex-1 px-4 pt-4"
          contentContainerStyle={{ paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between mb-1">
            <View className="flex-1 mr-3">
              <Text className="text-ink-900 font-bold text-base">
                {request.restaurant.name}
              </Text>
              <Text className="text-ink-400 text-xs">{request.orderId}</Text>
              {/* Step-based subtitle */}
              <Text className="text-ink-600 text-xs mt-0.5">
                {stepSubtitle(step, request.customer.name, request.estimatedDeliveryMinutes)}
              </Text>
            </View>
            <View className="bg-surface-sunken px-3 py-1.5 rounded-full">
              <Text className="text-ink-900 font-semibold text-xs">
                {formatINR(request.payoutPaise)}
              </Text>
            </View>
          </View>

          {/* Distance + payout info strip */}
          <View className="flex-row gap-2 mb-3 mt-2">
            <View className="flex-1 bg-surface-sunken rounded-xl px-3 py-2">
              <Text className="text-ink-400 text-2xs">Pickup</Text>
              <Text className="text-ink-900 font-semibold text-xs">
                {request.restaurant.distanceFromRiderKm.toFixed(1)} km away
              </Text>
            </View>
            <View className="flex-1 bg-surface-sunken rounded-xl px-3 py-2">
              <Text className="text-ink-400 text-2xs">Drop</Text>
              <Text className="text-ink-900 font-semibold text-xs">
                {request.customer.distanceFromRestaurantKm.toFixed(1)} km
              </Text>
            </View>
            <View className="flex-1 bg-surface-sunken rounded-xl px-3 py-2">
              <Text className="text-ink-400 text-2xs">Payout</Text>
              <Text className="text-success font-bold text-xs">
                {formatINR(request.payoutPaise)}
              </Text>
            </View>
          </View>

          {/* Steps */}
          <View className="mb-3">
            <NavigationStep
              step={1}
              label="Head to restaurant"
              sublabel={request.restaurant.name}
              isActive={step === 1}
              isCompleted={step > 1}
            />
            <NavigationStep
              step={2}
              label="Pick up order"
              sublabel={`${totalItems} items`}
              isActive={step === 2}
              isCompleted={step > 2}
            />
            <NavigationStep
              step={3}
              label="Deliver to customer"
              sublabel={request.customer.name}
              isActive={step === 3}
              isCompleted={false}
              isLast
            />
          </View>

          {/* Order items */}
          <View className="bg-surface-sunken rounded-xl px-3 py-3 mb-3">
            <Text className="text-ink-400 text-2xs font-medium uppercase tracking-wide mb-2">
              Order items
            </Text>
            {request.items.map((item, i) => (
              <View key={i} className="flex-row items-center justify-between py-1">
                <Text className="text-ink-900 text-xs font-medium flex-1" numberOfLines={1}>
                  {item.name}
                </Text>
                <Text className="text-ink-400 text-xs ml-2">×{item.qty}</Text>
              </View>
            ))}
          </View>

          {/* Active handoff card */}
          {step === 1 || step === 2 ? (
            <OrderHandoffCard
              type={step === 1 ? "pickup" : "dropoff"}
              name={step === 1 ? request.restaurant.name : request.customer.name}
              address={step === 1 ? request.restaurant.address : request.customer.address}
              phone={step === 1 ? "+91 98800 11223" : "+91 87654 32100"}
            />
          ) : (
            <OrderHandoffCard
              type="dropoff"
              name={request.customer.name}
              address={request.customer.address}
              phone="+91 87654 32100"
            />
          )}
        </ScrollView>

        {/* Sticky action button — outside ScrollView */}
        <View className="px-4 pb-2 pt-2">
          <Button
            label={STEP_ACTIONS[step]}
            onPress={handleAction}
            fullWidth
            size="lg"
            haptic="none"
          />
        </View>
      </SafeAreaView>
    </View>
  );
}
