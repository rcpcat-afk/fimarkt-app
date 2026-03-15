import * as DocumentPicker from "expo-document-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import STLViewer from "../components/STLViewer";
import { BACKEND_URL, COLOR_HEX, Colors } from "../constants";

const ACCEPTED_FORMATS = [".stl", ".obj", ".stp", ".step", ".igs", ".iges"];
const INFILL_OPTIONS = [
  { value: 15, label: "%15", desc: "Hafif" },
  { value: 20, label: "%20", desc: "Standart", recommended: true },
  { value: 30, label: "%30", desc: "Sağlam" },
  { value: 50, label: "%50", desc: "Güçlü" },
  { value: 100, label: "%100", desc: "Tam Dolu" },
];

const TECH_GROUPS = [
  {
    groupId: "fdm",
    label: "🏭 FDM Baskı",
    ids: ["fdm-standart", "fdm-endustriyel", "fdm-yuksek"],
  },
  { groupId: "recine", label: "💎 Reçine Baskı", ids: ["sla", "dlp", "msla"] },
  { groupId: "toz", label: "⚡ Toz Baskı", ids: ["sls", "mjf"] },
  {
    groupId: "metal",
    label: "🔩 Metal Baskı",
    ids: ["dmls", "binder-jetting"],
  },
  {
    groupId: "ozel",
    label: "🎨 Özel",
    ids: ["polyjet", "seramik", "karbon-fiber"],
  },
];

type Material = {
  id: string;
  name: string;
  colors: { name: string; active: boolean }[];
  gramPrice: number;
  hourlyRate: number;
  fixedCost: number;
  active: boolean;
};

