// ─── Gümrük Kapısı — Native Başvuru Sihirbazı ────────────────────────────────
// App: Native stepper mantığı, belge seçimi expo-document-picker ile.
// Web sihirbazıyla aynı 3 adım: Kimsiniz → Belgeler → İnceleniyor
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
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../hooks/useTheme";
import type { OnboardingCategory } from "../../lib/types/partner";

type Step = 1 | 2 | 3;

// ─── Adım Göstergesi ──────────────────────────────────────────────────────────
function StepIndicator({ current, colors }: { current: Step; colors: ReturnType<typeof useTheme>["colors"] }) {
  const steps = ["Profil", "Belgeler", "İnceleme"];
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 28 }}>
      {steps.map((label, i) => {
        const n      = i + 1;
        const done   = n < current;
        const active = n === current;
        return (
          <React.Fragment key={label}>
            <View style={{ alignItems: "center", gap: 4 }}>
              <View style={{
                width: 32, height: 32, borderRadius: 16,
                alignItems: "center", justifyContent: "center",
                borderWidth: 2,
                borderColor: done || active ? "#ff6b2b" : colors.border,
                backgroundColor: done ? "#ff6b2b" : active ? "rgba(255,107,43,0.12)" : colors.surface2,
              }}>
                <Text style={{
                  fontSize: 12, fontWeight: "800",
                  color: done ? "#fff" : active ? "#ff6b2b" : colors.mutedForeground,
                }}>
                  {done ? "✓" : n}
                </Text>
              </View>
              <Text style={{
                fontSize: 9, fontWeight: "700",
                color: active ? "#ff6b2b" : colors.subtleForeground,
              }}>
                {label}
              </Text>
            </View>
            {i < steps.length - 1 && (
              <View style={{
                height: 1, width: 32, marginBottom: 16, marginHorizontal: 4,
                backgroundColor: n < current ? "#ff6b2b" : colors.border,
              }} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

// ─── Belge Yükleme Kutusu (Mock) ─────────────────────────────────────────────
function DocPickerBox({ label, hint, onPick, picked, colors }: {
  label:    string;
  hint?:    string;
  onPick:   () => void;
  picked:   boolean;
  colors:   ReturnType<typeof useTheme>["colors"];
}) {
  return (
    <TouchableOpacity
      onPress={onPick}
      activeOpacity={0.8}
      style={{
        borderWidth: 2,
        borderStyle: "dashed",
        borderColor: picked ? "#ff6b2b" : colors.border,
        borderRadius: 14,
        padding: 16,
        alignItems: "center",
        backgroundColor: picked ? "rgba(255,107,43,0.06)" : colors.surface2,
        flex: 1,
      }}
    >
      <Text style={{ fontSize: 22, marginBottom: 6 }}>{picked ? "✅" : "📄"}</Text>
      <Text style={{ fontSize: 11, fontWeight: "700", color: picked ? "#ff6b2b" : colors.foreground, textAlign: "center" }}>
        {picked ? "Yüklendi" : label}
      </Text>
      {hint && !picked && (
        <Text style={{ fontSize: 10, color: colors.mutedForeground, marginTop: 3, textAlign: "center" }}>
          {hint}
        </Text>
      )}
    </TouchableOpacity>
  );
}

// ─── Ana Ekran ─────────────────────────────────────────────────────────────────
export default function OnboardingScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const { colors } = useTheme();

  const styles = useMemo(() => StyleSheet.create({
    container:    { flex: 1, backgroundColor: colors.background },
    scroll:       { flex: 1 },
    content:      { padding: 20, paddingBottom: 40 },
    header:       { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 14 },
    logoText:     { fontSize: 18, fontWeight: "900", color: colors.foreground },
    badgeRow:     { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99, backgroundColor: "#1d4ed820" },
    badgeText:    { fontSize: 9, fontWeight: "800", color: "#3b82f6" },
    titleBlock:   { alignItems: "center", marginBottom: 24 },
    chip:         { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99, backgroundColor: "rgba(255,107,43,0.12)", borderWidth: 1, borderColor: "rgba(255,107,43,0.2)", marginBottom: 12 },
    chipText:     { fontSize: 11, fontWeight: "800", color: "#ff6b2b" },
    title:        { fontSize: 22, fontWeight: "900", color: colors.foreground, textAlign: "center" },
    subtitle:     { fontSize: 12, color: colors.mutedForeground, textAlign: "center", marginTop: 6, lineHeight: 18 },
    sectionTitle: { fontSize: 14, fontWeight: "800", color: colors.foreground, marginBottom: 14 },
    categoryCard: { borderWidth: 2, borderRadius: 18, padding: 16, marginBottom: 12 },
    cardRow:      { flexDirection: "row", alignItems: "flex-start", gap: 12 },
    cardEmoji:    { fontSize: 28 },
    cardTitle:    { fontSize: 14, fontWeight: "800", color: colors.foreground },
    cardSub:      { fontSize: 11, color: colors.mutedForeground, marginTop: 3, lineHeight: 16 },
    tagRow:       { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 },
    tag:          { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
    tagText:      { fontSize: 9, fontWeight: "700", color: colors.mutedForeground },
    fieldLabel:   { fontSize: 10, fontWeight: "800", color: colors.mutedForeground, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 },
    input:        { backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 13, color: colors.foreground, fontFamily: "monospace", marginBottom: 14 },
    inputError:   { borderColor: colors.error },
    errorText:    { fontSize: 10, color: colors.error, marginTop: -10, marginBottom: 10 },
    infoBox:      { flexDirection: "row", gap: 10, backgroundColor: "rgba(59,130,246,0.08)", borderWidth: 1, borderColor: "rgba(59,130,246,0.2)", borderRadius: 12, padding: 12, marginBottom: 16 },
    infoText:     { fontSize: 11, color: "#93c5fd", flex: 1, lineHeight: 16 },
    docRow:       { flexDirection: "row", gap: 10, marginBottom: 14 },
    docLabel:     { fontSize: 10, fontWeight: "800", color: colors.mutedForeground, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 },
    btnPrimary:   { paddingVertical: 15, borderRadius: 14, alignItems: "center", marginTop: 8 },
    btnPrimaryText: { fontSize: 14, fontWeight: "900", color: "#fff" },
    btnBack:      { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 16 },
    btnBackText:  { fontSize: 14, color: colors.mutedForeground },
    // Step 3
    step3:        { alignItems: "center", paddingTop: 20, gap: 20 },
    pulseOuter:   { width: 112, height: 112, borderRadius: 56, borderWidth: 3, borderColor: "rgba(255,107,43,0.12)", alignItems: "center", justifyContent: "center" },
    pulseInner:   { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: "rgba(255,107,43,0.25)", alignItems: "center", justifyContent: "center" },
    pulseCore:    { width: 56, height: 56, borderRadius: 28, backgroundColor: "rgba(255,107,43,0.15)", borderWidth: 2, borderColor: "rgba(255,107,43,0.3)", alignItems: "center", justifyContent: "center" },
    step3Title:   { fontSize: 20, fontWeight: "900", color: colors.foreground, textAlign: "center" },
    step3Sub:     { fontSize: 13, color: colors.mutedForeground, textAlign: "center", lineHeight: 20 },
    timelineItem: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 10, width: "100%" },
    timelineDot:  { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", borderWidth: 2 },
    timelineLabel: { fontSize: 14, fontWeight: "700" },
    homeBtn:      { marginTop: 8, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12, backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border },
    homeBtnText:  { fontSize: 13, fontWeight: "700", color: colors.mutedForeground },
  }), [colors]);

  const [step,     setStep]     = useState<Step>(1);
  const [category, setCategory] = useState<OnboardingCategory | null>(null);

  // Form alanları (minimal controlled)
  const [companyName,  setCompanyName]  = useState("");
  const [taxNumber,    setTaxNumber]    = useState("");
  const [mersisNumber, setMersisNumber] = useState("");
  const [fullName,     setFullName]     = useState("");
  const [tcNo,         setTcNo]         = useState("");
  const [iban,         setIban]         = useState("");
  const [errors,       setErrors]       = useState<Record<string, string>>({});

  // Belge seçimleri (mock — sadece state toggle)
  const [pickedDocs, setPickedDocs] = useState<Record<string, boolean>>({});
  const pickDoc = (key: string) => {
    setPickedDocs(prev => ({ ...prev, [key]: true }));
    Alert.alert("Dosya Seçildi", "Belge yükleme simüle edildi. Gerçek entegrasyon yakında!");
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (category === "corporate") {
      if (companyName.length < 2)  errs.companyName  = "En az 2 karakter";
      if (taxNumber.length !== 10) errs.taxNumber    = "10 haneli olmalı";
      if (mersisNumber.length < 6) errs.mersisNumber = "Geçerli Mersis No";
    } else {
      if (fullName.length < 2)    errs.fullName = "En az 2 karakter";
      if (tcNo.length !== 11)     errs.tcNo     = "11 haneli olmalı";
    }
    if (!/^TR\d{24}$/.test(iban)) errs.iban = "TR ile başlayan 26 haneli IBAN";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const categoryCards = [
    {
      key:   "corporate" as OnboardingCategory,
      emoji: "🏢",
      title: "Kurumsal Şirket",
      sub:   "Ltd. Şti., A.Ş., Kooperatif veya diğer tüzel kişilikler",
      tags:  ["Vergi Levhası", "Mersis No", "Şirket IBAN"],
    },
    {
      key:   "individual" as OnboardingCategory,
      emoji: "👤",
      title: "Bireysel / Esnaf Muafiyetli",
      sub:   "Esnaf muafiyetli, serbest meslek veya kendi adına çalışan",
      tags:  ["TC Kimlik", "Esnaf Muafiyet Belgesi", "Şahsi IBAN"],
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logoText}>fimarkt<Text style={{ color: "#ff6b2b" }}>.</Text></Text>
        <View style={styles.badgeRow}>
          <Text style={{ fontSize: 10 }}>🔒</Text>
          <Text style={styles.badgeText}>İyzico Güvencesi</Text>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* Başlık */}
          <View style={styles.titleBlock}>
            <View style={styles.chip}>
              <Text>⚡</Text>
              <Text style={styles.chipText}>Çözüm Ortağı Başvurusu</Text>
            </View>
            <Text style={styles.title}>Fimarkt Gümrük Kapısı</Text>
            <Text style={styles.subtitle}>
              İyzico altyapısı üzerinde yasal doğrulama süreci.{"\n"}Tüm veriler şifreli saklanır.
            </Text>
          </View>

          <StepIndicator current={step} colors={colors} />

          {/* ── Adım 1 ── */}
          {step === 1 && (
            <>
              <Text style={styles.sectionTitle}>Profilinizi seçin</Text>
              {categoryCards.map(card => (
                <TouchableOpacity
                  key={card.key}
                  activeOpacity={0.85}
                  onPress={() => { setCategory(card.key); setStep(2); }}
                  style={[
                    styles.categoryCard,
                    {
                      borderColor:     category === card.key ? "#ff6b2b" : colors.border,
                      backgroundColor: category === card.key ? "rgba(255,107,43,0.06)" : colors.surface2,
                    },
                  ]}
                >
                  <View style={styles.cardRow}>
                    <Text style={styles.cardEmoji}>{card.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{card.title}</Text>
                      <Text style={styles.cardSub}>{card.sub}</Text>
                      <View style={styles.tagRow}>
                        {card.tags.map(t => (
                          <View key={t} style={styles.tag}>
                            <Text style={styles.tagText}>{t}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                    <Text style={{ color: colors.mutedForeground, fontSize: 20 }}>›</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}

          {/* ── Adım 2 ── */}
          {step === 2 && category && (
            <>
              <TouchableOpacity style={styles.btnBack} onPress={() => setStep(1)}>
                <Text style={{ color: colors.mutedForeground, fontSize: 20 }}>‹</Text>
                <Text style={styles.btnBackText}>
                  {category === "corporate" ? "Kurumsal bilgiler" : "Bireysel bilgiler"}
                </Text>
              </TouchableOpacity>

              {/* İyzico uyarı */}
              <View style={styles.infoBox}>
                <Text style={{ color: "#93c5fd" }}>ℹ</Text>
                <Text style={styles.infoText}>
                  Bu bilgiler İyzico&apos;nun yasal zorunluluğu kapsamında toplanmaktadır.
                </Text>
              </View>

              {category === "corporate" ? (
                <>
                  <Text style={styles.fieldLabel}>Şirket / Ticaret Unvanı</Text>
                  <TextInput style={[styles.input, errors.companyName && styles.inputError]} value={companyName} onChangeText={setCompanyName} placeholder="Örn: Fimarkt Teknoloji A.Ş." placeholderTextColor={colors.subtleForeground} />
                  {errors.companyName && <Text style={styles.errorText}>{errors.companyName}</Text>}

                  <Text style={styles.fieldLabel}>Vergi Numarası</Text>
                  <TextInput style={[styles.input, errors.taxNumber && styles.inputError]} value={taxNumber} onChangeText={setTaxNumber} placeholder="0000000000" placeholderTextColor={colors.subtleForeground} keyboardType="numeric" maxLength={10} />
                  {errors.taxNumber && <Text style={styles.errorText}>{errors.taxNumber}</Text>}

                  <Text style={styles.fieldLabel}>Mersis Numarası</Text>
                  <TextInput style={[styles.input, errors.mersisNumber && styles.inputError]} value={mersisNumber} onChangeText={setMersisNumber} placeholder="0000000000000000" placeholderTextColor={colors.subtleForeground} />
                  {errors.mersisNumber && <Text style={styles.errorText}>{errors.mersisNumber}</Text>}
                </>
              ) : (
                <>
                  <Text style={styles.fieldLabel}>Ad Soyad</Text>
                  <TextInput style={[styles.input, errors.fullName && styles.inputError]} value={fullName} onChangeText={setFullName} placeholder="Adınız Soyadınız" placeholderTextColor={colors.subtleForeground} />
                  {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}

                  <Text style={styles.fieldLabel}>TC Kimlik Numarası</Text>
                  <TextInput style={[styles.input, errors.tcNo && styles.inputError]} value={tcNo} onChangeText={setTcNo} placeholder="00000000000" placeholderTextColor={colors.subtleForeground} keyboardType="numeric" maxLength={11} />
                  {errors.tcNo && <Text style={styles.errorText}>{errors.tcNo}</Text>}
                </>
              )}

              <Text style={styles.fieldLabel}>IBAN (İyzico Ödemeleri)</Text>
              <TextInput style={[styles.input, errors.iban && styles.inputError]} value={iban} onChangeText={setIban} placeholder="TR000000000000000000000000" placeholderTextColor={colors.subtleForeground} autoCapitalize="characters" maxLength={26} />
              {errors.iban && <Text style={styles.errorText}>{errors.iban}</Text>}

              {/* Belgeler */}
              <Text style={styles.docLabel}>Belge Yükleme</Text>
              <View style={styles.docRow}>
                {category === "corporate" ? (
                  <>
                    <DocPickerBox label="Vergi Levhası" hint="Güncel tarihli" onPick={() => pickDoc("taxCert")} picked={!!pickedDocs.taxCert} colors={colors} />
                    <DocPickerBox label="Mersis Belgesi" hint="e-Devlet onaylı" onPick={() => pickDoc("mersis")} picked={!!pickedDocs.mersis} colors={colors} />
                  </>
                ) : (
                  <>
                    <DocPickerBox label="TC Kimlik" hint="Nüfus cüzdanı" onPick={() => pickDoc("tcId")} picked={!!pickedDocs.tcId} colors={colors} />
                    <DocPickerBox label="Esnaf Muafiyet" hint="e-Devlet onaylı" onPick={() => pickDoc("exemption")} picked={!!pickedDocs.exemption} colors={colors} />
                  </>
                )}
              </View>

              <TouchableOpacity
                style={[styles.btnPrimary, { backgroundColor: "#ff6b2b" }]}
                activeOpacity={0.85}
                onPress={() => { if (validateStep2()) setStep(3); }}
              >
                <Text style={styles.btnPrimaryText}>Başvuruyu Gönder →</Text>
              </TouchableOpacity>
            </>
          )}

          {/* ── Adım 3: Pending ── */}
          {step === 3 && (
            <View style={styles.step3}>
              {/* Animasyonlu ikon */}
              <View style={styles.pulseOuter}>
                <View style={styles.pulseInner}>
                  <View style={styles.pulseCore}>
                    <Text style={{ fontSize: 24 }}>⏳</Text>
                  </View>
                </View>
              </View>

              <View style={{ alignItems: "center" }}>
                <Text style={styles.step3Title}>Başvurunuz İnceleniyor</Text>
                <Text style={styles.step3Sub}>
                  Belgeleriniz ekibimize iletildi.{"\n"}
                  Ortalama <Text style={{ fontWeight: "800", color: colors.foreground }}>1–3 iş günü</Text> içinde{"\n"}
                  e-posta ile bildirim alacaksınız.
                </Text>
              </View>

              {/* Timeline */}
              <View style={{ width: "100%", paddingHorizontal: 8 }}>
                {[
                  { icon: "✓", label: "Belgeler Alındı",   done: true,  active: false },
                  { icon: "⟳", label: "İnceleniyor",        done: false, active: true  },
                  { icon: "○", label: "Onay & Aktivasyon",  done: false, active: false },
                ].map((s, i) => (
                  <View key={i} style={styles.timelineItem}>
                    <View style={[
                      styles.timelineDot,
                      {
                        backgroundColor: s.done ? "rgba(255,107,43,0.12)" : s.active ? "#ff6b2b" : colors.surface2,
                        borderColor:     s.done || s.active ? "#ff6b2b" : colors.border,
                      },
                    ]}>
                      <Text style={{
                        fontSize: 12, fontWeight: "800",
                        color: s.done ? "#ff6b2b" : s.active ? "#fff" : colors.mutedForeground,
                      }}>
                        {s.icon}
                      </Text>
                    </View>
                    <Text style={[
                      styles.timelineLabel,
                      { color: s.active ? colors.foreground : s.done ? "#ff6b2b" : colors.mutedForeground },
                    ]}>
                      {s.label}
                    </Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={styles.homeBtn} onPress={() => router.replace("/(tabs)" as never)}>
                <Text style={styles.homeBtnText}>Ana Sayfaya Dön</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
