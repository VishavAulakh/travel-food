import React from "react";
import { Text, View, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PressableScale } from "../ui/PressableScale";
import { FadeInImage } from "../ui/FadeInImage";
import { VegIndicator } from "../ui/VegIndicator";
import { formatINR } from "../../lib/format";
import { haptics } from "../../lib/haptics";

export type Suggestion = {
  id: string;
  name: string;
  pricePaise: number;
  imageUrl: string;
  isVeg: boolean;
};

type Props = {
  items: Suggestion[];
  onAdd: (s: Suggestion) => void;
};

export function SuggestionsSection({ items, onAdd }: Props) {
  return (
    <View>
      <View className="px-4 mb-2">
        <Text className="text-ink-900 font-bold text-sm">Missed something?</Text>
        <Text className="text-ink-500 text-2xs mt-0.5">Popular add-ons from this restaurant</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
      >
        {items.map((s) => (
          <View
            key={s.id}
            className="w-36 bg-white rounded-2xl border border-ink-100 overflow-hidden"
          >
            <FadeInImage uri={s.imageUrl} style={{ width: "100%", height: 80 }} />
            <View className="p-2.5">
              <View className="flex-row items-center mb-1">
                <VegIndicator isVeg={s.isVeg} size={10} />
              </View>
              <Text className="text-ink-900 font-semibold text-xs leading-4" numberOfLines={2}>
                {s.name}
              </Text>
              <View className="flex-row items-center justify-between mt-2">
                <Text className="text-ink-700 text-xs font-bold">
                  {formatINR(s.pricePaise)}
                </Text>
                <PressableScale
                  onPress={() => {
                    haptics.success();
                    onAdd(s);
                  }}
                  scaleTo={0.9}
                  className="bg-brand-50 border border-brand-100 rounded-md px-2 py-0.5 flex-row items-center"
                >
                  <Ionicons name="add" size={12} color="#FC5F30" />
                  <Text className="text-brand-700 text-2xs font-extrabold ml-0.5">ADD</Text>
                </PressableScale>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
