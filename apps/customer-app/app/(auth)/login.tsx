import React, { useMemo, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, FadeInImage } from "../../components";
import { PressableScale } from "../../components/ui/PressableScale";
import { haptics } from "../../lib/haptics";
import { spring } from "../../lib/animations";

// Curated, appetite-stirring Indian thali hero (Unsplash, high-res, free to use)
const HERO_URI =
  "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=1200&q=80";

// Format 10 digits progressively: "98765 43210"
function formatProgressive(digits: string) {
  const d = digits.replace(/\D/g, "").slice(0, 10);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)} ${d.slice(5)}`;
}

export default function LoginScreen() {
  const [phone, setPhone] = useState("");
  const inputRef = useRef<TextInput>(null);

  const digits = useMemo(() => phone.replace(/\D/g, "").slice(0, 10), [phone]);
  const canContinue = digits.length === 10;

  const handleContinue = () => {
    if (!canContinue) return;
    haptics.medium();
    Keyboard.dismiss();
    router.push({ pathname: "/(auth)/otp", params: { phone: digits } });
  };

  const handleSkip = () => {
    haptics.light();
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Hero image with brand-tinted ring */}
            <MotiView
              from={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", ...spring.soft, delay: 60 }}
              style={{ alignItems: "center", marginTop: 24, marginBottom: 12 }}
            >
              <View
                style={{
                  width: 220,
                  height: 220,
                  borderRadius: 110,
                  padding: 8,
                  backgroundColor: "#FFF8F5",
                  shadowColor: "#FC5F30",
                  shadowOffset: { width: 0, height: 12 },
                  shadowOpacity: 0.18,
                  shadowRadius: 24,
                  elevation: 10,
                }}
              >
                <FadeInImage
                  uri={HERO_URI}
                  borderRadius={108}
                  style={{ width: "100%", height: "100%" }}
                />
              </View>
            </MotiView>

            {/* Brand wordmark */}
            <MotiView
              from={{ opacity: 0, translateY: 8 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "timing", duration: 360, delay: 200 }}
              style={{ alignItems: "center", marginTop: 4 }}
            >
              <View className="flex-row items-baseline">
                <Text className="text-ink-900 text-3xl font-extrabold tracking-tight">
                  Go
                </Text>
                <Text className="text-brand text-3xl font-extrabold tracking-tight">
                  Local
                </Text>
              </View>
              <Text className="text-ink-500 text-xs mt-1.5 tracking-wide">
                Hyperlocal food, delivered with love
              </Text>
            </MotiView>

            {/* Title + phone input */}
            <View className="px-6 mt-10">
              <MotiView
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "timing", duration: 380, delay: 320 }}
              >
                <Text className="text-ink-900 text-2xl font-extrabold">
                  Login or Sign up
                </Text>
                <Text className="text-ink-500 text-sm mt-1.5">
                  We'll send you a 6-digit code to verify
                </Text>
              </MotiView>

              <MotiView
                from={{ opacity: 0, translateY: 12 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "timing", duration: 380, delay: 440 }}
                style={{ marginTop: 22 }}
              >
                <PressableScale
                  onPress={() => inputRef.current?.focus()}
                  scaleTo={0.995}
                  haptic="none"
                  className="flex-row items-stretch rounded-2xl border border-ink-200 bg-white overflow-hidden"
                  style={{
                    shadowColor: "#1F1408",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.04,
                    shadowRadius: 8,
                    elevation: 1,
                  }}
                >
                  <View className="px-4 justify-center bg-surface-sunken border-r border-ink-100">
                    <Text className="text-ink-900 text-base font-semibold">+91</Text>
                  </View>
                  <TextInput
                    ref={inputRef}
                    value={formatProgressive(phone)}
                    onChangeText={(t) => setPhone(t.replace(/\D/g, "").slice(0, 10))}
                    placeholder="Enter your mobile number"
                    placeholderTextColor="#A3A3A3"
                    keyboardType="number-pad"
                    maxLength={11}
                    autoFocus={false}
                    autoComplete="tel"
                    textContentType="telephoneNumber"
                    className="flex-1 px-4 py-4 text-ink-900 text-base font-semibold"
                    style={{ letterSpacing: 0.4 }}
                  />
                  {canContinue ? (
                    <View className="pr-3 justify-center">
                      <View className="w-6 h-6 rounded-full bg-success items-center justify-center">
                        <Ionicons name="checkmark" size={14} color="#fff" />
                      </View>
                    </View>
                  ) : null}
                </PressableScale>
              </MotiView>

              {/* Continue button */}
              <MotiView
                from={{ opacity: 0, translateY: 12 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "timing", duration: 380, delay: 560 }}
                style={{ marginTop: 18 }}
              >
                <Button
                  label="Continue"
                  onPress={handleContinue}
                  disabled={!canContinue}
                  size="lg"
                  fullWidth
                  icon="arrow-forward"
                  iconPosition="right"
                  haptic="medium"
                />
              </MotiView>

              {/* Divider */}
              <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ type: "timing", duration: 380, delay: 700 }}
                style={{ marginTop: 26 }}
              >
                <View className="flex-row items-center">
                  <View className="flex-1 h-px bg-ink-100" />
                  <Text className="text-ink-400 text-2xs font-semibold mx-3 tracking-widest uppercase">
                    or continue with
                  </Text>
                  <View className="flex-1 h-px bg-ink-100" />
                </View>
              </MotiView>

              {/* Social login row */}
              <MotiView
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "timing", duration: 380, delay: 820 }}
                style={{ marginTop: 16 }}
              >
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <SocialButton
                      icon="logo-google"
                      label="Google"
                      onPress={() => haptics.light()}
                    />
                  </View>
                  {Platform.OS === "ios" ? (
                    <View className="flex-1">
                      <SocialButton
                        icon="logo-apple"
                        label="Apple"
                        onPress={() => haptics.light()}
                      />
                    </View>
                  ) : null}
                </View>
              </MotiView>

              {/* Skip */}
              <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ type: "timing", duration: 380, delay: 940 }}
                style={{ marginTop: 14, alignItems: "center" }}
              >
                <PressableScale
                  onPress={handleSkip}
                  scaleTo={0.96}
                  haptic="light"
                  className="px-4 py-2.5"
                >
                  <Text className="text-ink-500 text-sm font-semibold">
                    Skip for now
                  </Text>
                </PressableScale>
              </MotiView>
            </View>

            {/* Footer / legal */}
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ type: "timing", duration: 380, delay: 1060 }}
              style={{ marginTop: "auto", paddingHorizontal: 32, paddingTop: 20, paddingBottom: 10 }}
            >
              <Text className="text-ink-500 text-2xs text-center leading-4">
                By continuing, you agree to our{" "}
                <Text className="text-brand font-semibold">Terms of Service</Text>{" "}
                and{" "}
                <Text className="text-brand font-semibold">Privacy Policy</Text>.
              </Text>
            </MotiView>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Lightweight outline social CTA — stub for now.
function SocialButton({
  icon,
  label,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress: () => void;
}) {
  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.97}
      haptic="light"
      className="flex-row items-center justify-center bg-white border border-ink-200 rounded-2xl py-3.5"
      style={{
        shadowColor: "#1F1408",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 6,
        elevation: 1,
      }}
    >
      <Ionicons name={icon} size={18} color="#0A0A0A" />
      <Text className="text-ink-900 font-semibold text-sm ml-2">{label}</Text>
    </PressableScale>
  );
}
