import React from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useRiderStore } from "../../store/rider";
import { api } from "../../lib/api";
import { formatINR } from "../../lib/format";
import { haptics } from "../../lib/haptics";
import { shadows } from "../../lib/theme";
import { Avatar, Button, Divider, AnimatedListItem, PressableScale } from "../../components";

type ApiProfile = {
  id: string;
  name: string;
  phone: string;
  avatarUrl?: string;
  vehicleType?: string;
  vehicleNumber?: string;
  rating?: number;
  totalRatings?: number;
  totalDeliveries?: number;
  joinedDate?: string;
  isVerified?: boolean;
  bankAccount?: { bankName: string; last4: string };
  documents?: {
    aadhar?: { verified: boolean };
    drivingLicense?: { verified: boolean; number: string };
    vehicleRC?: { verified: boolean; number: string };
  };
  monthPaise?: number;
  totalDeliveriesMonthly?: number;
  avgPerDeliveryPaise?: number;
};

function DocBadge({ verified }: { verified: boolean }) {
  return (
    <View
      className={`px-2.5 py-1 rounded-full flex-row items-center gap-1 ${
        verified ? "bg-success/10" : "bg-warning/10"
      }`}
    >
      <Ionicons
        name={verified ? "checkmark-circle" : "time"}
        size={12}
        color={verified ? "#16A34A" : "#F59E0B"}
      />
      <Text
        className={`text-2xs font-semibold ${
          verified ? "text-success" : "text-warning"
        }`}
      >
        {verified ? "Verified" : "Pending"}
      </Text>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
  valueClassName,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <View className="flex-row items-center py-3">
      <View className="w-8 h-8 rounded-lg bg-surface-sunken items-center justify-center mr-3">
        <Ionicons name={icon} size={16} color="#737373" />
      </View>
      <View className="flex-1">
        <Text className="text-ink-400 text-xs">{label}</Text>
        <Text className={`font-semibold text-sm mt-0.5 ${valueClassName ?? "text-ink-900"}`}>
          {value}
        </Text>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const { logout, token, rider } = useRiderStore();

  const { data: profile } = useQuery<ApiProfile>({
    queryKey: ['rider-profile'],
    queryFn: () => api.get<ApiProfile>('/riders/me/profile', token ?? undefined),
    enabled: !!token,
  });

  const { data: earningsData } = useQuery<{
    monthPaise: number;
    totalDeliveries: number;
    avgPerDeliveryPaise: number;
  }>({
    queryKey: ['earnings'],
    queryFn: () => api.get('/riders/me/earnings', token ?? undefined),
    enabled: !!token,
  });

  const handleLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  // Merge API profile with rider store data as fallback
  const name = profile?.name ?? rider?.name ?? 'Rider';
  const phone = profile?.phone ?? rider?.phone ?? '';
  const avatarUrl = profile?.avatarUrl;
  const vehicleType = profile?.vehicleType ?? 'scooter';
  const vehicleNumber = profile?.vehicleNumber ?? '—';
  const rating = profile?.rating ?? 0;
  const totalRatings = profile?.totalRatings ?? 0;
  const totalDeliveries = profile?.totalDeliveries ?? 0;
  const joinedDate = profile?.joinedDate ?? new Date().toISOString();
  const isVerified = profile?.isVerified ?? false;
  const bankAccount = profile?.bankAccount;
  const documents = profile?.documents;

  const joinedYear = new Date(joinedDate).getFullYear();
  const monthPaise = earningsData?.monthPaise ?? 0;
  const totalDeliveriesCount = earningsData?.totalDeliveries ?? totalDeliveries;
  const avgPerDelivery = earningsData?.avgPerDeliveryPaise ?? Math.round(
    monthPaise / Math.max(totalDeliveriesCount, 1)
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Profile header */}
        <AnimatedListItem index={0}>
          <View className="items-center py-8 px-4">
            <View className="relative mb-4">
              <Avatar
                uri={avatarUrl}
                name={name}
                size={88}
              />
              {isVerified ? (
                <View className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-success border-2 border-white items-center justify-center">
                  <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                </View>
              ) : null}
            </View>
            <Text className="text-ink-900 text-xl font-bold">{name}</Text>
            <Text className="text-ink-400 text-sm mt-0.5">{phone}</Text>
            {isVerified ? (
              <View className="mt-2 bg-success/10 px-3 py-1 rounded-full flex-row gap-1.5 items-center">
                <Ionicons name="shield-checkmark" size={12} color="#16A34A" />
                <Text className="text-success text-xs font-semibold">Verified Rider</Text>
              </View>
            ) : null}
            <Text className="text-ink-300 text-xs mt-2">Member since {joinedYear}</Text>

            {/* Edit profile button */}
            <PressableScale
              onPress={() => haptics.light()}
              className="mt-3 flex-row items-center gap-1 bg-surface-sunken px-4 py-2 rounded-full"
            >
              <Ionicons name="pencil" size={12} color="#737373" />
              <Text className="text-ink-400 text-xs font-medium">Edit Profile</Text>
            </PressableScale>
          </View>
        </AnimatedListItem>

        {/* Rating card */}
        <AnimatedListItem index={1} className="mx-4 mb-4">
          <View className="bg-white rounded-2xl p-4 flex-row justify-around" style={shadows.card}>
            <View className="items-center">
              <Text className="text-ink-900 text-2xl font-bold">
                {rating.toFixed(1)}
              </Text>
              <View className="flex-row gap-0.5 my-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Ionicons
                    key={s}
                    name={s <= Math.round(rating) ? "star" : "star-outline"}
                    size={14}
                    color="#FC5F30"
                  />
                ))}
              </View>
              <Text className="text-ink-400 text-xs">
                {totalRatings} ratings
              </Text>
            </View>
            <View className="w-px bg-ink-100" />
            <View className="items-center">
              <Text className="text-ink-900 text-2xl font-bold">
                {totalDeliveries.toLocaleString("en-IN")}
              </Text>
              <Text className="text-ink-400 text-xs mt-1">Total Deliveries</Text>
            </View>
            <View className="w-px bg-ink-100" />
            <View className="items-center">
              <Text className="text-ink-900 text-2xl font-bold">
                {formatINR(monthPaise)}
              </Text>
              <Text className="text-ink-400 text-xs mt-1">This Month</Text>
            </View>
          </View>
        </AnimatedListItem>

        {/* Performance section */}
        <AnimatedListItem index={2} className="mx-4 mb-4">
          <View className="bg-white rounded-2xl px-4" style={shadows.card}>
            <View className="py-3">
              <Text className="text-ink-900 font-bold text-sm">Performance</Text>
            </View>
            <Divider />
            <InfoRow
              icon="checkmark-circle"
              label="Acceptance Rate"
              value="94%"
              valueClassName="text-success"
            />
            <Divider />
            <InfoRow
              icon="time"
              label="On-Time Rate"
              value="97%"
              valueClassName="text-success"
            />
            <Divider />
            <InfoRow
              icon="calendar"
              label="Active since"
              value={String(joinedYear)}
            />
          </View>
        </AnimatedListItem>

        {/* Earnings summary section */}
        <AnimatedListItem index={3} className="mx-4 mb-4">
          <View className="bg-surface-tint border border-brand/10 rounded-2xl px-4 py-3">
            {/* Title row */}
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-ink-900 font-bold text-sm">Earnings Overview</Text>
              <View className="bg-brand/10 px-2 py-0.5 rounded-full">
                <Text className="text-brand text-xs font-medium">This Month</Text>
              </View>
            </View>
            {/* 3-col stats */}
            <View className="flex-row">
              <View className="flex-1 items-center">
                <Text className="text-ink-900 font-bold text-lg">
                  {totalDeliveriesCount}
                </Text>
                <Text className="text-ink-400 text-2xs text-center mt-0.5">
                  Total{"\n"}deliveries
                </Text>
              </View>
              <View className="w-px bg-brand/10 mx-2" />
              <View className="flex-1 items-center">
                <Text className="text-ink-900 font-bold text-lg">
                  {formatINR(monthPaise)}
                </Text>
                <Text className="text-ink-400 text-2xs text-center mt-0.5">
                  This month{"\n"}earnings
                </Text>
              </View>
              <View className="w-px bg-brand/10 mx-2" />
              <View className="flex-1 items-center">
                <Text className="text-ink-900 font-bold text-lg">
                  {formatINR(avgPerDelivery)}
                </Text>
                <Text className="text-ink-400 text-2xs text-center mt-0.5">
                  Avg per{"\n"}delivery
                </Text>
              </View>
            </View>
          </View>
        </AnimatedListItem>

        {/* Vehicle info */}
        <AnimatedListItem index={4} className="mx-4 mb-4">
          <View className="bg-white rounded-2xl px-4" style={shadows.card}>
            <View className="py-3">
              <Text className="text-ink-900 font-bold text-sm">Vehicle</Text>
            </View>
            <Divider />
            <InfoRow
              icon="bicycle"
              label="Vehicle type"
              value={
                vehicleType.charAt(0).toUpperCase() +
                vehicleType.slice(1)
              }
            />
            <Divider />
            <InfoRow
              icon="card"
              label="Registration number"
              value={vehicleNumber}
            />
          </View>
        </AnimatedListItem>

        {/* Documents */}
        <AnimatedListItem index={5} className="mx-4 mb-4">
          <View className="bg-white rounded-2xl px-4" style={shadows.card}>
            <View className="py-3">
              <Text className="text-ink-900 font-bold text-sm">Documents</Text>
            </View>
            <Divider />

            <View className="flex-row items-center py-3">
              <View className="w-8 h-8 rounded-lg bg-surface-sunken items-center justify-center mr-3">
                <Ionicons name="id-card" size={16} color="#737373" />
              </View>
              <Text className="text-ink-900 font-semibold text-sm flex-1">Aadhaar Card</Text>
              <DocBadge verified={documents?.aadhar?.verified ?? false} />
            </View>

            <Divider />

            <View className="flex-row items-center py-3">
              <View className="w-8 h-8 rounded-lg bg-surface-sunken items-center justify-center mr-3">
                <Ionicons name="document-text" size={16} color="#737373" />
              </View>
              <View className="flex-1">
                <Text className="text-ink-900 font-semibold text-sm">Driving License</Text>
                {documents?.drivingLicense?.number ? (
                  <Text className="text-ink-400 text-xs mt-0.5">
                    {documents.drivingLicense.number}
                  </Text>
                ) : null}
              </View>
              <DocBadge verified={documents?.drivingLicense?.verified ?? false} />
            </View>

            <Divider />

            <View className="flex-row items-center py-3">
              <View className="w-8 h-8 rounded-lg bg-surface-sunken items-center justify-center mr-3">
                <Ionicons name="car" size={16} color="#737373" />
              </View>
              <View className="flex-1">
                <Text className="text-ink-900 font-semibold text-sm">Vehicle RC</Text>
                {documents?.vehicleRC?.number ? (
                  <Text className="text-ink-400 text-xs mt-0.5">
                    {documents.vehicleRC.number}
                  </Text>
                ) : null}
              </View>
              <DocBadge verified={documents?.vehicleRC?.verified ?? false} />
            </View>
          </View>
        </AnimatedListItem>

        {/* Bank account */}
        <AnimatedListItem index={6} className="mx-4 mb-4">
          <View className="bg-white rounded-2xl px-4" style={shadows.card}>
            <View className="py-3">
              <Text className="text-ink-900 font-bold text-sm">Payment</Text>
            </View>
            <Divider />
            <InfoRow
              icon="business"
              label="Bank"
              value={bankAccount?.bankName ?? '—'}
            />
            <Divider />
            <InfoRow
              icon="wallet"
              label="Account"
              value={bankAccount?.last4 ? `••••  ••••  ••••  ${bankAccount.last4}` : '—'}
            />
          </View>
        </AnimatedListItem>

        {/* Logout */}
        <AnimatedListItem index={7} className="mx-4 mt-2">
          <Button
            label="Log Out"
            onPress={handleLogout}
            variant="outline"
            fullWidth
            size="lg"
            icon="log-out-outline"
          />
        </AnimatedListItem>
      </ScrollView>
    </SafeAreaView>
  );
}
