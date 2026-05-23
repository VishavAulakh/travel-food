import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
} from "react-native-reanimated";

import {
  AnimatedListItem,
  EmptyState,
  FadeInImage,
  FloatingCartBar,
  MenuItemRow,
  PressableScale,
  RatingPill,
} from "../../components";
import { CategoryTabBar } from "../../components/restaurant/CategoryTabBar";
import { VegToggle } from "../../components/restaurant/VegToggle";
import { getRestaurantById } from "../../lib/mock/restaurants";
import { getMenuForRestaurant, MenuCategory } from "../../lib/mock/menus";
import {
  formatCostForTwo,
  formatDistance,
  formatEta,
} from "../../lib/format";
import { haptics } from "../../lib/haptics";

const HERO_HEIGHT = 240;
const INFO_OVERLAP = 16;

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export default function RestaurantScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const restaurant = id ? getRestaurantById(id) : undefined;
  const menu = useMemo<MenuCategory[]>(
    () => (id ? getMenuForRestaurant(id) : []),
    [id]
  );

  if (!restaurant) {
    return (
      <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
        <View className="px-2 py-2 flex-row items-center">
          <PressableScale
            onPress={() => router.back()}
            scaleTo={0.88}
            haptic="light"
            className="w-11 h-11 items-center justify-center rounded-full"
          >
            <Ionicons name="arrow-back" size={24} color="#0A0A0A" />
          </PressableScale>
        </View>
        <EmptyState
          icon="storefront-outline"
          title="Restaurant not available"
          description="This restaurant may have closed or moved. Try exploring nearby spots instead."
          ctaLabel="Back to home"
          onCtaPress={() => router.back()}
        />
      </View>
    );
  }

  const scrollY = useSharedValue(0);
  const scrollRef = useRef<ScrollView>(null);
  const [vegOnly, setVegOnly] = useState(false);
  const [favourited, setFavourited] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState(menu[0]?.id ?? "");

  // Y-position (in scrollView coords) of each category section header.
  const sectionOffsets = useRef<Record<string, number>>({});
  const stickyOffsetRef = useRef<number>(0);

  // Filtered categories: keep all categories but optionally filter items.
  const visibleCategories = useMemo<MenuCategory[]>(
    () =>
      menu
        .map((c) => ({
          ...c,
          items: vegOnly ? c.items.filter((i) => i.isVeg) : c.items,
        }))
        .filter((c) => c.items.length > 0),
    [menu, vegOnly]
  );

  // Re-pick a valid active category if the previous one filtered out.
  React.useEffect(() => {
    if (!visibleCategories.find((c) => c.id === activeCategoryId)) {
      setActiveCategoryId(visibleCategories[0]?.id ?? "");
    }
  }, [visibleCategories, activeCategoryId]);

  const updateActiveCategory = useCallback(
    (offsetY: number) => {
      // Pick the deepest category whose top has been crossed by the sticky bar.
      const threshold = offsetY + stickyOffsetRef.current + 24;
      let next = visibleCategories[0]?.id ?? "";
      for (const c of visibleCategories) {
        const y = sectionOffsets.current[c.id];
        if (y != null && y <= threshold) next = c.id;
      }
      if (next && next !== activeCategoryId) {
        setActiveCategoryId(next);
      }
    },
    [visibleCategories, activeCategoryId]
  );

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
      runOnJS(updateActiveCategory)(event.contentOffset.y);
    },
  });

  // --- Animated styles ---
  const heroStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollY.value,
      [-200, 0],
      [1.35, 1],
      Extrapolation.CLAMP
    );
    const translateY = interpolate(
      scrollY.value,
      [0, HERO_HEIGHT],
      [0, -HERO_HEIGHT * 0.4],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ translateY }, { scale }],
    };
  });

  const headerBgStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [HERO_HEIGHT - 80, HERO_HEIGHT - 30],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }));

  const headerTitleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [HERO_HEIGHT - 40, HERO_HEIGHT + 20],
      [0, 1],
      Extrapolation.CLAMP
    ),
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [HERO_HEIGHT - 40, HERO_HEIGHT + 20],
          [8, 0],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  const backIconColorStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [HERO_HEIGHT - 80, HERO_HEIGHT - 30],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }));

  const backIconWhiteStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [HERO_HEIGHT - 80, HERO_HEIGHT - 30],
      [1, 0],
      Extrapolation.CLAMP
    ),
  }));

  // --- Sticky tab bar ---
  // Tab bar lives in flow at `stickyTop` (computed after info card lays out).
  // We overlay an absolute-positioned tab bar that fades in once scrolled past.
  const [stickyTop, setStickyTop] = useState<number>(0);
  const stickyBarStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [stickyTop - 8, stickyTop + 8],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }));

  const handleSelectCategory = useCallback(
    (catId: string) => {
      setActiveCategoryId(catId);
      const y = sectionOffsets.current[catId];
      if (y != null && scrollRef.current) {
        scrollRef.current.scrollTo({
          y: Math.max(0, y - stickyOffsetRef.current - 8),
          animated: true,
        });
      }
    },
    []
  );

  const categoryMeta = visibleCategories.map((c) => ({
    id: c.id,
    name: c.name,
    count: c.items.length,
  }));

  const tabBarHeight = 46;
  // Position where sticky tab bar locks: just below the safe-area header.
  const stickyLockY = insets.top + 44;
  stickyOffsetRef.current = stickyLockY + tabBarHeight;

  return (
    <View className="flex-1 bg-white">
      {/* --- Animated top header --- */}
      <Animated.View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 30,
          paddingTop: insets.top + 4,
          paddingHorizontal: 12,
          paddingBottom: 10,
        }}
      >
        {/* white background fades in on scroll */}
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "#FFFFFF",
              borderBottomWidth: 1,
              borderBottomColor: "#E5E5E5",
            },
            headerBgStyle,
          ]}
        />

        <View className="flex-row items-center">
          {/* Back button — has both an "over hero" white-bubble state and a "ghost" state */}
          <PressableScale
            onPress={() => router.back()}
            scaleTo={0.88}
            haptic="light"
          >
            <View className="w-10 h-10 items-center justify-center">
              <Animated.View
                style={[
                  {
                    position: "absolute",
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: "rgba(255,255,255,0.95)",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.18,
                    shadowRadius: 6,
                    elevation: 4,
                  },
                  backIconWhiteStyle,
                ]}
              />
              <Animated.View style={backIconWhiteStyle}>
                <Ionicons name="arrow-back" size={20} color="#0A0A0A" />
              </Animated.View>
              <Animated.View
                style={[{ position: "absolute" }, backIconColorStyle]}
              >
                <Ionicons name="arrow-back" size={22} color="#0A0A0A" />
              </Animated.View>
            </View>
          </PressableScale>

          <Animated.View
            style={[{ flex: 1, marginLeft: 6 }, headerTitleStyle]}
            pointerEvents="none"
          >
            <Text className="text-ink-900 font-bold text-base" numberOfLines={1}>
              {restaurant.name}
            </Text>
            <Text className="text-ink-500 text-2xs" numberOfLines={1}>
              {restaurant.cuisines.slice(0, 3).join(" · ")}
            </Text>
          </Animated.View>
        </View>
      </Animated.View>

      {/* --- Floating action buttons over hero --- */}
      <View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          top: insets.top + 10,
          right: 14,
          zIndex: 25,
          flexDirection: "row",
          gap: 10,
        }}
      >
        <PressableScale
          onPress={() => {
            haptics.success();
            setFavourited((v) => !v);
          }}
          scaleTo={0.85}
          haptic="none"
          className="w-9 h-9 rounded-full items-center justify-center"
          style={{
            backgroundColor: "rgba(255,255,255,0.95)",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.18,
            shadowRadius: 6,
            elevation: 4,
          }}
        >
          <Ionicons
            name={favourited ? "heart" : "heart-outline"}
            size={18}
            color={favourited ? "#FC5F30" : "#0A0A0A"}
          />
        </PressableScale>
        <PressableScale
          onPress={() => haptics.light()}
          scaleTo={0.85}
          haptic="none"
          className="w-9 h-9 rounded-full items-center justify-center"
          style={{
            backgroundColor: "rgba(255,255,255,0.95)",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.18,
            shadowRadius: 6,
            elevation: 4,
          }}
        >
          <Ionicons name="share-social-outline" size={18} color="#0A0A0A" />
        </PressableScale>
      </View>

      {/* --- Scrollable content --- */}
      <AnimatedScrollView
        ref={scrollRef as any}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 160 }}
      >
        {/* Parallax hero */}
        <View
          style={{
            height: HERO_HEIGHT,
            overflow: "hidden",
            backgroundColor: "#1F1408",
          }}
        >
          <Animated.View style={[{ flex: 1 }, heroStyle]}>
            <FadeInImage
              uri={restaurant.imageUrl}
              style={{ width: "100%", height: HERO_HEIGHT }}
            />
          </Animated.View>
          {/* Bottom legibility gradient */}
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 90,
              backgroundColor: "rgba(10,10,10,0.35)",
            }}
          />
        </View>

        {/* Restaurant info card — overlaps hero with curved top edge */}
        <View
          style={{ marginTop: -INFO_OVERLAP }}
          className="bg-white px-5 pt-5 pb-4 rounded-t-3xl"
        >
          <Text className="text-ink-900 text-xl font-extrabold" numberOfLines={2}>
            {restaurant.name}
          </Text>
          <Text className="text-ink-500 text-sm mt-1" numberOfLines={1}>
            {restaurant.cuisines.join(", ")}
          </Text>
          <Text className="text-ink-500 text-2xs mt-0.5">
            {restaurant.area} · {formatDistance(restaurant.distanceMeters)}
          </Text>

          {/* Stat pills row */}
          <View
            className="flex-row items-center mt-4 px-4 py-3 rounded-2xl bg-surface-sunken"
            style={{ gap: 12 }}
          >
            <RatingPill
              rating={restaurant.rating}
              totalRatings={restaurant.totalRatings}
              size="md"
              showCount
            />
            <View className="w-1 h-1 bg-ink-300 rounded-full" />
            <View>
              <Text className="text-ink-900 text-sm font-bold">
                {formatEta(restaurant.deliveryMinutes)}
              </Text>
              <Text className="text-ink-400 text-2xs">delivery</Text>
            </View>
            <View className="w-1 h-1 bg-ink-300 rounded-full" />
            <View>
              <Text className="text-ink-900 text-sm font-bold">
                {formatCostForTwo(restaurant.costForTwoPaise)}
              </Text>
              <Text className="text-ink-400 text-2xs">approx</Text>
            </View>
          </View>

          {/* Offers — dashed brand container */}
          {restaurant.offers && restaurant.offers.length > 0 ? (
            <View
              className="mt-4 rounded-2xl bg-brand-50 px-3 py-3 border border-dashed"
              style={{ borderColor: "#FFC2A8" }}
            >
              {restaurant.offers.map((offer, i) => (
                <View
                  key={i}
                  className={`flex-row items-center ${
                    i > 0 ? "mt-2 pt-2 border-t border-dashed border-brand-200" : ""
                  }`}
                >
                  <Ionicons name="pricetag" size={14} color="#C23B14" />
                  <Text className="text-brand-700 text-xs font-semibold ml-2 flex-1">
                    {offer}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        {/* Veg toggle */}
        <View
          onLayout={(e: LayoutChangeEvent) => {
            // Position where sticky tab bar should appear
            const y = e.nativeEvent.layout.y + e.nativeEvent.layout.height;
            setStickyTop(y - stickyLockY);
          }}
        >
          <VegToggle value={vegOnly} onChange={setVegOnly} />
        </View>

        {/* In-flow category tab bar */}
        <View style={{ height: tabBarHeight }}>
          <CategoryTabBar
            categories={categoryMeta}
            activeId={activeCategoryId}
            onSelect={handleSelectCategory}
          />
        </View>

        {/* Menu sections */}
        <View className="bg-surface-sunken pt-2">
          {visibleCategories.map((cat, ci) => (
            <View
              key={cat.id}
              onLayout={(e: LayoutChangeEvent) => {
                sectionOffsets.current[cat.id] = e.nativeEvent.layout.y;
              }}
              className="bg-white mb-2"
            >
              <View className="px-4 pt-5 pb-2 flex-row items-end justify-between">
                <Text className="text-ink-900 text-lg font-extrabold">
                  {cat.name}
                </Text>
                <Text className="text-ink-400 text-2xs font-semibold tracking-widest uppercase">
                  {cat.items.length} {cat.items.length === 1 ? "Item" : "Items"}
                </Text>
              </View>
              <View className="h-px bg-ink-100 mx-4" />
              <View className="px-4">
                {cat.items.map((item, i) => (
                  <AnimatedListItem
                    key={item.id}
                    index={i}
                    from="bottom"
                    delay={Math.min(i, 4) * 40 + ci * 20}
                  >
                    <MenuItemRow item={item} restaurantId={restaurant.id} />
                  </AnimatedListItem>
                ))}
              </View>
            </View>
          ))}

          {/* Footer */}
          <View className="py-8 px-4 items-center bg-surface-sunken">
            <Text className="text-ink-400 text-2xs text-center">
              Please note: Prices include applicable taxes
            </Text>
            <View
              className="mt-3 px-3 py-1 rounded-full"
              style={{ backgroundColor: "#F0EFEC" }}
            >
              <Text className="text-ink-300 text-2xs">
                License No. 12345678901234 (FSSAI)
              </Text>
            </View>
          </View>
        </View>
      </AnimatedScrollView>

      {/* --- Sticky category tab bar (overlay) --- */}
      <Animated.View
        pointerEvents="box-none"
        style={[
          {
            position: "absolute",
            top: stickyLockY,
            left: 0,
            right: 0,
            zIndex: 22,
          },
          stickyBarStyle,
        ]}
      >
        <CategoryTabBar
          categories={categoryMeta}
          activeId={activeCategoryId}
          onSelect={handleSelectCategory}
        />
      </Animated.View>

      <FloatingCartBar />
    </View>
  );
}
