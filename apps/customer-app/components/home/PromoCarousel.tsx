import React from "react";
import { ScrollView, View, NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { banners } from "../../lib/mock/banners";
import { PromoBanner } from "../restaurant/PromoBanner";

const CARD_WIDTH = 320;
const CARD_GAP = 12; // matches mr-3 in PromoBanner
const SNAP_INTERVAL = CARD_WIDTH + CARD_GAP;

type Props = {
  onBannerPress?: (id: string) => void;
};

export function PromoCarousel({ onBannerPress }: Props) {
  const scrollX = useSharedValue(0);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollX.value = e.nativeEvent.contentOffset.x;
  };

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={SNAP_INTERVAL}
        snapToAlignment="start"
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 4 }}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {banners.map((b) => (
          <PromoBanner
            key={b.id}
            banner={b}
            onPress={() => onBannerPress?.(b.id)}
          />
        ))}
      </ScrollView>

      <View className="flex-row items-center justify-center mt-3" style={{ gap: 6 }}>
        {banners.map((_, i) => (
          <Dot key={i} index={i} scrollX={scrollX} />
        ))}
      </View>
    </View>
  );
}

function Dot({ index, scrollX }: { index: number; scrollX: Animated.SharedValue<number> }) {
  const animatedStyle = useAnimatedStyle(() => {
    const distance = Math.abs(scrollX.value - index * SNAP_INTERVAL);
    const t = interpolate(
      distance,
      [0, SNAP_INTERVAL],
      [1, 0],
      Extrapolation.CLAMP
    );
    const width = interpolate(t, [0, 1], [6, 22], Extrapolation.CLAMP);
    const opacity = interpolate(t, [0, 1], [0.35, 1], Extrapolation.CLAMP);
    return {
      width,
      opacity,
      backgroundColor: t > 0.4 ? "#FC5F30" : "#D4D4D4",
    };
  });

  return (
    <Animated.View
      style={[
        { height: 6, borderRadius: 3 },
        animatedStyle,
      ]}
    />
  );
}
