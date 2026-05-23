import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { Button } from "./Button";

type Props = {
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  description?: string;
  ctaLabel?: string;
  onCtaPress?: () => void;
};

export function EmptyState({ icon = "search", title, description, ctaLabel, onCtaPress }: Props) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <MotiView
        from={{ opacity: 0, scale: 0.8, translateY: 10 }}
        animate={{ opacity: 1, scale: 1, translateY: 0 }}
        transition={{ type: "spring", damping: 14, stiffness: 160 }}
      >
        <View className="w-24 h-24 rounded-full bg-brand-50 items-center justify-center mb-5">
          <Ionicons name={icon} size={40} color="#FC5F30" />
        </View>
      </MotiView>
      <MotiView
        from={{ opacity: 0, translateY: 8 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 320, delay: 120 }}
      >
        <Text className="text-ink-900 text-lg font-bold text-center">{title}</Text>
        {description ? (
          <Text className="text-ink-500 text-sm text-center mt-2 leading-5 max-w-xs">
            {description}
          </Text>
        ) : null}
      </MotiView>
      {ctaLabel && onCtaPress ? (
        <View className="mt-6">
          <Button label={ctaLabel} onPress={onCtaPress} size="md" />
        </View>
      ) : null}
    </View>
  );
}
