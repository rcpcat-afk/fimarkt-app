// ─── Tasarım İste / RFQ Wizard (App) ──────────────────────────────────────────
// 3 adımlı proje formu — react-hook-form + zod + expo-image-picker + expo-document-picker
// KeyboardAvoidingView + ScrollView ile akıcı mobil deneyim

import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, StyleSheet, StatusBar,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { Colors } from "../../constants/theme";

const C = Colors.dark;

// ── Schema ────────────────────────────────────────────────────────────────────
const schema = z.object({
  title:        z.string().min(5,  "En az 5 karakter giriniz"),
  category:     z.string().min(1,  "Kategori seçiniz"),
  description:  z.string().min(20, "En az 20 karakter açıklama giriniz"),
  deliveryDays: z.string().min(1,  "Teslimat süresi seçiniz"),
  budget:       z.string().optional(),
});
type RfqForm = z.infer<typeof schema>;

// ── Sabitler ──────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { value: "endustriyel", label: "⚙️  Endüstriyel / Fonksiyonel" },
  { value: "karakter",    label: "🎭  Karakter / Figür / Heykel" },
  { value: "tarama",      label: "🔬  3D Tarama & Tersine Müh." },
  { value: "mimari",      label: "🏛️  Mimari Maket / Konsept" },
  { value: "medikal",     label: "🩺  Medikal / Dental" },
  { value: "diger",       label: "✨  Diğer" },
];

const DELIVERY_OPTIONS = [
  { value: "7",     label: "7 İş Günü",  tag: "Acil",          tagColor: "#ef4444" },
  { value: "14",    label: "14 İş Günü", tag: "Standart",       tagColor: C.accent },
  { value: "30",    label: "30 İş Günü", tag: "Ekonomik",       tagColor: "#10b981" },
  { value: "esnek", label: "Esnek",       tag: "En Uygun Fiyat", tagColor: "#0ea5e9" },
];

const STEP_LABELS = ["Proje Tanımı", "Detaylar & Dosyalar", "Süre & Bütçe"];

// ── Dosya tipi ────────────────────────────────────────────────────────────────
type UploadedFile = {
  uri:  string;
  name: string;
  type: "image" | "document";
  mimeType?: string;
};

