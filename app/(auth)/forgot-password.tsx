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
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants";
import { AuthButton, AuthInput } from "../../components/ui/AuthComponents";

const BACKEND = "https://fimarkt-backend-production.up.railway.app";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert("Hata", "Geçerli bir e-posta adresi girin.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (data.success) {
        router.push({ pathname: "/otp", params: { email } });
      } else {
        Alert.alert("Hata", data.message || "Bir hata oluştu.");
      }
    } catch {
      Alert.alert("Hata", "Sunucuya bağlanılamadı.");
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
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backText}>← Geri</Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            Şifreni{"\n"}
            <Text style={{ color: Colors.accent }}>Sıfırla</Text>
          </Text>
          <Text style={styles.sub}>E-posta adresine doğrulama kodu göndereceğiz.</Text>
        </View>
        <View style={styles.form}>
          <AuthInput
            label="E-POSTA"
            placeholder="Kayıtlı e-posta adresin"
            value={email}
            onChangeText={setEmail}
            icon="✉️"
            keyboardType="email-address"
          />
        </View>
        <View style={styles.submitArea}>
          <AuthButton title="Kod Gönder" onPress={handleSend} loading={loading} />
        </View>
        <TouchableOpacity style={styles.backLink} onPress={() => router.push("/login")}>
          <Text style={styles.backLinkText}>← Giriş ekranına dön</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 40 },
  header: { padding: 24, paddingTop: 56 },
  backBtn: { marginBottom: 20 },
  backText: { fontSize: 14, color: Colors.text2 },
  title: {
    fontSize: 30, fontWeight: "800", color: Colors.text,
    letterSpacing: -0.8, lineHeight: 38, marginBottom: 6,
  },
  sub: { fontSize: 13, color: Colors.text2, lineHeight: 20 },
  form: { paddingHorizontal: 24 },
  submitArea: { paddingHorizontal: 24, marginTop: 16 },
  backLink: { alignItems: "center", marginTop: 16 },
  backLinkText: { fontSize: 13, color: Colors.text2 },
});
