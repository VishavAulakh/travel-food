import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  AnimatedListItem,
  Header,
  PaymentMethodRow,
} from "../../components";
import { PressableScale } from "../../components/ui/PressableScale";
import { Skeleton } from "../../components/ui/Skeleton";
import {
  paymentMethods as mockPayments,
  type PaymentMethod,
} from "../../lib/mock/payments";
import { haptics } from "../../lib/haptics";
import { shadows } from "../../lib/theme";

type SectionKey = "upi" | "card" | "wallet" | "cod" | "netbanking";

const SECTIONS: {
  key: SectionKey;
  title: string;
  subtitle: string;
  addLabel: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
}[] = [
  {
    key: "upi",
    title: "Pay by UPI",
    subtitle: "Instant, secure & free",
    addLabel: "Add new UPI ID",
    icon: "qr-code-outline",
  },
  {
    key: "card",
    title: "Credit & Debit cards",
    subtitle: "Saved cards are encrypted with PCI-DSS",
    addLabel: "Add new card",
    icon: "card-outline",
  },
  {
    key: "wallet",
    title: "Wallets",
    subtitle: "GoLocal Money, Paytm, MobiKwik",
    addLabel: "Link a wallet",
    icon: "wallet-outline",
  },
  {
    key: "cod",
    title: "Pay on delivery",
    subtitle: "Cash or UPI when your order arrives",
    addLabel: "",
    icon: "cash-outline",
  },
];

export default function PaymentsScreen() {
  const [loading, setLoading] = useState(true);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setMethods(mockPayments);
      setSelectedId(mockPayments.find((m) => m.isDefault)?.id ?? null);
      setLoading(false);
    }, 700);
    return () => clearTimeout(t);
  }, []);

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-surface-sunken">
      <Header title="Payment Methods" />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View className="px-4 pt-4">
          <View
            className="bg-white border border-ink-100 rounded-2xl p-4 flex-row items-center"
            style={shadows.card}
          >
            <View className="w-11 h-11 rounded-2xl bg-brand-50 items-center justify-center">
              <Ionicons name="shield-checkmark" size={22} color="#FC5F30" />
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-ink-900 text-sm font-bold">
                Saved for faster checkout
              </Text>
              <Text className="text-ink-500 text-2xs mt-0.5">
                Tap a method to set it as your default
              </Text>
            </View>
          </View>
        </View>

        {/* Sections */}
        {loading
          ? [0, 1, 2, 3].map((i) => (
              <View key={i} className="mt-6 px-4">
                <Skeleton width={120} height={14} />
                <View
                  className="mt-3 bg-white rounded-2xl px-4 py-3 border border-ink-100"
                >
                  {[0, 1].map((j) => (
                    <View key={j} className="flex-row items-center py-2.5">
                      <Skeleton width={40} height={40} borderRadius={12} />
                      <View className="flex-1 ml-3">
                        <Skeleton width="60%" height={14} />
                        <View style={{ height: 6 }} />
                        <Skeleton width="40%" height={12} />
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ))
          : SECTIONS.map((section, sIdx) => {
              const rows = methods.filter((m) => m.type === section.key);
              if (rows.length === 0 && !section.addLabel) return null;
              return (
                <AnimatedListItem key={section.key} index={sIdx} from="bottom">
                  <View className="mt-6">
                    <SectionHeading
                      icon={section.icon}
                      title={section.title}
                      subtitle={section.subtitle}
                    />
                    <View className="mx-4">
                      <View
                        className="bg-white rounded-2xl px-3 border border-ink-100"
                        style={shadows.card}
                      >
                        {rows.map((m, i) => (
                          <PaymentMethodRow
                            key={m.id}
                            method={m}
                            selected={selectedId === m.id}
                            onPress={() => {
                              haptics.selection();
                              setSelectedId(m.id);
                            }}
                            showDivider={
                              i < rows.length - 1 || !!section.addLabel
                            }
                          />
                        ))}
                        {section.addLabel ? (
                          <AddNewRow
                            label={section.addLabel}
                            onPress={() => haptics.medium()}
                          />
                        ) : null}
                      </View>
                    </View>
                  </View>
                </AnimatedListItem>
              );
            })}

        {/* Trust footer */}
        <View className="mt-8 px-6 items-center">
          <View
            className="flex-row items-center bg-white border border-ink-100 rounded-full px-3.5 py-2"
            style={shadows.pill}
          >
            <Ionicons name="lock-closed" size={12} color="#16A34A" />
            <Text className="text-ink-500 text-2xs ml-1.5 font-medium">
              All payments are 100% secure and encrypted
            </Text>
          </View>
          <Text className="text-ink-300 text-2xs mt-3">
            Powered by Razorpay • RBI compliant
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeading({
  icon,
  title,
  subtitle,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  subtitle: string;
}) {
  return (
    <View className="px-4 mb-2">
      <View className="flex-row items-center">
        <View className="w-7 h-7 rounded-lg bg-brand-50 items-center justify-center">
          <Ionicons name={icon} size={14} color="#FC5F30" />
        </View>
        <Text className="text-ink-900 text-sm font-bold ml-2">{title}</Text>
      </View>
      <Text className="text-ink-500 text-2xs mt-1 ml-9">{subtitle}</Text>
    </View>
  );
}

function AddNewRow({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.99}
      haptic="light"
      className="flex-row items-center py-3.5 px-1"
    >
      <View className="w-10 h-10 rounded-xl border border-dashed border-brand-200 items-center justify-center bg-brand-50">
        <Ionicons name="add" size={20} color="#FC5F30" />
      </View>
      <View className="flex-1 ml-3">
        <Text className="text-brand text-sm font-bold">{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#FC5F30" />
    </PressableScale>
  );
}
