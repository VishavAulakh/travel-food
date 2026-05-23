import React from "react";
import { View, Text, Linking, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PressableScale } from "../ui/PressableScale";

type Props = {
  type: "pickup" | "dropoff";
  name: string;
  address: string;
  phone?: string;
  notes?: string;
};

export function OrderHandoffCard({ type, name, address, phone, notes }: Props) {
  const isPickup = type === "pickup";

  const handleCall = () => {
    if (!phone) return;
    const digits = phone.replace(/\D/g, "");
    Linking.openURL(`tel:${digits}`).catch(() =>
      Alert.alert("Unable to make call", "Please dial manually: " + phone)
    );
  };

  return (
    <View
      className={`rounded-2xl border p-4 mb-3 ${
        isPickup
          ? "bg-surface-tint border-brand/10"
          : "bg-white border-success/10"
      }`}
    >
      {/* Header label */}
      <View className="flex-row items-center gap-1.5 mb-3">
        <View
          className={`w-1 h-4 rounded-full ${isPickup ? "bg-brand" : "bg-success"}`}
        />
        <Text
          className={`text-xs font-semibold uppercase tracking-wide ${
            isPickup ? "text-brand" : "text-success"
          }`}
        >
          {isPickup ? "Pick up from" : "Deliver to"}
        </Text>
      </View>

      {/* Main info row */}
      <View className="flex-row items-center gap-3">
        <View
          className={`w-10 h-10 rounded-xl items-center justify-center ${
            isPickup ? "bg-brand" : "bg-success"
          }`}
        >
          <Ionicons
            name={isPickup ? "restaurant" : "home"}
            size={18}
            color="#FFFFFF"
          />
        </View>

        <View className="flex-1">
          <Text className="text-ink-900 font-bold text-sm">{name}</Text>
          <Text className="text-ink-500 text-xs mt-0.5" numberOfLines={2}>
            {address}
          </Text>
        </View>

        {phone ? (
          <PressableScale
            onPress={handleCall}
            haptic="light"
            className={`w-10 h-10 rounded-full items-center justify-center ${
              isPickup ? "bg-brand/10" : "bg-success/10"
            }`}
          >
            <Ionicons
              name="call"
              size={18}
              color={isPickup ? "#FC5F30" : "#16A34A"}
            />
          </PressableScale>
        ) : null}
      </View>

      {notes ? (
        <View className="mt-3 bg-warning/5 border border-warning/15 rounded-lg px-3 py-2 flex-row gap-2 items-start">
          <Ionicons name="information-circle" size={14} color="#F59E0B" />
          <Text className="text-ink-600 text-xs flex-1">{notes}</Text>
        </View>
      ) : null}
    </View>
  );
}
