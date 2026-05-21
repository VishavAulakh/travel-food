import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { useRiderStore } from "../../store/rider";

export default function RiderLoginScreen() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const setAuth = useRiderStore((s) => s.setAuth);

  const handleSend = async () => {
    if (phone.length < 10) return;
    setLoading(true);
    try {
      // TODO: POST /auth/rider/send-otp
      setStep("otp");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6) return;
    setLoading(true);
    try {
      // TODO: POST /auth/rider/verify-otp → { token, rider }
      // setAuth(token, rider);
      router.replace("/(tabs)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
    >
      <View className="flex-1 justify-center px-6">
        <Text className="text-4xl font-bold text-white mb-2">Rider Portal</Text>
        <Text className="text-muted text-lg mb-10">Travel Food</Text>

        {step === "phone" ? (
          <>
            <TextInput
              className="bg-surface text-white rounded-xl px-4 py-4 text-base mb-4"
              placeholder="+44 7700 000000"
              placeholderTextColor="#6B7280"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
            <TouchableOpacity
              onPress={handleSend}
              disabled={loading}
              className="bg-brand rounded-xl py-4 items-center"
            >
              <Text className="text-white font-semibold">Send code</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text className="text-muted mb-3">Enter code sent to {phone}</Text>
            <TextInput
              className="bg-surface text-white rounded-xl px-4 py-4 text-2xl tracking-widest text-center mb-4"
              keyboardType="number-pad"
              maxLength={6}
              value={code}
              onChangeText={setCode}
            />
            <TouchableOpacity
              onPress={handleVerify}
              disabled={loading || code.length !== 6}
              className="bg-brand rounded-xl py-4 items-center"
            >
              <Text className="text-white font-semibold">
                {loading ? "Verifying..." : "Verify"}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
