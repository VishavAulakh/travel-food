import React, { useMemo, useState, useCallback } from "react";
import {
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

import {
  AnimatedListItem,
  EmptyState,
  Header,
  OrderCard,
  PressableScale,
  SectionHeader,
} from "../../components";
import { activeOrders, pastOrders, type Order } from "../../lib/mock/orders";
import { spring } from "../../lib/animations";
import { haptics } from "../../lib/haptics";

type TabKey = "active" | "past" | "cancelled";

const TAB_DEFS: { key: TabKey; label: string }[] = [
  { key: "active", label: "Active" },
  { key: "past", label: "Past" },
  { key: "cancelled", label: "Cancelled" },
];

// Width of each segment in the segmented control — used for the sliding indicator.
const SEGMENT_GAP = 4;

function groupPastOrders(items: Order[]): { title: string; data: Order[] }[] {
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  const buckets: Record<string, Order[]> = {
    Today: [],
    Yesterday: [],
    "Last week": [],
    Earlier: [],
  };

  items
    .slice()
    .sort(
      (a, b) =>
        new Date(b.deliveredAt ?? b.placedAt).getTime() -
        new Date(a.deliveredAt ?? a.placedAt).getTime()
    )
    .forEach((o) => {
      const ref = new Date(o.deliveredAt ?? o.placedAt).getTime();
      const diff = now - ref;
      if (diff < day) buckets.Today.push(o);
      else if (diff < 2 * day) buckets.Yesterday.push(o);
      else if (diff < 7 * day) buckets["Last week"].push(o);
      else buckets.Earlier.push(o);
    });

  return Object.entries(buckets)
    .filter(([, arr]) => arr.length > 0)
    .map(([title, data]) => ({ title, data }));
}

export default function OrdersScreen() {
  const [tab, setTab] = useState<TabKey>("active");
  const [refreshing, setRefreshing] = useState(false);
  const [segWidth, setSegWidth] = useState(0);

  const active = useMemo(() => activeOrders(), [refreshing]);
  const past = useMemo(
    () => pastOrders().filter((o) => o.status === "delivered"),
    [refreshing]
  );
  const cancelled = useMemo(
    () => pastOrders().filter((o) => o.status === "cancelled"),
    [refreshing]
  );

  const counts: Record<TabKey, number> = {
    active: active.length,
    past: past.length,
    cancelled: cancelled.length,
  };

  // Sliding pill indicator
  const indicatorX = useSharedValue(0);
  const segmentWidth =
    segWidth > 0 ? (segWidth - SEGMENT_GAP * 2) / TAB_DEFS.length : 0;

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  const onSelectTab = useCallback(
    (next: TabKey, index: number) => {
      if (next === tab) return;
      haptics.selection();
      setTab(next);
      indicatorX.value = withSpring(index * segmentWidth, spring.soft);
    },
    [tab, segmentWidth, indicatorX]
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    haptics.light();
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  const onReorder = useCallback((order: Order) => {
    haptics.medium();
    // In a real app: rehydrate cart with items from the order.
    router.push("/(tabs)/cart");
  }, []);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-surface-sunken">
      <Header
        title="Your Orders"
        showBack={false}
        rightSlot={
          <PressableScale
            haptic="light"
            scaleTo={0.9}
            onPress={() => router.push("/search")}
            className="w-11 h-11 items-center justify-center rounded-full"
          >
            <Ionicons name="search" size={22} color="#0A0A0A" />
          </PressableScale>
        }
      />

      {/* Segmented control */}
      <View className="px-4 pt-3 pb-2">
        <View
          className="bg-ink-50 rounded-full flex-row relative"
          style={{ padding: SEGMENT_GAP }}
          onLayout={(e) => setSegWidth(e.nativeEvent.layout.width)}
        >
          {segmentWidth > 0 ? (
            <Animated.View
              pointerEvents="none"
              style={[
                {
                  position: "absolute",
                  top: SEGMENT_GAP,
                  bottom: SEGMENT_GAP,
                  left: SEGMENT_GAP,
                  width: segmentWidth,
                  borderRadius: 9999,
                  backgroundColor: "#FC5F30",
                  shadowColor: "#FC5F30",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.25,
                  shadowRadius: 10,
                  elevation: 4,
                },
                indicatorStyle,
              ]}
            />
          ) : null}

          {TAB_DEFS.map((def, i) => {
            const isActive = def.key === tab;
            return (
              <PressableScale
                key={def.key}
                onPress={() => onSelectTab(def.key, i)}
                haptic="none"
                scaleTo={0.97}
                className="flex-1 items-center justify-center py-2.5 rounded-full"
              >
                <Text
                  className={`text-sm font-semibold ${
                    isActive ? "text-white" : "text-ink-600"
                  }`}
                >
                  {def.label}
                  <Text
                    className={`text-2xs font-bold ${
                      isActive ? "text-white/80" : "text-ink-400"
                    }`}
                  >
                    {"  "}
                    {counts[def.key]}
                  </Text>
                </Text>
              </PressableScale>
            );
          })}
        </View>
      </View>

      {tab === "active" ? (
        <ActiveTab
          orders={active}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      ) : tab === "past" ? (
        <PastTab
          orders={past}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onReorder={onReorder}
        />
      ) : (
        <CancelledTab
          orders={cancelled}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}
    </SafeAreaView>
  );
}

// ---- Tab bodies ----

function ActiveTab({
  orders,
  refreshing,
  onRefresh,
}: {
  orders: Order[];
  refreshing: boolean;
  onRefresh: () => void;
}) {
  if (orders.length === 0) {
    return (
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FC5F30"
            colors={["#FC5F30"]}
          />
        }
      >
        <EmptyState
          icon="bicycle-outline"
          title="No active orders"
          description="When you place an order, you'll be able to track it live from here."
          ctaLabel="Order something delicious"
          onCtaPress={() => router.push("/(tabs)")}
        />
      </ScrollView>
    );
  }

  return (
    <FlatList
      data={orders}
      keyExtractor={(o) => o.id}
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#FC5F30"
          colors={["#FC5F30"]}
        />
      }
      ListHeaderComponent={
        <View className="mb-3 flex-row items-center">
          <View className="w-2 h-2 rounded-full bg-success mr-2" />
          <Text className="text-ink-700 text-xs font-semibold uppercase tracking-widest">
            Live · {orders.length} in progress
          </Text>
        </View>
      }
      renderItem={({ item, index }) => (
        <AnimatedListItem index={index}>
          <OrderCard order={item} />
        </AnimatedListItem>
      )}
    />
  );
}