// ── Ana Sayfa ─────────────────────────────────────────────────────────────────
export default function TasarimIsteScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();

  const [step,    setStep]    = useState(0);
  const [files,   setFiles]   = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [catOpen, setCatOpen] = useState(false);

  const {
    control, handleSubmit, trigger, setValue, watch,
    formState: { errors },
  } = useForm<RfqForm>({ resolver: zodResolver(schema), mode: "onTouched" });

  const selectedCategory = watch("category");
  const selectedDelivery = watch("deliveryDays");

  // ── Dosya seçiciler ─────────────────────────────────────────────────────────
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.85,
    });
    if (!result.canceled) {
      const newFiles: UploadedFile[] = result.assets.map(a => ({
        uri: a.uri,
        name: a.fileName ?? `foto-${Date.now()}.jpg`,
        type: "image",
        mimeType: a.mimeType,
      }));
      setFiles(prev => [...prev, ...newFiles].slice(0, 8));
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "application/octet-stream", "*/*"],
      multiple: true,
      copyToCacheDirectory: true,
    });
    if (!result.canceled) {
      const newFiles: UploadedFile[] = result.assets.map(a => ({
        uri: a.uri,
        name: a.name,
        type: "document",
        mimeType: a.mimeType ?? undefined,
      }));
      setFiles(prev => [...prev, ...newFiles].slice(0, 8));
    }
  };

  // ── Adım navigasyon ─────────────────────────────────────────────────────────
  const nextStep = async () => {
    const fieldsPerStep: (keyof RfqForm)[][] = [
      ["title", "category"],
      ["description"],
      ["deliveryDays"],
    ];
    const valid = await trigger(fieldsPerStep[step]);
    if (valid) setStep(s => s + 1);
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const onSubmit = async (_data: RfqForm) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1800));
    setLoading(false);
    setSuccess(true);
  };

  // ── Success state ───────────────────────────────────────────────────────────
  if (success) {
    return (
      <View style={[s.root, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>
        <StatusBar barStyle="light-content" />
        <Animated.View entering={FadeIn.duration(400)} style={s.successWrap}>
          <View style={s.successIcon}><Text style={s.successEmoji}>🎉</Text></View>
          <Text style={s.successTitle}>Projeniz Uzmanlara İletildi!</Text>
          <Text style={s.successSub}>
            Ekibimiz projenizi inceleyip{" "}
            <Text style={{ color: C.foreground, fontWeight: "700" }}>24 saat içinde</Text>
            {" "}tekliflerini iletecek.
          </Text>

          <View style={s.successBadgeRow}>
            {[
              { icon: "🔍", label: "İnceleniyor" },
              { icon: "👨‍💻", label: "Uzman\nAtaması" },
              { icon: "💬", label: "Teklif\nGelecek" },
            ].map(b => (
              <View key={b.label} style={s.successBadge}>
                <Text style={s.badgeEmoji}>{b.icon}</Text>
                <Text style={s.badgeLabel}>{b.label}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[s.primaryBtn, { backgroundColor: C.accent }]}
            onPress={() => { setSuccess(false); setStep(0); setFiles([]); }}
            activeOpacity={0.85}
          >
            <Text style={s.primaryBtnText}>+ Yeni Proje Gönder</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.secondaryBtn} onPress={() => router.back()} activeOpacity={0.8}>
            <Text style={[s.secondaryBtnText, { color: C.mutedForeground }]}>Geri Dön</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[s.root, { backgroundColor: C.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={insets.top}
    >
      <StatusBar barStyle="light-content" />

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <Animated.View
        entering={FadeInDown.duration(400)}
        style={[s.header, { paddingTop: insets.top + 8, borderBottomColor: C.border }]}
      >
        <TouchableOpacity onPress={() => router.back()} hitSlop={10} style={[s.backBtn, { backgroundColor: C.surface2, borderColor: C.border }]}>
          <Text style={[s.backArrow, { color: C.foreground }]}>←</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={[s.headerTitle, { color: C.foreground }]}>Tasarım İste</Text>
          <Text style={[s.headerSub, { color: C.mutedForeground }]}>{STEP_LABELS[step]}</Text>
        </View>
        <Text style={[s.stepCounter, { color: C.accent }]}>{step + 1} / {STEP_LABELS.length}</Text>
      </Animated.View>

      {/* ── Stepper bar ────────────────────────────────────────────────── */}
      <View style={[s.stepperBar, { backgroundColor: C.border }]}>
        <View style={[s.stepperFill, { width: `${((step + 1) / STEP_LABELS.length) * 100}%` as any, backgroundColor: C.accent }]} />
      </View>

      {/* ── Form içeriği ───────────────────────────────────────────────── */}
      <ScrollView
        style={s.scroll}
        contentContainerStyle={[s.scrollContent, { paddingBottom: insets.bottom + 120 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── ADIM 1: Proje Tanımı ─────────────────────────────────────── */}
        {step === 0 && (
          <Animated.View entering={FadeInDown.duration(350)} style={s.stepBlock}>
            <Text style={[s.stepTitle, { color: C.foreground }]}>Projeyi Tanımlayın</Text>
            <Text style={[s.stepSub, { color: C.mutedForeground }]}>Hangi konuda tasarım yaptırmak istiyorsunuz?</Text>

            {/* Proje başlığı */}
            <Text style={s.fieldLabel}>Proje Başlığı <Text style={{ color: C.accent }}>*</Text></Text>
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[s.input, { borderColor: errors.title ? "#ef4444" : C.border, color: C.foreground, backgroundColor: C.surface2 }]}
                  placeholder="örn: Kırık Dişli Mili için Yedek Parça"
                  placeholderTextColor={C.mutedForeground}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.title && <Text style={s.errorText}>{errors.title.message}</Text>}

            {/* Kategori */}
            <Text style={[s.fieldLabel, { marginTop: 16 }]}>Kategori <Text style={{ color: C.accent }}>*</Text></Text>
            <TouchableOpacity
              style={[s.selectBtn, { borderColor: errors.category ? "#ef4444" : C.border, backgroundColor: C.surface2 }]}
              onPress={() => setCatOpen(o => !o)}
              activeOpacity={0.8}
            >
              <Text style={{ color: selectedCategory ? C.foreground : C.mutedForeground, fontSize: 13 }}>
                {CATEGORIES.find(c => c.value === selectedCategory)?.label ?? "Kategori seçiniz..."}
              </Text>
              <Text style={{ color: C.mutedForeground }}>{catOpen ? "▲" : "▼"}</Text>
            </TouchableOpacity>
            {catOpen && (
              <View style={[s.dropdown, { backgroundColor: C.surface, borderColor: C.border }]}>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat.value}
                    style={[s.dropItem, { borderBottomColor: C.border, backgroundColor: selectedCategory === cat.value ? C.accent + "18" : "transparent" }]}
                    onPress={() => { setValue("category", cat.value, { shouldValidate: true }); setCatOpen(false); }}
                  >
                    <Text style={{ color: C.foreground, fontSize: 13 }}>{cat.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {errors.category && <Text style={s.errorText}>{errors.category.message}</Text>}
          </Animated.View>
        )}

        {/* ── ADIM 2: Detaylar & Dosyalar ─────────────────────────────── */}
        {step === 1 && (
          <Animated.View entering={FadeInDown.duration(350)} style={s.stepBlock}>
            <Text style={[s.stepTitle, { color: C.foreground }]}>Detayları Paylaşın</Text>
            <Text style={[s.stepSub, { color: C.mutedForeground }]}>Ne kadar detay verirseniz, teklif o kadar isabetli olur.</Text>

            {/* Açıklama */}
            <Text style={s.fieldLabel}>Proje Açıklaması <Text style={{ color: C.accent }}>*</Text></Text>
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[s.textarea, { borderColor: errors.description ? "#ef4444" : C.border, color: C.foreground, backgroundColor: C.surface2 }]}
                  placeholder={"Parçanın kullanım amacı, boyutları,\nmalzeme tercihi, tolerans gereksinimleri..."}
                  placeholderTextColor={C.mutedForeground}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  multiline
                  textAlignVertical="top"
                />
              )}
            />
            {errors.description && <Text style={s.errorText}>{errors.description.message}</Text>}

            {/* Referans dosyaları */}
            <Text style={[s.fieldLabel, { marginTop: 16 }]}>Referans Dosyaları</Text>
            <Text style={[s.fieldHint, { color: C.mutedForeground }]}>Fotoğraf, PDF, STEP, STL — maks. 8 dosya</Text>

            <View style={s.fileActions}>
              <TouchableOpacity
                style={[s.fileBtn, { backgroundColor: C.surface2, borderColor: C.border }]}
                onPress={pickImage}
                activeOpacity={0.8}
              >
                <Text style={s.fileBtnIcon}>📷</Text>
                <Text style={[s.fileBtnText, { color: C.foreground }]}>Fotoğraf / Görsel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.fileBtn, { backgroundColor: C.surface2, borderColor: C.border }]}
                onPress={pickDocument}
                activeOpacity={0.8}
              >
                <Text style={s.fileBtnIcon}>📄</Text>
                <Text style={[s.fileBtnText, { color: C.foreground }]}>PDF / STEP / STL</Text>
              </TouchableOpacity>
            </View>

            {/* Seçilen dosyalar */}
            {files.length > 0 && (
              <View style={s.fileList}>
                {files.map((f, i) => (
                  <View key={f.uri + i} style={[s.fileRow, { backgroundColor: C.surface, borderColor: C.border }]}>
                    {f.type === "image" ? (
                      <Image source={{ uri: f.uri }} style={s.fileThumbnail} />
                    ) : (
                      <View style={[s.fileIcon, { backgroundColor: C.accent + "18" }]}>
                        <Text style={{ fontSize: 14 }}>📄</Text>
                      </View>
                    )}
                    <Text style={[s.fileName, { color: C.foreground }]} numberOfLines={1}>{f.name}</Text>
                    <TouchableOpacity onPress={() => setFiles(prev => prev.filter((_, idx) => idx !== i))} hitSlop={8}>
                      <Text style={{ color: C.mutedForeground, fontSize: 18, lineHeight: 20 }}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </Animated.View>
        )}

        {/* ── ADIM 3: Süre & Bütçe ────────────────────────────────────── */}
        {step === 2 && (
          <Animated.View entering={FadeInDown.duration(350)} style={s.stepBlock}>
            <Text style={[s.stepTitle, { color: C.foreground }]}>Süre & Bütçe</Text>
            <Text style={[s.stepSub, { color: C.mutedForeground }]}>Mühendislerin size en uygun teklifte bulunabilmesi için son bilgileri paylaşın.</Text>

            {/* Teslimat süresi */}
            <Text style={s.fieldLabel}>Teslimat Süresi <Text style={{ color: C.accent }}>*</Text></Text>
            <View style={s.deliveryGrid}>
              {DELIVERY_OPTIONS.map(opt => {
                const active = selectedDelivery === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      s.deliveryCard,
                      {
                        borderColor: active ? C.accent : C.border,
                        backgroundColor: active ? C.accent + "0F" : C.surface2,
                      },
                    ]}
                    onPress={() => setValue("deliveryDays", opt.value, { shouldValidate: true })}
                    activeOpacity={0.8}
                  >
                    <Text style={[s.deliveryLabel, { color: C.foreground }]}>{opt.label}</Text>
                    <Text style={[s.deliveryTag, { color: opt.tagColor }]}>{opt.tag}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {errors.deliveryDays && <Text style={s.errorText}>{errors.deliveryDays.message}</Text>}

            {/* Bütçe */}
            <Text style={[s.fieldLabel, { marginTop: 16 }]}>Bütçe Beklentisi <Text style={[s.fieldHint, { color: C.mutedForeground }]}>(opsiyonel)</Text></Text>
            <Controller
              control={control}
              name="budget"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[s.input, { borderColor: C.border, color: C.foreground, backgroundColor: C.surface2 }]}
                  placeholder="örn: 500-1500 ₺"
                  placeholderTextColor={C.mutedForeground}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />

            {/* %0 komisyon rozeti */}
            <View style={[s.commissionBox, { backgroundColor: "#10b98114", borderColor: "#10b98133" }]}>
              <Text style={s.commissionIcon}>✦</Text>
              <View style={s.commissionText}>
                <Text style={[s.commissionTitle, { color: "#10b981" }]}>%0 Komisyon Güvencesi</Text>
                <Text style={[s.commissionSub, { color: C.mutedForeground }]}>Uzmanla doğrudan anlaşırsınız.</Text>
              </View>
            </View>
          </Animated.View>
        )}
      </ScrollView>

      {/* ── STICKY BOTTOM BUTTONS ──────────────────────────────────────── */}
      <View style={[s.bottomBar, { borderTopColor: C.border, backgroundColor: C.background, paddingBottom: insets.bottom + 12 }]}>
        <View style={s.bottomRow}>
          {step > 0 && (
            <TouchableOpacity
              style={[s.backBtnBottom, { borderColor: C.border }]}
              onPress={() => setStep(s => s - 1)}
              activeOpacity={0.8}
            >
              <Text style={[s.backBtnText, { color: C.mutedForeground }]}>← Geri</Text>
            </TouchableOpacity>
          )}

          {step < 2 ? (
            <TouchableOpacity
              style={[s.nextBtn, { backgroundColor: C.accent, flex: 1 }]}
              onPress={nextStep}
              activeOpacity={0.88}
            >
              <Text style={s.nextBtnText}>Devam Et →</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[s.nextBtn, { backgroundColor: C.accent, flex: 1, opacity: loading ? 0.7 : 1 }]}
              onPress={handleSubmit(onSubmit)}
              disabled={loading}
              activeOpacity={0.88}
            >
              <Text style={s.nextBtnText}>{loading ? "Gönderiliyor..." : "🚀 Projeyi Yayınla"}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

// ── Stiller ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:    { flex: 1 },
  header:  { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  backBtn: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center", marginRight: 12 },
  backArrow:    { fontSize: 18, fontWeight: "700" },
  headerCenter: { flex: 1 },
  headerTitle:  { fontSize: 15, fontWeight: "800", letterSpacing: -0.2 },
  headerSub:    { fontSize: 11, marginTop: 1 },
  stepCounter:  { fontSize: 12, fontWeight: "800" },

  stepperBar:  { height: 3 },
  stepperFill: { height: "100%" as any },

  scroll:        { flex: 1 },
  scrollContent: { padding: 16 },

  stepBlock: { gap: 4 },
  stepTitle: { fontSize: 20, fontWeight: "900", letterSpacing: -0.4, marginBottom: 4 },
  stepSub:   { fontSize: 13, lineHeight: 18, marginBottom: 20 },

  fieldLabel: { fontSize: 11, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase", color: C.foreground, marginBottom: 8 },
  fieldHint:  { fontSize: 10, fontWeight: "400", textTransform: "none", letterSpacing: 0, marginBottom: 8 },
  errorText:  { fontSize: 11, color: "#ef4444", marginTop: 4 },

  input: {
    borderWidth: 1, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 13,
  },
  textarea: {
    borderWidth: 1, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 13, minHeight: 120,
  },

  selectBtn: {
    borderWidth: 1, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  dropdown: {
    borderWidth: 1, borderRadius: 12,
    marginTop: 4, overflow: "hidden",
  },
  dropItem: {
    paddingHorizontal: 14, paddingVertical: 12,
    borderBottomWidth: 1,
  },

  fileActions: { flexDirection: "row", gap: 10, marginBottom: 12 },
  fileBtn: {
    flex: 1, borderWidth: 1, borderRadius: 12,
    paddingVertical: 14, alignItems: "center", gap: 6,
  },
  fileBtnIcon: { fontSize: 22 },
  fileBtnText: { fontSize: 11, fontWeight: "700" },

  fileList:      { gap: 8 },
  fileRow:       { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderRadius: 12, padding: 10 },
  fileThumbnail: { width: 40, height: 40, borderRadius: 8 },
  fileIcon:      { width: 40, height: 40, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  fileName:      { flex: 1, fontSize: 12, fontWeight: "600" },

  deliveryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 4 },
  deliveryCard: {
    width: "47%", borderWidth: 1.5, borderRadius: 12,
    paddingVertical: 12, paddingHorizontal: 14,
  },
  deliveryLabel: { fontSize: 13, fontWeight: "800", marginBottom: 3 },
  deliveryTag:   { fontSize: 10, fontWeight: "700" },

  commissionBox: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderWidth: 1, borderRadius: 12, padding: 14, marginTop: 16,
  },
  commissionIcon:  { fontSize: 18 },
  commissionText:  { flex: 1 },
  commissionTitle: { fontSize: 12, fontWeight: "800" },
  commissionSub:   { fontSize: 11, marginTop: 2 },

  bottomBar:  { borderTopWidth: 1, paddingHorizontal: 16, paddingTop: 12 },
  bottomRow:  { flexDirection: "row", gap: 10 },
  backBtnBottom: {
    paddingHorizontal: 16, paddingVertical: 14,
    borderWidth: 1, borderRadius: 14, alignItems: "center", justifyContent: "center",
  },
  backBtnText: { fontSize: 13, fontWeight: "700" },
  nextBtn: {
    borderRadius: 14, paddingVertical: 15,
    alignItems: "center", justifyContent: "center",
  },
  nextBtnText: { fontSize: 15, fontWeight: "900", color: "#fff", letterSpacing: -0.2 },

  // Success
  successWrap: {
    flex: 1, alignItems: "center", justifyContent: "center",
    padding: 32, gap: 8,
  },
  successIcon: {
    width: 88, height: 88, borderRadius: 28,
    backgroundColor: "#22c55e1a", borderWidth: 1, borderColor: "#22c55e33",
    alignItems: "center", justifyContent: "center", marginBottom: 8,
  },
  successEmoji:  { fontSize: 42 },
  successTitle:  { fontSize: 22, fontWeight: "900", color: C.foreground, textAlign: "center", letterSpacing: -0.4 },
  successSub:    { fontSize: 13, color: C.mutedForeground, textAlign: "center", lineHeight: 20, maxWidth: 300, marginTop: 4 },
  successBadgeRow: { flexDirection: "row", gap: 10, marginVertical: 16 },
  successBadge: {
    flex: 1, backgroundColor: C.surface2, borderRadius: 12,
    borderWidth: 1, borderColor: C.border, padding: 12, alignItems: "center",
  },
  badgeEmoji: { fontSize: 22, marginBottom: 6 },
  badgeLabel: { fontSize: 9, fontWeight: "700", color: C.mutedForeground, textAlign: "center", lineHeight: 13 },
  primaryBtn: {
    width: "100%", borderRadius: 14, paddingVertical: 16,
    alignItems: "center", marginTop: 8,
  },
  primaryBtnText:   { fontSize: 15, fontWeight: "900", color: "#fff" },
  secondaryBtn:     { width: "100%", paddingVertical: 12, alignItems: "center" },
  secondaryBtnText: { fontSize: 13, fontWeight: "600" },
});
