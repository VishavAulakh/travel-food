import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  NativeSyntheticEvent,
  Platform,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { MotiView } from "moti";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Header } from "../../components";
import { PressableScale } from "../../components/ui/PressableScale";
import { useAuthStore } from "../../store/auth";
import { formatPhone } from "../../lib/format";
import { haptics } from "../../lib/haptics";
import { spring } from "../../lib/animations";
import { api } from "../../lib/api";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 45;

export default function OtpScreen() {
  const { phone = "" } = useLocalSearchParams<{ phone?: string }>();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [digits, setDigits] = useState<string[]>(() => Array(OTP_LENGTH).fill(""));
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errored, setErrored] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Countdown
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  // Autofocus first
  useEffect(() => {
    const t = setTimeout(() => inputRefs.current[0]?.focus(), 250);
    return () => clearTimeout(t);
  }, []);

  const code = useMemo(() => digits.join(""), [digits]);

  const verify = useCallback(
    async (finalCode: string) => {
      if (finalCode.length !== OTP_LENGTH) return;
      Keyboard.dismiss();
      setLoading(true);
      setErrored(false);
      try {
        const res = await api.post<{ accessToken: string; customer: { id: string; name: string | null; phone: string } }>(
          '/delivery/customers/auth/verify-otp',
          { phone: '+91' + phone, otp: finalCode }
        );
        haptics.success();
        setAuth(res.accessToken, {
          id: res.customer.id,
          name: res.customer.name ?? phone,
          phone: res.customer.phone,
        });
        router.replace('/(tabs)');
      } catch {
        haptics.error();
        setErrored(true);
      } finally {
        setLoading(false);
      }
    },
    [phone, setAuth]
  );

  const handleChange = (text: string, idx: number) => {
    const cleaned = text.replace(/\D/g, "");

    // Paste of full OTP — fill all boxes
    if (cleaned.length >= OTP_LENGTH) {
      const next = cleaned.slice(0, OTP_LENGTH).split("");
      setDigits(next);
      setActiveIdx(OTP_LENGTH - 1);
      inputRefs.current[OTP_LENGTH - 1]?.blur();
      haptics.selection();
      verify(next.join(""));
      return;
    }

    // Single character input
    const single = cleaned.slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[idx] = single;
      // auto-fire verify when full
      if (single && idx === OTP_LENGTH - 1 && next.every(Boolean)) {
        verify(next.join(""));
      }
      return next;
    });
    setErrored(false);

    if (single && idx < OTP_LENGTH - 1) {
      haptics.selection();
      setActiveIdx(idx + 1);
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    idx: number
  ) => {
    if (e.nativeEvent.key === "Backspace") {
      setDigits((prev) => {
        const next = [...prev];
        if (next[idx]) {
          next[idx] = "";
          return next;
        }
        // already empty — step back
        if (idx > 0) {
          next[idx - 1] = "";
          setActiveIdx(idx - 1);
          inputRefs.current[idx - 1]?.focus();
          haptics.light();
        }
        return next;
      });
    }
  };

  const handleResend = () => {
    if (secondsLeft > 0) return;
    haptics.medium();
    setSecondsLeft(RESEND_SECONDS);
    setDigits(Array(OTP_LENGTH).fill(""));
    setActiveIdx(0);
    inputRefs.current[0]?.focus();
  };

  const handleEditNumber = () => {
    haptics.light();
    router.back();
  };

  const handleVerifyTap = () => verify(code);

  const formattedPhone = phone ? formatPhone(String(phone)) : "";
  const mm = Math.floor(secondsLeft / 60);
  const ss = secondsLeft % 60;
  const timerLabel = `${mm}:${ss.toString().padStart(2, "0")}`;

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-white">
      <Header title="Verify OTP" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
      >
        <View className="flex-1 px-6 pt-6">
          <MotiView
            from={{ opacity: 0, translateY: 8 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 360 }}
          >
            <Text className="text-ink-900 text-2xl font-extrabold">
              Enter the 6-digit code
            </Text>
            <View className="flex-row items-center mt-2 flex-wrap">
              <Text className="text-ink-500 text-sm">Sent to </Text>
              <Text className="text-ink-900 text-sm font-semibold">
                {formattedPhone || `+91 ${phone}`}
              </Text>
              <PressableScale
                onPress={handleEditNumber}
                scaleTo={0.94}
                haptic="light"
                className="ml-2 px-2 py-1 rounded-md bg-brand-50"
              >
                <Text className="text-brand text-2xs font-bold uppercase tracking-wider">
                  Edit
                </Text>
              </PressableScale>
            </View>
          </MotiView>

          {/* OTP boxes */}
          <MotiView
            from={{ opacity: 0, translateY: 14 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 380, delay: 120 }}
            style={{ marginTop: 32 }}
          >
            <View className="flex-row justify-between">
              {digits.map((d, i) => (
                <OtpBox
                  key={i}
                  ref={(el) => {
                    inputRefs.current[i] = el;
                  }}
                  value={d}
                  active={activeIdx === i}
                  errored={errored}
                  onChangeText={(t) => handleChange(t, i)}
                  onKeyPress={(e) => handleKeyPress(e, i)}
                  onFocus={() => setActiveIdx(i)}
                />
              ))}
            </View>
          </MotiView>

          {/* Resend */}
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: "timing", duration: 360, delay: 240 }}
            style={{ marginTop: 22, alignItems: "center" }}
          >
            {secondsLeft > 0 ? (
              <Text className="text-ink-500 text-sm">
                Resend code in{" "}
                <Text className="text-ink-900 font-semibold">{timerLabel}</Text>
              </Text>
            ) : (
              <PressableScale
                onPress={handleResend}
                scaleTo={0.96}
                haptic="medium"
                className="px-4 py-2 rounded-full"
              >
                <Text className="text-brand text-sm font-bold">Resend OTP</Text>
              </PressableScale>
            )}
          </MotiView>

          {/* Verify button */}
          <View className="mt-8">
            <Button
              label={loading ? "Verifying..." : "Verify"}
              onPress={handleVerifyTap}
              disabled={code.length !== OTP_LENGTH}
              loading={loading}
              size="lg"
              fullWidth
              haptic="success"
            />
          </View>

          {/* Trust footer */}
          <View className="mt-auto items-center pb-4">
            <View className="flex-row items-center">
              <Text className="text-ink-400 text-2xs">
                Didn't get a code? Check your SMS or try{" "}
              </Text>
              <Text className="text-brand text-2xs font-semibold">WhatsApp</Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Individual OTP box — animated scale + glow on focus
