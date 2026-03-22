import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../src/store/AuthContext";
import { useTheme } from "../../hooks/useTheme";
import GlobalHeader from "../../components/layout/GlobalHeader";
import CustomTabBar from "../../components/nav/CustomTabBar";

export default function TabLayout() {
  const { user }   = useAuth();
  const insets     = useSafeAreaInsets();
  const { colors } = useTheme();
  const tabBarH    = 60 + Math.max(insets.bottom, 10);

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown:  false,
        contentStyle: { paddingBottom: tabBarH, backgroundColor: colors.background },
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
        name="sanatkat"
        options={{
          title:       "Sanatkat",
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
