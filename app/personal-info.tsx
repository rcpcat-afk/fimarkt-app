import AsyncStorage from "@react-native-async-storage/async-storage";
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
import { Colors } from "../constants";
import { getMyCustomer, updateMyCustomer } from "../src/services/sanatkat";

export default function PersonalInfoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("sanatkat_token");
      if (!token) return;
      const customer = await getMyCustomer(token);
      if (customer) {
        setFirstName(customer.first_name || "");
        setLastName(customer.last_name || "");
        setEmail(customer.email || "");
        setPhone(customer.billing?.phone || "");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("Eksik Bilgi", "Ad ve soyad zorunludur.");
      return;
    }
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem("sanatkat_token");
      if (!token) return;
      const result = await updateMyCustomer(token, {
        first_name: firstName,
        last_name: lastName,
        billing: { phone },
      });
      if (result) {
        Alert.alert("✅ Kaydedildi", "Bilgileriniz güncellendi.");
      } else {
        Alert.alert("Hata", "Güncellenemedi, tekrar deneyin.");
      }
    } catch (e) {
      Alert.alert("Hata", "Bir sorun oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const initials =
    `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase() || "?";

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Kişisel Bilgiler</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.avatarArea}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Ad</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Adınız"
              placeholderTextColor={Colors.text3}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Soyad</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Soyadınız"
              placeholderTextColor={Colors.text3}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>E-posta</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={email}
              editable={false}
              placeholderTextColor={Colors.text3}
            />
            <Text style={styles.inputHint}>E-posta değiştirilemez</Text>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Telefon</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="05XX XXX XX XX"
              placeholderTextColor={Colors.text3}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnLoading]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>
            {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  title: { fontSize: 17, fontWeight: "700", color: Colors.text },
  content: { paddingHorizontal: 24, paddingBottom: 40 },
  avatarArea: { alignItems: "center", marginVertical: 24 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 28, fontWeight: "800", color: "#fff" },
  form: { gap: 16, marginBottom: 24 },
  inputGroup: { gap: 6 },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Colors.text,
  },
  inputDisabled: { opacity: 0.5 },
  inputHint: { fontSize: 11, color: Colors.text3 },
  saveBtn: {
    backgroundColor: Colors.accent,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  saveBtnLoading: { opacity: 0.7 },
  saveBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
});
