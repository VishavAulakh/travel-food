import React from "react";
import { Text, View, ImageBackground } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { Banner } from "../../lib/mock/banners";
import { PressableScale } from "../ui/PressableScale";

type Props = {
  banner: Banner;
  onPress?: () => void;
};

// Tries to load expo-linear-gradient; if unavailable, falls back to flat color.
let SafeGradient: any = View;
try {
  // expo-linear-gradient is optional — load lazily.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  SafeGradient = require("expo-linear-gradient").LinearGradient;
} catch {
  SafeGradient = View;
}

export function PromoBanner({ banner, onPress }: Props) {
  return (
    <PressableScale
      onPress={onPress}
      haptic="light"
      scaleTo={0.985}
      className="mr-3 rounded-2xl overflow-hidden"
      style={{
        width: 320,
        height: 150,
        shadowColor: banner.bgColor,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.18,
        shadowRadius: 14,
        elevation: 6,
      }}
    >
      <ImageBackground
        source={{ uri: banner.imageUrl }}
        style={{ width: "100%", height: "100%" }}
        imageStyle={{ borderRadius: 22 }}
      >
        <SafeGradient
          colors={[`${banner.bgColor}F0`, `${banner.bgColor}99`, `${banner.bgColor}33`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, padding: 18, justifyContent: "space-between" }}
        >
          <View>
            {banner.badge ? (
              <View className="self-start bg-white/95 px-2.5 py-1 rounded-md mb-2">
                <Text className="text-2xs font-bold" style={{ color: banner.bgColor }}>
                  USE {banner.badge}
                </Text>
              </View>
            ) : null}
            <Text
              className="text-xl font-extrabold"
              style={{ color: banner.textColor, lineHeight: 26, maxWidth: 200 }}
              numberOfLines={2}
            >
              {banner.title}
            </Text>
          </View>
          <View>
            <Text
              className="text-2xs mb-2"
              style={{ color: banner.textColor, opacity: 0.9, maxWidth: 200 }}
              numberOfLines={2}
            >
              {banner.subtitle}
            </Text>
            <View className="self-start bg-white px-3 py-1.5 rounded-full">
              <Text className="text-xs font-bold" style={{ color: banner.bgColor }}>
                {banner.cta} →
              </Text>
            </View>
          </View>
        </SafeGradient>
      </ImageBackground>
    </PressableScale>
  );
}
