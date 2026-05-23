import React, { useEffect, useState } from "react";
import { Text, TextInput, View } from "react-native";
import { MotiView, AnimatePresence } from "moti";
import { Ionicons } from "@expo/vector-icons";
import { PressableScale } from "../ui/PressableScale";

type Props = {
  onPress: () => void;
  prompts?: string[];
  intervalMs?: number;
};

// Search bar that cycles through placeholder prompts with a smooth crossfade.
// Tapping it routes into the search experience (does not focus the input).
export function CyclingSearchBar({
  onPress,
  prompts = ["Search 'biryani'", "Search 'pizza'", "Search 'paneer'"],
  intervalMs = 2500,
}: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % prompts.length);
    }, intervalMs);
    return () => clearInterval(t);
  }, [prompts.length, intervalMs]);

  return (
    <PressableScale onPress={onPress} scaleTo={0.99} haptic="light">
      <View
        className="flex-row items-center bg-white rounded-2xl px-4 py-3 border border-ink-100"
        style={{
          shadowColor: "#1F1408",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 2,
        }}
      >
        <Ionicons name="search" size={20} color="#FC5F30" />

        <View className="flex-1 ml-3" style={{ height: 22, justifyContent: "center" }}>
          <AnimatePresence exitBeforeEnter>
            <MotiView
              key={prompts[index]}
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: -10 }}
              transition={{ type: "timing", duration: 260 }}
            >
              <Text
                className="text-ink-500 text-sm"
                numberOfLines={1}
              >
                {prompts[index]}
              </Text>
            </MotiView>
          </AnimatePresence>
          {/* Hidden TextInput keeps platform a11y semantics for "search" affordance */}
          <TextInput
            editable={false}
            pointerEvents="none"
            style={{ position: "absolute", width: 0, height: 0, opacity: 0 }}
          />
        </View>

        <View className="w-px h-5 bg-ink-200 mx-2" />
        <Ionicons name="mic-outline" size={20} color="#FC5F30" />
      </View>
    </PressableScale>
  );
}
