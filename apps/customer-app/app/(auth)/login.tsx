import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { useState } from "react";
import { router } from "expo-router";

export default function LoginScreen() {
  const [phone, setPhone] = useState("");

  const handleSendOtp = async () => {
    if (phone.length < 10) return;
    // TODO: POST /auth/customer/send-otp
    router.push({ pathname: "/(auth)/otp", params: { phone } });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
    >
      <View className="flex-1 justify-center px-6">
        <Text className="text-4xl font-bold text-white mb-2">Travel Food</Text>
        <Text className="text-muted text-lg mb-10">Order food, track in real time</Text>

        <Text className="text-white text-base mb-2">Phone number</Text>
        <TextInput
          className="bg-surface text-white rounded-xl px-4 py-4 text-base mb-4"
          placeholder="+44 7700 000000"
          placeholderTextColor="#6B7280"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          maxLength={15}
        />

        <TouchableOpacity
          onPress={handleSendOtp}
          className="bg-brand rounded-xl py-4 items-center"
          activeOpacity={0.8}
        >
          <Text className="text-white font-semibold text-base">Send code</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
