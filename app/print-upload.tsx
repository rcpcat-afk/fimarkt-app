import * as DocumentPicker from "expo-document-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  Animated,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../constants";

const ACCEPTED_FORMATS = [".stl", ".obj", ".stp", ".step", ".igs", ".iges"];

const UNIT_OPTIONS = [
  { id: "mm", label: "mm", desc: "Milimetre" },
  { id: "inch", label: "inç", desc: "İnç" },
];

const StepIndicator = ({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) => (
  <View style={styles.stepContainer}>
    {Array.from({ length: totalSteps }).map((_, i) => (
      <View key={i} style={styles.stepTrack}>
        <View
          style={[
            styles.stepFill,
            {
              backgroundColor: i < currentStep ? Colors.accent : Colors.border,
            },
          ]}
        />
      </View>
    ))}
  </View>
);

export default function PrintUploadScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { service } = useLocalSearchParams();

  const [file, setFile] = useState<{
    name: string;
    size: number;
    uri: string;
  } | null>(null);
  const [unit, setUnit] = useState<"mm" | "inch">("mm");
  const [uploading, setUploading] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.03,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  };

  const stopPulse = () => {
    pulseAnim.stopAnimation();
    Animated.timing(pulseAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleFilePick = async () => {
    try {
      setUploading(true);
      startPulse();
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });
      stopPulse();
      setUploading(false);
      if (result.canceled) return;
      const picked = result.assets[0];
      const fileName = picked.name.toLowerCase();
      const isValid = ACCEPTED_FORMATS.some((fmt) => fileName.endsWith(fmt));
      if (!isValid) {
        Alert.alert(
          "Desteklenmeyen Format",
          `Lütfen şu formatlardan birini yükle:\n${ACCEPTED_FORMATS.join(", ")}`,
          [{ text: "Tamam" }],
        );
        return;
      }
      setFile({ name: picked.name, size: picked.size ?? 0, uri: picked.uri });
    } catch (e) {
      stopPulse();
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getFileExt = (name: string) => {
    const parts = name.split(".");
    return parts[parts.length - 1].toUpperCase();
  };

  const handleDevam = () => {
    if (!file) return;
    router.push({
      pathname: "/print-settings",
      params: {
        service,
        fileName: file.name,
        fileSize: file.size,
        fileUri: file.uri,
        unit,
      },
    });
  };

  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Dosya Yükle</Text>
          <Text style={styles.headerSub}>3D modelini seç</Text>
        </View>
        <View style={styles.fidropBadge}>
          <Text style={styles.fidropText}>by fidrop</Text>
        </View>
      </View>

      <StepIndicator currentStep={2} totalSteps={4} />
      <View style={styles.stepLabelRow}>
        <Text style={styles.stepLabel}>Adım 2 / 4</Text>
        <Text style={styles.stepLabelRight}>Dosya Yükleme</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>3D Modelini Yükle</Text>
        <Text style={styles.sectionSub}>
          Desteklenen formatlar:{" "}
          <Text style={{ color: Colors.accent }}>
            {ACCEPTED_FORMATS.join(" · ")}
          </Text>
          {"\n"}Maksimum dosya boyutu: 50 MB
        </Text>

        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={[styles.uploadBox, file && styles.uploadBoxDone]}
            onPress={handleFilePick}
            activeOpacity={0.85}
          >
            {!file ? (
              <>
                <Text style={styles.uploadIcon}>📂</Text>
                <Text style={styles.uploadTitle}>
                  {uploading ? "Dosya seçiliyor..." : "Dosya Seç"}
                </Text>
                <Text style={styles.uploadHint}>
                  {uploading ? "Lütfen bekle" : "Dokunarak dosya seçebilirsin"}
                </Text>
                <View style={styles.uploadFormatRow}>
                  {ACCEPTED_FORMATS.map((f) => (
                    <View key={f} style={styles.formatBadge}>
                      <Text style={styles.formatBadgeText}>
                        {f.replace(".", "").toUpperCase()}
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            ) : (
              <>
                <View style={styles.fileExtBadge}>
                  <Text style={styles.fileExtText}>
                    {getFileExt(file.name)}
                  </Text>
                </View>
                <Text style={styles.fileName} numberOfLines={2}>
                  {file.name}
                </Text>
                <Text style={styles.fileSize}>{formatFileSize(file.size)}</Text>
                <View style={styles.fileSuccessRow}>
                  <Text style={styles.fileSuccessIcon}>✅</Text>
                  <Text style={styles.fileSuccessText}>Dosya hazır</Text>
                </View>
                <Text style={styles.fileChangeHint}>
                  Değiştirmek için tekrar dokunabilirsin
                </Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.sectionBlock}>
          <Text style={styles.blockTitle}>Dosya Birimi</Text>
          <Text style={styles.blockSub}>
            Modelini hangi birimde tasarladın?
          </Text>
          <View style={styles.unitRow}>
            {UNIT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                style={[
                  styles.unitBtn,
                  unit === opt.id && styles.unitBtnActive,
                ]}
                onPress={() => setUnit(opt.id as "mm" | "inch")}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.unitLabel,
                    unit === opt.id && styles.unitLabelActive,
                  ]}
                >
                  {opt.label}
                </Text>
                <Text
                  style={[
                    styles.unitDesc,
                    unit === opt.id && { color: Colors.accent },
                  ]}
                >
                  {opt.desc}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>💡</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Dikkat Edilmesi Gerekenler</Text>
            <Text style={styles.infoText}>
              • Dosya adında Türkçe karakter kullanma{"\n"}• 50 MB üzeri
              dosyalar için manuel teklif gerekir{"\n"}• Modeller sistemde 7 gün
              saklanır
            </Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.devamBtn, !file && styles.devamBtnDisabled]}
          onPress={handleDevam}
          disabled={!file}
          activeOpacity={0.85}
        >
          <Text style={styles.devamBtnText}>
            {file ? "Devam Et — Baskı Ayarları →" : "Önce Dosya Seçiniz"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
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
  stepContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 6,
    marginTop: 4,
  },
  stepTrack: {
    flex: 1,
    height: 3,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: "hidden",
  },
  stepFill: { height: "100%", width: "100%", borderRadius: 2 },
  stepLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 6,
    marginBottom: 4,
  },
  stepLabel: { fontSize: 11, color: Colors.text3 },
  stepLabelRight: { fontSize: 11, color: Colors.accent, fontWeight: "600" },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 12 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 6,
  },
  sectionSub: {
    fontSize: 13,
    color: Colors.text2,
    lineHeight: 20,
    marginBottom: 20,
  },
  uploadBox: {
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: "dashed",
    borderRadius: 20,
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignItems: "center",
    marginBottom: 24,
  },
  uploadBoxDone: {
    borderColor: Colors.accent,
    borderStyle: "solid",
    backgroundColor: Colors.accent + "0a",
  },
  uploadIcon: { fontSize: 44, marginBottom: 12 },
  uploadTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 6,
  },
  uploadHint: { fontSize: 13, color: Colors.text2, marginBottom: 16 },
  uploadFormatRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    justifyContent: "center",
  },
  formatBadge: {
    backgroundColor: Colors.surface2,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  formatBadgeText: { color: Colors.text3, fontSize: 10, fontWeight: "600" },
  fileExtBadge: {
    backgroundColor: Colors.accent,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 12,
  },
  fileExtText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1,
  },
  fileName: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
    textAlign: "center",
  },
  fileSize: { fontSize: 12, color: Colors.text2, marginBottom: 12 },
  fileSuccessRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  fileSuccessIcon: { fontSize: 16 },
  fileSuccessText: { color: Colors.green, fontSize: 13, fontWeight: "600" },
  fileChangeHint: { fontSize: 11, color: Colors.text3 },
  sectionBlock: { marginBottom: 20 },
  blockTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },
  blockSub: { fontSize: 12, color: Colors.text2, marginBottom: 12 },
  unitRow: { flexDirection: "row", gap: 12 },
  unitBtn: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 14,
    alignItems: "center",
  },
  unitBtnActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent + "15",
  },
  unitLabel: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.text2,
    marginBottom: 2,
  },
  unitLabelActive: { color: Colors.accent },
  unitDesc: { fontSize: 11, color: Colors.text3 },
  infoBox: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    flexDirection: "row",
    gap: 12,
  },
  infoIcon: { fontSize: 20, marginTop: 2 },
  infoTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 6,
  },
  infoText: { fontSize: 12, color: Colors.text2, lineHeight: 19 },
  footer: {
    padding: 16,
    backgroundColor: Colors.bg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  devamBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  devamBtnDisabled: { backgroundColor: Colors.surface2 },
  devamBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
