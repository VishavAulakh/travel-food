import React, { useEffect, useRef } from "react";
import { ScrollView, Text, View } from "react-native";
import { PressableScale } from "../ui/PressableScale";

type Props = {
  categories: { id: string; name: string; count: number }[];
  activeId: string;
  onSelect: (id: string) => void;
};

// Horizontal category tab bar. Auto-scrolls active tab into view.
// Active pill: white bg + brand text + warm shadow; inactive: transparent.
export function CategoryTabBar({ categories, activeId, onSelect }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const layoutsRef = useRef<Record<string, { x: number; w: number }>>({});
  const scrollWidthRef = useRef<number>(0);

  useEffect(() => {
    const layout = layoutsRef.current[activeId];
    if (layout && scrollRef.current && scrollWidthRef.current > 0) {
      const target = Math.max(
        0,
        layout.x - scrollWidthRef.current / 2 + layout.w / 2
      );
      scrollRef.current.scrollTo({ x: target, animated: true });
    }
  }, [activeId]);

  return (
    <View
      className="bg-ink-900 py-2.5"
      style={{
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
      }}
    >
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
        onLayout={(e) => {
          scrollWidthRef.current = e.nativeEvent.layout.width;
        }}
      >
        {categories.map((c) => {
          const isActive = c.id === activeId;
          return (
            <PressableScale
              key={c.id}
              onPress={() => onSelect(c.id)}
              scaleTo={0.94}
              haptic="selection"
              onLayout={(e) => {
                layoutsRef.current[c.id] = {
                  x: e.nativeEvent.layout.x,
                  w: e.nativeEvent.layout.width,
                };
              }}
            >
              <View
                className={`px-3.5 py-2 rounded-full flex-row items-center ${
                  isActive ? "bg-white" : "bg-transparent"
                }`}
                style={
                  isActive
                    ? {
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.18,
                        shadowRadius: 8,
                        elevation: 4,
                      }
                    : undefined
                }
              >
                <Text
                  className={`text-xs font-bold ${
                    isActive ? "text-brand-700" : "text-white/85"
                  }`}
                >
                  {c.name}
                </Text>
                <Text
                  className={`text-2xs font-semibold ml-1.5 ${
                    isActive ? "text-brand-700/70" : "text-white/55"
                  }`}
                >
                  {c.count}
                </Text>
              </View>
            </PressableScale>
          );
        })}
      </ScrollView>
    </View>
  );
}
