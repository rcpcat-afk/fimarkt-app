// ─── Adreslerim — Premium Kargo Etiketi Tasarımı ────────────────────────────
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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
import { ILLER } from "../../constants/cities";
import { Colors } from "../../constants";
import { getMyCustomer, updateMyCustomer } from "../../src/services/api";

// ─── Tip ──────────────────────────────────────────────────────────────────────
type AddrType = "shipping" | "billing";
interface Addr {
  first_name: string;
  last_name: string;
  phone: string;
  city: string;
  state: string;
  postcode: string;
  address_1: string;
}

const EMPTY_ADDR: Addr = {
  first_name: "",
  last_name: "",
  phone: "",
  city: "",
  state: "",
  postcode: "",
  address_1: "",
};

const IL_LIST = Object.keys(ILLER).sort();

// ─── Kargo Etiketi Kartı ───────────────────────────────────────────────────
function AddressCard({
  type,
  addr,
  onEdit,
}: {
  type: AddrType;
  addr: Addr;
  onEdit: () => void;
}) {
  const isShipping = type === "shipping";
  const stripeColor = isShipping ? Colors.accent : Colors.success;
  const icon = isShipping ? "🚚" : "🧾";
  const label = isShipping ? "Teslimat Adresi" : "Fatura Adresi";
  const hasAddr = addr.address_1 && addr.city;

  return (
    <View style={[styles.addressCard, { borderLeftColor: stripeColor, borderLeftWidth: 3 }]}>
      {/* Üst: ikon + başlık + düzenle */}
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.cardIcon}>{icon}</Text>
          <View>
            <Text style={styles.cardLabel}>{label}</Text>
            {isShipping && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>Varsayılan</Text>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity style={styles.editBtn} onPress={onEdit}>
          <Text style={styles.editBtnText}>{hasAddr ? "Düzenle" : "+ Ekle"}</Text>
        </TouchableOpacity>
      </View>

      {/* İçerik */}
      {hasAddr ? (
        <View style={styles.cardBody}>
          <Text style={styles.cardName}>
            {addr.first_name} {addr.last_name}
          </Text>
          {addr.phone ? (
            <Text style={styles.cardDetail}>📞 {addr.phone}</Text>
          ) : null}
          <Text style={styles.cardDetail}>
            {addr.address_1}
            {addr.state ? `, ${addr.state}` : ""}
            {` / ${addr.city}`}
            {addr.postcode ? ` ${addr.postcode}` : ""}
          </Text>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Henüz adres eklenmemiş</Text>
          <Text style={styles.emptyHint}>
            {isShipping
              ? "Siparişlerinizin gönderileceği adresi ekleyin"
              : "Faturanızın gönderileceği adresi ekleyin"}
          </Text>
        </View>
      )}
    </View>
  );
}