function PastTab({
  orders,
  refreshing,
  onRefresh,
  onReorder,
}: {
  orders: Order[];
  refreshing: boolean;
  onRefresh: () => void;
  onReorder: (o: Order) => void;
}) {
  const groups = useMemo(() => groupPastOrders(orders), [orders]);

  if (orders.length === 0) {
    return (
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FC5F30"
            colors={["#FC5F30"]}
          />
        }
      >
        <EmptyState
          icon="receipt-outline"
          title="No past orders yet"
          description="Your order history will show up here once you've enjoyed your first delivery."
          ctaLabel="Browse restaurants"
          onCtaPress={() => router.push("/(tabs)")}
        />
      </ScrollView>
    );
  }

  // Flatten into rows so a single FlatList can stagger correctly
  type Row =
    | { kind: "section"; title: string }
    | { kind: "order"; order: Order };
  const rows: Row[] = [];
  groups.forEach((g) => {
    rows.push({ kind: "section", title: g.title });
    g.data.forEach((o) => rows.push({ kind: "order", order: o }));
  });

  return (
    <FlatList
      data={rows}
      keyExtractor={(r, i) =>
        r.kind === "section" ? `s-${r.title}` : `o-${r.order.id}-${i}`
      }
      contentContainerStyle={{ paddingTop: 12, paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#FC5F30"
          colors={["#FC5F30"]}
        />
      }
      renderItem={({ item, index }) =>
        item.kind === "section" ? (
          <View className="mt-4 mb-1">
            <SectionHeader title={item.title} uppercase />
          </View>
        ) : (
          <AnimatedListItem index={index} delay={Math.min(index, 6) * 50}>
            <View className="px-4">
              <OrderCardWithReorder
                order={item.order}
                onReorder={onReorder}
              />
            </View>
          </AnimatedListItem>
        )
      }
    />
  );
}

function CancelledTab({
  orders,
  refreshing,
  onRefresh,
}: {
  orders: Order[];
  refreshing: boolean;
  onRefresh: () => void;
}) {
  if (orders.length === 0) {
    return (
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FC5F30"
            colors={["#FC5F30"]}
          />
        }
      >
        <EmptyState
          icon="checkmark-circle-outline"
          title="Nothing cancelled"
          description="Good news — none of your recent orders were cancelled."
        />
      </ScrollView>
    );
  }

  return (
    <FlatList
      data={orders}
      keyExtractor={(o) => o.id}
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#FC5F30"
          colors={["#FC5F30"]}
        />
      }
      renderItem={({ item, index }) => (
        <AnimatedListItem index={index}>
          <OrderCard order={item} />
        </AnimatedListItem>
      )}
    />
  );
}

// Lightweight wrapper that re-uses OrderCard but adds an actionable Reorder hook.
// OrderCard already shows a "Reorder" button for past orders, but its onPress is a no-op —
// we wrap and overlay an invisible touch target on top of the button area. To keep things
// simple and predictable, we render OrderCard inside a PressableScale that triggers
// reorder on long-press, while taps still navigate via OrderCard's own onPress.
//
// Simpler & cleaner approach: just render OrderCard. The Reorder button inside is a
// no-op in the primitive, but tapping the card navigates to the order detail where a
// reorder bottom-bar lives. We add a discreet "Order again" pill below for fast access.
function OrderCardWithReorder({
  order,
  onReorder,
}: {
  order: Order;
  onReorder: (o: Order) => void;
}) {
  return (
    <View>
      <OrderCard order={order} />
      <View className="-mt-1 mb-3 flex-row justify-end pr-1">
        <PressableScale
          onPress={() => onReorder(order)}
          haptic="medium"
          scaleTo={0.96}
          className="flex-row items-center bg-brand-50 px-3 py-1.5 rounded-full border border-brand-100"
        >
          <Ionicons name="repeat" size={12} color="#C23B14" />
          <Text className="text-brand-700 text-2xs font-bold ml-1.5 uppercase tracking-wide">
            Order again
          </Text>
        </PressableScale>
      </View>
    </View>
  );
}
