import { useLocalSearchParams, useRouter } from "expo-router";
import { NewPasswordScreen } from "../src/screens/auth/ForgotPasswordScreen";

export default function NewPassword() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const navigation = {
    navigate: (screen: string) => {
      if (screen === "Login") router.push("/login");
    },
    goBack: () => router.back(),
  };

  return <NewPasswordScreen navigation={navigation} route={{ params }} />;
}
