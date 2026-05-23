import React, { useEffect, useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  AddressCard,
  AnimatedListItem,
  Button,
  EmptyState,
  Header,
} from "../../components";
import { PressableScale } from "../../components/ui/PressableScale";
import { Skeleton } from "../../components/ui/Skeleton";
import { addresses as mockAddresses, type Address } from "../../lib/mock/addresses";
import { haptics } from "../../lib/haptics";
import { shadows } from "../../lib/theme";

export default function AddressesScreen() {
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // simulate fetch
  useEffect(() => {
    const t = setTimeout(() => {
      setAddresses(mockAddresses);
      setSelectedId(mockAddresses.find((a) => a.isDefault)?.id ?? null);
      setLoading(false);
    }, 700);
    return () => clearTimeout(t);
  }, []);

  const filtered = addresses.filter((a) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      a.area.toLowerCase().includes(q) ||
      a.line1.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q) ||
      a.pincode.includes(q) ||
      (a.landmark?.toLowerCase().includes(q) ?? false)
    );
  });

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-surface-sunken">
      <Header title="Saved Addresses" />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Search */}
        <View className="px-4 pt-4">
          <View
            className="flex-row items-center bg-white border border-ink-100 rounded-2xl px-4 py-3"
            style={shadows.pill}
          >
            <Ionicons name="search" size={18} color="#737373" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search for area, street name..."
              placeholderTextColor="#A3A3A3"
              className="flex-1 ml-2 text-ink-900 text-sm"
              returnKeyType="search"
            />
            {query ? (
              <PressableScale
                onPress={() => setQuery("")}
                scaleTo={0.85}
                haptic="light"
                className="p-1"
              >
                <Ionicons name="close-circle" size={18} color="#A3A3A3" />
              </PressableScale>
            ) : null}
          </View>
        </View>

        {/* Use current location */}
        <View className="px-4 mt-3">
          <PressableScale
            onPress={() => haptics.medium()}
            scaleTo={0.98}
            haptic="none"
            className="flex-row items-center bg-white border border-brand-200 rounded-2xl px-4 py-3"
            style={shadows.pill}
          >
            <View className="w-9 h-9 rounded-full bg-brand-50 items-center justify-center">
              <Ionicons name="locate" size={18} color="#FC5F30" />
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-brand text-sm font-bold">
                Use current location
              </Text>
              <Text className="text-ink-500 text-2xs mt-0.5">
                Using GPS for the most accurate delivery
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#FC5F30" />
          </PressableScale>
        </View>

        {/* Add new */}
        <View className="px-4 mt-3">
          <Button
            label="Add a new address"
            icon="add"
            size="md"
            fullWidth
            haptic="medium"
            onPress={() => haptics.medium()}
          />
        </View>

        {/* Saved label */}
        <View className="px-4 mt-6 mb-3 flex-row items-center justify-between">
          <Text className="text-ink-500 text-2xs font-bold tracking-widest uppercase">
            Saved Addresses
          </Text>
          {!loading && filtered.length > 0 ? (
            <Text className="text-ink-400 text-2xs">
              {filtered.length} {filtered.length === 1 ? "location" : "locations"}
            </Text>
          ) : null}
        </View>

        {/* List */}
        {loading ? (
          <View className="px-4 gap-3">
            {[0, 1].map((i) => (
              <View
                key={i}
                className="bg-white rounded-2xl p-4 border border-ink-100"
              >
                <View className="flex-row items-start">
                  <Skeleton width={40} height={40} borderRadius={20} />
                  <View className="flex-1 ml-3">
                    <Skeleton width="40%" height={14} />
                    <View style={{ height: 8 }} />
                    <Skeleton width="90%" height={12} />
                    <View style={{ height: 6 }} />
                    <Skeleton width="60%" height={12} />
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="location-outline"
            title={query ? "No matches found" : "No saved addresses"}
            description={
              query
                ? `We couldn't find anything for "${query}". Try a different search.`
                : "Add your home, work and favourite spots for faster checkout."
            }
            ctaLabel={query ? undefined : "Add an address"}
            onCtaPress={query ? undefined : () => haptics.medium()}
          />
        ) : (
          <View className="px-4 gap-3">
            {filtered.map((address, i) => (
              <AnimatedListItem key={address.id} index={i} from="bottom">
                <AddressCard
                  address={address}
                  selected={selectedId === address.id}
                  onPress={() => {
                    haptics.selection();
                    setSelectedId(address.id);
                  }}
                  onEdit={() => haptics.light()}
                />
              </AnimatedListItem>
            ))}
          </View>
        )}

        {/* Trust footer */}
        {!loading && filtered.length > 0 ? (
          <View className="mt-7 px-6 items-center">
            <View className="flex-row items-center">
              <Ionicons name="information-circle-outline" size={14} color="#737373" />
              <Text className="text-ink-500 text-2xs ml-1.5">
                Long-press a card to edit or delete (coming soon)
              </Text>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
