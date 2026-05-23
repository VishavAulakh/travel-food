import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components/ui/Button";
import { PressableScale } from "../../components/ui/PressableScale";
import { useRiderStore } from "../../store/rider";
import { haptics } from "../../lib/haptics";
import { api } from "../../lib/api";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

export default function OtpScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const inputs = useRef<(TextInput | null)[]>(Array(OTP_LENGTH).fill(null));
  const setAuth = useRiderStore((s) => s.setAuth);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleChange = (val: string, idx: number) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[idx] = digit;
    setOtp(next);
    if (digit && idx < OTP_LENGTH - 1) {
      inputs.current[idx + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    idx: number
  ) => {
    if (e.nativeEvent.key === "Backspace" && !otp[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const isComplete = otp.every((d) => d !== "");

  const handleVerify = async () => {
    if (!isComplete) return;
    haptics.medium();
    setLoading(true);
    try {
      const finalCode = otp.join('');
      const res = await api.post<{ accessToken: string; rider: { id: string; name: string; phone: string } }>(
        '/riders/auth/verify-otp',
        { phone: '+91' + phone, otp: finalCode }
      );
      setAuth(res.accessToken, { id: res.rider.id, name: res.rider.name, phone: res.rider.phone });
      haptics.success();
      router.replace("/(tabs)");
    } catch (err: any) {
      Alert.alert('Invalid OTP', err?.message ?? 'The code you entered is incorrect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    haptics.light();
    setCountdown(RESEND_SECONDS);
    setOtp(Array(OTP_LENGTH).fill(""));
    inputs.current[0]?.focus();
    try {
      await api.post('/riders/auth/send-otp', { phone: '+91' + phone });
    } catch {
      // silently ignore — countdown already reset
    }
  };

  const displayPhone = phone
    ? `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`
    : "+91 XXXXX XXXXX";

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 px-6 pt-12 pb-8">
          {/* Back */}
          <PressableScale
            onPress={() => router.back()}
            haptic="light"
            className="self-start mb-8"
          >
            <View className="w-10 h-10 rounded-full bg-surface-sunken items-center justify-center">
              <Ionicons name="arrow-back" size={20} color="#0A0A0A" />
            </View>
          </PressableScale>

          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 300 }}
            className="mb-8"
          >
            <Text className="text-ink-900 text-2xl font-bold mb-2">Verify OTP</Text>
            <Text className="text-ink-400 text-sm leading-5">
              We sent a 6-digit code to{"\n"}
              <Text className="text-ink-900 font-semibold">{displayPhone}</Text>
            </Text>
          </MotiView>

          {/* OTP Boxes */}
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 300, delay: 100 }}
            className="flex-row gap-3 justify-center mb-8"
          >
            {Array(OTP_LENGTH)
              .fill(null)
              .map((_, i) => (
                <TextInput
                  key={i}
                  ref={(r) => { inputs.current[i] = r; }}
                  className={`w-12 h-14 text-center text-ink-900 text-xl font-bold rounded-xl border ${
                    otp[i]
                      ? "border-brand bg-surface-tint"
                      : "border-ink-100 bg-surface-sunken"
                  }`}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={otp[i]}
                  onChangeText={(v) => handleChange(v, i)}
                  onKeyPress={(e) => handleKeyPress(e, i)}
                  selectionColor="#FC5F30"
                />
              ))}
          </MotiView>

          {/* Verify button */}
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 300, delay: 200 }}
            className="mb-6"
          >
            <Button
              label="Verify OTP"
              onPress={handleVerify}
              disabled={!isComplete}
              loading={loading}
              fullWidth
              size="lg"
              haptic="none"
            />
          </MotiView>

          {/* Resend */}
          <View className="items-center">
            <PressableScale
              onPress={handleResend}
              haptic="light"
              disabled={countdown > 0}
            >
              <Text className="text-sm text-center">
                <Text className="text-ink-400">Didn't receive it? </Text>
                {countdown > 0 ? (
                  <Text className="text-ink-400">
                    Resend in{" "}
                    <Text className="text-brand font-semibold">{countdown}s</Text>
                  </Text>
                ) : (
                  <Text className="text-brand font-semibold">Resend OTP</Text>
                )}
              </Text>
            </PressableScale>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
