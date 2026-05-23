import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from "react-native-reanimated";

import {
  AnimatedListItem,
  CuisineTile,
  FloatingCartBar,
  RestaurantCard,
  SectionHeader,
  SkeletonRestaurantCard,
} from "../../components";
import { LocationHeader } from "../../components/home/LocationHeader";
import { CyclingSearchBar } from "../../components/home/CyclingSearchBar";
import { QuickFilterChips } from "../../components/home/QuickFilterChips";
import { PromoCarousel } from "../../components/home/PromoCarousel";
import { restaurants as mockRestaurants } from "../../lib/mock/restaurants";
import { cuisines } from "../../lib/mock/cuisines";
import { haptics } from "../../lib/haptics";

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

// Simulated API call. Real impl will swap to BILLING backend later.
const fetchRestaurants = () =>
  new Promise<typeof mockRestaurants>((resolve) =>
    setTimeout(() => resolve(mockRestaurants), 600)
  );

export default function HomeScreen() {
  const scrollY = useSharedValue(0);
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: restaurants = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["home-restaurants"],
    queryFn: fetchRestaurants,
  });

  const topPicks = useMemo(
    () => [...restaurants].sort((a, b) => b.rating - a.rating).slice(0, 6),
    [restaurants]
  );
  const tastyDeals = useMemo(
    () => restaurants.filter((r) => r.isPromoted),
    [restaurants]
  );

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const onRefresh = useCallback(async () => {
    haptics.light();
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  return (
    <View className="flex-1 bg-surface-sunken">
      <SafeAreaView edges={["top"]} className="bg-white" style={{ zIndex: 30 }}>
        <LocationHeader scrollY={scrollY} />
      </SafeAreaView>

      <AnimatedScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        bounces
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FC5F30"
            colors={["#FC5F30"]}
          />
        }
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {/* Search bar */}
        <View className="px-4 pt-3 pb-2 bg-white">
          <CyclingSearchBar onPress={() => router.push("/search")} />
        </View>

        {/* Quick filter chips */}
        <View className="bg-white pt-2 pb-3">
          <QuickFilterChips />
        </View>

        {/* Promo carousel */}
        <View className="bg-surface-tint pt-4 pb-5">
          <PromoCarousel
            onBannerPress={() => {
              haptics.light();
            }}
          />
        </View>

        {/* What's on your mind */}
        <View className="bg-white pt-5 pb-3">
          <SectionHeader title="What's on your mind?" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 6 }}
          >
            {cuisines.map((c) => (
              <CuisineTile key={c.id} cuisine={c} />
            ))}
          </ScrollView>
        </View>

        {/* Top picks */}
        <View className="bg-white pt-6 pb-4">
          <SectionHeader
            title="Top picks for you"
            actionLabel="See all"
            onActionPress={() => router.push("/search")}
          />
          {isLoading ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
            >
              {[0, 1, 2].map((i) => (
                <View key={i} style={{ width: 256 }}>
                  <SkeletonRestaurantCard />
                </View>
              ))}
            </ScrollView>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            >
              {topPicks.map((r, i) => (
                <AnimatedListItem key={r.id} index={i} from="right">
                  <RestaurantCard restaurant={r} variant="horizontal" />
                </AnimatedListItem>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Tasty deals near you */}
        {tastyDeals.length > 0 ? (
          <View className="bg-white pt-2 pb-4">
            <SectionHeader
              title="Tasty deals near you"
              subtitle="Don't miss these limited-time offers"
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            >
              {tastyDeals.map((r, i) => (
                <AnimatedListItem key={r.id} index={i} from="right">
                  <RestaurantCard restaurant={r} variant="horizontal" />
                </AnimatedListItem>
              ))}
            </ScrollView>
          </View>
        ) : null}

        {/* All restaurants */}
        <View className="pt-6 pb-2">
          <SectionHeader
            title="Restaurants to explore"
            subtitle={
              isLoading
                ? "Finding restaurants…"
                : `${restaurants.length} restaurants near you`
            }
          />
          <View className="px-4">
            {isLoading
              ? [0, 1, 2].map((i) => <SkeletonRestaurantCard key={i} />)
              : restaurants.map((r, i) => (
                  <AnimatedListItem key={r.id} index={i} from="bottom">
                    <RestaurantCard restaurant={r} variant="feed" />
                  </AnimatedListItem>
                ))}
          </View>

          {isLoading ? (
            <View className="items-center py-6">
              <ActivityIndicator size="small" color="#FC5F30" />
              <Text className="text-ink-400 text-2xs mt-2 tracking-wider uppercase">
                Curating your feed
              </Text>
            </View>
          ) : (
            <View className="items-center py-8">
              <Text className="text-ink-300 text-2xs tracking-widest uppercase">
                You're all caught up
              </Text>
              <Text className="text-ink-400 text-xs mt-1">
                Pull to refresh for more
              </Text>
            </View>
          )}
        </View>
      </AnimatedScrollView>

      <FloatingCartBar />
    </View>
  );
}
