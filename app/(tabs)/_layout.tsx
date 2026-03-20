import { Tabs } from "expo-router";
import { Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../constants/theme";
import { useAuth } from "../../src/store/AuthContext";
import GlobalHeader from "../../components/layout/GlobalHeader";

const C = Colors.dark;

function TabIcon({ icon, color }: { icon: string; color: string }) {
  return (
    <Text style={{ fontSize: 20, opacity: color === C.accent ? 1 : 0.4 }}>
      {icon}
    </Text>
  );
}

export default function TabLayout() {
  const insets          = useSafeAreaInsets();
  const { user }        = useAuth();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor:  C.surface,
          borderTopColor:   C.border,
          borderTopWidth:   1,
          paddingBottom:    insets.bottom + 4,
          paddingTop:       8,
          height:           56 + insets.bottom,
        },
        tabBarActiveTintColor:   C.accent,
        tabBarInactiveTintColor: C.subtleForeground,
        tabBarLabelStyle: { fontSize: 10, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title:       "Ana Sayfa",
          tabBarIcon:  ({ color }) => <TabIcon icon="🏠" color={color} />,
          header:      () => <GlobalHeader />,
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title:       "Mağaza",
          tabBarIcon:  ({ color }) => <TabIcon icon="🛍️" color={color} />,
          header:      () => <GlobalHeader />,
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="print"
        options={{
          title:       "Üret",
          tabBarIcon:  ({ color }) => <TabIcon icon="➕" color={color} />,
          header:      () => <GlobalHeader />,
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title:       "Siparişler",
          tabBarIcon:  ({ color }) => <TabIcon icon="📦" color={color} />,
          header:      () => <GlobalHeader />,
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title:      "Profil",
          tabBarIcon: ({ color }) => <TabIcon icon="👤" color={color} />,
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title:      "Yönetim",
          tabBarIcon: ({ color }) => <TabIcon icon="⚙️" color={color} />,
          href:       user?.isAdmin ? undefined : null,
        }}
      />
    </Tabs>
  );
}
