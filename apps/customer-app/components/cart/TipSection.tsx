import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { PressableScale } from "../ui/PressableScale";
import { formatINR } from "../../lib/format";
import { haptics } from "../../lib/haptics";

const TIP_OPTIONS_PAISE = [2000, 3000, 5000] as const;

type Props = {
  tipPaise: number;
  onChange: (paise: number) => void;
};

export function TipSection({ tipPaise, onChange }: Props) {
  return (
    <View className="bg-white rounded-2xl border border-ink-100 p-4">
      <View className="flex-row items-center mb-1">
        <Ionicons name="heart" size={16} color="#FC5F30" />
        <Text className="text-ink-900 font-bold text-sm ml-2">
          Tip your delivery partner
        </Text>
      </View>
      <Text className="text-ink-500 text-2xs mb-3 leading-4">
        Your kindness means a lot. 100% of the tip goes to your rider.
      </Text>

      <View className="flex-row gap-2">
        {TIP_OPTIONS_PAISE.map((amt) => {
          const active = tipPaise === amt;
          return (
            <PressableScale
              key={amt}
              onPress={() => {
                haptics.selection();
                onChange(active ? 0 : amt);
              }}
              scaleTo={0.94}
              className="flex-1"
            >
              <MotiView
                animate={{
                  backgroundColor: active ? "#FC5F30" : "#FFFFFF",
                  borderColor: active ? "#FC5F30" : "#E5E5E5",
                }}
                transition={{ type: "timing", duration: 180 }}
                className="border rounded-xl items-center justify-center py-2.5"
              >
                <Text
                  className={`font-extrabold text-sm ${
                    active ? "text-white" : "text-ink-800"
                  }`}
                >
                  {formatINR(amt)}
                </Text>
              </MotiView>
            </PressableScale>
          );
        })}
        <PressableScale
          onPress={() => {
            haptics.selection();
            onChange(tipPaise === 10000 ? 0 : 10000);
          }}
          scaleTo={0.94}
          className="flex-1"
        >
          <MotiView
            animate={{
              backgroundColor: tipPaise === 10000 ? "#FC5F30" : "#FFFFFF",
              borderColor: tipPaise === 10000 ? "#FC5F30" : "#E5E5E5",
            }}
            transition={{ type: "timing", duration: 180 }}
            className="border rounded-xl items-center justify-center py-2.5"
          >
            <Text
              className={`font-extrabold text-sm ${
                tipPaise === 10000 ? "text-white" : "text-ink-800"
              }`}
            >
              Custom
            </Text>
          </MotiView>
        </PressableScale>
      </View>
    </View>
  );
}
