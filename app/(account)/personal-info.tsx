// ─── Hesap Ayarları — Kişisel Bilgiler (App) ─────────────────────────────────
// 3 kart: Profil | İletişim & Güvenlik | Fatura Bilgileri
// Inline editing: her satırda kalem butonu → TextInput + Kaydet/İptal (per-field)
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { type ThemeColors } from "../../constants/theme";
import { useTheme } from "../../hooks/useTheme";
import { getMyCustomer, updateMyCustomer } from "../../src/services/api";

// ─── buildC helper ─────────────────────────────────────────────────────────────
function buildC(colors: ThemeColors) {
  return {
    ...colors,
    bg:    colors.background,
    text:  colors.foreground,
    text2: colors.mutedForeground,
    text3: colors.subtleForeground,
  };
}
type AliasedColors = ReturnType<typeof buildC>;

// ─── createStyles factory ──────────────────────────────────────────────────────
function createStyles(C: AliasedColors) {
  return StyleSheet.create({
    container:   { flex: 1, backgroundColor: C.bg },

    // Header
    header: {
      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      paddingHorizontal: 16, paddingVertical: 12,
    },
    backBtn: {
      width: 40, height: 40, borderRadius: 20,
      backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border,
      alignItems: "center", justifyContent: "center",
    },
    backArrow:   { fontSize: 28, color: C.text, lineHeight: 32, marginTop: -2 },
    headerTitle: { fontSize: 17, fontWeight: "700", color: C.text },

    scrollContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 },

    // Card
    card: {
      backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border,
      borderRadius: 20, overflow: "hidden", marginBottom: 14,
    },
    cardHeader: {
      flexDirection: "row", alignItems: "center", gap: 10,
      paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border,
    },
    cardHeaderIcon:  { fontSize: 15 },
    cardHeaderTitle: { fontSize: 13, fontWeight: "700", color: C.text },
    cardBody:        { paddingHorizontal: 16 },

    // Avatar
    avatarArea: { alignItems: "center", paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: C.border },
    avatarWrap: { position: "relative" },
    avatar: {
      width: 76, height: 76, borderRadius: 20,
      backgroundColor: C.accent, alignItems: "center", justifyContent: "center",
    },
    avatarText:        { fontSize: 26, fontWeight: "800", color: "#fff" },
    avatarOverlay: {
      position: "absolute", inset: 0 as any, borderRadius: 20,
      backgroundColor: "rgba(0,0,0,0.45)", alignItems: "center", justifyContent: "center",
    },
    avatarOverlayText: { fontSize: 18 },
    avatarHint:        { fontSize: 11, color: C.text3, marginTop: 8 },

    // Row
    row:       { paddingVertical: 14 },
    rowBorder: { borderBottomWidth: 1, borderBottomColor: C.border },

    rowReadMode:  { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
    rowReadLeft:  { flex: 1, minWidth: 0 },
    rowReadRight: { flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 0 },

    rowLabel: { fontSize: 10, fontWeight: "700", color: C.text3, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 2 },
    rowValue: { fontSize: 14, fontWeight: "600", color: C.text },

    editBtn:     { width: 32, height: 32, borderRadius: 10, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, alignItems: "center", justifyContent: "center" },
    editBtnIcon: { fontSize: 13 },

    lockedBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 99, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
    lockedBadgeText: { fontSize: 12 },

    savedText: { fontSize: 10, fontWeight: "700", color: "#22c55e" },

    // Badges
    verifiedBadge:     { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 99, backgroundColor: "#22c55e" + "18", borderWidth: 1, borderColor: "#22c55e" + "30" },
    verifiedBadgeText: { fontSize: 10, fontWeight: "700", color: "#22c55e" },
    comingSoonBadge:   { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 99, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
    comingSoonBadgeText: { fontSize: 10, fontWeight: "700", color: C.text3 },

    // Edit mode
    rowEditMode: { gap: 8 },
    input: {
      backgroundColor: C.surface, borderWidth: 1.5, borderColor: C.border,
      borderRadius: 12, padding: 12, fontSize: 14, color: C.text,
    },
    inputError: { borderColor: "#ef4444" },
    errorText:  { fontSize: 11, color: "#ef4444" },
    rowActions: { flexDirection: "row", gap: 8 },
    actionBtn:  { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center" },
    actionBtnSave:       { backgroundColor: C.accent },
    actionBtnCancel:     { backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border },
    actionBtnDisabled:   { opacity: 0.6 },
    actionBtnSaveText:   { fontSize: 12, fontWeight: "700", color: "#fff" },
    actionBtnCancelText: { fontSize: 12, fontWeight: "700", color: C.text2 },

    // Password accordion
    accordionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    accordionBtn:    { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
    accordionBtnActive: { backgroundColor: C.accent + "15", borderColor: C.accent + "30" },
    accordionBtnText: { fontSize: 11, fontWeight: "700", color: C.text2 },
    accordionBtnTextActive: { color: C.accent },
    accordionBody:   { marginTop: 14, gap: 12 },
    pwField:         { gap: 6 },
    saveAllBtn:      { backgroundColor: C.accent, paddingVertical: 13, borderRadius: 12, alignItems: "center" },
    saveAllBtnDisabled: { opacity: 0.6 },
    saveAllBtnText:  { fontSize: 14, fontWeight: "700", color: "#fff" },

    // Billing
    maskedBadge:     { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 99, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
    maskedBadgeText: { fontSize: 10, color: C.text3 },
    efaturaButtons:  { flexDirection: "row", gap: 8 },
    efaturaBtn:      { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
    efaturaBtnActive:{ backgroundColor: C.accent + "18", borderColor: C.accent + "35" },
    efaturaBtnText:  { fontSize: 12, fontWeight: "700", color: C.text2 },
    efaturaBtnTextActive: { color: C.accent },
    infoNote: { marginTop: 4, marginBottom: 8, padding: 10, borderRadius: 12, backgroundColor: "#f59e0b" + "10", borderWidth: 1, borderColor: "#f59e0b" + "25" },
    infoNoteText: { fontSize: 11, color: C.text2, lineHeight: 16 },
  });
}

// ─── Validation (sade, Alert tabanlı) ────────────────────────────────────────
const validate = {
  name:  (v: string) => v.trim().length >= 2  ? null : "En az 2 karakter girin",
  phone: (v: string) => /^(05|5)\d{9}$/.test(v) || v === "" ? null : "05XX XXX XX XX formatında girin",
  password: (current: string, next: string, confirm: string) => {
    if (!current.trim()) return "Mevcut şifrenizi girin";
    if (next.length < 8)  return "Yeni şifre en az 8 karakter olmalı";
    if (!/[A-Z]/.test(next)) return "En az 1 büyük harf içermeli";
    if (!/[0-9]/.test(next)) return "En az 1 rakam içermeli";
    if (next !== confirm)    return "Şifreler eşleşmiyor";
    return null;
  },
  company:    (v: string) => v.trim().length >= 2 ? null : "En az 2 karakter girin",
  vergiNo:    (v: string) => /^\d{10}$/.test(v)  ? null : "10 haneli vergi numarası girin",
  vergiDairesi: (v: string) => v.trim().length >= 2 ? null : "En az 2 karakter girin",
};

// ─── AppCard ──────────────────────────────────────────────────────────────────
function AppCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  const C      = useMemo(() => buildC(colors), [colors]);
  const styles = useMemo(() => createStyles(C), [C]);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardHeaderIcon}>{icon}</Text>
        <Text style={styles.cardHeaderTitle}>{title}</Text>
      </View>
      <View style={styles.cardBody}>{children}</View>
    </View>
  );
}

// ─── InlineRow ────────────────────────────────────────────────────────────────
// Read mod: etiket + değer + kalem ikon | Edit mod: TextInput + Kaydet/İptal
interface InlineRowProps {
  label:       string;
  value:       string;
  onSave:      (v: string) => Promise<void>;
  validate?:   (v: string) => string | null;
  keyboardType?: "default" | "phone-pad" | "numeric" | "email-address";
  secureTextEntry?: boolean;
  placeholder?: string;
  isLast?:     boolean;
  badge?:      React.ReactNode;
  locked?:     boolean;
}

function InlineRow({
  label, value, onSave, validate: validateFn,
  keyboardType = "default", secureTextEntry = false,
  placeholder, isLast, badge, locked,
}: InlineRowProps) {
  const { colors } = useTheme();
  const C      = useMemo(() => buildC(colors), [colors]);
  const styles = useMemo(() => createStyles(C), [C]);

  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const [error, setError]           = useState<string | null>(null);
  const [saving, setSaving]         = useState(false);
  const [savedOk, setSavedOk]       = useState(false);

  const handleSave = async () => {
    if (validateFn) {
      const err = validateFn(localValue);
      if (err) { setError(err); return; }
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(localValue);
      setSavedOk(true);
      setIsEditing(false);
      setTimeout(() => setSavedOk(false), 2500);
    } catch {
      setError("Kaydedilemedi, tekrar deneyin.");
    }
    setSaving(false);
  };

  const handleCancel = () => {
    setLocalValue(value);
    setError(null);
    setIsEditing(false);
  };

  return (
    <View style={[styles.row, !isLast && styles.rowBorder]}>
      {!isEditing ? (
        <View style={styles.rowReadMode}>
          <View style={styles.rowReadLeft}>
            <Text style={styles.rowLabel}>{label}</Text>
            <Text style={styles.rowValue} numberOfLines={1}>{value || "—"}</Text>
          </View>
          <View style={styles.rowReadRight}>
            {savedOk && <Text style={styles.savedText}>✓ Kaydedildi</Text>}
            {badge}
            {!locked && (
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => { setLocalValue(value); setIsEditing(true); }}
              >
                <Text style={styles.editBtnIcon}>✏️</Text>
              </TouchableOpacity>
            )}
            {locked && (
              <View style={styles.lockedBadge}>
                <Text style={styles.lockedBadgeText}>🔒</Text>
              </View>
            )}
          </View>
        </View>
      ) : (
        <View style={styles.rowEditMode}>
          <Text style={styles.rowLabel}>{label}</Text>
          <TextInput
            style={[styles.input, error ? styles.inputError : null]}
            value={localValue}
            onChangeText={(t) => { setLocalValue(t); setError(null); }}
            keyboardType={keyboardType}
            secureTextEntry={secureTextEntry}
            placeholder={placeholder}
            placeholderTextColor={C.text3}
            autoFocus
          />
          {error && <Text style={styles.errorText}>{error}</Text>}
          <View style={styles.rowActions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnSave, saving && styles.actionBtnDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.actionBtnSaveText}>{saving ? "..." : "Kaydet"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.actionBtnCancel]} onPress={handleCancel}>
              <Text style={styles.actionBtnCancelText}>İptal</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

// ─── Rozet Bileşenleri ────────────────────────────────────────────────────────
const VerifiedBadge = () => {
  const { colors } = useTheme();
  const C      = useMemo(() => buildC(colors), [colors]);
  const styles = useMemo(() => createStyles(C), [C]);
  return (
    <View style={styles.verifiedBadge}>
      <Text style={styles.verifiedBadgeText}>✓ Doğrulandı</Text>
    </View>
  );
};

const ComingSoonBadge = () => {
  const { colors } = useTheme();
  const C      = useMemo(() => buildC(colors), [colors]);
  const styles = useMemo(() => createStyles(C), [C]);
  return (
    <View style={styles.comingSoonBadge}>
      <Text style={styles.comingSoonBadgeText}>🔒 Yakında</Text>
    </View>
  );
};

// ─── Ana Ekran ────────────────────────────────────────────────────────────────
export default function PersonalInfoScreen() {
  const { colors, isDark } = useTheme();
  const C      = useMemo(() => buildC(colors), [colors]);
  const styles = useMemo(() => createStyles(C), [C]);

  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [loading, setLoading]       = useState(true);
  const [firstName, setFirstName]   = useState("");
  const [lastName, setLastName]     = useState("");
  const [email, setEmail]           = useState("");
  const [phone, setPhone]           = useState("");
  // Şifre
  const [pwOpen, setPwOpen]           = useState(false);
  const [currentPw, setCurrentPw]     = useState("");
  const [newPw, setNewPw]             = useState("");
  const [confirmPw, setConfirmPw]     = useState("");
  const [pwSaving, setPwSaving]       = useState(false);
  // Fatura
  const [isKurumsal, setIsKurumsal]   = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [vergiDairesi, setVergiDairesi] = useState("");
  const [vergiNo, setVergiNo]         = useState("");
  const [efatura, setEfatura]         = useState(false);

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("fimarkt_token");
      if (!token) return;
      const customer = await getMyCustomer(token);
      if (customer) {
        setFirstName(customer.first_name || "");
        setLastName(customer.last_name   || "");
        setEmail(customer.email          || "");
        setPhone(customer.billing?.phone || "");
        if (customer.billing?.company) {
          setIsKurumsal(true);
          setCompanyName(customer.billing.company);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // ── API Patch ────────────────────────────────────────────────────────────
  const patchCustomer = async (body: Record<string, unknown>) => {
    const token = await AsyncStorage.getItem("fimarkt_token");
    if (!token) throw new Error("No token");
    const result = await updateMyCustomer(token, body as any);
    if (!result) throw new Error("Güncelleme başarısız");
  };

  // ── Şifre Kaydet ─────────────────────────────────────────────────────────
  const handlePasswordSave = async () => {
    const err = validate.password(currentPw, newPw, confirmPw);
    if (err) { Alert.alert("Hata", err); return; }
    setPwSaving(true);
    try {
      await patchCustomer({ password: newPw });
      Alert.alert("✅ Başarılı", "Şifreniz güncellendi.");
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      setPwOpen(false);
    } catch {
      Alert.alert("Hata", "Şifre güncellenemedi. Tekrar deneyin.");
    }
    setPwSaving(false);
  };

  const initials = `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase() || "?";

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator color={C.accent} size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hesap Ayarları</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >

          {/* ══ KART 1 — PROFİL ═══════════════════════════════════════════ */}
          <AppCard title="Profil" icon="👤">

            {/* Avatar */}
            <View style={styles.avatarArea}>
              <TouchableOpacity style={styles.avatarWrap} activeOpacity={0.8}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
                <View style={styles.avatarOverlay}>
                  <Text style={styles.avatarOverlayText}>📷</Text>
                </View>
              </TouchableOpacity>
              <Text style={styles.avatarHint}>Fotoğraf değiştir</Text>
            </View>

            <InlineRow
              label="Ad"
              value={firstName}
              placeholder="Adınız"
              validate={validate.name}
              onSave={async (v) => { await patchCustomer({ first_name: v }); setFirstName(v); }}
            />
            <InlineRow
              label="Soyad"
              value={lastName}
              placeholder="Soyadınız"
              validate={validate.name}
              onSave={async (v) => { await patchCustomer({ last_name: v }); setLastName(v); }}
            />
            {/* Sanatkat kullanıcı adı — read-only */}
            <View style={[styles.row]}>
              <View style={styles.rowReadMode}>
                <View style={styles.rowReadLeft}>
                  <Text style={styles.rowLabel}>Sanatkat Kullanıcı Adı</Text>
                  <Text style={styles.rowValue}>
                    @{firstName.toLowerCase().replace(/\s+/g, "") || "kullanici"}
                  </Text>
                </View>
                <ComingSoonBadge />
              </View>
            </View>
          </AppCard>

          {/* ══ KART 2 — İLETİŞİM & GÜVENLİK ════════════════════════════ */}
          <AppCard title="İletişim & Güvenlik" icon="🔒">

            {/* E-posta — kilitli */}
            <View style={[styles.row, styles.rowBorder]}>
              <View style={styles.rowReadMode}>
                <View style={styles.rowReadLeft}>
                  <Text style={styles.rowLabel}>E-posta</Text>
                  <Text style={styles.rowValue} numberOfLines={1}>{email || "—"}</Text>
                </View>
                <VerifiedBadge />
              </View>
            </View>

            <InlineRow
              label="Telefon"
              value={phone}
              placeholder="05XX XXX XX XX"
              keyboardType="phone-pad"
              validate={validate.phone}
              onSave={async (v) => { await patchCustomer({ billing: { phone: v } }); setPhone(v); }}
            />

            {/* Şifre Akordeon ─────────────────────────────────────────────── */}
            <View style={[styles.row]}>
              <TouchableOpacity
                style={styles.accordionHeader}
                onPress={() => setPwOpen(!pwOpen)}
                activeOpacity={0.7}
              >
                <View>
                  <Text style={styles.rowLabel}>Şifre</Text>
                  <Text style={styles.rowValue}>••••••••</Text>
                </View>
                <View style={[styles.accordionBtn, pwOpen && styles.accordionBtnActive]}>
                  <Text style={[styles.accordionBtnText, pwOpen && styles.accordionBtnTextActive]}>
                    {pwOpen ? "✕ Kapat" : "Değiştir"}
                  </Text>
                </View>
              </TouchableOpacity>

              {pwOpen && (
                <View style={styles.accordionBody}>
                  {[
                    { label: "Mevcut Şifre",     value: currentPw, setter: setCurrentPw, placeholder: "Mevcut şifreniz"     },
                    { label: "Yeni Şifre",        value: newPw,     setter: setNewPw,     placeholder: "8+ karakter"         },
                    { label: "Yeni Şifre Tekrar", value: confirmPw, setter: setConfirmPw, placeholder: "Tekrar girin"        },
                  ].map((field) => (
                    <View key={field.label} style={styles.pwField}>
                      <Text style={styles.rowLabel}>{field.label}</Text>
                      <TextInput
                        style={styles.input}
                        value={field.value}
                        onChangeText={field.setter}
                        secureTextEntry
                        placeholder={field.placeholder}
                        placeholderTextColor={C.text3}
                      />
                    </View>
                  ))}

                  <TouchableOpacity
                    style={[styles.saveAllBtn, pwSaving && styles.saveAllBtnDisabled]}
                    onPress={handlePasswordSave}
                    disabled={pwSaving}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.saveAllBtnText}>
                      {pwSaving ? "Güncelleniyor..." : "Şifreyi Güncelle"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </AppCard>

          {/* ══ KART 3 — FATURA BİLGİLERİ ════════════════════════════════ */}
          <AppCard title="Fatura Bilgileri" icon="🧾">

            {/* Bireysel / Kurumsal toggle */}
            <View style={[styles.row, styles.rowBorder]}>
              <View style={styles.rowReadMode}>
                <View style={styles.rowReadLeft}>
                  <Text style={[styles.rowValue, { marginBottom: 2 }]}>
                    {isKurumsal ? "Kurumsal Üyelik" : "Bireysel Üyelik"}
                  </Text>
                  <Text style={styles.rowLabel}>
                    {isKurumsal ? "Vergi faturası düzenlenebilir" : "Standart bireysel fatura"}
                  </Text>
                </View>
                <Switch
                  value={isKurumsal}
                  onValueChange={setIsKurumsal}
                  trackColor={{ false: C.border, true: C.accent }}
                  thumbColor="#fff"
                />
              </View>
            </View>

            {/* Bireysel: TC Kimlik */}
            {!isKurumsal && (
              <View style={[styles.row]}>
                <View style={styles.rowReadMode}>
                  <View style={styles.rowReadLeft}>
                    <Text style={styles.rowLabel}>TC Kimlik No</Text>
                    <Text style={[styles.rowValue, { letterSpacing: 2 }]}>123•••••89</Text>
                  </View>
                  <View style={styles.maskedBadge}>
                    <Text style={styles.maskedBadgeText}>🔒 Şifreli</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Kurumsal: Şirket bilgileri */}
            {isKurumsal && (
              <>
                <InlineRow
                  label="Şirket Unvanı"
                  value={companyName}
                  placeholder="Firma Adı A.Ş."
                  validate={validate.company}
                  onSave={async (v) => { await patchCustomer({ billing: { company: v } }); setCompanyName(v); }}
                />
                <InlineRow
                  label="Vergi Dairesi"
                  value={vergiDairesi}
                  placeholder="Kadıköy Vergi Dairesi"
                  validate={validate.vergiDairesi}
                  onSave={async (v) => setVergiDairesi(v)} // mock
                />
                <InlineRow
                  label="Vergi Numarası"
                  value={vergiNo}
                  placeholder="10 haneli numara"
                  keyboardType="numeric"
                  validate={validate.vergiNo}
                  onSave={async (v) => setVergiNo(v)} // mock
                />

                {/* E-Fatura */}
                <View style={[styles.row, styles.rowBorder]}>
                  <View style={styles.rowReadMode}>
                    <View style={styles.rowReadLeft}>
                      <Text style={styles.rowLabel}>E-Fatura Mükellefi</Text>
                      <Text style={styles.rowValue}>{efatura ? "Evet" : "Hayır"}</Text>
                    </View>
                    <View style={styles.efaturaButtons}>
                      {(["Evet", "Hayır"] as const).map((opt) => {
                        const active = (opt === "Evet" && efatura) || (opt === "Hayır" && !efatura);
                        return (
                          <TouchableOpacity
                            key={opt}
                            style={[styles.efaturaBtn, active && styles.efaturaBtnActive]}
                            onPress={() => setEfatura(opt === "Evet")}
                          >
                            <Text style={[styles.efaturaBtnText, active && styles.efaturaBtnTextActive]}>
                              {opt}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </View>

                {/* Bilgi notu */}
                <View style={styles.infoNote}>
                  <Text style={styles.infoNoteText}>
                    💡 Vergi dairesi ve vergi no bilgileri destek ekibimiz tarafından doğrulanacaktır.
                  </Text>
                </View>
              </>
            )}
          </AppCard>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
