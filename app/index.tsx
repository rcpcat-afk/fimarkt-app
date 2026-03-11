import { Redirect } from "expo-router";
import { useAuth } from "../src/store/AuthContext";

export default function Index() {
  const { user } = useAuth();

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/onboarding" />;
}
