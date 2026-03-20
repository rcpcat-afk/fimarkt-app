import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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
import { Colors } from "../../constants/theme";
import { useAuth } from "../../src/store/AuthContext";

const C = Colors.dark;

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe]     = useState(false);
  const [loading, setLoading]           = useState(false);
  const [errors, setErrors]             = useState<{ email?: string; password?: string }>({});

  useEffect(() => {
    AsyncStorage.getItem("fimarkt_remember_email").then((v) => {
      if (v) { setEmail(v); setRememberMe(true); }
    });
  }, []);

  const validate = () => {
    const e: typeof errors = {};
    if (!email) e.email = "E-posta zorunlu";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Geçerli e-posta girin";
    if (!password) e.password = "Şifre zorunlu";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email, password);
      if (rememberMe) await AsyncStorage.setItem("fimarkt_remember_email", email);
      else            await AsyncStorage.removeItem("fimarkt_remember_email");
      router.replace("/(tabs)");
    } catch {
      Alert.alert("Giriş Başarısız", "E-posta veya şifre hatalı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backBtn, { borderColor: C.border, backgroundColor: C.surface2 }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.backArrow, { color: C.foreground }]}>‹</Text>
          </TouchableOpacity>

          <View style={styles.logoRow}>
            <View style={styles.logoCube}>
              <View style={[styles.cubeTop,   { backgroundColor: C.accent }]} />
              <View style={[styles.cubeLeft,  { backgroundColor: C.accent + "99" }]} />
              <View style={[styles.cubeRight, { backgroundColor: C.accent + "59" }]} />
            </View>
            <Text style={[styles.logoText, { color: C.foreground }]}>fimarkt</Text>
          </View>

          <Text style={[styles.title, { color: C.foreground }]}>Tekrar hoş geldin 👋</Text>
          <Text style={[styles.sub,   { color: C.mutedForeground }]}>
            Hesabına giriş yap, üretmeye devam et.
          </Text>
        </View>

        {/* Sosyal Giriş */}
        <View style={styles.socialRow}>
          {[{ icon: "G", label: "Google" }, { icon: "🍎", label: "Apple" }].map((s) => (
            <TouchableOpacity
              key={s.label}
              style={[styles.socialBtn, { backgroundColor: C.surface2, borderColor: C.border }]}
              onPress={() => Alert.alert("Yakında", `${s.label} ile giriş yakında aktif olacak.`)}
            >
              <Text style={[styles.socialIcon, { color: C.foreground }]}>{s.icon}</Text>
              <Text style={[styles.socialText, { color: C.foreground }]}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Ayraç */}
        <View style={styles.dividerRow}>
          <View style={[styles.dividerLine, { backgroundColor: C.border }]} />
          <Text style={[styles.dividerText, { color: C.subtleForeground }]}>veya e-posta ile</Text>
          <View style={[styles.dividerLine, { backgroundColor: C.border }]} />
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputWrap}>
            <Text style={[styles.label, { color: C.subtleForeground }]}>E-POSTA</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: C.surface, borderColor: errors.email ? C.error : C.border, color: C.foreground },
              ]}
              placeholder="ornek@email.com"
              placeholderTextColor={C.subtleForeground}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {errors.email && <Text style={[styles.errorText, { color: C.error }]}>{errors.email}</Text>}
          </View>

          <View style={styles.inputWrap}>
            <Text style={[styles.label, { color: C.subtleForeground }]}>ŞİFRE</Text>
            <View
              style={[
                styles.passwordWrap,
                { backgroundColor: C.surface, borderColor: errors.password ? C.error : C.border },
              ]}
            >
              <TextInput
                style={[styles.passwordInput, { color: C.foreground }]}
                placeholder="Şifrenizi girin"
                placeholderTextColor={C.subtleForeground}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Text style={styles.eyeText}>{showPassword ? "🙈" : "👁"}</Text>
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={[styles.errorText, { color: C.error }]}>{errors.password}</Text>}
          </View>

          {/* Beni Hatırla + Şifremi Unuttum */}
          <View style={styles.rememberRow}>
            <TouchableOpacity style={styles.checkRow} onPress={() => setRememberMe(!rememberMe)}>
              <View
                style={[
                  styles.checkbox,
                  { borderColor: C.border, backgroundColor: rememberMe ? C.accent : C.surface2 },
                ]}
              >
                {rememberMe && <Text style={styles.checkMark}>✓</Text>}
              </View>
              <Text style={[styles.rememberText, { color: C.mutedForeground }]}>Beni Hatırla</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/(auth)/forgot-password")}>
              <Text style={[styles.forgotText, { color: C.mutedForeground }]}>Şifremi unuttum</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Giriş Butonu */}
        <View style={styles.submitArea}>
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: C.accent }, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.submitText}>{loading ? "Giriş yapılıyor..." : "Giriş Yap"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerRow}>
          <Text style={[styles.footerText, { color: C.mutedForeground }]}>Hesabın yok mu? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
            <Text style={[styles.footerLink, { color: C.accent }]}>Kayıt Ol</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll:        { paddingBottom: 40 },
  header:        { padding: 24, paddingTop: 56, alignItems: "center", marginBottom: 8 },
  backBtn:       { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: "center", justifyContent: "center", alignSelf: "flex-start", marginBottom: 24 },
  backArrow:     { fontSize: 28, lineHeight: 32, marginTop: -2 },
  logoRow:       { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 20 },
  logoCube:      { width: 32, height: 32, position: "relative" },
  cubeTop:       { position: "absolute", top: 0, left: 4, width: 24, height: 12, borderRadius: 3, transform: [{ skewX: "-20deg" }] },
  cubeLeft:      { position: "absolute", top: 10, left: 0, width: 14, height: 16, borderRadius: 2 },
  cubeRight:     { position: "absolute", top: 10, left: 14, width: 14, height: 16, borderRadius: 2 },
  logoText:      { fontSize: 28, fontWeight: "900", letterSpacing: -1 },
  title:         { fontSize: 26, fontWeight: "800", letterSpacing: -0.8, marginBottom: 6, textAlign: "center" },
  sub:           { fontSize: 13, textAlign: "center" },
  socialRow:     { flexDirection: "row", gap: 10, paddingHorizontal: 24, marginBottom: 20 },
  socialBtn:     { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1, borderRadius: 14, paddingVertical: 13 },
  socialIcon:    { fontSize: 16, fontWeight: "700" },
  socialText:    { fontSize: 13, fontWeight: "500" },
  dividerRow:    { flexDirection: "row", alignItems: "center", paddingHorizontal: 24, marginBottom: 20, gap: 10 },
  dividerLine:   { flex: 1, height: 1 },
  dividerText:   { fontSize: 11 },
  form:          { paddingHorizontal: 24, gap: 4 },
  inputWrap:     { marginBottom: 12 },
  label:         { fontSize: 11, fontWeight: "700", letterSpacing: 0.5, marginBottom: 6 },
  input:         { borderWidth: 1, borderRadius: 14, padding: 14, fontSize: 14 },
  passwordWrap:  { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 14, paddingRight: 4 },
  passwordInput: { flex: 1, padding: 14, fontSize: 14 },
  eyeBtn:        { padding: 10 },
  eyeText:       { fontSize: 16 },
  errorText:     { fontSize: 11, marginTop: 4, marginLeft: 2 },
  rememberRow:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4, marginBottom: 4 },
  checkRow:      { flexDirection: "row", alignItems: "center", gap: 8 },
  checkbox:      { width: 20, height: 20, borderRadius: 5, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  checkMark:     { color: "#ffffff", fontSize: 11, fontWeight: "700" },
  rememberText:  { fontSize: 12 },
  forgotText:    { fontSize: 12 },
  submitArea:    { paddingHorizontal: 24, marginTop: 20 },
  submitBtn:     { borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  submitText:    { color: "#ffffff", fontSize: 15, fontWeight: "700" },
  footerRow:     { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 20 },
  footerText:    { fontSize: 13 },
  footerLink:    { fontSize: 13, fontWeight: "600" },
});
