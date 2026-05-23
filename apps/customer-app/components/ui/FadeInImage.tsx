import React, { useState } from "react";
import { Image, ImageProps, View, StyleProp, ImageStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { Skeleton } from "./Skeleton";

type Props = Omit<ImageProps, "source" | "style"> & {
  uri: string;
  style?: StyleProp<ImageStyle>;
  borderRadius?: number;
  showSkeleton?: boolean;
};

// Image that fades in after the network load completes. Falls back to skeleton.
export function FadeInImage({
  uri,
  style,
  borderRadius = 0,
  showSkeleton = true,
  ...rest
}: Props) {
  const opacity = useSharedValue(0);
  const [loaded, setLoaded] = useState(false);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={[{ overflow: "hidden", borderRadius }, style as any]}>
      {!loaded && showSkeleton ? (
        <View style={{ ...(style as any), position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
          <Skeleton width="100%" height="100%" borderRadius={borderRadius} />
        </View>
      ) : null}
      <Animated.Image
        {...rest}
        source={{ uri }}
        style={[{ width: "100%", height: "100%", borderRadius }, animatedStyle as any]}
        onLoadEnd={() => {
          setLoaded(true);
          opacity.value = withTiming(1, { duration: 360 });
        }}
      />
    </View>
  );
}
