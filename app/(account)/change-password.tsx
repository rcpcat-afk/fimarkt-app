// ─── Şifre Değiştir ───────────────────────────────────────────────────────────
// Giriş yapmış kullanıcı → mevcut şifre doğrulama → yeni şifre belirleme.
// (account)/_layout.tsx zaten auth guard sağlıyor.

import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
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
import { useAuth } from "../../src/store/AuthContext";
import { type ThemeColors } from "../../constants/theme";
import { useTheme } from "../../hooks/useTheme";
import { BACKEND_URL } from "../../constants";

function createStyles(C: ThemeColors) {
  return StyleSheet.create({
    container:       { flex: 1, backgroundColor: C.background },
    scroll:          { padding: 20, paddingTop: 16 },

    // Header
    header:          { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 28 },
    backBtn:         { width: 40, height: 40, borderRadius: 12, backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border, alignItems: "center", justifyContent: "center" },
    backIcon:        { fontSize: 20, color: C.mutedForeground },
    headerTitle:     { fontSize: 20, fontWeight: "900", color: C.foreground },

    // Info kutusu
    infoBox:         { flexDirection: "row", gap: 10, backgroundColor: "rgba(59,130,246,0.08)", borderWidth: 1, borderColor: "rgba(59,130,246,0.2)", borderRadius: 14, padding: 14, marginBottom: 28 },
    infoText:        { flex: 1, fontSize: 12, color: "#93c5fd", lineHeight: 18 },

    // Form
    fieldLabel:      { fontSize: 11, fontWeight: "700", color: C.mutedForeground, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
    fieldWrap:       { marginBottom: 20 },
    inputRow:        { flexDirection: "row", alignItems: "center", backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border, borderRadius: 14, paddingHorizontal: 14 },
    inputRowError:   { borderColor: "#ef4444" },
    input:           { flex: 1, fontSize: 14, color: C.foreground, paddingVertical: 13 },
    eyeBtn:          { padding: 8 },
    eyeIcon:         { fontSize: 18 },
    errorText:       { fontSize: 11, color: "#ef4444", marginTop: 6 },

    // Güç göstergesi
    strengthRow:     { flexDirection: "row", gap: 4, marginTop: 8 },
    strengthBar:     { flex: 1, height: 3, borderRadius: 2, backgroundColor: C.border },
    strengthLabel:   { fontSize: 10, color: C.subtleForeground, marginTop: 4 },

    // Divider
    divider:         { height: 1, backgroundColor: C.border, marginBottom: 28 },

    // Buton
    submitBtn:       { backgroundColor: C.accent, borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 8 },
    submitBtnDis:    { opacity: 0.5 },
    submitBtnText:   { fontSize: 15, fontWeight: "900", color: "#fff" },

    // İpuçları
    tipsBox:         { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 16, marginTop: 28 },
    tipsTitle:       { fontSize: 10, fontWeight: "800", color: C.subtleForeground, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 },
    tipRow:          { flexDirection: "row", gap: 8, marginBottom: 6 },
    tipDot:          { fontSize: 12, color: C.accent, marginTop: 1 },
    tipText:         { flex: 1, fontSize: 12, color: C.mutedForeground, lineHeight: 18 },
  });
}

// ── Şifre gücü hesapla ─────────────────────────────────────────────────────────
function getStrength(pw: string): { level: 0 | 1 | 2 | 3; label: string; color: string } {
  if (!pw) return { level: 0, label: "", color: "transparent" };
  let score = 0;
  if (pw.length >= 8)                     score++;
  if (/[A-Z]/.test(pw))                   score++;
  if (/[0-9]/.test(pw))                   score++;
  if (/[^A-Za-z0-9]/.test(pw))           score++;
  if (score <= 1) return { level: 1, label: "Zayıf",  color: "#ef4444" };
  if (score === 2) return { level: 2, label: "Orta",   color: "#f59e0b" };
  return              { level: 3, label: "Güçlü", color: "#22c55e" };
}

export default function ChangePasswordScreen() {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { user } = useAuth();

  const [current,     setCurrent]     = useState("");
  const [newPw,       setNewPw]       = useState("");
  const [confirm,     setConfirm]     = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [errors,      setErrors]      = useState<Record<string, string>>({});

  const strength = getStrength(newPw);

  function validate() {
    const errs: Record<string, string> = {};
    if (!current)              errs.current = "Mevcut şifrenizi girin";
    if (newPw.length < 6)     errs.newPw   = "En az 6 karakter olmalı";
    if (newPw === current)    errs.newPw   = "Yeni şifre mevcut şifreden farklı olmalı";
    if (newPw !== confirm)    errs.confirm = "Şifreler eşleşmiyor";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ currentPassword: current, newPassword: newPw }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        if (res.status === 400 && data.message?.includes("Mevcut şifre")) {
          setErrors({ current: "Mevcut şifre hatalı" });
        } else {
          Alert.alert("Hata", data.message || "Şifre güncellenemedi");
        }
        return;
      }
      Alert.alert("Başarılı", "Şifreniz güncellendi.", [
        { text: "Tamam", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Hata", "Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = current.length > 0 && newPw.length >= 6 && confirm.length > 0 && !loading;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Şifre Değiştir</Text>
        </View>

        {/* Bilgi notu */}
        <View style={styles.infoBox}>
          <Text style={{ fontSize: 14 }}>🔒</Text>
          <Text style={styles.infoText}>
            Mevcut şifrenizi doğruladıktan sonra yeni şifrenizi belirleyebilirsiniz.
          </Text>
        </View>

        {/* Mevcut Şifre */}
        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>Mevcut Şifre</Text>
          <View style={[styles.inputRow, errors.current && styles.inputRowError]}>
            <TextInput
              style={styles.input}
              value={current}
              onChangeText={(v) => { setCurrent(v); setErrors(e => ({ ...e, current: "" })); }}
              placeholder="Mevcut şifreniz"
              placeholderTextColor={colors.subtleForeground}
              secureTextEntry={!showCurrent}
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowCurrent(v => !v)}>
              <Text style={styles.eyeIcon}>{showCurrent ? "🙈" : "👁️"}</Text>
            </TouchableOpacity>
          </View>
          {errors.current ? <Text style={styles.errorText}>{errors.current}</Text> : null}
        </View>

        <View style={styles.divider} />

        {/* Yeni Şifre */}
        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>Yeni Şifre</Text>
          <View style={[styles.inputRow, errors.newPw && styles.inputRowError]}>
            <TextInput
              style={styles.input}
              value={newPw}
              onChangeText={(v) => { setNewPw(v); setErrors(e => ({ ...e, newPw: "" })); }}
              placeholder="En az 6 karakter"
              placeholderTextColor={colors.subtleForeground}
              secureTextEntry={!showNew}
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowNew(v => !v)}>
              <Text style={styles.eyeIcon}>{showNew ? "🙈" : "👁️"}</Text>
            </TouchableOpacity>
          </View>
          {errors.newPw ? <Text style={styles.errorText}>{errors.newPw}</Text> : null}
          {/* Güç göstergesi */}
          {newPw.length > 0 && (
            <>
              <View style={styles.strengthRow}>
                {[1, 2, 3].map(i => (
                  <View
                    key={i}
                    style={[styles.strengthBar, i <= strength.level && { backgroundColor: strength.color }]}
                  />
                ))}
              </View>
              <Text style={[styles.strengthLabel, { color: strength.color }]}>{strength.label}</Text>
            </>
          )}
        </View>

        {/* Şifre Tekrar */}
        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>Yeni Şifre (Tekrar)</Text>
          <View style={[styles.inputRow, errors.confirm && styles.inputRowError]}>
            <TextInput
              style={styles.input}
              value={confirm}
              onChangeText={(v) => { setConfirm(v); setErrors(e => ({ ...e, confirm: "" })); }}
              placeholder="Şifreyi tekrar girin"
              placeholderTextColor={colors.subtleForeground}
              secureTextEntry={!showConfirm}
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowConfirm(v => !v)}>
              <Text style={styles.eyeIcon}>{showConfirm ? "🙈" : "👁️"}</Text>
            </TouchableOpacity>
          </View>
          {errors.confirm ? <Text style={styles.errorText}>{errors.confirm}</Text> : null}
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, !canSubmit && styles.submitBtnDis]}
          onPress={handleSubmit}
          disabled={!canSubmit}
        >
          <Text style={styles.submitBtnText}>
            {loading ? "Güncelleniyor..." : "🔐 Şifreyi Güncelle"}
          </Text>
        </TouchableOpacity>

        {/* İpuçları */}
        <View style={styles.tipsBox}>
          <Text style={styles.tipsTitle}>Güçlü şifre için</Text>
          {[
            "En az 8 karakter kullan",
            "Büyük ve küçük harf karıştır",
            "Rakam veya özel karakter ekle",
            "Tahmin edilmesi kolay bilgilerden kaçın",
          ].map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <Text style={styles.tipDot}>›</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
