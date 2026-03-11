import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
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
import { createOrder, getMyCustomer } from "../src/services/sanatkat";
import { useCart } from "../src/store/CartContext";

export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { items, totalItems, totalPrice, clearCart } = useCart();

  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [savedAddress, setSavedAddress] = useState<any>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address_1: "",
    city: "",
    state: "",
    postcode: "",
  });

  useEffect(() => {
    loadSavedAddress();
  }, []);

  const loadSavedAddress = async () => {
    try {
      const token = await AsyncStorage.getItem("sanatkat_token");
      if (!token) {
        setLoading(false);
        return;
      }
      const customer = await getMyCustomer(token);
      if (customer?.shipping?.address_1 && customer?.shipping?.city) {
        setSavedAddress(customer.shipping);
        setForm({
          first_name: customer.shipping.first_name || "",
          last_name: customer.shipping.last_name || "",
          email: customer.billing?.email || customer.email || "",
          phone: customer.billing?.phone || "",
          address_1: customer.shipping.address_1 || "",
          city: customer.shipping.city || "",
          state: customer.shipping.state || "",
          postcode: customer.shipping.postcode || "",
        });
      } else {
        setUseNewAddress(true);
      }
    } catch (e) {
      setUseNewAddress(true);
    } finally {
      setLoading(false);
    }
  };

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const canSubmit = () => {
    if (useNewAddress) {
      return !!(
        form.first_name &&
        form.last_name &&
        form.email &&
        form.phone &&
        form.address_1 &&
        form.city
      );
    }
    return !!savedAddress;
  };

  const handleOrder = async () => {
    if (!canSubmit()) {
      Alert.alert("Eksik Bilgi", "Lütfen adres bilgilerini doldurun.");
      return;
    }
    Alert.alert(
      "Siparişi Onayla",
      `${totalItems} ürün, ${totalPrice.toLocaleString("tr-TR")}₺\n\nÖdeme: Banka Havalesi / EFT`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sipariş Ver",
          onPress: async () => {
            setOrdering(true);
            try {
              const token = await AsyncStorage.getItem("sanatkat_token");
              if (!token) {
                Alert.alert("Hata", "Lütfen önce giriş yapın.");
                return;
              }
              const billing = useNewAddress
                ? {
                    first_name: form.first_name,
                    last_name: form.last_name,
                    email: form.email,
                    phone: form.phone,
                    address_1: form.address_1,
                    city: form.city,
                    state: form.state,
                    postcode: form.postcode,
                    country: "TR",
                  }
                : {
                    first_name: savedAddress.first_name,
                    last_name: savedAddress.last_name,
                    email: form.email || savedAddress.email || "",
                    phone: form.phone || savedAddress.phone || "",
                    address_1: savedAddress.address_1,
                    city: savedAddress.city,
                    state: savedAddress.state || "",
                    postcode: savedAddress.postcode || "",
                    country: "TR",
                  };
              const orderItems = items.map((item) => ({
                product_id: item.product.id,
                quantity: item.quantity,
              }));
              const order = await createOrder(token, orderItems, billing);
              if (order) {
                clearCart();
                Alert.alert(
                  "✅ Sipariş Alındı!",
                  `Sipariş No: #${order.number}\n\nHavale bilgileri e-posta ile gönderilecek.`,
                  [
                    {
                      text: "Siparişlerime Git",
                      onPress: () => router.replace("/(tabs)/orders"),
                    },
                  ],
                );
              } else {
                Alert.alert("Hata", "Sipariş oluşturulamadı, tekrar deneyin.");
              }
            } catch (e) {
              Alert.alert("Hata", "Bir sorun oluştu.");
            } finally {
              setOrdering(false);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View
        style={[
          styles.safe,
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
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sipariş Bilgileri</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>Sipariş Özeti</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{totalItems} ürün</Text>
              <Text style={styles.summaryValue}>
                {totalPrice.toLocaleString("tr-TR")}₺
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Ödeme</Text>
              <Text style={styles.summaryValue}>Banka Havalesi</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Teslimat Adresi</Text>

          {savedAddress && !useNewAddress && (
            <View style={styles.savedAddrBox}>
              <View style={styles.savedAddrHeader}>
                <Text style={styles.savedAddrIcon}>📍</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.savedAddrName}>
                    {savedAddress.first_name} {savedAddress.last_name}
                  </Text>
                  <Text style={styles.savedAddrText}>
                    {savedAddress.address_1}
                    {savedAddress.state ? `, ${savedAddress.state}` : ""}
                    {` / ${savedAddress.city}`}
                  </Text>
                </View>
                <View style={styles.checkMark}>
                  <Text
                    style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}
                  >
                    ✓
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.changeAddrBtn}
                onPress={() => setUseNewAddress(true)}
              >
                <Text style={styles.changeAddrText}>Farklı adres kullan</Text>
              </TouchableOpacity>
            </View>
          )}

          {useNewAddress && (
            <>
              {savedAddress && (
                <TouchableOpacity
                  style={styles.useSavedBtn}
                  onPress={() => setUseNewAddress(false)}
                >
                  <Text style={styles.useSavedText}>
                    ← Kayıtlı adresi kullan
                  </Text>
                </TouchableOpacity>
              )}
              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Ad *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Adınız"
                    placeholderTextColor={Colors.text3}
                    value={form.first_name}
                    onChangeText={(v) => update("first_name", v)}
                  />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Soyad *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Soyadınız"
                    placeholderTextColor={Colors.text3}
                    value={form.last_name}
                    onChangeText={(v) => update("last_name", v)}
                  />
                </View>
              </View>
              <Text style={styles.label}>E-posta *</Text>
              <TextInput
                style={styles.input}
                placeholder="ornek@email.com"
                placeholderTextColor={Colors.text3}
                keyboardType="email-address"
                autoCapitalize="none"
                value={form.email}
                onChangeText={(v) => update("email", v)}
              />
              <Text style={styles.label}>Telefon *</Text>
              <TextInput
                style={styles.input}
                placeholder="05XX XXX XX XX"
                placeholderTextColor={Colors.text3}
                keyboardType="phone-pad"
                value={form.phone}
                onChangeText={(v) => update("phone", v)}
              />
              <Text style={styles.label}>Adres *</Text>
              <TextInput
                style={[styles.input, styles.addressInput]}
                placeholder="Mahalle, sokak, bina no, daire..."
                placeholderTextColor={Colors.text3}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                value={form.address_1}
                onChangeText={(v) => update("address_1", v)}
              />
              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Şehir *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="İstanbul"
                    placeholderTextColor={Colors.text3}
                    value={form.city}
                    onChangeText={(v) => update("city", v)}
                  />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Posta Kodu</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="34000"
                    placeholderTextColor={Colors.text3}
                    keyboardType="numeric"
                    value={form.postcode}
                    onChangeText={(v) => update("postcode", v)}
                  />
                </View>
              </View>
            </>
          )}

          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>🏦</Text>
            <Text style={styles.infoText}>
              Siparişiniz oluşturulduktan sonra havale bilgileri e-posta
              adresinize gönderilecektir.
            </Text>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[
            styles.orderBtn,
            { backgroundColor: canSubmit() ? Colors.accent : Colors.surface2 },
            ordering && { opacity: 0.7 },
          ]}
          onPress={handleOrder}
          disabled={!canSubmit() || ordering}
          activeOpacity={0.85}
        >
          <Text style={styles.orderBtnText}>
            {ordering
              ? "Sipariş Oluşturuluyor..."
              : `Sipariş Ver — ${totalPrice.toLocaleString("tr-TR")}₺`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: "space-between",
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
  headerTitle: { fontSize: 18, fontWeight: "700", color: Colors.text },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 12 },
  summaryBox: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 24,
    gap: 8,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryLabel: { fontSize: 13, color: Colors.text2 },
  summaryValue: { fontSize: 13, fontWeight: "600", color: Colors.text },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 12,
  },
  savedAddrBox: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.accent + "44",
    padding: 14,
    marginBottom: 16,
  },
  savedAddrHeader: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  savedAddrIcon: { fontSize: 18, marginTop: 2 },
  savedAddrName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  savedAddrText: { fontSize: 12, color: Colors.text2, lineHeight: 18 },
  checkMark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.accent,
    justifyContent: "center",
    alignItems: "center",
  },
  changeAddrBtn: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
    alignItems: "center",
  },
  changeAddrText: { fontSize: 12, color: Colors.text2 },
  useSavedBtn: { marginBottom: 14 },
  useSavedText: { fontSize: 13, color: Colors.accent },
  row: { flexDirection: "row", gap: 12 },
  halfInput: { flex: 1 },
  label: { fontSize: 12, color: Colors.text2, marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    fontSize: 14,
    color: Colors.text,
  },
  addressInput: { minHeight: 80, lineHeight: 20 },
  infoBox: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    gap: 10,
    alignItems: "flex-start",
    marginTop: 20,
  },
  infoIcon: { fontSize: 20 },
  infoText: { flex: 1, fontSize: 12, color: Colors.text2, lineHeight: 18 },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: Colors.bg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  orderBtn: { borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  orderBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
