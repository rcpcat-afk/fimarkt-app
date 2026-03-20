import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "@/constants/theme";
import VisitorHome from "@/components/home/VisitorHome";
import UserHome    from "@/components/home/UserHome";
import { type WebUser } from "@/lib/types";

export default function HomeScreen() {
  const scheme = useColorScheme();
  const C      = Colors[scheme ?? "dark"];
  const [user,    setUser]    = useState<WebUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem("fimarkt_user").then((raw) => {
      try { setUser(raw ? JSON.parse(raw) : null); }
      catch { setUser(null); }
      finally { setLoading(false); }
    });
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: C.background, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={C.accent} />
      </View>
    );
  }

  if (user) {
    return <UserHome userName={user.name} userRole={user.role} />;
  }

  return <VisitorHome />;
}