type OtpBoxProps = {
  value: string;
  active: boolean;
  errored: boolean;
  onChangeText: (t: string) => void;
  onKeyPress: (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => void;
  onFocus: () => void;
};
const OtpBox = React.forwardRef<TextInput, OtpBoxProps>(
  ({ value, active, errored, onChangeText, onKeyPress, onFocus }, ref) => {
    const scale = useSharedValue(1);
    const glow = useSharedValue(0);

    useEffect(() => {
      scale.value = withSpring(active ? 1.06 : 1, spring.default);
      glow.value = withTiming(active ? 1 : 0, { duration: 220 });
    }, [active, scale, glow]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      shadowOpacity: 0.18 * glow.value,
    }));

    const borderColor = errored
      ? "#DC2626"
      : active
      ? "#FC5F30"
      : value
      ? "#FFC2A8"
      : "#E5E5E5";

    return (
      <Animated.View
        style={[
          {
            width: 48,
            height: 56,
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor,
            backgroundColor: value ? "#FFF8F5" : "#FFFFFF",
            shadowColor: "#FC5F30",
            shadowOffset: { width: 0, height: 6 },
            shadowRadius: 14,
            elevation: active ? 4 : 0,
          },
          animatedStyle,
        ]}
      >
        <TextInput
          ref={ref}
          value={value}
          onChangeText={onChangeText}
          onKeyPress={onKeyPress}
          onFocus={onFocus}
          keyboardType="number-pad"
          maxLength={Platform.OS === "android" ? 1 : OTP_LENGTH}
          textContentType="oneTimeCode"
          autoComplete={Platform.OS === "ios" ? "one-time-code" : "sms-otp"}
          selectionColor="#FC5F30"
          style={{
            flex: 1,
            textAlign: "center",
            fontSize: 22,
            fontWeight: "700",
            color: "#0A0A0A",
            padding: 0,
          }}
        />
      </Animated.View>
    );
  }
);
OtpBox.displayName = "OtpBox";
