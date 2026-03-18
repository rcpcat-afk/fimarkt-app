import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants";
import { AuthButton } from "../../components/ui/AuthComponents";

const BACKEND = "https://fimarkt-backend-production.up.railway.app";

export default function OTPScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
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
        router.push({ pathname: "/new-password", params: { email } });
      } else {
        Alert.alert("Hata", data.message || "Kod hatalı.");
      }
    } catch {
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
    } catch {
      Alert.alert("Hata", "Gönderilemedi.");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backText}>← Geri</Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            Kodu{"\n"}
            <Text style={{ color: Colors.accent }}>Gir</Text>
          </Text>
          <Text style={styles.sub}>{email} adresine 6 haneli kod gönderdik.</Text>
        </View>

        <View style={otpStyles.row}>
          {otp.map((val, idx) => (
            <TextInput
              key={idx}
              ref={(el) => { if (el) inputs.current[idx] = el; }}
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
          <AuthButton title="Devam Et" onPress={handleVerify} loading={loading} />
        </View>
      </ScrollView>
    </View>
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
  submitArea: { paddingHorizontal: 24, marginTop: 16 },
});

const otpStyles = StyleSheet.create({
  row: {
    flexDirection: "row", gap: 10, paddingHorizontal: 24,
    marginTop: 32, justifyContent: "center",
  },
  box: {
    width: 48, height: 60, backgroundColor: Colors.surface2,
    borderWidth: 1, borderColor: Colors.border, borderRadius: 12,
    fontSize: 22, fontWeight: "700", color: Colors.text,
  },
  filled: { borderColor: Colors.accent },
  resend: {
    flexDirection: "row", justifyContent: "center",
    alignItems: "center", marginTop: 20, marginBottom: 8,
  },
  resendText: { fontSize: 12, color: Colors.text2 },
  resendLink: { fontSize: 12, color: Colors.accent },
});
