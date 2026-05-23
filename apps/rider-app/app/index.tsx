import { Redirect } from "expo-router";

// DEV: bypass auth to preview UI — restore token check before production
export default function Index() {
  return <Redirect href="/(tabs)" />;
}
