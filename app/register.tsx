import { useRouter } from "expo-router";
import RegisterScreen from "../src/screens/auth/RegisterScreen";

export default function Register() {
  const router = useRouter();

  const navigation = {
    navigate: (screen: string) => {
      if (screen === "Login") router.push("/login");
    },
    goBack: () => router.back(),
    replace: (screen: string) => router.replace("/(tabs)"),
  };

  return <RegisterScreen navigation={navigation} />;
}
