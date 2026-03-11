import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../constants";
import { getMyCustomer, updateMyCustomer } from "../src/services/sanatkat";

export default function AddressesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingType, setEditingType] = useState<"billing" | "shipping" | null>(
    null,
  );

  const [billing, setBilling] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    city: "",
    state: "",
    postcode: "",
    address_1: "",
  });
  const [shipping, setShipping] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    city: "",
    state: "",
    postcode: "",
    address_1: "",
  });

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    city: "",
    state: "",
    postcode: "",
    address_1: "",
  });

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("sanatkat_token");
      if (!token) return;
      const customer = await getMyCustomer(token);
      if (customer) {
        setBilling(customer.billing || {});
        setShipping(customer.shipping || {});
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (type: "billing" | "shipping") => {
    setEditingType(type);
    setForm(type === "billing" ? billing : shipping);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.first_name || !form.last_name || !form.city || !form.address_1) {
      Alert.alert("Eksik Bilgi", "Zorunlu alanları doldurun.");
      return;
    }
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem("sanatkat_token");
      if (!token) return;
      const updateData =
        editingType === "billing"
          ? { billing: { ...form, country: "TR" } }
          : { shipping: { ...form, country: "TR" } };
      const result = await updateMyCustomer(token, updateData);
      if (result) {
        if (editingType === "billing") setBilling(form);
        else setShipping(form);
        setShowForm(false);
        Alert.alert("✅ Kaydedildi", "Adres bilgileriniz güncellendi.");
      } else {
        Alert.alert("Hata", "Adres kaydedilemedi.");
      }
    } catch (e) {
      Alert.alert("Hata", "Bir sorun oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const updateForm = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const hasAddress = (addr: any) => addr?.address_1 && addr?.city;

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Adreslerim</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {showForm ? (
          <View style={styles.form}>
            <Text style={styles.formTitle}>
              {editingType === "billing" ? "Fatura Adresi" : "Teslimat Adresi"}
            </Text>
            {[
              { label: "Ad *", key: "first_name", placeholder: "Adınız" },
              { label: "Soyad *", key: "last_name", placeholder: "Soyadınız" },
              { label: "Telefon", key: "phone", placeholder: "05XX XXX XX XX" },
              { label: "Şehir *", key: "city", placeholder: "İstanbul" },
              { label: "İlçe", key: "state", placeholder: "Kadıköy" },
              { label: "Posta Kodu", key: "postcode", placeholder: "34000" },
              {
                label: "Açık Adres *",
                key: "address_1",
                placeholder: "Mahalle, sokak, no...",
              },
            ].map((field) => (
              <View key={field.key} style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{field.label}</Text>
                <TextInput
                  style={styles.input}
                  value={(form as any)[field.key]}
                  onChangeText={(v) => updateForm(field.key, v)}
                  placeholder={field.placeholder}
                  placeholderTextColor={Colors.text3}
                />
              </View>
            ))}
            <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  {
                    flex: 1,
                    backgroundColor: Colors.surface2,
                    borderWidth: 1,
                    borderColor: Colors.border,
                  },
                ]}
                onPress={() => setShowForm(false)}
              >
                <Text style={[styles.saveBtnText, { color: Colors.text2 }]}>
                  İptal
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, { flex: 2, opacity: saving ? 0.7 : 1 }]}
                onPress={handleSave}
                disabled={saving}
              >
                <Text style={styles.saveBtnText}>
                  {saving ? "Kaydediliyor..." : "Kaydet"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            {/* Teslimat Adresi */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Teslimat Adresi</Text>
              <TouchableOpacity onPress={() => handleEdit("shipping")}>
                <Text style={styles.editText}>
                  {hasAddress(shipping) ? "Düzenle" : "+ Ekle"}
                </Text>
              </TouchableOpacity>
            </View>
            {hasAddress(shipping) ? (
              <View style={styles.card}>
                <Text style={styles.cardName}>
                  {shipping.first_name} {shipping.last_name}
                </Text>
                {shipping.phone ? (
                  <Text style={styles.cardPhone}>{shipping.phone}</Text>
                ) : null}
                <Text style={styles.cardAddress}>
                  {shipping.address_1}
                  {shipping.state ? `, ${shipping.state}` : ""}
                  {` / ${shipping.city}`}
                  {shipping.postcode ? ` ${shipping.postcode}` : ""}
                </Text>
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyCardText}>
                  Teslimat adresi eklenmemiş
                </Text>
              </View>
            )}

            {/* Fatura Adresi */}
            <View style={[styles.sectionHeader, { marginTop: 20 }]}>
              <Text style={styles.sectionTitle}>Fatura Adresi</Text>
              <TouchableOpacity onPress={() => handleEdit("billing")}>
                <Text style={styles.editText}>
                  {hasAddress(billing) ? "Düzenle" : "+ Ekle"}
                </Text>
              </TouchableOpacity>
            </View>
            {hasAddress(billing) ? (
              <View style={styles.card}>
                <Text style={styles.cardName}>
                  {billing.first_name} {billing.last_name}
                </Text>
                {billing.phone ? (
                  <Text style={styles.cardPhone}>{billing.phone}</Text>
                ) : null}
                <Text style={styles.cardAddress}>
                  {billing.address_1}
                  {billing.state ? `, ${billing.state}` : ""}
                  {` / ${billing.city}`}
                  {billing.postcode ? ` ${billing.postcode}` : ""}
                </Text>
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyCardText}>
                  Fatura adresi eklenmemiş
                </Text>
              </View>
            )}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: { fontSize: 17, fontWeight: "700", color: Colors.text },
  content: { paddingHorizontal: 24, paddingBottom: 40 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  container: { flex: 1, backgroundColor: Colors.bg },
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
  sectionTitle: { fontSize: 14, fontWeight: "700", color: Colors.text },
  editText: { fontSize: 13, color: Colors.accent, fontWeight: "600" },
  card: {
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 4,
  },
  cardName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  cardPhone: { fontSize: 12, color: Colors.text2, marginBottom: 4 },
  cardAddress: { fontSize: 12, color: Colors.text2, lineHeight: 18 },
  emptyCard: {
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  emptyCardText: { fontSize: 13, color: Colors.text3 },
  form: {
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  formTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },
  inputGroup: { gap: 6 },
  inputLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.text2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: Colors.text,
  },
  saveBtn: {
    backgroundColor: Colors.accent,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  saveBtnText: { fontSize: 15, fontWeight: "700", color: "#fff" },
});
