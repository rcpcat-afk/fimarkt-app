import React, { useRef, useState } from "react";
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
import { AuthButton, AuthInput, Colors } from "../../components/AuthComponents";

const BACKEND = "https://fimarkt-backend-production.up.railway.app";

export function ForgotPasswordScreen({ navigation }: any) {
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
        navigation.navigate("OTP", { email });
      } else {
        Alert.alert("Hata", data.message || "Bir hata oluştu.");
      }
    } catch (e) {
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
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>← Geri</Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            Şifreni{"\n"}
            <Text style={{ color: Colors.accent }}>Sıfırla</Text>
          </Text>
          <Text style={styles.sub}>
            E-posta adresine doğrulama kodu göndereceğiz.
          </Text>
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
          <AuthButton
            title="Kod Gönder"
            onPress={handleSend}
            loading={loading}
          />
        </View>
        <TouchableOpacity
          style={styles.backLink}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.backLinkText}>← Giriş ekranına dön</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function OTPScreen({ navigation, route }: any) {
  const email = route?.params?.email || "";
  const inputs = useRef<TextInput[]>([]);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);

  const handleChange = (val: string, idx: number) => {
    const newOtp = [...otp];
    newOtp[idx] = val;
    setOtp(newOtp);
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (e: any, idx: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      Alert.alert("Hata", "6 haneli kodu eksiksiz girin.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code }),
      });
      const data = await response.json();
      if (data.success) {
        navigation.navigate("NewPassword", { email });
      } else {
        Alert.alert("Hata", data.message || "Kod hatalı.");
      }
    } catch (e) {
      Alert.alert("Hata", "Sunucuya bağlanılamadı.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await fetch(`${BACKEND}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      Alert.alert("Gönderildi", "Kod tekrar gönderildi.");
    } catch (e) {
      Alert.alert("Hata", "Gönderilemedi.");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>← Geri</Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            Kodu{"\n"}
            <Text style={{ color: Colors.accent }}>Gir</Text>
          </Text>
          <Text style={styles.sub}>
            {email} adresine 6 haneli kod gönderdik.
          </Text>
        </View>
        <View style={otpStyles.row}>
          {otp.map((val, idx) => (
            <TextInput
              key={idx}
              ref={(el) => {
                if (el) inputs.current[idx] = el;
              }}
              style={[otpStyles.box, !!val && otpStyles.filled]}
              value={val}
              onChangeText={(v) => handleChange(v.slice(-1), idx)}
              onKeyPress={(e) => handleKeyDown(e, idx)}
              keyboardType="numeric"
              maxLength={1}
              textAlign="center"
              selectionColor={Colors.accent}
            />
          ))}
        </View>
        <View style={otpStyles.resend}>
          <Text style={otpStyles.resendText}>Kodu almadın mı? </Text>
          <TouchableOpacity onPress={handleResend}>
            <Text style={otpStyles.resendLink}>Tekrar gönder</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.submitArea}>
          <AuthButton
            title="Devam Et"
            onPress={handleVerify}
            loading={loading}
          />
        </View>
      </ScrollView>
    </View>
  );
}

export function NewPasswordScreen({ navigation, route }: any) {
  const email = route?.params?.email || "";
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
          { text: "Giriş Yap", onPress: () => navigation.navigate("Login") },
        ]);
      } else {
        Alert.alert("Hata", data.message || "Bir hata oluştu.");
      }
    } catch (e) {
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
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
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
          <AuthButton
            title="Şifreyi Güncelle"
            onPress={handleUpdate}
            loading={loading}
          />
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
    fontSize: 30,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.8,
    lineHeight: 38,
    marginBottom: 6,
  },
  sub: { fontSize: 13, color: Colors.text2, lineHeight: 20 },
  form: { paddingHorizontal: 24 },
  submitArea: { paddingHorizontal: 24, marginTop: 16 },
  backLink: { alignItems: "center", marginTop: 16 },
  backLinkText: { fontSize: 13, color: Colors.text2 },
});

const otpStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 24,
    marginTop: 32,
    justifyContent: "center",
  },
  box: {
    width: 48,
    height: 60,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    fontSize: 22,
    fontWeight: "700",
    color: Colors.text,
  },
  filled: { borderColor: Colors.accent },
  resend: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 8,
  },
  resendText: { fontSize: 12, color: Colors.text2 },
  resendLink: { fontSize: 12, color: Colors.accent },
});
