import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Address } from "../../lib/mock/addresses";
import { PressableScale } from "../ui/PressableScale";

type Props = {
  address: Address;
  onPress?: () => void;
  onEdit?: () => void;
  selected?: boolean;
  compact?: boolean;
};

const LABEL_ICONS: Record<Address["label"], React.ComponentProps<typeof Ionicons>["name"]> = {
  Home: "home",
  Work: "briefcase",
  Other: "location",
};

export function AddressCard({ address, onPress, onEdit, selected, compact }: Props) {
  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.99}
      haptic="selection"
      className={`bg-white rounded-2xl p-4 border ${
        selected ? "border-brand" : "border-ink-100"
      }`}
      style={
        selected
          ? {
              shadowColor: "#FC5F30",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.18,
              shadowRadius: 10,
              elevation: 4,
            }
          : undefined
      }
    >
      <View className="flex-row items-start">
        <View
          className={`w-10 h-10 rounded-full items-center justify-center ${
            selected ? "bg-brand" : "bg-brand-50"
          }`}
        >
          <Ionicons
            name={LABEL_ICONS[address.label]}
            size={18}
            color={selected ? "#fff" : "#FC5F30"}
          />
        </View>
        <View className="flex-1 ml-3">
          <View className="flex-row items-center">
            <Text className="text-ink-900 font-bold text-sm">
              {address.customLabel ?? address.label}
            </Text>
            {address.isDefault ? (
              <View className="ml-2 bg-ink-100 px-1.5 py-0.5 rounded">
                <Text className="text-2xs font-semibold text-ink-700">DEFAULT</Text>
              </View>
            ) : null}
          </View>
          <Text
            className="text-ink-600 text-xs mt-1 leading-5"
            numberOfLines={compact ? 1 : 2}
          >
            {address.line1}
            {address.line2 ? `, ${address.line2}` : ""}, {address.area}, {address.city} {address.pincode}
          </Text>
          {address.landmark && !compact ? (
            <Text className="text-ink-400 text-2xs mt-1">
              Landmark: {address.landmark}
            </Text>
          ) : null}
        </View>
        {selected ? (
          <Ionicons name="checkmark-circle" size={22} color="#FC5F30" />
        ) : onEdit ? (
          <PressableScale onPress={onEdit} scaleTo={0.92} className="px-1">
            <Text className="text-brand text-xs font-bold uppercase">EDIT</Text>
          </PressableScale>
        ) : null}
      </View>
    </PressableScale>
  );
}