// ─── İl/İlçe Picker Row ───────────────────────────────────────────────────────
function CityRow({
  selectedIl,
  selectedIlce,
  onIlChange,
  onIlceChange,
}: {
  selectedIl: string;
  selectedIlce: string;
  onIlChange: (il: string) => void;
  onIlceChange: (ilce: string) => void;
}) {
  const [ilOpen, setIlOpen] = useState(false);
  const [ilceOpen, setIlceOpen] = useState(false);
  const ilceler = selectedIl ? (ILLER[selectedIl] ?? []) : [];

  return (
    <View style={{ gap: 12 }}>
      {/* İl */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Şehir (İl) *</Text>
        <TouchableOpacity
          style={styles.pickerBtn}
          onPress={() => { setIlOpen(!ilOpen); setIlceOpen(false); }}
        >
          <Text style={[styles.pickerText, !selectedIl && { color: Colors.text3 }]}>
            {selectedIl || "Şehir seçin..."}
          </Text>
          <Text style={styles.pickerChevron}>{ilOpen ? "▲" : "▼"}</Text>
        </TouchableOpacity>
        {ilOpen && (
          <ScrollView style={styles.dropdown} nestedScrollEnabled>
            {IL_LIST.map(il => (
              <TouchableOpacity
                key={il}
                style={[styles.dropdownItem, selectedIl === il && styles.dropdownItemActive]}
                onPress={() => {
                  onIlChange(il);
                  onIlceChange("");
                  setIlOpen(false);
                }}
              >
                <Text style={[styles.dropdownText, selectedIl === il && { color: Colors.accent }]}>
                  {il}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* İlçe */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>İlçe</Text>
        <TouchableOpacity
          style={[styles.pickerBtn, !selectedIl && { opacity: 0.4 }]}
          onPress={() => { if (!selectedIl) return; setIlceOpen(!ilceOpen); setIlOpen(false); }}
          disabled={!selectedIl}
        >
          <Text style={[styles.pickerText, !selectedIlce && { color: Colors.text3 }]}>
            {selectedIlce || (selectedIl ? "İlçe seçin..." : "Önce şehir seçin")}
          </Text>
          <Text style={styles.pickerChevron}>{ilceOpen ? "▲" : "▼"}</Text>
        </TouchableOpacity>
        {ilceOpen && (
          <ScrollView style={styles.dropdown} nestedScrollEnabled>
            {ilceler.map(ilce => (
              <TouchableOpacity
                key={ilce}
                style={[styles.dropdownItem, selectedIlce === ilce && styles.dropdownItemActive]}
                onPress={() => { onIlceChange(ilce); setIlceOpen(false); }}
              >
                <Text style={[styles.dropdownText, selectedIlce === ilce && { color: Colors.accent }]}>
                  {ilce}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

// ─── Ana Ekran ─────────────────────────────────────────────────────────────────
export default function AddressesScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [showForm, setShowForm]     = useState(false);
  const [editType, setEditType]     = useState<AddrType>("shipping");
  const [billing, setBilling]       = useState<Addr>(EMPTY_ADDR);
  const [shipping, setShipping]     = useState<Addr>(EMPTY_ADDR);
  const [form, setForm]             = useState<Addr>(EMPTY_ADDR);

  useEffect(() => { loadAddresses(); }, []);

  const loadAddresses = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("fimarkt_token");
      if (!token) return;
      const customer = await getMyCustomer(token);
      if (customer) {
        setBilling({ ...EMPTY_ADDR, ...(customer.billing  ?? {}) });
        setShipping({ ...EMPTY_ADDR, ...(customer.shipping ?? {}) });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (type: AddrType) => {
    setEditType(type);
    setForm(type === "billing" ? { ...billing } : { ...shipping });
    setShowForm(true);
  };

  const updateForm = (key: keyof Addr, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!form.first_name || !form.last_name || !form.city || !form.address_1) {
      Alert.alert("Eksik Bilgi", "Ad, soyad, şehir ve açık adres zorunludur.");
      return;
    }
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem("fimarkt_token");
      if (!token) return;
      const payload =
        editType === "billing"
          ? { billing: { ...form, country: "TR" } }
          : { shipping: { ...form, country: "TR" } };
      const result = await updateMyCustomer(token, payload);
      if (result) {
        if (editType === "billing") setBilling({ ...form });
        else setShipping({ ...form });
        setShowForm(false);
        Alert.alert("✅ Kaydedildi", "Adres bilgileriniz güncellendi.");
      } else {
        Alert.alert("Hata", "Adres kaydedilemedi, tekrar deneyin.");
      }
    } catch {
      Alert.alert("Hata", "Bir sorun oluştu.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="light-content" />
      <View style={[styles.container, { paddingTop: insets.top }]}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => { if (showForm) setShowForm(false); else router.back(); }}
            style={styles.backBtn}
          >
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {showForm
              ? (editType === "shipping" ? "Teslimat Adresi" : "Fatura Adresi")
              : "Adreslerim"}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {showForm ? (
            /* ── FORM ── */
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>
                {editType === "shipping" ? "🚚 Teslimat Adresi" : "🧾 Fatura Adresi"}
              </Text>

              {/* Ad / Soyad */}
              <View style={styles.row2}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Ad *</Text>
                  <TextInput
                    style={styles.input}
                    value={form.first_name}
                    onChangeText={v => updateForm("first_name", v)}
                    placeholder="Adınız"
                    placeholderTextColor={Colors.text3}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Soyad *</Text>
                  <TextInput
                    style={styles.input}
                    value={form.last_name}
                    onChangeText={v => updateForm("last_name", v)}
                    placeholder="Soyadınız"
                    placeholderTextColor={Colors.text3}
                  />
                </View>
              </View>

              {/* Telefon */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Telefon</Text>
                <TextInput
                  style={styles.input}
                  value={form.phone}
                  onChangeText={v => updateForm("phone", v)}
                  placeholder="05XX XXX XX XX"
                  placeholderTextColor={Colors.text3}
                  keyboardType="phone-pad"
                />
              </View>

              {/* İl / İlçe cascade */}
              <CityRow
                selectedIl={form.city}
                selectedIlce={form.state}
                onIlChange={il => updateForm("city", il)}
                onIlceChange={ilce => updateForm("state", ilce)}
              />

              {/* Posta Kodu */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Posta Kodu</Text>
                <TextInput
                  style={styles.input}
                  value={form.postcode}
                  onChangeText={v => updateForm("postcode", v)}
                  placeholder="34000"
                  placeholderTextColor={Colors.text3}
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>

              {/* Açık Adres */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Açık Adres *</Text>
                <TextInput
                  style={[styles.input, styles.inputMultiline]}
                  value={form.address_1}
                  onChangeText={v => updateForm("address_1", v)}
                  placeholder="Mahalle, sokak, bina no, daire..."
                  placeholderTextColor={Colors.text3}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              {/* Kaydet / İptal */}
              <View style={styles.formActions}>
                <TouchableOpacity
                  style={[styles.btn, styles.btnSecondary]}
                  onPress={() => setShowForm(false)}
                >
                  <Text style={styles.btnSecondaryText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btn, styles.btnPrimary, saving && { opacity: 0.7 }]}
                  onPress={handleSave}
                  disabled={saving}
                >
                  <Text style={styles.btnPrimaryText}>
                    {saving ? "Kaydediliyor..." : "Kaydet"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* ── KARTLAR ── */
            <View style={{ gap: 14 }}>
              <AddressCard type="shipping" addr={shipping} onEdit={() => handleEdit("shipping")} />
              <AddressCard type="billing"  addr={billing}  onEdit={() => handleEdit("billing")} />

              {/* WooCommerce notu */}
              <View style={styles.infoNote}>
                <Text style={styles.infoNoteIcon}>ℹ️</Text>
                <Text style={styles.infoNoteText}>
                  Her hesap için 1 teslimat ve 1 fatura adresi kaydedilebilir.
                </Text>
              </View>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Stiller ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surface2,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: "center", justifyContent: "center",
  },
  backArrow: { fontSize: 28, color: Colors.text, lineHeight: 32, marginTop: -2 },
  headerTitle: { fontSize: 17, fontWeight: "700", color: Colors.text },

  content: { paddingHorizontal: 16, paddingBottom: 40 },

  // ── Address Card ──
  addressCard: {
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 10,
  },
  cardHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  cardIcon: { fontSize: 22 },
  cardLabel:  { fontSize: 13, fontWeight: "700", color: Colors.text },
  defaultBadge: {
    marginTop: 3,
    backgroundColor: `${Colors.success}22`,
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: "flex-start",
  },
  defaultBadgeText: { fontSize: 10, fontWeight: "700", color: Colors.success },
  editBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bg,
  },
  editBtnText: { fontSize: 12, fontWeight: "600", color: Colors.accent },
  cardBody: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 3,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  cardName:   { fontSize: 14, fontWeight: "600", color: Colors.text, marginTop: 10 },
  cardDetail: { fontSize: 12, color: Colors.text2, lineHeight: 18 },
  emptyState: {
    paddingHorizontal: 14,
    paddingBottom: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: "center",
  },
  emptyText: { fontSize: 13, fontWeight: "600", color: Colors.text3 },
  emptyHint: { fontSize: 11, color: Colors.text3, marginTop: 4, textAlign: "center" },

  // ── Form ──
  formCard: {
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  formTitle: { fontSize: 15, fontWeight: "700", color: Colors.text },
  row2: { flexDirection: "row", gap: 10 },
  inputGroup: { gap: 6 },
  inputLabel: {
    fontSize: 10, fontWeight: "700", color: Colors.text2,
    textTransform: "uppercase", letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Colors.bg,
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: 10, padding: 12,
    fontSize: 14, color: Colors.text,
  },
  inputMultiline: { minHeight: 80 },

  // ── Picker (il/ilçe) ──
  pickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.bg,
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: 10, padding: 12,
  },
  pickerText:    { fontSize: 14, color: Colors.text, flex: 1 },
  pickerChevron: { fontSize: 10, color: Colors.text2 },
  dropdown: {
    maxHeight: 180,
    backgroundColor: Colors.surface2,
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: 10, marginTop: 4,
  },
  dropdownItem: {
    paddingHorizontal: 14, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  dropdownItemActive: { backgroundColor: `${Colors.accent}15` },
  dropdownText: { fontSize: 13, color: Colors.text },

  // ── Buttons ──
  formActions: { flexDirection: "row", gap: 10, marginTop: 4 },
  btn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  btnPrimary: { backgroundColor: Colors.accent },
  btnPrimaryText: { fontSize: 15, fontWeight: "700", color: "#fff" },
  btnSecondary: {
    backgroundColor: Colors.bg,
    borderWidth: 1, borderColor: Colors.border,
  },
  btnSecondaryText: { fontSize: 15, fontWeight: "600", color: Colors.text2 },

  // ── Info Note ──
  infoNote: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: Colors.surface2,
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: 12, padding: 12,
  },
  infoNoteIcon: { fontSize: 14 },
  infoNoteText: { flex: 1, fontSize: 11, color: Colors.text2, lineHeight: 17 },
});
