import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BACKEND_URL, Colors } from "../../constants";
import { useAuth } from "../../src/store/AuthContext";

export default function AdminUsersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    Alert.alert(
      "Hesap Durumu",
      `Bu kullanıcıyı ${newStatus === "inactive" ? "dondur" : "aktif et"}?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Evet",
          onPress: async () => {
            try {
              await fetch(`${BACKEND_URL}/api/admin/users/${id}`, {
                method: "PUT",
                headers: {
                  Authorization: `Bearer ${user?.token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: newStatus }),
              });
              setUsers((prev) =>
                prev.map((u) =>
                  u.id === id ? { ...u, status: newStatus } : u,
                ),
              );
            } catch (e) {}
          },
        },
      ],
    );
  };

  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kullanıcılar</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{users.length}</Text>
        </View>
      </View>

      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="İsim veya e-posta ara..."
          placeholderTextColor={Colors.text3}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Text style={styles.searchClear}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.accent} size="large" />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Kullanıcı bulunamadı</Text>
        </View>
      ) : (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {filtered.map((u) => (
            <View key={u.id} style={styles.card}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {u.name?.charAt(0)?.toUpperCase() || "?"}
                </Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{u.name}</Text>
                <Text style={styles.email}>{u.email}</Text>
                <Text style={styles.meta}>
                  {u.orders_count || 0} sipariş · Üye:{" "}
                  {u.date_created
                    ? new Date(u.date_created).toLocaleDateString("tr-TR")
                    : "-"}
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.statusBtn,
                  {
                    backgroundColor:
                      u.status === "inactive"
                        ? Colors.red + "22"
                        : Colors.green + "22",
                  },
                ]}
                onPress={() => handleToggle(u.id, u.status || "active")}
              >
                <Text
                  style={[
                    styles.statusBtnText,
                    {
                      color:
                        u.status === "inactive" ? Colors.red : Colors.green,
                    },
                  ]}
                >
                  {u.status === "inactive" ? "Dondur." : "Aktif"}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: {
    fontSize: 28,
    color: Colors.text,
    lineHeight: 32,
    marginTop: -2,
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: Colors.text, flex: 1 },
  countBadge: {
    backgroundColor: Colors.accent + "22",
    borderColor: Colors.accent + "55",
    borderWidth: 1,
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  countText: { color: Colors.accent, fontSize: 13, fontWeight: "700" },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    margin: 16,
    height: 44,
    gap: 8,
  },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, fontSize: 14, color: Colors.text },
  searchClear: { fontSize: 12, color: Colors.text3 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { color: Colors.text2, fontSize: 15 },
  scroll: { flex: 1, paddingHorizontal: 16 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accent + "33",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 18, fontWeight: "700", color: Colors.accent },
  info: { flex: 1 },
  name: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 2,
  },
  email: { fontSize: 12, color: Colors.text2, marginBottom: 2 },
  meta: { fontSize: 11, color: Colors.text3 },
  statusBtn: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusBtnText: { fontSize: 11, fontWeight: "700" },
});
