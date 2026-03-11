import { useRouter } from "expo-router";
import OnboardingScreen from "../src/screens/auth/OnboardingScreen";

export default function Onboarding() {
  const router = useRouter();

  const navigation = {
    navigate: (screen: string) => {
      if (screen === "Login") router.push("/login");
      if (screen === "Register") router.push("/register");
    },
    goBack: () => router.back(),
  };

  return <OnboardingScreen navigation={navigation} />;
}
