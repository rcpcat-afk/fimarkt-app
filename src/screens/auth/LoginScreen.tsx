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
import { Colors } from "../../../constants";
import { useAuth } from "../../store/AuthContext";

export default function LoginScreen({ navigation }: any) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );

  const validate = () => {
    const e: typeof errors = {};
    if (!email) e.email = "E-posta zorunlu";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Geçerli e-posta girin";
    if (!password) e.password = "Şifre zorunlu";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email, password);
      navigation.replace("/(tabs)");
    } catch {
      Alert.alert("Giriş Başarısız", "E-posta veya şifre hatalı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.bg }}
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
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>

          <View style={styles.logoRow}>
            <View style={styles.logoCube}>
              <View style={styles.cubeTop} />
              <View style={styles.cubeLeft} />
              <View style={styles.cubeRight} />
            </View>
            <Text style={styles.logoText}>fimarkt</Text>
          </View>

          <Text style={styles.title}>Tekrar hoş geldin 👋</Text>
          <Text style={styles.sub}>Hesabına giriş yap, üretmeye devam et.</Text>
        </View>

        {/* Sosyal giriş */}
        <View style={styles.socialRow}>
          <TouchableOpacity
            style={styles.socialBtn}
            onPress={() =>
              Alert.alert("Yakında", "Google ile giriş yakında aktif olacak.")
            }
          >
            <Text style={styles.socialIcon}>G</Text>
            <Text style={styles.socialText}>Google</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.socialBtn}
            onPress={() =>
              Alert.alert("Yakında", "Apple ile giriş yakında aktif olacak.")
            }
          >
            <Text style={styles.socialIcon}>🍎</Text>
            <Text style={styles.socialText}>Apple</Text>
          </TouchableOpacity>
        </View>

        {/* Ayraç */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>veya e-posta ile</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputWrap}>
            <Text style={styles.label}>E-POSTA</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="ornek@email.com"
              placeholderTextColor={Colors.text3}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
          </View>

          <View style={styles.inputWrap}>
            <Text style={styles.label}>ŞİFRE</Text>
            <View
              style={[
                styles.passwordWrap,
                errors.password && styles.inputError,
              ]}
            >
              <TextInput
                style={styles.passwordInput}
                placeholder="Şifrenizi girin"
                placeholderTextColor={Colors.text3}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                <Text style={styles.eyeText}>{showPassword ? "🙈" : "👁"}</Text>
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.forgotBtn}
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text style={styles.forgotText}>Şifremi unuttum</Text>
          </TouchableOpacity>
        </View>

        {/* Giriş butonu */}
        <View style={styles.submitArea}>
          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.submitText}>
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Kayıt ol */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Hesabın yok mu? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={styles.footerLink}>Kayıt Ol</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 40 },
  header: {
    padding: 24,
    paddingTop: 56,
    alignItems: "center",
    marginBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface2,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    marginBottom: 24,
  },
  backArrow: {
    fontSize: 28,
    color: Colors.text,
    lineHeight: 32,
    marginTop: -2,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  logoCube: { width: 32, height: 32, position: "relative" },
  cubeTop: {
    position: "absolute",
    top: 0,
    left: 4,
    width: 24,
    height: 12,
    backgroundColor: Colors.accent,
    borderRadius: 3,
    transform: [{ skewX: "-20deg" }],
  },
  cubeLeft: {
    position: "absolute",
    top: 10,
    left: 0,
    width: 14,
    height: 16,
    backgroundColor: "rgba(255,107,43,0.6)",
    borderRadius: 2,
  },
  cubeRight: {
    position: "absolute",
    top: 10,
    left: 14,
    width: 14,
    height: 16,
    backgroundColor: "rgba(255,107,43,0.35)",
    borderRadius: 2,
  },
  logoText: {
    fontSize: 28,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: -1,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.8,
    marginBottom: 6,
    textAlign: "center",
  },
  sub: { fontSize: 13, color: Colors.text2, textAlign: "center" },
  socialRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  socialBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingVertical: 13,
  },
  socialIcon: { fontSize: 16, fontWeight: "700", color: Colors.text },
  socialText: { fontSize: 13, color: Colors.text, fontWeight: "500" },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 20,
    gap: 10,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { fontSize: 11, color: Colors.text3 },
  form: { paddingHorizontal: 24, gap: 4 },
  inputWrap: { marginBottom: 12 },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.text3,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    color: Colors.text,
  },
  inputError: { borderColor: Colors.red },
  passwordWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingRight: 4,
  },
  passwordInput: { flex: 1, padding: 14, fontSize: 14, color: Colors.text },
  eyeBtn: { padding: 10 },
  eyeText: { fontSize: 16 },
  errorText: { fontSize: 11, color: Colors.red, marginTop: 4, marginLeft: 2 },
  forgotBtn: { alignSelf: "flex-end", marginTop: 4 },
  forgotText: { fontSize: 12, color: Colors.text2 },
  submitArea: { paddingHorizontal: 24, marginTop: 20 },
  submitBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  submitText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  footerText: { fontSize: 13, color: Colors.text2 },
  footerLink: { fontSize: 13, color: Colors.accent, fontWeight: "600" },
});
