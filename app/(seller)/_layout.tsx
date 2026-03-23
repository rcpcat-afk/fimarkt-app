// ─── (seller) Route Group Layout ─────────────────────────────────────────────
// Satıcı paneli: 5 sekme (Komuta, Ürünlerim, Siparişler, Finans, Mesajlar).
// Onboarding (satici-ol) → app/satici-ol.tsx olarak taşındı, bu layout dışında.
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SellerTabBar from "../../components/nav/SellerTabBar";

export default function SellerLayout() {
  const insets  = useSafeAreaInsets();
  const tabBarH = 60 + Math.max(insets.bottom, 10);

  return (
    <Tabs
      tabBar={(props) => <SellerTabBar {...props} />}
      screenOptions={{
        headerShown:  false,
        contentStyle: { paddingBottom: tabBarH },
      }}
    >
      <Tabs.Screen name="dashboard"  options={{ title: "Komuta Merkezi" }} />
      <Tabs.Screen name="inventory"  options={{ title: "Ürünlerim"      }} />
      <Tabs.Screen name="orders"     options={{ title: "Siparişler"     }} />
      <Tabs.Screen name="finance"    options={{ title: "Finans"         }} />
      <Tabs.Screen name="messages"   options={{ title: "Mesajlar"       }} />
    </Tabs>
  );
}
