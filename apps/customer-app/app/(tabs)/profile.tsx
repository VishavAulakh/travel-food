import React from "react";
import { ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { MotiView } from "moti";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Avatar,
  FloatingCartBar,
  SectionHeader,
  AnimatedListItem,
} from "../../components";
import { PressableScale } from "../../components/ui/PressableScale";
import { useAuthStore } from "../../store/auth";
import { activeOrders, pastOrders } from "../../lib/mock/orders";
import { formatPhone, formatINR } from "../../lib/format";
import { haptics } from "../../lib/haptics";
import { colors, shadows } from "../../lib/theme";

// Try to import LinearGradient — gracefully degrade if it isn't installed.
let LinearGradient: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  LinearGradient = require("expo-linear-gradient").LinearGradient;
} catch {
  LinearGradient = null;
}

type SettingsRow = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  iconColor?: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  badge?: string;
};

export default function ProfileScreen() {
  const customer = useAuthStore((s) => s.customer);
  const logout = useAuthStore((s) => s.logout);

  const totalOrders = activeOrders().length + pastOrders().length;
  const reviewsCount = 8;
  const savedCount = 12;
  const walletBalancePaise = 24500; // ₹245

  const name = customer?.name ?? "Vishav Aulakh";
  const phone = customer?.phone
    ? formatPhone(customer.phone)
    : "+91 98765 43210";

  const handleLogout = () => {
    haptics.warning();
    logout();
    router.replace("/(auth)/login");
  };

  const yourInfoRows: SettingsRow[] = [
    {
      icon: "location-outline",
      iconColor: colors.brand.DEFAULT,
      title: "Addresses",
      subtitle: "Saved delivery locations",
      onPress: () => router.push("/profile/addresses"),
    },
    {
      icon: "card-outline",
      iconColor: "#2563EB",
      title: "Payment Methods",
      subtitle: "UPI, cards, wallets",
      onPress: () => router.push("/profile/payments"),
    },
    {
      icon: "heart-outline",
      iconColor: "#E11D48",
      title: "Favourite Restaurants",
      subtitle: `${savedCount} restaurants saved`,
      onPress: () => haptics.light(),
    },
  ];

  const preferencesRows: SettingsRow[] = [
    {
      icon: "notifications-outline",
      iconColor: "#7C3AED",
      title: "Notifications",
      subtitle: "Manage push & email alerts",
      onPress: () => haptics.light(),
    },
    {
      icon: "language-outline",
      iconColor: "#0EA5E9",
      title: "Language",
      subtitle: "English",
      onPress: () => haptics.light(),
    },
    {
      icon: "leaf-outline",
      iconColor: "#16A34A",
      title: "Dietary preferences",
      subtitle: "Veg / Non-veg / Jain",
      onPress: () => haptics.light(),
    },
  ];

  const helpRows: SettingsRow[] = [
    {
      icon: "help-circle-outline",
      iconColor: "#0EA5E9",
      title: "FAQs",
      onPress: () => haptics.light(),
    },
    {
      icon: "headset-outline",
      iconColor: "#FC5F30",
      title: "Contact us",
      subtitle: "We're online 24/7",
      onPress: () => haptics.light(),
    },
    {
      icon: "shield-checkmark-outline",
      iconColor: "#16A34A",
      title: "Report a safety issue",
      onPress: () => haptics.light(),
    },
  ];

  const legalRows: SettingsRow[] = [
    {
      icon: "document-text-outline",
      iconColor: "#525252",
      title: "Terms of Service",
      onPress: () => haptics.light(),
    },
    {
      icon: "lock-closed-outline",
      iconColor: "#525252",
      title: "Privacy Policy",
      onPress: () => haptics.light(),
    },
  ];

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-surface-sunken">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO */}
        <ProfileHero name={name} phone={phone} />

        {/* STATS */}
        <AnimatedListItem index={0} from="bottom">
          <View className="flex-row px-4 mt-4 gap-3">
            <StatCard
              icon="receipt"
              tint="#FC5F30"
              value={totalOrders}
              label="Orders"
            />
            <StatCard
              icon="star"
              tint="#F59E0B"
              value={reviewsCount}
              label="Reviews"
            />
            <StatCard
              icon="heart"
              tint="#E11D48"
              value={savedCount}
              label="Saved"
            />
          </View>
        </AnimatedListItem>

        {/* WALLET / GoLocal Money */}
        <AnimatedListItem index={1} from="bottom">
          <View className="px-4 mt-5">
            <WalletBanner balancePaise={walletBalancePaise} />
          </View>
        </AnimatedListItem>

        {/* SETTINGS — Your Information */}
        <AnimatedListItem index={2} from="bottom">
          <View className="mt-7">
            <SectionHeader title="Your information" uppercase />
            <SettingsGroup rows={yourInfoRows} />
          </View>
        </AnimatedListItem>

        {/* Preferences */}
        <AnimatedListItem index={3} from="bottom">
          <View className="mt-6">
            <SectionHeader title="Preferences" uppercase />
            <SettingsGroup rows={preferencesRows} />
          </View>
        </AnimatedListItem>

        {/* Help */}
        <AnimatedListItem index={4} from="bottom">
          <View className="mt-6">
            <SectionHeader title="Help & support" uppercase />
            <SettingsGroup rows={helpRows} />
          </View>
        </AnimatedListItem>

        {/* Legal */}
        <AnimatedListItem index={5} from="bottom">
          <View className="mt-6">
            <SectionHeader title="Legal" uppercase />
            <SettingsGroup rows={legalRows} />
          </View>
        </AnimatedListItem>

        {/* Logout */}
        <AnimatedListItem index={6} from="bottom">
          <View className="px-4 mt-7">
            <PressableScale
              onPress={handleLogout}
              scaleTo={0.98}
              haptic="none"
              className="flex-row items-center justify-center bg-white border border-danger/30 rounded-2xl py-4"
              style={{
                shadowColor: "#DC2626",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 10,
                elevation: 2,
              }}
            >
              <Ionicons name="log-out-outline" size={18} color="#DC2626" />
              <Text className="text-danger text-base font-bold ml-2">
                Log out
              </Text>
            </PressableScale>
          </View>
        </AnimatedListItem>

        {/* Footer */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: "timing", duration: 400, delay: 600 }}
          style={{ alignItems: "center", marginTop: 24 }}
        >
          <Text className="text-ink-300 text-2xs">
            GoLocal v1.0.0 • Made with ❤️ in India
          </Text>
        </MotiView>
      </ScrollView>

      {/* Cart bar (in case user has items) */}
      <FloatingCartBar />
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function ProfileHero({ name, phone }: { name: string; phone: string }) {
  const content = (
    <View className="px-4 pt-4 pb-7">
      <View className="flex-row items-center">
        <View
          style={{
            shadowColor: "#FC5F30",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.25,
            shadowRadius: 16,
            elevation: 8,
            borderRadius: 999,
          }}
        >
          <Avatar
            name={name}
            size={72}
            style={{ borderWidth: 3, borderColor: "#FFFFFF" }}
          />
        </View>
        <View className="flex-1 ml-4">
          <Text className="text-ink-900 text-xl font-extrabold" numberOfLines={1}>
            {name}
          </Text>
          <Text className="text-ink-500 text-sm mt-1" numberOfLines={1}>
            {phone}
          </Text>
          <View className="flex-row items-center mt-2">
            <View className="bg-brand-100 rounded-full px-2 py-0.5 flex-row items-center">
              <Ionicons name="sparkles" size={10} color="#C23B14" />
              <Text className="text-brand-700 text-2xs font-bold ml-1">
                GOLD MEMBER
              </Text>
            </View>
          </View>
        </View>
        <PressableScale
          onPress={() => haptics.light()}
          scaleTo={0.92}
          haptic="none"
          className="bg-white border border-ink-100 rounded-full px-3.5 py-2 flex-row items-center"
          style={shadows.pill}
        >
          <Ionicons name="create-outline" size={14} color="#0A0A0A" />
          <Text className="text-ink-900 text-xs font-bold ml-1">Edit</Text>
        </PressableScale>
      </View>
    </View>
  );

  if (LinearGradient) {
    return (
      <LinearGradient
        colors={["#FFF1E8", "#FFFFFF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ paddingTop: 4 }}
      >
        {content}
      </LinearGradient>
    );
  }
  return <View className="bg-brand-50">{content}</View>;
}

function StatCard({
  icon,
  tint,
  value,
  label,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  tint: string;
  value: number;
  label: string;
}) {
  return (
    <PressableScale
      onPress={() => haptics.light()}
      scaleTo={0.97}
      haptic="none"
      className="flex-1 bg-white rounded-2xl py-4 items-center"
      style={shadows.card}
    >
      <View
        className="w-10 h-10 rounded-full items-center justify-center mb-2"
        style={{ backgroundColor: `${tint}1A` }}
      >
        <Ionicons name={icon} size={18} color={tint} />
      </View>
      <Text className="text-ink-900 text-lg font-extrabold">{value}</Text>
      <Text className="text-ink-500 text-2xs mt-0.5">{label}</Text>
    </PressableScale>
  );
}

function WalletBanner({ balancePaise }: { balancePaise: number }) {
  const inner = (
    <View className="flex-row items-center p-4">
      <View
        className="w-12 h-12 rounded-2xl items-center justify-center"
        style={{ backgroundColor: "rgba(255,255,255,0.18)" }}
      >
        <Ionicons name="wallet" size={22} color="#fff" />
      </View>
      <View className="flex-1 ml-3">
        <Text className="text-white/80 text-2xs font-semibold tracking-widest uppercase">
          GoLocal Money
        </Text>
        <Text className="text-white text-xl font-extrabold mt-0.5">
          {formatINR(balancePaise, { decimals: false })}
        </Text>
      </View>
      <PressableScale
        onPress={() => haptics.medium()}
        scaleTo={0.96}
        haptic="none"
        className="bg-white rounded-full px-4 py-2 flex-row items-center"
      >
        <Ionicons name="add" size={14} color="#FC5F30" />
        <Text className="text-brand text-xs font-bold ml-1">Add money</Text>
      </PressableScale>
    </View>
  );

  if (LinearGradient) {
    return (
      <LinearGradient
        colors={["#FC5F30", "#E84A1B"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 22,
          overflow: "hidden",
          shadowColor: "#FC5F30",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
          elevation: 6,
        }}
      >
        {inner}
      </LinearGradient>
    );
  }
  return (
    <View
      className="bg-brand rounded-3xl overflow-hidden"
      style={{
        shadowColor: "#FC5F30",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 6,
      }}
    >
      {inner}
    </View>
  );
}

function SettingsGroup({ rows }: { rows: SettingsRow[] }) {
  return (
    <View className="mx-4 bg-white rounded-2xl overflow-hidden" style={shadows.card}>
      {rows.map((row, i) => (
        <View key={row.title}>
          <SettingsRowItem row={row} />
          {i < rows.length - 1 ? (
            <View className="h-px bg-ink-100 ml-16" />
          ) : null}
        </View>
      ))}
    </View>
  );
}

function SettingsRowItem({ row }: { row: SettingsRow }) {
  return (
    <PressableScale
      onPress={row.onPress}
      scaleTo={0.99}
      haptic="light"
      className="flex-row items-center px-4 py-3.5"
    >
      <View
        className="w-10 h-10 rounded-xl items-center justify-center"
        style={{ backgroundColor: `${row.iconColor ?? "#737373"}14` }}
      >
        <Ionicons
          name={row.icon}
          size={20}
          color={row.iconColor ?? "#525252"}
        />
      </View>
      <View className="flex-1 ml-3">
        <Text className="text-ink-900 text-sm font-semibold">{row.title}</Text>
        {row.subtitle ? (
          <Text className="text-ink-500 text-2xs mt-0.5">{row.subtitle}</Text>
        ) : null}
      </View>
      {row.badge ? (
        <View className="bg-brand-50 rounded-full px-2 py-0.5 mr-2">
          <Text className="text-brand text-2xs font-bold">{row.badge}</Text>
        </View>
      ) : null}
      <Ionicons name="chevron-forward" size={18} color="#A3A3A3" />
    </PressableScale>
  );
}
