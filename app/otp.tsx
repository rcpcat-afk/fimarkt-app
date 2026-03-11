import { useLocalSearchParams, useRouter } from "expo-router";
import { OTPScreen } from "../src/screens/auth/ForgotPasswordScreen";

export default function OTP() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const navigation = {
    navigate: (screen: string, screenParams?: any) => {
      if (screen === "NewPassword") {
        router.push({
          pathname: "/new-password",
          params: { email: screenParams?.email || params?.email },
        });
      }
    },
    goBack: () => router.back(),
  };

  return <OTPScreen navigation={navigation} route={{ params }} />;
}
