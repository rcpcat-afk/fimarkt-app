import * as DocumentPicker from "expo-document-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
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

const QUESTIONS: Record<
  string,
  {
    id: string;
    question: string;
    type: "single" | "multi";
    options: { id: string; label: string; icon: string }[];
  }[]
> = {
  "3d-modelleme": [
    {
      id: "amac",
      question: "Modelleme amacınız nedir?",
      type: "single",
      options: [
        { id: "prototip", label: "Prototip Üretim", icon: "🔧" },
        { id: "seri", label: "Seri Üretim", icon: "🏭" },
        { id: "sunum", label: "Sunum / Görsel", icon: "🎨" },
        { id: "yedek", label: "Yedek Parça", icon: "⚙️" },
        { id: "diger", label: "Diğer", icon: "📋" },
      ],
    },
    {
      id: "kaynak",
      question: "Elinizde ne var?",
      type: "single",
      options: [
        { id: "cizim", label: "El Çizimi / Kroki", icon: "✏️" },
        { id: "teknik", label: "Teknik Çizim", icon: "📐" },
        { id: "fotograf", label: "Fotoğraf", icon: "📷" },
        { id: "fiziksel", label: "Fiziksel Nesne", icon: "📦" },
        { id: "sadece_fikir", label: "Sadece Fikir", icon: "💡" },
      ],
    },
    {
      id: "boyut",
      question: "Nesnenin boyutu nedir?",
      type: "single",
      options: [
        { id: "kucuk", label: "Küçük (< 10 cm)", icon: "🔹" },
        { id: "orta", label: "Orta (10–30 cm)", icon: "🔷" },
        { id: "buyuk", label: "Büyük (30–100 cm)", icon: "🔵" },
        { id: "cok_buyuk", label: "Çok Büyük (> 100 cm)", icon: "🟣" },
      ],
    },
    {
      id: "format",
      question: "Çıktı dosya formatı tercihiniz?",
      type: "multi",
      options: [
        { id: "stl", label: "STL", icon: "📄" },
        { id: "step", label: "STEP", icon: "📄" },
        { id: "obj", label: "OBJ", icon: "📄" },
        { id: "fark_etmez", label: "Fark Etmez", icon: "✅" },
      ],
    },
    {
      id: "butce",
      question: "Modelleme bütçeniz?",
      type: "single",
      options: [
        { id: "b1", label: "500₺ altı", icon: "💚" },
        { id: "b2", label: "500 – 2.000₺", icon: "💛" },
        { id: "b3", label: "2.000 – 5.000₺", icon: "🧡" },
        { id: "b4", label: "5.000₺ üzeri", icon: "❤️" },
      ],
    },
    {
      id: "sure",
      question: "Ne zaman ihtiyacınız var?",
      type: "single",
      options: [
        { id: "acil", label: "Acil (1-3 gün)", icon: "🔴" },
        { id: "normal", label: "Normal (1 hafta)", icon: "🟡" },
        { id: "esnek", label: "Esnek (2+ hafta)", icon: "🟢" },
      ],
    },
  ],
  "3d-tarama": [
    {
      id: "amac",
      question: "Tarama amacınız nedir?",
      type: "single",
      options: [
        { id: "tersine", label: "Tersine Mühendislik", icon: "🔄" },
        { id: "arsiv", label: "Arşivleme / Dijitalleştirme", icon: "🗄️" },
        { id: "analiz", label: "Kalite Analizi", icon: "🔬" },
        { id: "baski", label: "3D Baskıya Hazırlık", icon: "🖨️" },
        { id: "diger", label: "Diğer", icon: "📋" },
      ],
    },
    {
      id: "nesne_tipi",
      question: "Nesne tipi nedir?",
      type: "single",
      options: [
        { id: "endustriyel", label: "Endüstriyel Parça", icon: "⚙️" },
        { id: "urun", label: "Tüketici Ürünü", icon: "📦" },
        { id: "sanat", label: "Sanat / Heykel", icon: "🎭" },
        { id: "insan", label: "İnsan / Vücut", icon: "🧍" },
        { id: "mimari", label: "Mimari Eleman", icon: "🏛️" },
      ],
    },
    {
      id: "boyut",
      question: "Nesnenin boyutu nedir?",
      type: "single",
      options: [
        { id: "kucuk", label: "Küçük (< 20 cm)", icon: "🔹" },
        { id: "orta", label: "Orta (20–50 cm)", icon: "🔷" },
        { id: "buyuk", label: "Büyük (50–200 cm)", icon: "🔵" },
        { id: "cok_buyuk", label: "Çok Büyük (> 200 cm)", icon: "🟣" },
      ],
    },
    {
      id: "hassasiyet",
      question: "Hassasiyet ihtiyacınız nedir?",
      type: "single",
      options: [
        { id: "yuksek", label: "Yüksek (±0.1 mm)", icon: "🎯" },
        { id: "standart", label: "Standart (±0.5 mm)", icon: "✅" },
        { id: "genel", label: "Genel Amaçlı", icon: "📊" },
      ],
    },
    {
      id: "konum",
      question: "Tarama nerede yapılacak?",
      type: "single",
      options: [
        { id: "ofis", label: "Fidrop Ofisine Getireceğim", icon: "🏢" },
        { id: "saha", label: "Sahaya Gelinmesini İstiyorum", icon: "📍" },
        { id: "kargo", label: "Kargo ile Göndereceğim", icon: "🚚" },
      ],
    },
    {
      id: "sure",
      question: "Ne zaman ihtiyacınız var?",
      type: "single",
      options: [
        { id: "acil", label: "Acil (1-3 gün)", icon: "🔴" },
        { id: "normal", label: "Normal (1 hafta)", icon: "🟡" },
        { id: "esnek", label: "Esnek (2+ hafta)", icon: "🟢" },
      ],
    },
  ],
  danismanlik: [
    {
      id: "konu",
      question: "Hangi konuda danışmanlık istiyorsunuz?",
      type: "multi",
      options: [
        { id: "teknoloji", label: "Teknoloji Seçimi", icon: "🖨️" },
        { id: "malzeme", label: "Malzeme Seçimi", icon: "🧪" },
        { id: "maliyet", label: "Maliyet Optimizasyonu", icon: "💰" },
        { id: "tasarim", label: "Tasarım İyileştirme", icon: "✏️" },
        { id: "uretim", label: "Üretim Planlaması", icon: "📋" },
      ],
    },
    {
      id: "deneyim",
      question: "3D baskı deneyiminiz nedir?",
      type: "single",
      options: [
        { id: "yeni", label: "Yeni Başlıyorum", icon: "🌱" },
        { id: "temel", label: "Temel Bilgim Var", icon: "📚" },
        { id: "deneyimli", label: "Deneyimliyim", icon: "⭐" },
        { id: "uzman", label: "Uzman Seviyesinde", icon: "🏆" },
      ],
    },
    {
      id: "sektor",
      question: "Hangi sektörde faaliyet gösteriyorsunuz?",
      type: "single",
      options: [
        { id: "makine", label: "Makine / Üretim", icon: "⚙️" },
        { id: "medikal", label: "Medikal", icon: "🏥" },
        { id: "otomotiv", label: "Otomotiv", icon: "🚗" },
        { id: "mimari", label: "Mimarlık / İnşaat", icon: "🏗️" },
        { id: "egitim", label: "Eğitim / Araştırma", icon: "🎓" },
        { id: "diger", label: "Diğer", icon: "📋" },
      ],
    },
    {
      id: "butce",
      question: "Proje bütçeniz nedir?",
      type: "single",
      options: [
        { id: "b1", label: "1.000₺ altı", icon: "💚" },
        { id: "b2", label: "1.000 – 5.000₺", icon: "💛" },
        { id: "b3", label: "5.000 – 20.000₺", icon: "🧡" },
        { id: "b4", label: "20.000₺ üzeri", icon: "❤️" },
      ],
    },
    {
      id: "sure",
      question: "Ne zaman ihtiyacınız var?",
      type: "single",
      options: [
        { id: "acil", label: "Acil (Bu hafta)", icon: "🔴" },
        { id: "normal", label: "Normal (2-3 hafta)", icon: "🟡" },
        { id: "esnek", label: "Esnek (1+ ay)", icon: "🟢" },
      ],
    },
  ],
  prototip: [
    {
      id: "amac",
      question: "Prototipin amacı nedir?",
      type: "single",
      options: [
        { id: "test", label: "Fonksiyon Testi", icon: "🔬" },
        { id: "gorsel", label: "Görsel Sunum", icon: "🎨" },
        { id: "kalip", label: "Kalıp / Seri Üretim", icon: "🏭" },
        { id: "patent", label: "Patent / Belgeleme", icon: "📄" },
        { id: "diger", label: "Diğer", icon: "📋" },
      ],
    },
    {
      id: "malzeme",
      question: "Malzeme tercihiniz nedir?",
      type: "single",
      options: [
        { id: "plastik", label: "Plastik (FDM/SLA)", icon: "🧴" },
        { id: "metal", label: "Metal", icon: "⚙️" },
        { id: "esnek", label: "Esnek / Kauçuk", icon: "🔄" },
        { id: "fark_etmez", label: "Öneri Bekliyorum", icon: "💡" },
      ],
    },
    {
      id: "boyut",
      question: "Nesnenin boyutu nedir?",
      type: "single",
      options: [
        { id: "kucuk", label: "Küçük (< 10 cm)", icon: "🔹" },
        { id: "orta", label: "Orta (10–30 cm)", icon: "🔷" },
        { id: "buyuk", label: "Büyük (30–100 cm)", icon: "🔵" },
        { id: "cok_buyuk", label: "Çok Büyük (> 100 cm)", icon: "🟣" },
      ],
    },
    {
      id: "dosya",
      question: "Elinizde dosya var mı?",
      type: "single",
      options: [
        { id: "var", label: "3D Dosyam Var", icon: "✅" },
        { id: "cizim", label: "Teknik Çizimim Var", icon: "📐" },
        { id: "fikir", label: "Sadece Fikir / Kroki", icon: "💡" },
        { id: "modelleme", label: "Modelleme de Lazım", icon: "🧊" },
      ],
    },
    {
      id: "adet",
      question: "Kaç adet üretilecek?",
      type: "single",
      options: [
        { id: "1", label: "1 Adet", icon: "1️⃣" },
        { id: "2-5", label: "2–5 Adet", icon: "🔢" },
        { id: "6-20", label: "6–20 Adet", icon: "📦" },
        { id: "20+", label: "20+ Adet", icon: "🏭" },
      ],
    },
    {
      id: "sure",
      question: "Ne zaman ihtiyacınız var?",
      type: "single",
      options: [
        { id: "acil", label: "Acil (1-3 gün)", icon: "🔴" },
        { id: "normal", label: "Normal (1 hafta)", icon: "🟡" },
        { id: "esnek", label: "Esnek (2+ hafta)", icon: "🟢" },
      ],
    },
  ],
  "yedek-parca": [
    {
      id: "tip",
      question: "Parça tipi nedir?",
      type: "single",
      options: [
        { id: "mekanik", label: "Mekanik Parça", icon: "⚙️" },
        { id: "kapak", label: "Kapak / Kasa", icon: "📦" },
        { id: "braket", label: "Braket / Tutucu", icon: "🔩" },
        { id: "dis_li", label: "Dişli / Mil", icon: "🔧" },
        { id: "diger", label: "Diğer", icon: "📋" },
      ],
    },
    {
      id: "kaynak",
      question: "Elinizde ne var?",
      type: "single",
      options: [
        { id: "orjinal", label: "Orijinal Parça Var", icon: "✅" },
        { id: "fotograf", label: "Fotoğraf / Ölçü", icon: "📷" },
        { id: "teknik", label: "Teknik Çizim", icon: "📐" },
        { id: "dosya", label: "3D Dosya", icon: "🖥️" },
      ],
    },
    {
      id: "malzeme",
      question: "Malzeme tercihiniz?",
      type: "single",
      options: [
        { id: "plastik", label: "Plastik", icon: "🧴" },
        { id: "metal", label: "Metal", icon: "⚙️" },
        { id: "esnek", label: "Esnek", icon: "🔄" },
        { id: "oneri", label: "Öneri Bekliyorum", icon: "💡" },
      ],
    },
    {
      id: "adet",
      question: "Kaç adet üretilecek?",
      type: "single",
      options: [
        { id: "1", label: "1 Adet", icon: "1️⃣" },
        { id: "2-5", label: "2–5 Adet", icon: "🔢" },
        { id: "6-20", label: "6–20 Adet", icon: "📦" },
        { id: "20+", label: "20+ Adet", icon: "🏭" },
      ],
    },
    {
      id: "sure",
      question: "Ne zaman ihtiyacınız var?",
      type: "single",
      options: [
        { id: "acil", label: "Acil (1-3 gün)", icon: "🔴" },
        { id: "normal", label: "Normal (1 hafta)", icon: "🟡" },
        { id: "esnek", label: "Esnek (2+ hafta)", icon: "🟢" },
      ],
    },
  ],
};

