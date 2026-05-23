import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { PaymentMethod } from "../../lib/mock/payments";
import { PressableScale } from "../ui/PressableScale";

type Props = {
  method: PaymentMethod;
  selected?: boolean;
  onPress?: () => void;
  showDivider?: boolean;
};

export function PaymentMethodRow({ method, selected, onPress, showDivider }: Props) {
  return (
    <>
      <PressableScale
        onPress={onPress}
        scaleTo={0.995}
        haptic="selection"
        className="flex-row items-center py-3.5 px-1"
      >
        <View
          className="w-10 h-10 rounded-xl items-center justify-center"
          style={{ backgroundColor: `${method.iconColor ?? "#737373"}15` }}
        >
          <Ionicons name={method.icon as any} size={20} color={method.iconColor ?? "#737373"} />
        </View>
        <View className="flex-1 ml-3">
          <Text className="text-ink-900 text-sm font-semibold">{method.label}</Text>
          {method.subLabel ? (
            <Text className="text-ink-500 text-2xs mt-0.5">{method.subLabel}</Text>
          ) : null}
        </View>
        <View
          className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
            selected ? "border-brand bg-brand" : "border-ink-300 bg-white"
          }`}
        >
          {selected ? <Ionicons name="checkmark" size={12} color="#fff" /> : null}
        </View>
      </PressableScale>
      {showDivider ? <View className="h-px bg-ink-100 ml-13" /> : null}
    </>
  );
}
