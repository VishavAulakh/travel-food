import { Redirect } from "expo-router";
import { useRiderStore } from "../store/rider";

export default function Index() {
  const token = useRiderStore((s) => s.token);
  return <Redirect href={token ? "/(tabs)" : "/(auth)/login"} />;
}
