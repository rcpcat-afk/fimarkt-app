import { useLocalSearchParams, useRouter } from "expo-router";
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

export default function NewPasswordScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!pw || pw.length < 8) {
      Alert.alert("Hata", "En az 8 karakter girin.");
      return;
    }
    if (pw !== pw2) {
      Alert.alert("Hata", "Şifreler eşleşmiyor.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pw }),
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert("Başarılı", "Şifreniz güncellendi.", [
          { text: "Giriş Yap", onPress: () => router.replace("/login") },
        ]);
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
            Yeni{"\n"}
            <Text style={{ color: Colors.accent }}>Şifre</Text>
          </Text>
          <Text style={styles.sub}>Güçlü bir şifre oluştur.</Text>
        </View>
        <View style={styles.form}>
          <AuthInput
            label="YENİ ŞİFRE"
            placeholder="En az 8 karakter"
            value={pw}
            onChangeText={setPw}
            icon="🔒"
            secureTextEntry
          />
          <AuthInput
            label="ŞİFRE TEKRAR"
            placeholder="Şifreyi tekrar gir"
            value={pw2}
            onChangeText={setPw2}
            icon="🔒"
            secureTextEntry
          />
        </View>
        <View style={styles.submitArea}>
          <AuthButton title="Şifreyi Güncelle" onPress={handleUpdate} loading={loading} />
        </View>
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
});
