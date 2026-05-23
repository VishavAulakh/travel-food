import React, { useState } from "react";
import { Text, View, TextInput, LayoutAnimation, Platform, UIManager } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { PressableScale } from "../ui/PressableScale";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = {
  value: string;
  onChangeText: (v: string) => void;
};

export function CookingInstructions({ value, onChangeText }: Props) {
  const [expanded, setExpanded] = useState(value.length > 0);

  const toggle = () => {
    LayoutAnimation.configureNext({
      duration: 260,
      create: { type: "easeInEaseOut", property: "opacity" },
      update: { type: "easeInEaseOut" },
    });
    setExpanded((e) => !e);
  };

  return (
    <View className="bg-white rounded-2xl border border-ink-100 overflow-hidden">
      <PressableScale
        onPress={toggle}
        scaleTo={0.99}
        haptic="light"
        className="flex-row items-center px-4 py-3.5"
      >
        <View className="w-9 h-9 rounded-xl bg-ink-50 items-center justify-center">
          <Ionicons name="restaurant-outline" size={18} color="#404040" />
        </View>
        <View className="flex-1 ml-3">
          <Text className="text-ink-900 font-semibold text-sm">
            Add cooking instructions
          </Text>
          <Text className="text-ink-400 text-2xs mt-0.5" numberOfLines={1}>
            {value ? value : "The restaurant will try its best to follow your request"}
          </Text>
        </View>
        <MotiView
          animate={{ rotate: expanded ? "90deg" : "0deg" }}
          transition={{ type: "spring", damping: 18, stiffness: 220 }}
        >
          <Ionicons name="chevron-forward" size={18} color="#737373" />
        </MotiView>
      </PressableScale>

      {expanded ? (
        <View className="px-4 pb-4">
          <View className="bg-ink-50 rounded-xl px-3 py-2.5">
            <TextInput
              value={value}
              onChangeText={onChangeText}
              placeholder="E.g. Don't ring the bell, please leave at the door"
              placeholderTextColor="#A3A3A3"
              multiline
              maxLength={240}
              className="text-ink-900 text-sm leading-5"
              style={{ minHeight: 64, textAlignVertical: "top" }}
            />
          </View>
          <Text className="text-ink-400 text-2xs text-right mt-1.5">
            {value.length} / 240
          </Text>
        </View>
      ) : null}
    </View>
  );
}
