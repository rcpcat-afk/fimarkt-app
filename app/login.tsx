import { useRouter } from "expo-router";
import LoginScreen from "../src/screens/auth/LoginScreen";

export default function Login() {
  const router = useRouter();

  const navigation = {
    navigate: (screen: string) => {
      if (screen === "Register") router.push("/register");
      if (screen === "ForgotPassword") router.push("/forgot-password");
    },
    goBack: () => router.back(),
    replace: (screen: string) => router.replace("/(tabs)"),
  };

  return <LoginScreen navigation={navigation} />;
}
