import React, { useState } from "react";
import { Text, View, LayoutAnimation, Platform, UIManager } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { PressableScale } from "../ui/PressableScale";
import { promos, type Promo } from "../../lib/mock/promos";
import { formatPromo, formatINR } from "../../lib/format";
import { haptics } from "../../lib/haptics";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = {
  appliedCode: string | null;
  onApply: (promo: Promo) => void;
  onRemove: () => void;
  orderTotalPaise: number;
};

export function CouponSection({
  appliedCode,
  onApply,
  onRemove,
  orderTotalPaise,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const applied = appliedCode ? promos.find((p) => p.code === appliedCode) : null;

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
        <View className="w-9 h-9 rounded-xl bg-brand-50 items-center justify-center">
          <Ionicons name="pricetag" size={16} color="#FC5F30" />
        </View>
        <View className="flex-1 ml-3">
          {applied ? (
            <>
              <Text className="text-ink-900 font-semibold text-sm">
                {applied.code} applied
              </Text>
              <Text className="text-success text-2xs mt-0.5">
                You're saving on this order
              </Text>
            </>
          ) : (
            <>
              <Text className="text-ink-900 font-semibold text-sm">Apply coupon</Text>
              <Text className="text-ink-500 text-2xs mt-0.5">
                {promos.length} offers available
              </Text>
            </>
          )}
        </View>
        {applied ? (
          <PressableScale
            onPress={() => {
              haptics.light();
              onRemove();
            }}
            scaleTo={0.94}
            className="px-2 py-1"
          >
            <Text className="text-danger text-xs font-bold uppercase">Remove</Text>
          </PressableScale>
        ) : (
          <MotiView
            animate={{ rotate: expanded ? "90deg" : "0deg" }}
            transition={{ type: "spring", damping: 18, stiffness: 220 }}
          >
            <Ionicons name="chevron-forward" size={18} color="#737373" />
          </MotiView>
        )}
      </PressableScale>

      {expanded && !applied ? (
        <View className="px-4 pb-4 pt-1">
          {promos.map((p, idx) => {
            const eligible = orderTotalPaise >= p.minOrderPaise;
            return (
              <MotiView
                key={p.code}
                from={{ opacity: 0, translateY: 8 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "timing", duration: 240, delay: idx * 50 }}
                className="bg-surface-tint border border-brand-100 rounded-xl p-3 mb-2"
              >
                <View className="flex-row items-center mb-1">
                  <View className="bg-brand-50 px-2 py-0.5 rounded">
                    <Text className="text-brand-700 text-2xs font-extrabold tracking-wider">
                      {p.code}
                    </Text>
                  </View>
                  <Text className="text-ink-900 font-semibold text-xs ml-2 flex-1" numberOfLines={1}>
                    {formatPromo(p.discount)}
                  </Text>
                </View>
                <Text className="text-ink-600 text-2xs leading-4 mb-2" numberOfLines={2}>
                  {p.description}
                </Text>
                <View className="flex-row items-center justify-between">
                  <Text className="text-ink-400 text-2xs">
                    {eligible
                      ? "Eligible"
                      : `Add ${formatINR(p.minOrderPaise - orderTotalPaise)} more`}
                  </Text>
                  <PressableScale
                    onPress={() => {
                      if (!eligible) {
                        haptics.warning();
                        return;
                      }
                      haptics.success();
                      onApply(p);
                      setExpanded(false);
                    }}
                    scaleTo={0.94}
                    className={`px-3 py-1.5 rounded-lg ${
                      eligible ? "bg-brand" : "bg-ink-100"
                    }`}
                  >
                    <Text
                      className={`text-2xs font-extrabold tracking-wider ${
                        eligible ? "text-white" : "text-ink-400"
                      }`}
                    >
                      APPLY
                    </Text>
                  </PressableScale>
                </View>
              </MotiView>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}
