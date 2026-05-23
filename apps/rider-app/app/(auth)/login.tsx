import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components/ui/Button";
import { haptics } from "../../lib/haptics";

export default function RiderLoginScreen() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const digits = phone.replace(/\D/g, "").slice(0, 10);
  const isReady = digits.length === 10;

  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/\D/g, "").slice(0, 10);
    setPhone(cleaned);
  };

  const handleSendOtp = async () => {
    if (!isReady) return;
    haptics.medium();
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      router.push({ pathname: "/(auth)/otp", params: { phone: digits } });
    } finally {
      setLoading(false);
    }
  };

  const displayPhone = digits.length > 5
    ? `${digits.slice(0, 5)} ${digits.slice(5)}`
    : digits;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 pt-16 pb-8">
            {/* Icon */}
            <MotiView
              from={{ opacity: 0, scale: 0.7, translateY: 20 }}
              animate={{ opacity: 1, scale: 1, translateY: 0 }}
              transition={{ type: "spring", damping: 14, stiffness: 160 }}
              className="self-center mb-8"
            >
              <View className="w-24 h-24 rounded-full bg-surface-tint items-center justify-center">
                <Ionicons name="bicycle" size={48} color="#FC5F30" />
              </View>
            </MotiView>

            {/* Heading */}
            <MotiView
              from={{ opacity: 0, translateY: 12 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 320, delay: 100 }}
              className="mb-8"
            >
              <Text className="text-ink-900 text-3xl font-bold text-center">
                Welcome Back, Rider!
              </Text>
              <Text className="text-ink-400 text-base text-center mt-2 leading-6">
                Enter your registered +91 mobile number{"\n"}to continue
              </Text>
            </MotiView>

            {/* Phone input */}
            <MotiView
              from={{ opacity: 0, translateY: 12 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 320, delay: 200 }}
              className="mb-5"
            >
              <Text className="text-ink-700 font-semibold text-sm mb-2">
                Mobile Number
              </Text>
              <View className="flex-row items-center border border-ink-100 rounded-xl bg-surface-sunken overflow-hidden">
                <View className="px-4 py-4 border-r border-ink-100">
                  <Text className="text-brand font-bold text-base">+91</Text>
                </View>
                <TextInput
                  className="flex-1 px-4 py-4 text-ink-900 text-base"
                  placeholder="98765 43210"
                  placeholderTextColor="#A3A3A3"
                  keyboardType="phone-pad"
                  value={displayPhone}
                  onChangeText={handlePhoneChange}
                  maxLength={11}
                  returnKeyType="done"
                  onSubmitEditing={handleSendOtp}
                />
              </View>
            </MotiView>

            {/* CTA */}
            <MotiView
              from={{ opacity: 0, translateY: 12 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 320, delay: 300 }}
            >
              <Button
                label="Send OTP"
                onPress={handleSendOtp}
                disabled={!isReady}
                loading={loading}
                fullWidth
                size="lg"
                haptic="none"
              />
            </MotiView>

            {/* Footer */}
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ type: "timing", duration: 320, delay: 500 }}
              className="mt-auto pt-8"
            >
              <Text className="text-ink-300 text-xs text-center leading-5">
                By continuing you agree to our{" "}
                <Text className="text-brand">Terms</Text> &{" "}
                <Text className="text-brand">Privacy Policy</Text>
              </Text>
            </MotiView>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
