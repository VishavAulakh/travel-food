import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { PressableScale } from "../ui/PressableScale";
import { haptics } from "../../lib/haptics";
import { shadows } from "../../lib/theme";
import { formatINR } from "../../lib/format";

type Props = {
  isOnline: boolean;
  onToggle: () => void;
  isLoading?: boolean;
  todayEarnings?: number; // paise
};

// Three vertical signal bars with staggered pulsing
function SignalBars() {
  const bars = [
    { height: 4, delay: 0 },
    { height: 8, delay: 150 },
    { height: 12, delay: 300 },
  ];

  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 2 }}>
      {bars.map((bar, i) => (
        <MotiView
          key={i}
          from={{ opacity: 0.4 }}
          animate={{ opacity: 1 }}
          transition={{
            type: "timing",
            duration: 600,
            delay: bar.delay,
            loop: true,
            repeatReverse: true,
          }}
          style={{
            width: 4,
            height: bar.height,
            borderRadius: 2,
            backgroundColor: "#FFFFFF",
          }}
        />
      ))}
    </View>
  );
}

export function OnlineToggleButton({
  isOnline,
  onToggle,
  isLoading,
  todayEarnings = 0,
}: Props) {
  const handlePress = () => {
    haptics.medium();
    onToggle();
  };

  return (
    <PressableScale
      onPress={handlePress}
      haptic="none"
      scaleTo={0.97}
      disabled={isLoading}
      style={[
        isOnline ? shadows.brand : shadows.card,
        { opacity: isLoading ? 0.7 : 1, overflow: "hidden" },
      ]}
      className={`rounded-2xl py-5 px-6 ${
        isOnline ? "bg-brand" : "bg-ink-900"
      }`}
    >
      {/* Offline shimmer overlay */}
      {!isOnline && !isLoading && (
        <MotiView
          from={{ translateX: -220 }}
          animate={{ translateX: 420 }}
          transition={{
            type: "timing",
            duration: 2000,
            loop: true,
            repeatReverse: false,
          }}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            width: 80,
            backgroundColor: "rgba(255,255,255,0.06)",
            transform: [{ skewX: "-20deg" }],
          }}
        />
      )}

      {/* Main row */}
      <View className="flex-row items-center justify-center gap-3">
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <>
            {/* Left indicator: signal bars (online) or power icon (offline) */}
            {isOnline ? (
              <SignalBars />
            ) : (
              <Ionicons name="power" size={24} color="#FFFFFF" />
            )}

            {/* Label + subtitle column */}
            <View className="items-center">
              <Text className="text-white text-lg font-bold">
                {isOnline ? "Go Offline" : "Go Online"}
              </Text>
              <Text className="text-white/70 text-xs mt-0.5">
                {isOnline
                  ? "Looking for orders nearby..."
                  : `${formatINR(todayEarnings)} earned today`}
              </Text>
            </View>

            {/* Right icon for online state */}
            {isOnline && (
              <Ionicons name="radio" size={24} color="#FFFFFF" />
            )}
          </>
        )}
      </View>
    </PressableScale>
  );
}
