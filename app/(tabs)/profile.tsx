import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../constants";
import {
  getMyCustomer,
  getMyOrders,
  WCOrder,
} from "../../src/services/sanatkat";
import { useAuth } from "../../src/store/AuthContext";

interface SettingRowProps {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  isSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (val: boolean) => void;
  danger?: boolean;
}

const SettingRow = ({
  icon,
  label,
  value,
  onPress,
  isSwitch,
  switchValue,
  onSwitchChange,
  danger,
}: SettingRowProps) => (
  <TouchableOpacity
    style={styles.settingRow}
    onPress={onPress}
    disabled={isSwitch}
  >
    <Text style={styles.settingIcon}>{icon}</Text>
    <Text style={[styles.settingLabel, danger && { color: Colors.red }]}>
      {label}
    </Text>
    <View style={styles.settingRight}>
      {isSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: Colors.border, true: Colors.accent }}
          thumbColor="#fff"
        />
      ) : (
        <>
          {value && <Text style={styles.settingValue}>{value}</Text>}
          <Text style={[styles.settingArrow, danger && { color: Colors.red }]}>
            ›
          </Text>
        </>
      )}
    </View>
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [campaigns, setCampaigns] = useState(false);
  const [orders, setOrders] = useState<WCOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [displayName, setDisplayName] = useState(user?.name || "");
  const [isKurumsal, setIsKurumsal] = useState(false);
  const [companyName, setCompanyName] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = await AsyncStorage.getItem("sanatkat_token");
      if (!token) return;
      const [data, customer] = await Promise.all([
        getMyOrders(token),
        getMyCustomer(token),
      ]);
      setOrders(data);
      if (customer) {
        const company = customer.billing?.company;
        if (company) {
          setIsKurumsal(true);
          setCompanyName(company);
          setDisplayName(`${customer.first_name} ${customer.last_name}`.trim());
        } else if (customer.first_name) {
          setDisplayName(`${customer.first_name} ${customer.last_name}`.trim());
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setOrdersLoading(false);
    }
  };

  const orderCounts = {
    processing: orders.filter(
      (o) => o.status === "processing" || o.status === "on-hold",
    ).length,
    shipped: orders.filter(
      (o) => o.status === "shipped" || o.status === "hezarfen-shipped",
    ).length,
    completed: orders.filter((o) => o.status === "completed").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  const handleLogout = () => {
    Alert.alert("Çıkış Yap", "Hesabınızdan çıkmak istediğinize emin misiniz?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Çıkış Yap",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/onboarding");
        },
      },
    ]);
  };

  const name = displayName || user?.name || "Kullanıcı";
  const avatarSource = isKurumsal && companyName ? companyName : name;
  const initials = avatarSource
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Profil</Text>
        </View>

        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.userInfo}>
            {isKurumsal && companyName ? (
              <>
                <Text style={styles.userName}>{companyName}</Text>
                <Text style={styles.userEmail}>{displayName}</Text>
                <Text style={styles.userEmail}>{user?.email || ""}</Text>
              </>
            ) : (
              <>
                <Text style={styles.userName}>{name}</Text>
                <Text style={styles.userEmail}>{user?.email || ""}</Text>
              </>
            )}
          </View>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => router.push("/personal-info")}
          >
            <Text style={styles.editBtnText}>Düzenle</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.quickRow}>
          {[
            {
              icon: "📦",
              label: "Siparişler",
              onPress: () => router.push("/(tabs)/orders"),
            },
            {
              icon: "❤️",
              label: "Favoriler",
              onPress: () => router.push("/favorites"),
            },
            {
              icon: "📍",
              label: "Adresler",
              onPress: () => router.push("/addresses"),
            },
            {
              icon: "💳",
              label: "Ödeme",
              onPress: () => router.push("/payment-methods"),
            },
          ].map((item, i) => (
            <TouchableOpacity
              key={i}
              style={styles.quickItem}
              onPress={item.onPress}
            >
              <Text style={styles.quickIcon}>{item.icon}</Text>
              <Text style={styles.quickLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Siparişlerim</Text>
          <View style={styles.orderStatus}>
            {ordersLoading ? (
              <ActivityIndicator color={Colors.accent} size="small" />
            ) : (
              <>
                {[
                  {
                    icon: "⏳",
                    label: "Hazırlanıyor",
                    count: orderCounts.processing,
                  },
                  { icon: "🚚", label: "Kargoda", count: orderCounts.shipped },
                  { icon: "✅", label: "Teslim", count: orderCounts.completed },
                  { icon: "❌", label: "İptal", count: orderCounts.cancelled },
                ].map((item, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.orderStatusItem}
                    onPress={() => router.push("/(tabs)/orders")}
                  >
                    <Text style={styles.orderStatusIcon}>{item.icon}</Text>
                    <Text style={styles.orderStatusCount}>{item.count}</Text>
                    <Text style={styles.orderStatusLabel}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bildirimler</Text>
          <View style={styles.settingCard}>
            <SettingRow
              icon="🔔"
              label="Bildirimler"
              isSwitch
              switchValue={notifications}
              onSwitchChange={setNotifications}
            />
            <SettingRow
              icon="📦"
              label="Sipariş Güncellemeleri"
              isSwitch
              switchValue={orderUpdates}
              onSwitchChange={setOrderUpdates}
            />
            <SettingRow
              icon="🎁"
              label="Kampanyalar"
              isSwitch
              switchValue={campaigns}
              onSwitchChange={setCampaigns}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hesap</Text>
          <View style={styles.settingCard}>
            <SettingRow
              icon="👤"
              label="Kişisel Bilgiler"
              onPress={() => router.push("/personal-info")}
            />
            <SettingRow
              icon="🔒"
              label="Şifre Değiştir"
              onPress={() => router.push("/forgot-password")}
            />
            <SettingRow
              icon="📍"
              label="Adreslerim"
              onPress={() => router.push("/addresses")}
            />
            <SettingRow
              icon="💳"
              label="Ödeme Yöntemlerim"
              onPress={() => router.push("/payment-methods")}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Uygulama</Text>
          <View style={styles.settingCard}>
            <SettingRow
              icon="⭐"
              label="Uygulamayı Puanla"
              onPress={() =>
                Alert.alert(
                  "⭐ Teşekkürler!",
                  "Uygulama mağazasına yönlendiriliyorsunuz...",
                  [{ text: "Tamam" }],
                )
              }
            />
            <SettingRow
              icon="💬"
              label="Destek"
              onPress={() =>
                Alert.alert(
                  "💬 Destek",
                  "destek@fimarkt.com.tr adresine e-posta gönderin.",
                  [{ text: "Tamam" }],
                )
              }
            />
            <SettingRow
              icon="📄"
              label="Gizlilik Politikası"
              onPress={() =>
                Alert.alert(
                  "📄 Gizlilik",
                  "fimarkt.com.tr/gizlilik adresinden okuyabilirsiniz.",
                  [{ text: "Tamam" }],
                )
              }
            />
            <SettingRow icon="ℹ️" label="Versiyon" value="1.0.0" />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.settingCard}>
            <SettingRow
              icon="🚪"
              label="Çıkış Yap"
              onPress={handleLogout}
              danger
            />
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { padding: 24, paddingTop: 16 },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.5,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 24,
    marginBottom: 20,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 20, fontWeight: "800", color: "#fff" },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: "700", color: Colors.text },
  userEmail: { fontSize: 12, color: Colors.text2, marginTop: 2 },
  editBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  editBtnText: { fontSize: 12, color: Colors.text2 },
  quickRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 24,
    marginBottom: 20,
  },
  quickItem: {
    flex: 1,
    alignItems: "center",
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    padding: 12,
    marginHorizontal: 4,
  },
  quickIcon: { fontSize: 22, marginBottom: 6 },
  quickLabel: { fontSize: 10, color: Colors.text2, fontWeight: "500" },
  section: { marginHorizontal: 24, marginBottom: 16 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.text2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  orderStatus: {
    flexDirection: "row",
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 16,
    minHeight: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  orderStatusItem: { flex: 1, alignItems: "center", gap: 4 },
  orderStatusIcon: { fontSize: 20 },
  orderStatusCount: { fontSize: 16, fontWeight: "800", color: Colors.text },
  orderStatusLabel: { fontSize: 9, color: Colors.text2, textAlign: "center" },
  settingCard: {
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingIcon: { fontSize: 18, width: 28, textAlign: "center" },
  settingLabel: { flex: 1, fontSize: 14, color: Colors.text },
  settingRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  settingValue: { fontSize: 13, color: Colors.text2 },
  settingArrow: { fontSize: 20, color: Colors.text3 },
});
