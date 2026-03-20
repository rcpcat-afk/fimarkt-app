import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../src/store/AuthContext";
import GlobalHeader from "../../components/layout/GlobalHeader";
import CustomTabBar from "../../components/nav/CustomTabBar";

export default function TabLayout() {
  const { user }   = useAuth();
  const insets     = useSafeAreaInsets();
  // Tab bar is position:absolute → screens need explicit bottom padding
  const tabBarH    = 60 + insets.bottom;

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown:  false,
        contentStyle: { paddingBottom: tabBarH },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title:       "Ana Sayfa",
          header:      () => <GlobalHeader />,
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title:       "Keşfet",
          header:      () => <GlobalHeader />,
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="print"
        options={{
          title:       "Fidrop",
          header:      () => <GlobalHeader />,
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title:       "Siparişler",
          header:      () => <GlobalHeader />,
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: "Yönetim",
          // Admin tab only accessible when logged in as admin — hidden from bar
          href: user?.isAdmin ? undefined : null,
        }}
      />
    </Tabs>
  );
}
