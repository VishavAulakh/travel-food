import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MotiView, AnimatePresence } from "moti";

import {
  PressableScale,
  Chip,
  SectionHeader,
  AnimatedListItem,
  RestaurantCard,
  CuisineTile,
  EmptyState,
  SearchBar,
} from "../components";
import { restaurants, type Restaurant } from "../lib/mock/restaurants";
import { cuisines } from "../lib/mock/cuisines";
import { haptics } from "../lib/haptics";

const RECENT_SEARCHES = ["Biryani", "Pizza", "Burger", "South Indian"];

function filterRestaurants(query: string): Restaurant[] {
  const q = query.toLowerCase().trim();
  if (q.length < 2) return [];
  return restaurants.filter(
    (r) =>
      r.name.toLowerCase().includes(q) ||
      r.cuisines.some((c) => c.toLowerCase().includes(q)) ||
      r.area.toLowerCase().includes(q)
  );
}

function matchingCuisines(query: string): string[] {
  const q = query.toLowerCase().trim();
  if (q.length < 2) return [];
  const matched = new Set<string>();
  restaurants.forEach((r) =>
    r.cuisines.forEach((c) => {
      if (c.toLowerCase().includes(q)) matched.add(c);
    })
  );
  return Array.from(matched).slice(0, 5);
}

export default function SearchScreen() {
  const params = useLocalSearchParams<{ cuisine?: string; q?: string }>();
  const [query, setQuery] = useState(params.q ?? (params.cuisine ? "" : ""));
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [recentSearches, setRecentSearches] = useState<string[]>(RECENT_SEARCHES);
  const inputRef = useRef<TextInput>(null);

  // Seed from cuisine param
  useEffect(() => {
    if (params.cuisine) {
      const c = cuisines.find((c) => c.id === params.cuisine);
      if (c) setQuery(c.name);
    }
  }, [params.cuisine]);

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const results = filterRestaurants(debouncedQuery);
  const cuisineMatches = matchingCuisines(debouncedQuery);
  const hasQuery = debouncedQuery.trim().length >= 2;

  const handleSelectRecent = useCallback((term: string) => {
    setQuery(term);
    haptics.light();
  }, []);

  const handleClearHistory = useCallback(() => {
    setRecentSearches([]);
    haptics.light();
  }, []);

  const handleCuisineChipPress = useCallback((name: string) => {
    setQuery(name);
    haptics.selection();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Search Header */}
      <View className="flex-row items-center px-4 py-2 bg-white border-b border-ink-100 gap-3">
        <PressableScale
          onPress={() => router.back()}
          scaleTo={0.88}
          haptic="light"
          className="w-9 h-9 rounded-full items-center justify-center bg-ink-50"
        >
          <Ionicons name="arrow-back" size={20} color="#0A0A0A" />
        </PressableScale>

        <View className="flex-1">
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Search restaurants, cuisines..."
            autoFocus
            showVoiceIcon={false}
          />
        </View>

        {query.length > 0 ? (
          <PressableScale
            onPress={() => { setQuery(""); haptics.light(); }}
            scaleTo={0.9}
            haptic="none"
          >
            <Text className="text-brand text-sm font-semibold">Clear</Text>
          </PressableScale>
        ) : (
          <PressableScale onPress={() => router.back()} scaleTo={0.9} haptic="none">
            <Text className="text-ink-600 text-sm font-medium">Cancel</Text>
          </PressableScale>
        )}
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <AnimatePresence exitBeforeEnter>
          {!hasQuery ? (
            /* ─── IDLE: Recent + Popular cuisines ─── */
            <MotiView
              key="idle"
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "timing", duration: 200 }}
            >
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <View className="mt-5">
                  <View className="flex-row items-center justify-between px-4 mb-3">
                    <Text className="text-ink-900 font-bold text-base">Recent searches</Text>
                    <PressableScale onPress={handleClearHistory} scaleTo={0.94} haptic="light">
                      <Text className="text-brand text-xs font-semibold">Clear all</Text>
                    </PressableScale>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
                  >
                    {recentSearches.map((term) => (
                      <View key={term} className="flex-row items-center">
                        <Chip
                          label={term}
                          icon="time-outline"
                          variant="filter"
                          onPress={() => handleSelectRecent(term)}
                        />
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Popular Cuisines */}
              <View className="mt-6">
                <SectionHeader title="Popular cuisines" />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8 }}
                >
                  {cuisines.map((c) => (
                    <CuisineTile key={c.id} cuisine={c} />
                  ))}
                </ScrollView>
              </View>

              {/* All Restaurants teaser */}
              <View className="mt-6">
                <SectionHeader title="All restaurants" subtitle={`${restaurants.length} restaurants near you`} />
                <View className="px-4">
                  {restaurants.slice(0, 4).map((r, i) => (
                    <AnimatedListItem key={r.id} index={i}>
                      <RestaurantCard restaurant={r} variant="compact" />
                    </AnimatedListItem>
                  ))}
                </View>
              </View>
            </MotiView>
          ) : results.length === 0 ? (
            /* ─── NO RESULTS ─── */
            <MotiView
              key="empty"
              from={{ opacity: 0, translateY: 12 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: "timing", duration: 260 }}
              className="mt-10"
            >
              <EmptyState
                icon="search-outline"
                title={`No results for "${debouncedQuery}"`}
                description="Try searching for Biryani, Pizza, or your favourite cuisine. We have 15 restaurants!"
                ctaLabel="Try Biryani"
                onCtaPress={() => setQuery("Biryani")}
              />
            </MotiView>
          ) : (
            /* ─── RESULTS ─── */
            <MotiView
              key="results"
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "timing", duration: 220 }}
            >
              {/* Cuisine filter chips */}
              {cuisineMatches.length > 0 && (
                <View className="mt-4 mb-2">
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
                  >
                    {cuisineMatches.map((c) => (
                      <View key={c} className="flex-row items-center">
                        <Chip
                          label={c}
                          variant="tag"
                          onPress={() => handleCuisineChipPress(c)}
                        />
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Results count */}
              <View className="px-4 mt-4 mb-2">
                <Text className="text-ink-500 text-xs">
                  {results.length} restaurant{results.length !== 1 ? "s" : ""} found for "
                  <Text className="text-ink-900 font-semibold">{debouncedQuery}</Text>"
                </Text>
              </View>

              {/* Restaurant list */}
              <View className="px-4">
                {results.map((r, i) => (
                  <AnimatedListItem key={r.id} index={i}>
                    <RestaurantCard restaurant={r} variant="compact" />
                  </AnimatedListItem>
                ))}
              </View>
            </MotiView>
          )}
        </AnimatePresence>
      </ScrollView>
    </SafeAreaView>
  );
}
