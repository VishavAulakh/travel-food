import React, { useEffect, useMemo } from "react";
import { View, Text, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MotiView, AnimatePresence } from "moti";

import { Button, AnimatedListItem } from "../components";
import { haptics } from "../lib/haptics";

// 6-digit random order ID, stable across re-renders
function useOrderId() {
  return useMemo(() => {
    return `TF${Math.floor(100000 + Math.random() * 900000)}`;
  }, []);
}

const BURST_DOTS = Array.from({ length: 6 });

const TIMELINE_STEPS = [
  {
    icon: "restaurant" as const,
    label: "Restaurant is preparing",
    description: "Your order is being freshly prepared",
    active: true,
  },
  {
    icon: "bicycle" as const,
    label: "Rider picks up your order",
    description: "A delivery partner will collect your order",
    active: false,
  },
  {
    icon: "home" as const,
    label: "Delivered to you",
    description: "Hot food at your doorstep",
    active: false,
  },
];

export default function OrderPlacedScreen() {
  const params = useLocalSearchParams<{ restaurantName?: string; estimatedMinutes?: string }>();
  const restaurantName = decodeURIComponent(params.restaurantName ?? "the restaurant");
  const estimatedMinutes = params.estimatedMinutes ?? "35-40";
  const orderId = useOrderId();

  useEffect(() => {
    haptics.success();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Celebration Hero */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: "timing", duration: 400 }}
          className="items-center mt-10 mb-6"
        >
          {/* Burst dots */}
          <View className="w-40 h-40 items-center justify-center" style={{ position: "relative" }}>
            {BURST_DOTS.map((_, i) => {
              const angle = (i / BURST_DOTS.length) * 2 * Math.PI;
              const endX = Math.cos(angle) * 68;
              const endY = Math.sin(angle) * 68;
              return (
                <MotiView
                  key={i}
                  from={{ opacity: 1, translateX: 0, translateY: 0, scale: 1 }}
                  animate={{ opacity: 0, translateX: endX, translateY: endY, scale: 0.4 }}
                  transition={{
                    type: "timing",
                    duration: 700,
                    delay: i * 50,
                  }}
                  style={{
                    position: "absolute",
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: i % 2 === 0 ? "#FC5F30" : "#FFB700",
                  }}
                />
              );
            })}

            {/* Main checkmark circle */}
            <MotiView
              from={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", ...{ damping: 10, stiffness: 200, mass: 1 } }}
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: "#FC5F30",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#FC5F30",
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.35,
                shadowRadius: 20,
                elevation: 12,
              }}
            >
              <Ionicons name="checkmark" size={52} color="#fff" />
            </MotiView>
          </View>

          {/* Heading */}
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 380, delay: 300 }}
            className="items-center mt-4"
          >
            <Text className="text-ink-900 text-2xl font-extrabold text-center">
              Order Confirmed!
            </Text>
            <Text className="text-ink-500 text-sm text-center mt-1.5 leading-5 max-w-xs">
              Your food is being prepared at{"\n"}
              <Text className="text-ink-900 font-semibold">{restaurantName}</Text>
            </Text>
          </MotiView>
        </MotiView>

        {/* ETA Card */}
        <AnimatedListItem index={1} className="mb-4">
          <View
            className="bg-surface-tint border border-brand-100 rounded-2xl p-4 flex-row items-center"
            style={{
              shadowColor: "#FC5F30",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 3,
            }}
          >
            <View className="w-12 h-12 rounded-full bg-brand/10 items-center justify-center mr-3">
              <Ionicons name="bicycle" size={26} color="#FC5F30" />
            </View>
            <View className="flex-1">
              <Text className="text-ink-900 font-bold text-base">
                Estimated Delivery
              </Text>
              <View className="flex-row items-center mt-1">
                {/* Pulsing green dot */}
                <MotiView
                  from={{ scale: 1, opacity: 1 }}
                  animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                  transition={{ type: "timing", duration: 1400, loop: true }}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "#16A34A",
                    marginRight: 6,
                  }}
                />
                <Text className="text-ink-600 text-sm">
                  {estimatedMinutes} mins
                </Text>
              </View>
            </View>
            <View className="items-end">
              <Text className="text-ink-300 text-2xs">Order ID</Text>
              <Text className="text-ink-700 text-xs font-bold mt-0.5">#{orderId}</Text>
            </View>
          </View>
        </AnimatedListItem>

        {/* What happens next */}
        <AnimatedListItem index={2} className="mb-4">
          <View className="bg-white rounded-2xl p-4 border border-ink-100">
            <Text className="text-ink-900 font-bold text-sm mb-4">What happens next?</Text>

            {TIMELINE_STEPS.map((step, i) => (
              <MotiView
                key={step.label}
                from={{ opacity: 0, translateX: -12 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: "timing", duration: 360, delay: 500 + i * 100 }}
              >
                <View className="flex-row">
                  {/* Icon column */}
                  <View className="items-center" style={{ width: 36 }}>
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: i === 0 ? "#FC5F30" : "#F0EFEC",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Ionicons
                        name={step.icon}
                        size={16}
                        color={i === 0 ? "#fff" : "#A3A3A3"}
                      />
                    </View>
                    {i < TIMELINE_STEPS.length - 1 ? (
                      <View
                        style={{
                          width: 2,
                          flex: 1,
                          minHeight: 28,
                          marginVertical: 4,
                          backgroundColor: i === 0 ? "#FC5F30" : "#E5E5E5",
                          borderRadius: 1,
                        }}
                      />
                    ) : null}
                  </View>

                  {/* Text column */}
                  <View className="flex-1 ml-3" style={{ paddingBottom: i < TIMELINE_STEPS.length - 1 ? 20 : 0 }}>
                    <Text
                      className={`text-sm font-bold ${i === 0 ? "text-ink-900" : "text-ink-400"}`}
                    >
                      {step.label}
                    </Text>
                    <Text
                      className={`text-2xs mt-0.5 ${i === 0 ? "text-ink-500" : "text-ink-300"}`}
                    >
                      {step.description}
                    </Text>
                  </View>
                </View>
              </MotiView>
            ))}
          </View>
        </AnimatedListItem>

        {/* Support note */}
        <AnimatedListItem index={3} className="mb-6">
          <View className="flex-row items-center bg-ink-50 rounded-xl px-3 py-2.5">
            <Ionicons name="headset-outline" size={16} color="#737373" />
            <Text className="text-ink-500 text-xs ml-2 flex-1">
              Need help with your order? Chat with us anytime.
            </Text>
          </View>
        </AnimatedListItem>

        {/* Actions */}
        <AnimatedListItem index={4} className="gap-3">
          <Button
            label="Track Order"
            icon="navigate"
            iconPosition="left"
            size="lg"
            variant="primary"
            fullWidth
            onPress={() => router.replace("/(tabs)/orders")}
            haptic="medium"
          />
          <View className="mt-2">
            <Button
              label="Browse more restaurants"
              size="md"
              variant="ghost"
              fullWidth
              onPress={() => router.replace("/(tabs)")}
              haptic="light"
            />
          </View>
        </AnimatedListItem>
      </ScrollView>
    </SafeAreaView>
  );
}
