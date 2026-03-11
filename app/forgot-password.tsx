import { useRouter } from "expo-router";
import { ForgotPasswordScreen } from "../src/screens/auth/ForgotPasswordScreen";

export default function ForgotPassword() {
  const router = useRouter();

  const navigation = {
    navigate: (screen: string, params?: any) => {
      if (screen === "OTP") router.push({ pathname: "/otp", params });
      if (screen === "Login") router.push("/login");
    },
    goBack: () => router.back(),
  };

  return <ForgotPasswordScreen navigation={navigation} />;
}
