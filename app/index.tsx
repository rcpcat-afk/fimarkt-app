// ─── Uygulama Giriş Yönlendirici ──────────────────────────────────────────────
// Onboarding flag'i + auth durumuna göre doğru ekrana yönlendirir:
//   1. Kullanıcı giriş yapmış           → /(tabs)
//   2. Onboarding daha önce görüldü     → /(auth)/login
//   3. Onboarding hiç görülmedi         → /(auth)/onboarding
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { useAuth } from "../src/store/AuthContext";

const ONBOARDING_KEY = "fimarkt_onboarding_done";

export default function Index() {
  const { user, isLoading }                       = useAuth();
  const [onboardingDone, setOnboardingDone]       = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((val) => {
      setOnboardingDone(val === "true");
    });
  }, []);

  // Auth veya flag henüz hazır değil — splash ekranı kapanana kadar bekle
  if (isLoading || onboardingDone === null) return null;

  // Giriş yapılmış → ana sayfa
  if (user) return <Redirect href="/(tabs)" />;

  // Onboarding zaten görüldü → login
  if (onboardingDone) return <Redirect href="/(auth)/login" />;

  // İlk kez açılış → onboarding
  return <Redirect href="/(auth)/onboarding" />;
}
