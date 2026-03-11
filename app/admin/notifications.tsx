import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BACKEND_URL, Colors } from "../../constants";
import { useAuth } from "../../src/store/AuthContext";

const SEGMENTS = [
  { id: "all", label: "Tüm Kullanıcılar" },
  { id: "customers", label: "Müşteriler" },
];

export default function AdminNotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [segment, setSegment] = useState("all");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert("Hata", "Başlık ve mesaj zorunludur");
      return;
    }
    Alert.alert(
      "Bildirim Gönder",
      `"${title}" başlıklı bildirim ${segment === "all" ? "tüm kullanıcılara" : "müşterilere"} gönderilecek. Onaylıyor musun?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Gönder",
          onPress: async () => {
            setSending(true);
            try {
              const res = await fetch(
                `${BACKEND_URL}/api/admin/notifications/send`,
                {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${user?.token}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ title, body, segment }),
                },
              );
              const data = await res.json();
              if (res.ok) {
                Alert.alert("Başarılı", "Bildirim gönderildi", [
                  {
                    text: "Tamam",
                    onPress: () => {
                      setTitle("");
                      setBody("");
                    },
                  },
                ]);
              } else {
                Alert.alert("Hata", data.error || "Gönderilemedi");
              }
            } catch (e) {
              Alert.alert("Hata", "Bağlantı hatası");
            } finally {
              setSending(false);
            }
          },
        },
      ],
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bildirim Gönder</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>💡</Text>
          <Text style={styles.infoText}>
            Push bildirimler EAS Build sonrası aktif olacak. Şu an bildirimler
            kaydedilir ama iletilmez.
          </Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Hedef Kitle</Text>
          <View style={styles.segmentRow}>
            {SEGMENTS.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={[
                  styles.segmentBtn,
                  segment === s.id && styles.segmentBtnActive,
                ]}
                onPress={() => setSegment(s.id)}
              >
                <Text
                  style={[
                    styles.segmentText,
                    segment === s.id && styles.segmentTextActive,
                  ]}
                >
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Bildirim Başlığı *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Başlık gir..."
            placeholderTextColor={Colors.text3}
            maxLength={100}
          />
          <Text style={styles.charCount}>{title.length}/100</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Mesaj *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={body}
            onChangeText={setBody}
            placeholder="Bildirim mesajını gir..."
            placeholderTextColor={Colors.text3}
            multiline
            numberOfLines={4}
            maxLength={300}
          />
          <Text style={styles.charCount}>{body.length}/300</Text>
        </View>

        {title.length > 0 && body.length > 0 && (
          <View style={styles.preview}>
            <Text style={styles.previewTitle}>Önizleme</Text>
            <View style={styles.previewCard}>
              <Text style={styles.previewApp}>Fimarkt</Text>
              <Text style={styles.previewNotifTitle}>{title}</Text>
              <Text style={styles.previewNotifBody}>{body}</Text>
            </View>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[
            styles.sendBtn,
            (sending || !title || !body) && { opacity: 0.5 },
          ]}
          onPress={handleSend}
          disabled={sending || !title.trim() || !body.trim()}
        >
          {sending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.sendBtnText}>🔔 Bildirimi Gönder</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: {
    fontSize: 28,
    color: Colors.text,
    lineHeight: 32,
    marginTop: -2,
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: Colors.text },
  scroll: { flex: 1, padding: 16 },
  infoBox: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    gap: 10,
    marginBottom: 20,
    alignItems: "flex-start",
  },
  infoIcon: { fontSize: 18 },
  infoText: { flex: 1, fontSize: 12, color: Colors.text2, lineHeight: 18 },
  field: { marginBottom: 20 },
  label: {
    fontSize: 13,
    color: Colors.text2,
    fontWeight: "600",
    marginBottom: 8,
  },
  segmentRow: { flexDirection: "row", gap: 10 },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  segmentBtnActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  segmentText: { fontSize: 13, color: Colors.text2, fontWeight: "600" },
  segmentTextActive: { color: "#fff" },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: Colors.text,
    fontSize: 14,
  },
  textArea: { minHeight: 100, textAlignVertical: "top" },
  charCount: {
    fontSize: 11,
    color: Colors.text3,
    textAlign: "right",
    marginTop: 4,
  },
  preview: { marginBottom: 20 },
  previewTitle: {
    fontSize: 13,
    color: Colors.text2,
    fontWeight: "600",
    marginBottom: 8,
  },
  previewCard: {
    backgroundColor: Colors.surface2,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
  },
  previewApp: {
    fontSize: 11,
    color: Colors.accent,
    fontWeight: "700",
    marginBottom: 4,
  },
  previewNotifTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },
  previewNotifBody: { fontSize: 13, color: Colors.text2, lineHeight: 18 },
  footer: {
    padding: 16,
    backgroundColor: Colors.bg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  sendBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  sendBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
