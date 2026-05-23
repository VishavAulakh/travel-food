import React, { useRef } from "react";
import { Text, View, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Swipeable, RectButton } from "react-native-gesture-handler";
import { MotiView } from "moti";
import { VegIndicator } from "../ui/VegIndicator";
import { Stepper } from "../ui/Stepper";
import { formatINR } from "../../lib/format";
import { haptics } from "../../lib/haptics";

type Props = {
  productId: string;
  name: string;
  pricePaise: number;
  qty: number;
  isVeg?: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
};

// Swipeable cart row — reveal red "Remove" action by swiping left.
export function CartItemRow({
  name,
  pricePaise,
  qty,
  isVeg = true,
  onIncrement,
  onDecrement,
  onRemove,
}: Props) {
  const swipeableRef = useRef<Swipeable>(null);

  const renderRightActions = (
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-100, -40, 0],
      outputRange: [1, 0.85, 0.6],
      extrapolate: "clamp",
    });
    const opacity = dragX.interpolate({
      inputRange: [-80, -20, 0],
      outputRange: [1, 0.5, 0],
      extrapolate: "clamp",
    });
    return (
      <RectButton
        style={{
          width: 96,
          backgroundColor: "#DC2626",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 16,
          marginLeft: 8,
        }}
        onPress={() => {
          haptics.warning();
          swipeableRef.current?.close();
          onRemove();
        }}
      >
        <Animated.View style={{ transform: [{ scale }], opacity, alignItems: "center" }}>
          <Ionicons name="trash" size={20} color="#fff" />
          <Text className="text-white font-bold text-2xs mt-1">REMOVE</Text>
        </Animated.View>
      </RectButton>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
      friction={2}
      rightThreshold={48}
    >
      <MotiView
        from={{ opacity: 0.6, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "timing", duration: 200 }}
        className="bg-white rounded-2xl px-3.5 py-3 flex-row items-center"
      >
        <View className="mr-3 mt-0.5">
          <VegIndicator isVeg={isVeg} size={14} />
        </View>
        <View className="flex-1 pr-3">
          <Text className="text-ink-900 font-semibold text-sm" numberOfLines={2}>
            {name}
          </Text>
          <Text className="text-ink-500 text-xs mt-1">{formatINR(pricePaise)}</Text>
        </View>
        <View className="items-end">
          <Stepper qty={qty} onIncrement={onIncrement} onDecrement={onDecrement} size="sm" />
          <Text className="text-ink-700 text-xs font-semibold mt-1.5">
            {formatINR(pricePaise * qty)}
          </Text>
        </View>
      </MotiView>
    </Swipeable>
  );
}
