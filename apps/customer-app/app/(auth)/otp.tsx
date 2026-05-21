import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { useAuthStore } from "../../store/auth";

export default function OtpScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleVerify = async () => {
    if (code.length !== 6) return;
    setLoading(true);
    try {
      // TODO: POST /auth/customer/verify-otp → { token, customer }
      // setAuth(token, customer);
      router.replace("/(tabs)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background justify-center px-6">
      <Text className="text-white text-2xl font-bold mb-2">Enter code</Text>
      <Text className="text-muted mb-8">Sent to {phone}</Text>

      <TextInput
        className="bg-surface text-white rounded-xl px-4 py-4 text-2xl tracking-widest text-center mb-6"
        keyboardType="number-pad"
        maxLength={6}
        value={code}
        onChangeText={setCode}
        placeholder="000000"
        placeholderTextColor="#6B7280"
      />

      <TouchableOpacity
        onPress={handleVerify}
        disabled={loading || code.length !== 6}
        className="bg-brand rounded-xl py-4 items-center disabled:opacity-50"
        activeOpacity={0.8}
      >
        <Text className="text-white font-semibold text-base">
          {loading ? "Verifying..." : "Verify"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