type Technology = {
  id: string;
  name: string;
  icon: string;
  color: string;
  active: boolean;
  materials: Material[];
};

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
  const [priceResult, setPriceResult] = useState<{
    unitPrice: number;
    totalPrice: number;
    discount: number;
    weightGram: number;
    printHours: number;
    source: string;
  } | null>(null);
  const [file, setFile] = useState<{
    name: string;
    size: number;
    uri: string;
  } | null>(null);
  const [isSTL, setIsSTL] = useState(false);
  const [unit, setUnit] = useState<"mm" | "inch">("mm");
  const [volumeData, setVolumeData] = useState<{
    volumeCm3: number;
    weightGram: number;
    printHours: number;
  } | null>(null);
  const [techLoading, setTechLoading] = useState(false);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [selectedTech, setSelectedTech] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedInfill, setSelectedInfill] = useState(20);
  const [quantity, setQuantity] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [stlVertices, setStlVertices] = useState<number[] | null>(null);
  const [stlNormals, setStlNormals] = useState<number[] | null>(null);

  const selectedTechData = technologies.find((t) => t.id === selectedTech);
  const selectedMaterialData = selectedTechData?.materials.find(
    (m) => m.id === selectedMaterial,
  );
  const modelColor = selectedColor
    ? (COLOR_HEX[selectedColor] ?? "#cccccc")
    : "#cccccc";
  const canProceed = file && selectedTech && selectedMaterial && selectedColor;

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });
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
      if ((picked.size ?? 0) > 15 * 1024 * 1024) {
        Alert.alert("Dosya Çok Büyük", "Maksimum dosya boyutu 15MB'tır.", [
          { text: "Tamam" },
        ]);
        return;
      }
      setFile({ name: picked.name, size: picked.size ?? 0, uri: picked.uri });
      setIsSTL(picked.name.toLowerCase().endsWith(".stl"));
      setSelectedTech(null);
      setSelectedMaterial(null);
      setSelectedColor(null);
      setVolumeData(null);
      if (technologies.length === 0) {
        setTechLoading(true);
        fetch(`${BACKEND_URL}/api/print-materials`)
          .then((r) => r.json())
          .then((data) => {
            if (Array.isArray(data) && data[0]?.materials) {
              setTechnologies(data.filter((t: Technology) => t.active));
            }
            setTechLoading(false);
          })
          .catch(() => setTechLoading(false));
      }
    } catch (e) {}
  };

  const handleTechSelect = (techId: string) => {
    setSelectedTech(selectedTech === techId ? null : techId);
    setSelectedMaterial(null);
    setSelectedColor(null);
  };

  const handleMaterialSelect = (matId: string) => {
    setSelectedMaterial(matId);
    setSelectedColor(null);
  };

  const handleDevam = () => {
    if (!canProceed) return;
    router.push({
      pathname: "/print-summary",
      params: {
        gramPrice: selectedMaterialData?.gramPrice ?? 0,
        hourlyRate: selectedMaterialData?.hourlyRate ?? 0,
        fixedCost: selectedMaterialData?.fixedCost ?? 0,
        profitMargin: (selectedMaterialData as any)?.profitMargin ?? 30,
        service,
        fileName: file.name,
        fileSize: file.size,
        fileUri: file.uri,
        unit,
        volumeCm3: volumeData?.volumeCm3 ?? 0,
        tech: selectedTech,
        techName: selectedTechData?.name,
        material: selectedMaterial,
        materialName: selectedMaterialData?.name,
        color: selectedColor,
        infill: selectedInfill,
        quantity,
      },
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const renderTechCard = (tech: Technology) => {
    const isSelected = selectedTech === tech.id;
    const activeMaterials = tech.materials.filter((m) => m.active);
    const selMat = activeMaterials.find((m) => m.id === selectedMaterial);

    return (
      <View
        key={tech.id}
        style={[
          styles.techCard,
          isSelected && { borderColor: tech.color, borderWidth: 2 },
        ]}
      >
        <TouchableOpacity
          style={styles.techCardHeader}
          onPress={() => handleTechSelect(tech.id)}
          activeOpacity={0.85}
        >
          <View
            style={[
              styles.techIconWrap,
              { backgroundColor: tech.color + "22" },
            ]}
          >
            <Text style={styles.techIcon}>{tech.icon}</Text>
          </View>
          <View style={styles.techInfo}>
            <Text style={styles.techTitle}>{tech.name}</Text>
            <Text style={styles.techDesc}>
              {activeMaterials.length} malzeme mevcut
            </Text>
          </View>
          <View
            style={[
              styles.techRadio,
              isSelected && {
                borderColor: tech.color,
                backgroundColor: tech.color,
              },
            ]}
          >
            {isSelected && <Text style={styles.techRadioCheck}>✓</Text>}
          </View>
        </TouchableOpacity>

        {isSelected && (
          <View style={styles.techExpanded}>
            <Text style={styles.expandedLabel}>Malzeme</Text>
            <View style={styles.chipRow}>
              {activeMaterials.map((mat) => (
                <TouchableOpacity
                  key={mat.id}
                  style={[
                    styles.chip,
                    selectedMaterial === mat.id && {
                      backgroundColor: tech.color,
                      borderColor: tech.color,
                    },
                  ]}
                  onPress={() => handleMaterialSelect(mat.id)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedMaterial === mat.id && { color: "#fff" },
                    ]}
                  >
                    {mat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {selMat && (
              <>
                <Text style={[styles.expandedLabel, { marginTop: 16 }]}>
                  Renk
                </Text>
                <View style={styles.colorRow}>
                  {selMat.colors
                    .filter((c) => c.active)
                    .map((colorObj) => (
                      <TouchableOpacity
                        key={colorObj.name}
                        style={[
                          styles.colorItem,
                          selectedColor === colorObj.name && {
                            borderColor: tech.color,
                            borderWidth: 2,
                          },
                        ]}
                        onPress={() => setSelectedColor(colorObj.name)}
                        activeOpacity={0.8}
                      >
                        <View
                          style={[
                            styles.colorDot,
                            {
                              backgroundColor:
                                COLOR_HEX[colorObj.name] ?? "#94a3b8",
                              borderColor:
                                colorObj.name === "Beyaz" ||
                                colorObj.name === "Şeffaf"
                                  ? "#cbd5e1"
                                  : "transparent",
                              borderWidth:
                                colorObj.name === "Beyaz" ||
                                colorObj.name === "Şeffaf"
                                  ? 1
                                  : 0,
                            },
                          ]}
                        />
                        <Text
                          style={[
                            styles.colorName,
                            selectedColor === colorObj.name && {
                              color: tech.color,
                              fontWeight: "700",
                            },
                          ]}
                          numberOfLines={2}
                        >
                          {colorObj.name}
                        </Text>
                        {selectedColor === colorObj.name && (
                          <View
                            style={[
                              styles.colorCheckBadge,
                              { backgroundColor: tech.color },
                            ]}
                          >
                            <Text style={styles.colorCheckText}>✓</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                </View>
              </>
            )}

            {selectedColor && (
              <>
                <Text style={[styles.expandedLabel, { marginTop: 16 }]}>
                  Dolgu Oranı
                </Text>
                <View style={styles.infillRow}>
                  {INFILL_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt.value}
                      style={[
                        styles.infillBtn,
                        selectedInfill === opt.value && {
                          borderColor: tech.color,
                          backgroundColor: tech.color + "15",
                        },
                      ]}
                      onPress={() => setSelectedInfill(opt.value)}
                      activeOpacity={0.8}
                    >
                      {opt.recommended && (
                        <View style={styles.infillRecommended}>
                          <Text
                            style={[
                              styles.infillRecommendedText,
                              { color: tech.color },
                            ]}
                          >
                            ✦
                          </Text>
                        </View>
                      )}
                      <Text
                        style={[
                          styles.infillLabel,
                          selectedInfill === opt.value && { color: tech.color },
                        ]}
                      >
                        {opt.label}
                      </Text>
                      <Text
                        style={[
                          styles.infillDesc,
                          selectedInfill === opt.value && { color: tech.color },
                        ]}
                      >
                        {opt.desc}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {selectedColor && (
              <>
                <Text style={[styles.expandedLabel, { marginTop: 16 }]}>
                  Adet
                </Text>
                <View style={styles.quantityRow}>
                  <TouchableOpacity
                    style={[
                      styles.qtyBtn,
                      quantity <= 1 && styles.qtyBtnDisabled,
                    ]}
                    onPress={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Text style={styles.qtyBtnText}>−</Text>
                  </TouchableOpacity>
                  <View
                    style={[
                      styles.qtyDisplay,
                      { borderColor: tech.color + "44" },
                    ]}
                  >
                    <Text style={styles.qtyNumber}>{quantity}</Text>
                    <Text style={styles.qtyUnit}>adet</Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.qtyBtn,
                      quantity >= 999 && styles.qtyBtnDisabled,
                    ]}
                    onPress={() => setQuantity(Math.min(999, quantity + 1))}
                    disabled={quantity >= 999}
                  >
                    <Text style={styles.qtyBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>3D Baskı Siparişi</Text>
          <Text style={styles.headerSub}>Model yükle ve ayarları seç</Text>
        </View>
        <View style={styles.fidropBadge}>
          <Text style={styles.fidropText}>by fidrop</Text>
        </View>
      </View>

      <StepIndicator currentStep={file ? 2 : 1} totalSteps={3} />
      <View style={styles.stepLabelRow}>
        <Text style={styles.stepLabel}>
          {file ? "Adım 2 / 3" : "Adım 1 / 3"}
        </Text>
        <Text style={styles.stepLabelRight}>
          {file ? "Baskı Ayarları" : "Dosya Yükleme"}
        </Text>
      </View>

      <View style={styles.viewerWrapper}>
        {!file ? (
          <TouchableOpacity
            style={styles.uploadPlaceholder}
            onPress={handleFilePick}
            activeOpacity={0.85}
          >
            <Text style={styles.uploadIcon}>📂</Text>
            <Text style={styles.uploadTitle}>Dosya Seç</Text>
            <Text style={styles.uploadHint}>STL, OBJ, STP, STEP, IGS</Text>
            <View style={styles.uploadFormatRow}>
              {ACCEPTED_FORMATS.map((f) => (
                <View key={f} style={styles.formatBadge}>
                  <Text style={styles.formatBadgeText}>
                    {f.replace(".", "").toUpperCase()}
                  </Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        ) : (
          <View style={{ flex: 1 }}>
            {isSTL ? (
              <STLViewer
                uri={file.uri}
                color={modelColor}
                height={220}
                onVolumeCalculated={(volumeCm3, weightGram, printHours) => {
                  setVolumeData({ volumeCm3, weightGram, printHours });
                  setModelReady(true);
                }}
                onVerticesReady={(v) => setStlVertices(v)}
                onNormalsReady={(n) => setStlNormals(n)}
                onPriceCalculated={(data) => setPriceResult(data)}
                priceParams={
                  selectedTech && selectedMaterial && selectedMaterialData
                    ? {
                        technologyId: selectedTech,
                        infill: selectedInfill,
                        gramPrice: selectedMaterialData.gramPrice,
                        hourlyRate: selectedMaterialData.hourlyRate,
                        fixedCost: selectedMaterialData.fixedCost,
                        profitMargin:
                          (selectedMaterialData as any).profitMargin ?? 30,
                        quantity,
                      }
                    : undefined
                }
              />
            ) : (
              <View style={styles.nonStlPlaceholder}>
                <Text style={styles.nonStlIcon}>📄</Text>
                <Text style={styles.nonStlName} numberOfLines={1}>
                  {file.name}
                </Text>
                <Text style={styles.nonStlSize}>
                  {formatFileSize(file.size)}
                </Text>
              </View>
            )}
            <View style={styles.viewerBar}>
              <TouchableOpacity
                onPress={handleFilePick}
                style={styles.changeBtn}
              >
                <Text style={styles.changeBtnText}>✏️ Değiştir</Text>
              </TouchableOpacity>
              <Text style={styles.viewerFileName} numberOfLines={1}>
                {file.name}
              </Text>
              {isSTL && (
                <TouchableOpacity
                  onPress={() => setFullscreen(true)}
                  style={styles.fullscreenBtn}
                >
                  <Text style={styles.fullscreenBtnText}>⛶</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>

      <Modal visible={fullscreen} animationType="fade" statusBarTranslucent>
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalClose}
            onPress={() => setFullscreen(false)}
          >
            <Text style={styles.modalCloseText}>✕</Text>
          </TouchableOpacity>
          {file && isSTL && (
            <STLViewer uri={file.uri} color={modelColor} height={600} />
          )}
        </View>
      </Modal>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!file && (
          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>💡</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoTitle}>Nasıl Çalışır?</Text>
              <Text style={styles.infoText}>
                Yukarıdan 3D modelini seç → Teknoloji ve malzeme seç → Anında
                fiyat al → Sipariş ver
              </Text>
            </View>
          </View>
        )}

        {file && (
          <>
            {isSTL && (
              <View style={styles.sectionBlock}>
                <Text style={styles.blockTitle}>Dosya Birimi</Text>
                <View style={styles.unitRow}>
                  {[
                    { id: "mm", label: "mm" },
                    { id: "inch", label: "inç" },
                  ].map((opt) => (
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
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {(!isSTL || modelReady) && (
              <>
                <Text style={styles.sectionTitle}>Üretim Teknolojisi</Text>
                {techLoading ? (
                  <ActivityIndicator
                    color={Colors.accent}
                    style={{ marginVertical: 20 }}
                  />
                ) : (
                  TECH_GROUPS.map((group) => {
                    const groupTechs = technologies.filter((t) =>
                      group.ids.includes(t.id),
                    );
                    if (groupTechs.length === 0) return null;
                    return (
                      <View key={group.groupId}>
                        <Text style={styles.groupLabel}>{group.label}</Text>
                        {groupTechs.map((tech) => renderTechCard(tech))}
                      </View>
                    );
                  })
                )}
              </>
            )}
          </>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        {canProceed && (
          <View style={styles.selectionSummary}>
            <Text style={styles.summaryText} numberOfLines={1}>
              {selectedTechData?.name} · {selectedMaterialData?.name} ·{" "}
              {selectedColor} · %{selectedInfill} · {quantity} adet
            </Text>
          </View>
        )}
        <TouchableOpacity
          style={[styles.devamBtn, !canProceed && styles.devamBtnDisabled]}
          onPress={handleDevam}
          disabled={!canProceed}
          activeOpacity={0.85}
        >
          <Text style={styles.devamBtnText}>
            {!file
              ? "Önce Dosya Seçiniz"
              : !canProceed
                ? "Teknoloji, Malzeme ve Renk Seçiniz"
                : "Devam Et — Fiyat Özeti →"}
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
  viewerWrapper: { width: "100%", height: 220, backgroundColor: "#1a1a2e" },
  uploadPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  uploadIcon: { fontSize: 40 },
  uploadTitle: { fontSize: 16, fontWeight: "700", color: Colors.text },
  uploadHint: { fontSize: 12, color: Colors.text2 },
  uploadFormatRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    justifyContent: "center",
    marginTop: 4,
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
  viewerBar: {
    position: "absolute",
    bottom: 32,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 8,
  },
  changeBtn: {
    backgroundColor: Colors.surface2,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  changeBtnText: { fontSize: 11, color: Colors.text2, fontWeight: "600" },
  viewerFileName: { flex: 1, fontSize: 11, color: "#ffffff99" },
  fullscreenBtn: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface2,
    borderRadius: 6,
  },
  fullscreenBtnText: { fontSize: 14, color: Colors.text },
  nonStlPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  nonStlIcon: { fontSize: 40 },
  nonStlName: { fontSize: 14, fontWeight: "600", color: Colors.text },
  nonStlSize: { fontSize: 12, color: Colors.text2 },
  modalContainer: {
    flex: 1,
    backgroundColor: "#0f0f1a",
    justifyContent: "center",
  },
  modalClose: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCloseText: { color: Colors.text, fontSize: 16, fontWeight: "700" },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16 },
  infoBox: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  infoIcon: { fontSize: 20, marginTop: 2 },
  infoTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },
  infoText: { fontSize: 12, color: Colors.text2, lineHeight: 19 },
  sectionBlock: { marginBottom: 16 },
  blockTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 8,
  },
  unitRow: { flexDirection: "row", gap: 12 },
  unitBtn: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 12,
    alignItems: "center",
  },
  unitBtnActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent + "15",
  },
  unitLabel: { fontSize: 16, fontWeight: "700", color: Colors.text2 },
  unitLabelActive: { color: Colors.accent },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },
  groupLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.text3,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 12,
    paddingLeft: 4,
  },
  techCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
    overflow: "hidden",
  },
  techCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  techIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  techIcon: { fontSize: 20 },
  techInfo: { flex: 1 },
  techTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 2,
  },
  techDesc: { fontSize: 12, color: Colors.text2 },
  techRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  techRadioCheck: { color: "#fff", fontSize: 11, fontWeight: "700" },
  techExpanded: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  expandedLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.text2,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipText: { fontSize: 13, fontWeight: "600", color: Colors.text2 },
  colorRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  colorItem: {
    alignItems: "center",
    width: 58,
    paddingVertical: 8,
    paddingHorizontal: 4,
    backgroundColor: Colors.surface2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    position: "relative",
  },
  colorDot: { width: 28, height: 28, borderRadius: 14, marginBottom: 6 },
  colorName: {
    fontSize: 9,
    color: Colors.text2,
    textAlign: "center",
    lineHeight: 12,
  },
  colorCheckBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  colorCheckText: { color: "#fff", fontSize: 9, fontWeight: "700" },
  infillRow: { flexDirection: "row", gap: 6 },
  infillBtn: {
    flex: 1,
    backgroundColor: Colors.surface2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 10,
    alignItems: "center",
    position: "relative",
  },
  infillRecommended: { position: "absolute", top: -6, right: -4 },
  infillRecommendedText: { fontSize: 10 },
  infillLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.text2,
    marginBottom: 2,
  },
  infillDesc: { fontSize: 9, color: Colors.text3 },
  quantityRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  qtyBtn: {
    width: 44,
    height: 44,
    backgroundColor: Colors.surface2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyBtnDisabled: { opacity: 0.4 },
  qtyBtnText: { fontSize: 22, color: Colors.text, fontWeight: "300" },
  qtyDisplay: {
    flex: 1,
    alignItems: "center",
    backgroundColor: Colors.surface2,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 8,
  },
  qtyNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text,
    lineHeight: 30,
  },
  qtyUnit: { fontSize: 11, color: Colors.text2 },
  footer: {
    padding: 16,
    backgroundColor: Colors.bg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  selectionSummary: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryText: { fontSize: 12, color: Colors.text2 },
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
