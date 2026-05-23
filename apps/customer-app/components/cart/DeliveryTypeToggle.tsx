import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { PressableScale } from "../ui/PressableScale";

export type DeliveryType = "standard" | "scheduled";

type Props = {
  value: DeliveryType;
  onChange: (v: DeliveryType) => void;
  etaLabel: string;
};

export function DeliveryTypeToggle({ value, onChange, etaLabel }: Props) {
  const options: { key: DeliveryType; icon: React.ComponentProps<typeof Ionicons>["name"]; title: string; subtitle: string }[] = [
    { key: "standard", icon: "flash", title: "Standard", subtitle: etaLabel },
    { key: "scheduled", icon: "calendar-outline", title: "Schedule", subtitle: "Pick a time" },
  ];
  return (
    <View className="bg-white rounded-2xl border border-ink-100 p-2 flex-row">
      {options.map((opt) => {
        const active = value === opt.key;
        return (
          <PressableScale
            key={opt.key}
            onPress={() => onChange(opt.key)}
            scaleTo={0.97}
            haptic="selection"
            className="flex-1"
          >
            <MotiView
              animate={{
                backgroundColor: active ? "#FFF4F0" : "#FFFFFF",
                borderColor: active ? "#FC5F30" : "transparent",
              }}
              transition={{ type: "timing", duration: 200 }}
              className="rounded-xl border px-3 py-2.5 flex-row items-center"
            >
              <View
                className={`w-8 h-8 rounded-full items-center justify-center ${
                  active ? "bg-brand" : "bg-ink-50"
                }`}
              >
                <Ionicons
                  name={opt.icon}
                  size={16}
                  color={active ? "#fff" : "#525252"}
                />
              </View>
              <View className="ml-2 flex-1">
                <Text
                  className={`text-xs font-bold ${
                    active ? "text-brand-700" : "text-ink-900"
                  }`}
                >
                  {opt.title}
                </Text>
                <Text className="text-ink-500 text-2xs mt-0.5" numberOfLines={1}>
                  {opt.subtitle}
                </Text>
              </View>
            </MotiView>
          </PressableScale>
        );
      })}
    </View>
  );
}
