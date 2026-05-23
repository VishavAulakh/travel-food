import { Stack } from "expo-router";

// Auth flow stack — keep it chrome-less; each screen owns its own header.
// Light bg, slide-from-right transitions to match the iOS push paradigm.
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#FFFFFF" },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="otp" />
    </Stack>
  );
}
