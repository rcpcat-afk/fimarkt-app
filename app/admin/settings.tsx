import { useRouter } from "expo-router";
import React, { useState } from "react";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../constants";

const SECTIONS = [
  {
    id: "banner",
    title: "🖼️ Ana Sayfa Banner",
    desc: "Banner başlığı ve alt yazısını düzenle",
    fields: [
      {
        key: "banner_title",
        label: "Banner Başlığı",
        placeholder: "Fimarkt'a Hoş Geldiniz",
      },
      {
        key: "banner_subtitle",
        label: "Banner Alt Yazı",
        placeholder: "Türkiye'nin 3D baskı marketi",
      },
      {
        key: "banner_cta",
        label: "Buton Yazısı",
        placeholder: "Alışverişe Başla",
      },
    ],
  },
  {
    id: "featured",
    title: "⭐ Öne Çıkan",
    desc: "Öne çıkan ürün ID'lerini virgülle gir",
    fields: [
      {
        key: "featured_ids",
        label: "Ürün ID'leri",
        placeholder: "123, 456, 789",
      },
    ],
  },
  {
    id: "campaign",
    title: "🎯 Kampanya",
    desc: "Aktif kampanya bilgisi",
    fields: [
      {
        key: "campaign_title",
        label: "Kampanya Başlığı",
        placeholder: "Yaz İndirimi",
      },
      {
        key: "campaign_desc",
        label: "Kampanya Açıklaması",
        placeholder: "%20 indirim fırsatı",
      },
      { key: "campaign_code", label: "İndirim Kodu", placeholder: "YAZ20" },
    ],
  },
  {
    id: "contact",
    title: "📞 İletişim Bilgileri",
    desc: "Destek hattı ve WhatsApp numarası",
    fields: [
      { key: "whatsapp", label: "WhatsApp", placeholder: "+905001234567" },
      {
        key: "support_email",
        label: "Destek E-posta",
        placeholder: "destek@fimarkt.com.tr",
      },
      {
        key: "support_phone",
        label: "Destek Telefon",
        placeholder: "+905001234567",
      },
    ],
  },
];

export default function AdminSettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    // İleride backend'e kaydedilecek
    setSaved(true);
    Alert.alert("Kaydedildi", "Ayarlar kaydedildi");
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Uygulama Ayarları</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>💡</Text>
          <Text style={styles.infoText}>
            Bu ayarlar ilerleyen aşamada backend'e bağlanacak ve uygulamaya
            yansıyacak.
          </Text>
        </View>

        {SECTIONS.map((section) => (
          <View key={section.id} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionDesc}>{section.desc}</Text>
            {section.fields.map((field) => (
              <View key={field.key} style={styles.field}>
                <Text style={styles.label}>{field.label}</Text>
                <TextInput
                  style={styles.input}
                  value={values[field.key] || ""}
                  onChangeText={(v) => handleChange(field.key, v)}
                  placeholder={field.placeholder}
                  placeholderTextColor={Colors.text3}
                />
              </View>
            ))}
          </View>
        ))}

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>
            {saved ? "✅ Kaydedildi" : "Ayarları Kaydet"}
          </Text>
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
  section: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },
  sectionDesc: { fontSize: 12, color: Colors.text2, marginBottom: 14 },
  field: { marginBottom: 12 },
  label: {
    fontSize: 12,
    color: Colors.text2,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Colors.text,
    fontSize: 13,
  },
  footer: {
    padding: 16,
    backgroundColor: Colors.bg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  saveBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
