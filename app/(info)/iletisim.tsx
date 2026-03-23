import React, { useMemo, useState } from "react";
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, Linking, Modal, Animated,
} from "react-native";
import { Stack } from "expo-router";
import { type ThemeColors } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { CONTACT } from "@/lib/content-manager";

interface FormState { name: string; email: string; subject: string; message: string }

const QUICK_CARDS = [
  { icon: "💬", label: "WhatsApp",  value: CONTACT.whatsapp, href: CONTACT.whatsappLink, color: "#25D366" },
  { icon: "📧", label: "E-posta",   value: CONTACT.email,    href: `mailto:${CONTACT.email}`,              color: "#ff6b2b" },
  { icon: "📞", label: "Telefon",   value: CONTACT.phone,    href: `tel:${CONTACT.phone.replace(/\s/g,"")}`, color: "#0ea5e9" },
  { icon: "📍", label: "Adres",     value: `${CONTACT.address}, ${CONTACT.city}`, href: CONTACT.mapsDeepLink, color: "#a855f7" },
];

export default function IletisimScreen() {
  const { colors: C } = useTheme();
  const s = useMemo(() => createStyles(C), [C]);

  const [form,    setForm]    = useState<FormState>({ name: "", email: "", subject: "", message: "" });
  const [errors,  setErrors]  = useState<Partial<FormState>>({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const e: Partial<FormState> = {};
    if (!form.name.trim())                                       e.name    = "Zorunlu alan.";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email   = "Geçerli e-posta girin.";
    if (!form.subject.trim())                                    e.subject = "Zorunlu alan.";
    if (form.message.trim().length < 20)                         e.message = "En az 20 karakter.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200)); // Mock
    setLoading(false);
    setSuccess(true);
  };

  const InputField = ({ key2, label, multi }: { key2: keyof FormState; label: string; multi?: boolean }) => (
    <View style={s.fieldWrap}>
      <Text style={s.fieldLabel}>{label}</Text>
      <TextInput
        value={form[key2]}
        onChangeText={(v) => setForm((p) => ({ ...p, [key2]: v }))}
        placeholder={label}
        placeholderTextColor={C.mutedForeground}
        multiline={multi}
        numberOfLines={multi ? 4 : 1}
        style={[s.input, multi && s.inputMulti, errors[key2] ? s.inputError : undefined]}
      />
      {errors[key2] ? <Text style={s.errorText}>{errors[key2]}</Text> : null}
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ title: "İletişim" }} />
      <ScrollView style={s.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* ── Başlık ──────────────────────────────────────────────────── */}
        <View style={s.hero}>
          <Text style={s.heroTitle}>İletişim Merkezi</Text>
          <Text style={s.heroSub}>{CONTACT.workingHours}</Text>
        </View>

        {/* ── Hızlı Erişim Kartları ───────────────────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Hızlı Erişim</Text>
          {QUICK_CARDS.map((card) => (
            <TouchableOpacity
              key={card.label}
              style={s.quickCard}
              onPress={() => Linking.openURL(card.href)}
              activeOpacity={0.8}
            >
              <View style={[s.quickIcon, { backgroundColor: `${card.color}18` }]}>
                <Text style={s.quickIconText}>{card.icon}</Text>
              </View>
              <View style={s.quickInfo}>
                <Text style={s.quickLabel}>{card.label}</Text>
                <Text style={[s.quickValue, { color: card.color }]} numberOfLines={1}>{card.value}</Text>
              </View>
              <Text style={s.quickArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Mesaj Formu ─────────────────────────────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Mesaj Gönder</Text>
          <View style={s.formCard}>
            <InputField key2="name"    label="Ad Soyad"          />
            <InputField key2="email"   label="E-posta Adresi"    />
            <InputField key2="subject" label="Konu"              />
            <InputField key2="message" label="Mesajınız" multi   />
            <TouchableOpacity
              style={[s.submitBtn, loading && s.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={s.submitBtnText}>{loading ? "Gönderiliyor…" : "Gönder →"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* ── Başarı Modali ───────────────────────────────────────────── */}
      <Modal visible={success} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalEmoji}>✅</Text>
            <Text style={s.modalTitle}>Mesajınız Alındı!</Text>
            <Text style={s.modalSub}>
              En geç <Text style={{ color: C.foreground, fontWeight: "700" }}>24 saat</Text> içinde{"\n"}
              <Text style={{ color: C.accent }}>{form.email}</Text> adresinize dönüş yapacağız.
            </Text>
            <TouchableOpacity
              style={s.modalBtn}
              onPress={() => {
                setSuccess(false);
                setForm({ name: "", email: "", subject: "", message: "" });
              }}
            >
              <Text style={s.modalBtnText}>Tamam</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

function createStyles(C: ThemeColors) {
  return StyleSheet.create({
    container:        { flex: 1, backgroundColor: C.background },
    hero:             { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: C.border, backgroundColor: C.surface },
    heroTitle:        { fontSize: 22, fontWeight: "900", color: C.foreground, marginBottom: 4 },
    heroSub:          { fontSize: 12, color: C.mutedForeground },
    section:          { paddingHorizontal: 16, marginTop: 20 },
    sectionTitle:     { fontSize: 11, fontWeight: "800", color: C.mutedForeground, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 },
    quickCard:        { flexDirection: "row", alignItems: "center", backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 14, marginBottom: 8, gap: 12 },
    quickIcon:        { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    quickIconText:    { fontSize: 20 },
    quickInfo:        { flex: 1 },
    quickLabel:       { fontSize: 10, color: C.mutedForeground, marginBottom: 2 },
    quickValue:       { fontSize: 13, fontWeight: "600" },
    quickArrow:       { fontSize: 20, color: C.subtleForeground },
    formCard:         { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 20, padding: 16, gap: 12 },
    fieldWrap:        { gap: 4 },
    fieldLabel:       { fontSize: 11, fontWeight: "600", color: C.foreground },
    input:            { backgroundColor: C.background, borderWidth: 1, borderColor: C.border, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontSize: 13, color: C.foreground },
    inputMulti:       { height: 100, textAlignVertical: "top" },
    inputError:       { borderColor: C.error },
    errorText:        { fontSize: 10, color: C.error },
    submitBtn:        { backgroundColor: C.accent, borderRadius: 16, paddingVertical: 14, alignItems: "center" },
    submitBtnDisabled:{ opacity: 0.6 },
    submitBtnText:    { fontSize: 14, fontWeight: "700", color: "#fff" },
    // Modal
    modalOverlay:     { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center", padding: 24 },
    modalCard:        { backgroundColor: C.surface, borderRadius: 28, padding: 32, alignItems: "center", width: "100%" },
    modalEmoji:       { fontSize: 48, marginBottom: 12 },
    modalTitle:       { fontSize: 20, fontWeight: "900", color: C.foreground, marginBottom: 8 },
    modalSub:         { fontSize: 13, color: C.mutedForeground, textAlign: "center", lineHeight: 20, marginBottom: 24 },
    modalBtn:         { backgroundColor: C.accent, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 16 },
    modalBtnText:     { fontSize: 14, fontWeight: "700", color: "#fff" },
  });
}
