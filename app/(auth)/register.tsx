import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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
import { ILLER, IL_LISTESI } from "../../constants/cities";
import { Colors } from "../../constants/theme";
import { RegisterData, UserRole, useAuth } from "../../src/store/AuthContext";

const C = Colors.dark;

// ── Küçük Yardımcı Bileşenler ─────────────────────────────────────────────────

const StepBar = ({ step, total }: { step: number; total: number }) => (
  <View style={{ flexDirection: "row", gap: 6, paddingHorizontal: 24, marginBottom: 8 }}>
    {Array.from({ length: total }).map((_, i) => (
      <View
        key={i}
        style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: i < step ? C.accent : C.border }}
      />
    ))}
  </View>
);

const PasswordStrength = ({ password }: { password: string }) => {
  if (!password) return null;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const colors = ["", C.error, C.warning, "#84cc16", C.success];
  const labels = ["", "Zayıf", "Orta", "İyi", "Güçlü"];
  return (
    <View style={{ marginTop: 6, marginBottom: 4 }}>
      <View style={{ flexDirection: "row", gap: 4, marginBottom: 4 }}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: i <= score ? colors[score] : C.border }} />
        ))}
      </View>
      <Text style={{ fontSize: 11, color: colors[score] }}>{labels[score]}</Text>
    </View>
  );
};

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: any;
  secureTextEntry?: boolean;
  error?: string;
  autoCapitalize?: any;
  multiline?: boolean;
  rightElement?: React.ReactNode;
}

const InputField = ({ label, value, onChangeText, placeholder, keyboardType, secureTextEntry, error, autoCapitalize, multiline, rightElement }: InputFieldProps) => (
  <View style={styles.inputWrap}>
    <Text style={[styles.label, { color: C.subtleForeground }]}>{label}</Text>
    <View style={[styles.inputRow, error && { borderColor: C.error }]}>
      <TextInput
        style={[styles.input, multiline && { minHeight: 80, textAlignVertical: "top", paddingTop: 14 }, { color: C.foreground }]}
        placeholder={placeholder}
        placeholderTextColor={C.subtleForeground}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType || "default"}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize || "none"}
        autoCorrect={false}
        multiline={multiline}
      />
      {rightElement}
    </View>
    {error && <Text style={[styles.errorText, { color: C.error }]}>{error}</Text>}
  </View>
);

interface DocPickerProps {
  label: string;
  file?: { name: string };
  onPick: () => void;
  error?: string;
  required?: boolean;
}

const DocPickerRow = ({ label, file, onPick, error, required }: DocPickerProps) => (
  <View style={styles.inputWrap}>
    <Text style={[styles.label, { color: C.subtleForeground }]}>
      {label} {required && <Text style={{ color: C.error }}>*</Text>}
    </Text>
    <TouchableOpacity
      style={[styles.docBtn, error && { borderColor: C.error }, file && { borderColor: C.accent, backgroundColor: C.accent + "12" }]}
      onPress={onPick}
      activeOpacity={0.8}
    >
      <Text style={{ fontSize: 20, marginRight: 8 }}>{file ? "✅" : "📎"}</Text>
      <Text style={[styles.docBtnText, { color: file ? C.accent : C.mutedForeground }]} numberOfLines={1}>
        {file ? file.name : "Dosya seç (JPG, PNG, PDF — maks 10 MB)"}
      </Text>
    </TouchableOpacity>
    {error && <Text style={[styles.errorText, { color: C.error }]}>{error}</Text>}
  </View>
);

// ── Ana Bileşen ───────────────────────────────────────────────────────────────

type DocKey = "kimlik" | "esnaf_muafiyet" | "vergi_levhasi" | "imza_sirkuleri" | "faaliyet_belgesi";

interface DocFile { uri: string; name: string; mimeType: string; }

const ROLES: { id: UserRole; icon: string; title: string; sub: string }[] = [
  { id: "musteri",       icon: "🛍️", title: "Müşteri",           sub: "Alışveriş yap, sipariş takip et" },
  { id: "sanatci",       icon: "🎨", title: "Sanatçı",           sub: "STL/OBJ tasarım ve biblo heykel sat" },
  { id: "magaza",        icon: "🏪", title: "Mağaza",            sub: "Filament, yazıcı parçası ve ürün sat" },
  { id: "cozum-ortagi",  icon: "⚙️", title: "Çözüm Ortağı",     sub: "3D baskı ve modelleme hizmeti sun" },
];