const SERVICE_INFO: Record<
  string,
  { title: string; icon: string; color: string }
> = {
  "3d-modelleme": { title: "3D Modelleme", icon: "🧊", color: "#6366f1" },
  "3d-tarama": { title: "3D Tarama", icon: "📡", color: "#0ea5e9" },
  danismanlik: { title: "Danışmanlık", icon: "💡", color: "#22c55e" },
  prototip: { title: "Prototip Üretimi", icon: "🔬", color: "#f59e0b" },
  "yedek-parca": { title: "Yedek Parça Üretimi", icon: "⚙️", color: "#ec4899" },
};

const CONTACT_OPTIONS = [
  { id: "email", label: "E-posta", icon: "📧" },
  { id: "phone", label: "Telefon", icon: "📞" },
  { id: "whatsapp", label: "WhatsApp", icon: "💬" },
];

export default function PrintQuoteScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { service } = useLocalSearchParams();
  const serviceKey = service as string;
  const info = SERVICE_INFO[serviceKey] || SERVICE_INFO["danismanlik"];
  const questions = QUESTIONS[serviceKey] || QUESTIONS["danismanlik"];

  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [description, setDescription] = useState("");
  const [contactPref, setContactPref] = useState("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [file, setFile] = useState<{ name: string; size: number } | null>(null);
  const [sending, setSending] = useState(false);

  const answeredCount = questions.filter(
    (q) => (answers[q.id] || []).length > 0,
  ).length;
  const allAnswered = answeredCount === questions.length;
  const canSend = allAnswered && description.trim().length >= 10;

  const handleSelect = (
    questionId: string,
    optionId: string,
    type: "single" | "multi",
  ) => {
    setAnswers((prev) => {
      const current = prev[questionId] || [];
      if (type === "single") return { ...prev, [questionId]: [optionId] };
      if (current.includes(optionId))
        return {
          ...prev,
          [questionId]: current.filter((id) => id !== optionId),
        };
      return { ...prev, [questionId]: [...current, optionId] };
    });
  };

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });
      if (!result.canceled)
        setFile({
          name: result.assets[0].name,
          size: result.assets[0].size ?? 0,
        });
    } catch (e) {}
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleGonder = () => {
    if (!canSend) return;
    Alert.alert(
      "Teklif Gönderilsin mi?",
      `${info.title} için teklif talebiniz iletilecek.`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Gönder",
          onPress: async () => {
            setSending(true);
            try {
              const contactValue = contactPref === "email" ? email : phone;
              const response = await fetch(
                "https://fimarkt-backend-production.up.railway.app/api/quote/send",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    service: serviceKey,
                    answers,
                    description,
                    contact: contactPref,
                    contactValue,
                  }),
                },
              );
              const data = await response.json();
              if (data.success) {
                setAnswers({});
                setDescription("");
                setContactPref("email");
                setEmail("");
                setPhone("");
                setFile(null);
                Alert.alert(
                  "✅ Teklif Talebiniz Alındı!",
                  "Uzman ekibimiz projenizi inceleyerek en kısa sürede size ulaşacak.",
                  [{ text: "Tamam" }],
                );
              } else {
                Alert.alert("Hata", "Teklif gönderilemedi, tekrar deneyin.");
              }
            } catch (error) {
              Alert.alert("Hata", "Bağlantı hatası, tekrar deneyin.");
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

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Teklif Al</Text>
          <Text style={styles.headerSub}>{info.title}</Text>
        </View>
        <View style={styles.fidropBadge}>
          <Text style={styles.fidropText}>by fidrop</Text>
        </View>
      </View>

      {/* İlerleme */}
      <View style={styles.progressRow}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${(answeredCount / questions.length) * 100}%`,
                backgroundColor: info.color,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {answeredCount}/{questions.length} soru
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hizmet banner */}
        <View
          style={[styles.serviceBanner, { borderColor: info.color + "44" }]}
        >
          <View
            style={[styles.bannerIcon, { backgroundColor: info.color + "22" }]}
          >
            <Text style={styles.bannerEmoji}>{info.icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.bannerTitle, { color: info.color }]}>
              {info.title}
            </Text>
            <Text style={styles.bannerSub}>
              Soruları yanıtla, uzmanlarımız sana ulaşsın
            </Text>
          </View>
        </View>

        {/* Sorular */}
        {questions.map((q, qIndex) => (
          <View key={q.id} style={styles.questionBlock}>
            <View style={styles.questionHeader}>
              <View
                style={[
                  styles.questionNum,
                  (answers[q.id] || []).length > 0 && {
                    backgroundColor: info.color,
                  },
                ]}
              >
                <Text style={styles.questionNumText}>
                  {(answers[q.id] || []).length > 0 ? "✓" : qIndex + 1}
                </Text>
              </View>
              <Text style={styles.questionText}>{q.question}</Text>
              {q.type === "multi" && (
                <Text style={styles.multiLabel}>Çoklu</Text>
              )}
            </View>
            <View style={styles.optionsGrid}>
              {q.options.map((opt) => {
                const isSelected = (answers[q.id] || []).includes(opt.id);
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[
                      styles.optionBtn,
                      isSelected && {
                        borderColor: info.color,
                        backgroundColor: info.color + "18",
                      },
                    ]}
                    onPress={() => handleSelect(q.id, opt.id, q.type)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.optionIcon}>{opt.icon}</Text>
                    <Text
                      style={[
                        styles.optionLabel,
                        isSelected && { color: info.color, fontWeight: "600" },
                      ]}
                    >
                      {opt.label}
                    </Text>
                    {isSelected && (
                      <View
                        style={[
                          styles.optionCheck,
                          { backgroundColor: info.color },
                        ]}
                      >
                        <Text style={styles.optionCheckText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        {/* Proje açıklaması */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Proje Açıklaması</Text>
          <Text style={styles.sectionSub}>
            Ek detaylar, özel istekler veya sorularınızı buraya yazın.
          </Text>
          <TextInput
            style={[
              styles.textArea,
              description.length >= 10 && { borderColor: info.color + "66" },
            ]}
            placeholder="Ne kadar detaylı yazarsanız, o kadar doğru teklif alırsınız..."
            placeholderTextColor={Colors.text3}
            multiline
            numberOfLines={5}
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
          />
          <Text
            style={[
              styles.charCount,
              description.length >= 10
                ? { color: Colors.green }
                : { color: Colors.text3 },
            ]}
          >
            {description.length < 10
              ? `En az ${10 - description.length} karakter daha`
              : `✓ ${description.length} karakter`}
          </Text>
        </View>

        {/* Dosya yükle */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>
            Proje Dosyası <Text style={styles.optional}>(Opsiyonel)</Text>
          </Text>
          <Text style={styles.sectionSub}>
            Çizim, fotoğraf, referans veya 3D dosyanız varsa ekleyin.
          </Text>
          <TouchableOpacity
            style={[
              styles.fileUploadBtn,
              file && { borderColor: info.color, borderStyle: "solid" },
            ]}
            onPress={handleFilePick}
            activeOpacity={0.85}
          >
            {!file ? (
              <>
                <Text style={styles.fileUploadIcon}>📎</Text>
                <Text style={styles.fileUploadText}>Dosya Seç</Text>
                <Text style={styles.fileUploadHint}>
                  Görsel, çizim veya 3D dosyası
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.fileUploadIcon}>✅</Text>
                <Text style={styles.fileUploadText} numberOfLines={1}>
                  {file.name}
                </Text>
                <Text style={styles.fileUploadHint}>
                  {formatSize(file.size)} · Değiştirmek için dokun
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* İletişim tercihi */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>İletişim Tercihi</Text>
          <Text style={styles.sectionSub}>Sizi nasıl arayalım?</Text>
          <View style={styles.contactRow}>
            {CONTACT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                style={[
                  styles.contactBtn,
                  contactPref === opt.id && {
                    borderColor: info.color,
                    backgroundColor: info.color + "18",
                  },
                ]}
                onPress={() => setContactPref(opt.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.contactIcon}>{opt.icon}</Text>
                <Text
                  style={[
                    styles.contactLabel,
                    contactPref === opt.id && { color: info.color },
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {contactPref === "email" && (
            <TextInput
              style={styles.contactInput}
              placeholder="ornek@email.com"
              placeholderTextColor={Colors.text3}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          )}
          {(contactPref === "phone" || contactPref === "whatsapp") && (
            <TextInput
              style={styles.contactInput}
              placeholder="05XX XXX XX XX"
              placeholderTextColor={Colors.text3}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          )}
        </View>

        {/* Bilgi notu */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>⏱️</Text>
          <Text style={styles.infoText}>
            Teklif taleplerinize genellikle{" "}
            <Text style={{ color: Colors.text, fontWeight: "600" }}>
              1 iş günü
            </Text>{" "}
            içinde dönüş yapılmaktadır.
          </Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Alt buton */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        {!allAnswered && (
          <Text style={styles.footerHint}>
            Devam etmek için tüm soruları yanıtlayın ({answeredCount}/
            {questions.length})
          </Text>
        )}
        <TouchableOpacity
          style={[
            styles.gonderBtn,
            { backgroundColor: canSend ? info.color : Colors.surface2 },
            sending && { opacity: 0.7 },
          ]}
          onPress={handleGonder}
          disabled={!canSend || sending}
          activeOpacity={0.85}
        >
          <Text style={styles.gonderBtnText}>
            {sending
              ? "Gönderiliyor..."
              : canSend
                ? "Teklif Talebini Gönder →"
                : "Tüm Soruları Yanıtlayın"}
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
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
    letterSpacing: -0.5,
  },
  headerSub: { fontSize: 12, color: Colors.text2, marginTop: 1 },
  fidropBadge: {
    backgroundColor: Colors.accent + "22",
    borderColor: Colors.accent + "55",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  fidropText: {
    color: Colors.accent,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 4,
  },
  progressBar: {
    flex: 1,
    height: 3,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 2 },
  progressText: {
    fontSize: 11,
    color: Colors.text3,
    width: 50,
    textAlign: "right",
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 12 },
  serviceBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 14,
    marginBottom: 20,
  },
  bannerIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  bannerEmoji: { fontSize: 26 },
  bannerTitle: { fontSize: 16, fontWeight: "700", marginBottom: 3 },
  bannerSub: { fontSize: 12, color: Colors.text2 },
  questionBlock: { marginBottom: 24 },
  questionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  questionNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  questionNumText: { fontSize: 11, fontWeight: "700", color: Colors.text },
  questionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  multiLabel: {
    fontSize: 10,
    color: Colors.text3,
    backgroundColor: Colors.surface2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  optionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
  },
  optionIcon: { fontSize: 15 },
  optionLabel: { fontSize: 13, color: Colors.text2 },
  optionCheck: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 2,
  },
  optionCheckText: { fontSize: 9, color: "#fff", fontWeight: "700" },
  sectionBlock: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },
  optional: { fontSize: 12, color: Colors.text3, fontWeight: "400" },
  sectionSub: { fontSize: 12, color: Colors.text2, marginBottom: 12 },
  textArea: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    fontSize: 13,
    color: Colors.text,
    minHeight: 120,
    lineHeight: 20,
  },
  charCount: { fontSize: 11, textAlign: "right", marginTop: 6 },
  fileUploadBtn: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: "dashed",
    paddingVertical: 20,
    alignItems: "center",
    gap: 4,
  },
  fileUploadIcon: { fontSize: 28, marginBottom: 4 },
  fileUploadText: { fontSize: 14, fontWeight: "600", color: Colors.text },
  fileUploadHint: { fontSize: 11, color: Colors.text3 },
  contactRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  contactBtn: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 12,
    alignItems: "center",
    gap: 4,
  },
  contactIcon: { fontSize: 20 },
  contactLabel: { fontSize: 12, color: Colors.text2, fontWeight: "500" },
  contactInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    fontSize: 14,
    color: Colors.text,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    gap: 10,
    alignItems: "flex-start",
  },
  infoIcon: { fontSize: 16, marginTop: 1 },
  infoText: { flex: 1, fontSize: 12, color: Colors.text2, lineHeight: 18 },
  footer: {
    padding: 16,
    backgroundColor: Colors.bg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 8,
  },
  footerHint: { fontSize: 12, color: Colors.text3, textAlign: "center" },
  gonderBtn: { borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  gonderBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