const EXPERTISE_OPTIONS = ["3D Baskı", "3D Modelleme", "Her İkisi", "Diğer"];

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();

  const [step, setStep]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState<Record<string, string>>({});

  const [role, setRole]           = useState<UserRole | null>(null);
  const [showPw, setShowPw]       = useState(false);
  const [showPwC, setShowPwC]     = useState(false);
  const [ilOpen, setIlOpen]       = useState(false);
  const [ilceOpen, setIlceOpen]   = useState(false);
  const [expOpen, setExpOpen]     = useState(false);

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    password: "", passwordConfirm: "",
    tckn: "", iban: "", companyName: "", taxNumber: "",
    taxOffice: "", expertiseArea: "", il: "", ilce: "", adres: "",
  });

  const [docs, setDocs] = useState<Partial<Record<DocKey, DocFile>>>({});

  const set = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }));
  const clrErr = (key: string) => setErrors((p) => { const e = { ...p }; delete e[key]; return e; });

  const pickDoc = async (field: DocKey) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets?.[0]) {
        const a = result.assets[0];
        setDocs((p) => ({ ...p, [field]: { uri: a.uri, name: a.name, mimeType: a.mimeType || "application/octet-stream" } }));
        clrErr(field);
      }
    } catch {
      Alert.alert("Hata", "Dosya seçilirken bir sorun oluştu.");
    }
  };

  const validateStep = (s: number) => {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (!role) e.role = "Lütfen bir hesap türü seçin";
    }
    if (s === 2) {
      if (!form.firstName) e.firstName = "Ad zorunlu";
      if (!form.lastName)  e.lastName  = "Soyad zorunlu";
      if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Geçerli e-posta girin";
      if (!form.phone) e.phone = "Telefon zorunlu";
      if (form.password.length < 8)         e.password = "En az 8 karakter";
      if (form.password !== form.passwordConfirm) e.passwordConfirm = "Şifreler eşleşmiyor";
    }
    if (s === 3 && role === "sanatci") {
      if (!form.tckn || form.tckn.length !== 11) e.tckn = "Geçerli TC kimlik no girin (11 hane)";
      if (!form.iban) e.iban = "IBAN zorunlu";
      if (!docs.kimlik)        e.kimlik       = "Kimlik görseli zorunlu";
      if (!docs.esnaf_muafiyet) e.esnaf_muafiyet = "Esnaf muafiyet belgesi zorunlu";
    }
    if (s === 3 && (role === "magaza" || role === "cozum-ortagi")) {
      if (!form.companyName) e.companyName = "Şirket adı zorunlu";
      if (!form.taxNumber)   e.taxNumber   = "Vergi numarası zorunlu";
      if (!form.taxOffice)   e.taxOffice   = "Vergi dairesi zorunlu";
      if (!form.iban)        e.iban        = "Şirket IBAN zorunlu";
      if (!docs.vergi_levhasi)    e.vergi_levhasi   = "Vergi levhası zorunlu";
      if (!docs.imza_sirkuleri)   e.imza_sirkuleri  = "İmza sirküleri zorunlu";
      if (!docs.faaliyet_belgesi) e.faaliyet_belgesi= "Faaliyet belgesi zorunlu";
      if (role === "cozum-ortagi" && !form.expertiseArea) e.expertiseArea = "Uzmanlık alanı seçin";
    }
    if (s === 4) {
      if (!form.il)   e.il   = "İl seçiniz";
      if (!form.ilce) e.ilce = "İlçe seçiniz";
      if (!form.adres) e.adres = "Açık adres zorunlu";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => { if (validateStep(step)) setStep((s) => s + 1); };
  const prevStep = () => { setErrors({}); setStep((s) => s - 1); };

  const handleRegister = async () => {
    if (!validateStep(4) || !role) return;
    setLoading(true);
    try {
      const data: RegisterData = {
        firstName: form.firstName, lastName: form.lastName,
        email: form.email, phone: form.phone, password: form.password,
        role,
        tckn: form.tckn || undefined,
        iban: form.iban || undefined,
        companyName:   form.companyName   || undefined,
        taxNumber:     form.taxNumber     || undefined,
        taxOffice:     form.taxOffice     || undefined,
        expertiseArea: form.expertiseArea || undefined,
        address_1: form.adres, city: form.il, state: form.ilce,
        files: Object.keys(docs).length ? docs as RegisterData["files"] : undefined,
      };
      const result = await register(data);
      if (result.needsApproval) {
        Alert.alert(
          "Kayıt Başarılı 🎉",
          "Belgeleriniz inceleniyor. Onay sonrası hesabınız aktifleşecek.",
          [{ text: "Tamam", onPress: () => router.replace("/(tabs)") }]
        );
      } else {
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      Alert.alert("Kayıt Başarısız", err?.message || "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const ilceler = form.il ? ILLER[form.il] || [] : [];
  const stepTitle = ["", "Hesap Türü", "Temel Bilgiler", "Belgeler", "Adres & Onay"];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: C.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={step === 1 ? () => router.back() : prevStep}>
          <Text style={[styles.backText, { color: C.mutedForeground }]}>← Geri</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.stepLabel, { color: C.subtleForeground }]}>Adım {step} / 4</Text>
          <Text style={[styles.title, { color: C.foreground }]}>{stepTitle[step]}</Text>
        </View>
      </View>

      <StepBar step={step} total={4} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── ADIM 1: Rol Seçimi ──────────────────────────────────────────── */}
        {step === 1 && (
          <View style={styles.stepContent}>
            <Text style={[styles.stepDesc, { color: C.mutedForeground }]}>
              Fimarkt ekosistemindeki rolünü seç.
            </Text>
            {ROLES.map((r) => (
              <TouchableOpacity
                key={r.id}
                style={[styles.roleCard, { backgroundColor: C.surface, borderColor: role === r.id ? C.accent : C.border }, role === r.id && { backgroundColor: C.accent + "12" }]}
                onPress={() => { setRole(r.id); clrErr("role"); }}
                activeOpacity={0.85}
              >
                <Text style={styles.roleIcon}>{r.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.roleTitle, { color: C.foreground }]}>{r.title}</Text>
                  <Text style={[styles.roleSub, { color: C.mutedForeground }]}>{r.sub}</Text>
                </View>
                <View style={[styles.radio, { borderColor: role === r.id ? C.accent : C.border, backgroundColor: role === r.id ? C.accent : "transparent" }]}>
                  {role === r.id && <Text style={styles.radioCheck}>✓</Text>}
                </View>
              </TouchableOpacity>
            ))}
            {errors.role && <Text style={[styles.errorText, { color: C.error }]}>{errors.role}</Text>}
          </View>
        )}

        {/* ── ADIM 2: Temel Bilgiler ──────────────────────────────────────── */}
        {step === 2 && (
          <View style={styles.stepContent}>
            <Text style={[styles.stepDesc, { color: C.mutedForeground }]}>Hesap bilgilerini gir.</Text>
            <View style={styles.nameRow}>
              <View style={{ flex: 1 }}>
                <InputField label="AD" placeholder="Adın" value={form.firstName}
                  onChangeText={(v) => { set("firstName", v); clrErr("firstName"); }}
                  autoCapitalize="words" error={errors.firstName} />
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                <InputField label="SOYAD" placeholder="Soyadın" value={form.lastName}
                  onChangeText={(v) => { set("lastName", v); clrErr("lastName"); }}
                  autoCapitalize="words" error={errors.lastName} />
              </View>
            </View>
            <InputField label="E-POSTA" placeholder="ornek@email.com" value={form.email}
              onChangeText={(v) => { set("email", v); clrErr("email"); }}
              keyboardType="email-address" error={errors.email} />
            <InputField label="TELEFON" placeholder="05XX XXX XX XX" value={form.phone}
              onChangeText={(v) => { set("phone", v); clrErr("phone"); }}
              keyboardType="phone-pad" error={errors.phone} />
            <InputField label="ŞİFRE" placeholder="En az 8 karakter" value={form.password}
              onChangeText={(v) => { set("password", v); clrErr("password"); }}
              secureTextEntry={!showPw} error={errors.password}
              rightElement={
                <TouchableOpacity onPress={() => setShowPw(!showPw)} style={styles.eyeBtn}>
                  <Text style={styles.eyeText}>{showPw ? "🙈" : "👁"}</Text>
                </TouchableOpacity>
              } />
            <PasswordStrength password={form.password} />
            <InputField label="ŞİFRE TEKRAR" placeholder="Şifreni tekrar gir" value={form.passwordConfirm}
              onChangeText={(v) => { set("passwordConfirm", v); clrErr("passwordConfirm"); }}
              secureTextEntry={!showPwC} error={errors.passwordConfirm}
              rightElement={
                <TouchableOpacity onPress={() => setShowPwC(!showPwC)} style={styles.eyeBtn}>
                  <Text style={styles.eyeText}>{showPwC ? "🙈" : "👁"}</Text>
                </TouchableOpacity>
              } />
          </View>
        )}

        {/* ── ADIM 3: Dinamik Belgeler ────────────────────────────────────── */}
        {step === 3 && (
          <View style={styles.stepContent}>
            {role === "musteri" && (
              <View style={[styles.infoBanner, { backgroundColor: C.surface, borderColor: C.accent + "40" }]}>
                <Text style={{ fontSize: 28, marginBottom: 8 }}>✅</Text>
                <Text style={[styles.infoTitle, { color: C.foreground }]}>Ek belge gerekmiyor</Text>
                <Text style={[styles.infoSub, { color: C.mutedForeground }]}>
                  Müşteri hesabı için belge yükleme gerekmez. Devam et butonuna bas.
                </Text>
              </View>
            )}

            {role === "sanatci" && (
              <>
                <Text style={[styles.stepDesc, { color: C.mutedForeground }]}>
                  Sanatçı hesabı için kimlik ve muafiyet belgesi gereklidir.
                </Text>
                <InputField label="TC KİMLİK NUMARASI" placeholder="11 haneli TC no" value={form.tckn}
                  onChangeText={(v) => { set("tckn", v); clrErr("tckn"); }}
                  keyboardType="numeric" error={errors.tckn} />
                <DocPickerRow label="KİMLİK GÖRSELİ"        file={docs.kimlik}        onPick={() => pickDoc("kimlik")}        error={errors.kimlik}        required />
                <DocPickerRow label="ESNAF MUAFİYET BELGESİ" file={docs.esnaf_muafiyet} onPick={() => pickDoc("esnaf_muafiyet")} error={errors.esnaf_muafiyet} required />
                <InputField label="IBAN" placeholder="TR00 0000 0000 0000 0000 0000 00" value={form.iban}
                  onChangeText={(v) => { set("iban", v); clrErr("iban"); }}
                  autoCapitalize="characters" error={errors.iban} />
              </>
            )}

            {(role === "magaza" || role === "cozum-ortagi") && (
              <>
                <Text style={[styles.stepDesc, { color: C.mutedForeground }]}>
                  {role === "cozum-ortagi" ? "Çözüm ortağı" : "Mağaza"} belgelerini yükle.
                </Text>
                <InputField label="ŞİRKET ADI"      placeholder="Firma A.Ş." value={form.companyName}
                  onChangeText={(v) => { set("companyName", v); clrErr("companyName"); }}
                  autoCapitalize="words" error={errors.companyName} />
                <InputField label="VERGİ NUMARASI"  placeholder="1234567890" value={form.taxNumber}
                  onChangeText={(v) => { set("taxNumber", v); clrErr("taxNumber"); }}
                  keyboardType="numeric" error={errors.taxNumber} />
                <InputField label="VERGİ DAİRESİ"   placeholder="Kadıköy VD" value={form.taxOffice}
                  onChangeText={(v) => { set("taxOffice", v); clrErr("taxOffice"); }}
                  autoCapitalize="words" error={errors.taxOffice} />
                <DocPickerRow label="VERGİ LEVHASI"      file={docs.vergi_levhasi}    onPick={() => pickDoc("vergi_levhasi")}    error={errors.vergi_levhasi}   required />
                <DocPickerRow label="İMZA SİRKÜLERİ"     file={docs.imza_sirkuleri}   onPick={() => pickDoc("imza_sirkuleri")}   error={errors.imza_sirkuleri}  required />
                <DocPickerRow label="FAALİYET BELGESİ"   file={docs.faaliyet_belgesi} onPick={() => pickDoc("faaliyet_belgesi")} error={errors.faaliyet_belgesi} required />
                <InputField label="ŞİRKET IBAN" placeholder="TR00 0000 0000 0000 0000 0000 00" value={form.iban}
                  onChangeText={(v) => { set("iban", v); clrErr("iban"); }}
                  autoCapitalize="characters" error={errors.iban} />

                {role === "cozum-ortagi" && (
                  <View style={styles.inputWrap}>
                    <Text style={[styles.label, { color: C.subtleForeground }]}>UZMANLIK ALANI <Text style={{ color: C.error }}>*</Text></Text>
                    <TouchableOpacity
                      style={[styles.inputRow, errors.expertiseArea && { borderColor: C.error }]}
                      onPress={() => setExpOpen(!expOpen)}
                    >
                      <Text style={[styles.input, { color: form.expertiseArea ? C.foreground : C.subtleForeground }]}>
                        {form.expertiseArea || "Uzmanlık alanı seçin"}
                      </Text>
                      <Text style={{ color: C.subtleForeground, paddingRight: 14 }}>▾</Text>
                    </TouchableOpacity>
                    {errors.expertiseArea && <Text style={[styles.errorText, { color: C.error }]}>{errors.expertiseArea}</Text>}
                    {expOpen && (
                      <View style={[styles.dropdown, { backgroundColor: C.surface2, borderColor: C.border }]}>
                        {EXPERTISE_OPTIONS.map((opt) => (
                          <TouchableOpacity
                            key={opt}
                            style={[styles.dropdownItem, { borderBottomColor: C.border }, form.expertiseArea === opt && { backgroundColor: C.accent + "15" }]}
                            onPress={() => { set("expertiseArea", opt); clrErr("expertiseArea"); setExpOpen(false); }}
                          >
                            <Text style={[styles.dropdownText, { color: form.expertiseArea === opt ? C.accent : C.foreground }]}>{opt}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </>
            )}
          </View>
        )}

        {/* ── ADIM 4: Adres & Onay ───────────────────────────────────────── */}
        {step === 4 && (
          <View style={styles.stepContent}>
            <Text style={[styles.stepDesc, { color: C.mutedForeground }]}>
              Teslimat adresin sipariş sırasında otomatik kullanılacak.
            </Text>

            {/* İl */}
            <View style={styles.inputWrap}>
              <Text style={[styles.label, { color: C.subtleForeground }]}>İL</Text>
              <TouchableOpacity
                style={[styles.inputRow, errors.il && { borderColor: C.error }]}
                onPress={() => { setIlOpen(!ilOpen); setIlceOpen(false); }}
              >
                <Text style={[styles.input, { color: form.il ? C.foreground : C.subtleForeground }]}>{form.il || "İl seçiniz"}</Text>
                <Text style={{ color: C.subtleForeground, paddingRight: 14 }}>▾</Text>
              </TouchableOpacity>
              {errors.il && <Text style={[styles.errorText, { color: C.error }]}>{errors.il}</Text>}
              {ilOpen && (
                <View style={[styles.dropdown, { backgroundColor: C.surface2, borderColor: C.border }]}>
                  <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                    {IL_LISTESI.map((il) => (
                      <TouchableOpacity
                        key={il}
                        style={[styles.dropdownItem, { borderBottomColor: C.border }, form.il === il && { backgroundColor: C.accent + "15" }]}
                        onPress={() => { set("il", il); set("ilce", ""); clrErr("il"); setIlOpen(false); }}
                      >
                        <Text style={[styles.dropdownText, { color: form.il === il ? C.accent : C.foreground }]}>{il}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* İlçe */}
            {form.il !== "" && (
              <View style={styles.inputWrap}>
                <Text style={[styles.label, { color: C.subtleForeground }]}>İLÇE</Text>
                <TouchableOpacity
                  style={[styles.inputRow, errors.ilce && { borderColor: C.error }]}
                  onPress={() => { setIlceOpen(!ilceOpen); setIlOpen(false); }}
                >
                  <Text style={[styles.input, { color: form.ilce ? C.foreground : C.subtleForeground }]}>{form.ilce || "İlçe seçiniz"}</Text>
                  <Text style={{ color: C.subtleForeground, paddingRight: 14 }}>▾</Text>
                </TouchableOpacity>
                {errors.ilce && <Text style={[styles.errorText, { color: C.error }]}>{errors.ilce}</Text>}
                {ilceOpen && (
                  <View style={[styles.dropdown, { backgroundColor: C.surface2, borderColor: C.border }]}>
                    <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                      {ilceler.map((ilce) => (
                        <TouchableOpacity
                          key={ilce}
                          style={[styles.dropdownItem, { borderBottomColor: C.border }, form.ilce === ilce && { backgroundColor: C.accent + "15" }]}
                          onPress={() => { set("ilce", ilce); clrErr("ilce"); setIlceOpen(false); }}
                        >
                          <Text style={[styles.dropdownText, { color: form.ilce === ilce ? C.accent : C.foreground }]}>{ilce}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            )}

            {/* Açık Adres */}
            <InputField label="AÇIK ADRES" placeholder="Mahalle, sokak, bina no, daire..." value={form.adres}
              onChangeText={(v) => { set("adres", v); clrErr("adres"); }}
              autoCapitalize="sentences" multiline error={errors.adres} />

            {/* KVKK */}
            <TouchableOpacity
              style={styles.kvkkRow}
              onPress={() => clrErr("kvkk")}
              activeOpacity={1}
            >
              <View style={[styles.kvkkCheck, { borderColor: C.border, backgroundColor: errors.kvkk ? C.error + "20" : C.surface2 }]}>
                <Text style={{ color: C.foreground, fontSize: 11 }}>✓</Text>
              </View>
              <Text style={[styles.kvkkText, { color: C.mutedForeground }]}>
                <Text style={{ color: C.accent }}>Kullanım Koşulları</Text>
                {" "}ve{" "}
                <Text style={{ color: C.accent }}>KVKK Aydınlatma Metni</Text>
                {"'ni okudum ve kabul ediyorum."}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Alt Buton */}
      <View style={[styles.footer, { backgroundColor: C.background, borderTopColor: C.border }]}>
        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: C.accent }, loading && { opacity: 0.7 }]}
          onPress={step === 4 ? handleRegister : nextStep}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.nextBtnText}>
            {loading ? "Kayıt yapılıyor..." : step === 4 ? "Kayıt Ol 🚀" : "Devam Et →"}
          </Text>
        </TouchableOpacity>
        {step === 1 && (
          <View style={styles.footerRow}>
            <Text style={[styles.footerText, { color: C.mutedForeground }]}>Zaten hesabın var mı? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text style={[styles.footerLink, { color: C.accent }]}>Giriş Yap</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header:      { flexDirection: "row", alignItems: "center", paddingHorizontal: 24, paddingTop: 56, paddingBottom: 12, gap: 12, borderBottomWidth: 1 },
  backBtn:     { paddingRight: 4 },
  backText:    { fontSize: 14 },
  stepLabel:   { fontSize: 11, marginBottom: 2 },
  title:       { fontSize: 22, fontWeight: "800", letterSpacing: -0.5 },
  scroll:      { paddingBottom: 20 },
  stepContent: { paddingHorizontal: 24, paddingTop: 16 },
  stepDesc:    { fontSize: 13, marginBottom: 20, lineHeight: 20 },
  nameRow:     { flexDirection: "row" },
  inputWrap:   { marginBottom: 14 },
  label:       { fontSize: 11, fontWeight: "700", letterSpacing: 0.5, marginBottom: 6 },
  inputRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 14,
  },
  input:       { flex: 1, padding: 14, fontSize: 14 },
  eyeBtn:      { padding: 12 },
  eyeText:     { fontSize: 16 },
  errorText:   { fontSize: 11, marginTop: 4, marginLeft: 2 },
  roleCard:    { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 16, padding: 18, marginBottom: 12, gap: 14 },
  roleIcon:    { fontSize: 28 },
  roleTitle:   { fontSize: 15, fontWeight: "700", marginBottom: 2 },
  roleSub:     { fontSize: 12 },
  radio:       { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  radioCheck:  { color: "#ffffff", fontSize: 11, fontWeight: "700" },
  docBtn:      { flexDirection: "row", alignItems: "center", borderWidth: 1.5, borderStyle: "dashed", borderColor: C.border, borderRadius: 14, padding: 14, backgroundColor: C.surface },
  docBtnText:  { flex: 1, fontSize: 13 },
  infoBanner:  { alignItems: "center", borderWidth: 1, borderRadius: 16, padding: 28, marginBottom: 8 },
  infoTitle:   { fontSize: 18, fontWeight: "700", marginBottom: 6 },
  infoSub:     { fontSize: 13, textAlign: "center", lineHeight: 20 },
  dropdown:    { borderWidth: 1, borderRadius: 12, marginTop: 4, zIndex: 100 },
  dropdownItem:{ padding: 12, borderBottomWidth: 1 },
  dropdownText:{ fontSize: 14 },
  kvkkRow:     { flexDirection: "row", gap: 10, marginTop: 8, marginBottom: 6, alignItems: "flex-start" },
  kvkkCheck:   { width: 20, height: 20, borderRadius: 5, borderWidth: 1, marginTop: 1, alignItems: "center", justifyContent: "center" },
  kvkkText:    { flex: 1, fontSize: 12, lineHeight: 18 },
  footer:      { padding: 20, paddingBottom: 30, borderTopWidth: 1 },
  nextBtn:     { borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  nextBtnText: { color: "#ffffff", fontSize: 15, fontWeight: "700" },
  footerRow:   { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 14 },
  footerText:  { fontSize: 13 },
  footerLink:  { fontSize: 13, fontWeight: "600" },
});
