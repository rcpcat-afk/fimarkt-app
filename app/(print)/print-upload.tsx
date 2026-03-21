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
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import STLViewer from "../../components/STLViewer";
import { BACKEND_URL, COLOR_HEX } from "../../constants";
import { Colors } from "../../constants/theme";

const C = Colors.dark;

// ── Sabitler ───────────────────────────────────────────────────────────────────
const ACCEPTED_FORMATS = [".stl", ".obj", ".stp", ".step", ".igs", ".iges"];
const INFILL_OPTIONS = [
  { value: 15,  label: "%15",  desc: "Hafif"    },
  { value: 20,  label: "%20",  desc: "Standart", recommended: true },
  { value: 30,  label: "%30",  desc: "Sağlam"   },
  { value: 50,  label: "%50",  desc: "Güçlü"    },
  { value: 100, label: "%100", desc: "Tam Dolu" },
];
const FDM_TECHNOLOGIES = ["fdm-standart", "fdm-endustriyel", "fdm-yuksek"];
const TECH_GROUPS = [
  { groupId: "fdm",    label: "🏭 FDM Baskı",   ids: ["fdm-standart", "fdm-endustriyel", "fdm-yuksek"] },
  { groupId: "recine", label: "💎 Reçine Baskı", ids: ["sla", "dlp", "msla"] },
  { groupId: "toz",    label: "⚡ Toz Baskı",    ids: ["sls", "mjf"] },
  { groupId: "metal",  label: "🔩 Metal Baskı",  ids: ["dmls", "binder-jetting"] },
  { groupId: "ozel",   label: "🎨 Özel",         ids: ["polyjet", "seramik", "karbon-fiber"] },
];

// ── Tipler ─────────────────────────────────────────────────────────────────────
type Material = {
  id: string;
  name: string;
  colors: { name: string; active: boolean }[];
  gramPrice: number;
  hourlyRate: number;
  fixedCost: number;
  density?: number;
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

// ── Adım göstergesi ────────────────────────────────────────────────────────────
const StepIndicator = ({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) => (
  <View style={s.stepContainer}>
    {Array.from({ length: totalSteps }).map((_, i) => (
      <View key={i} style={s.stepTrack}>
        <View
          style={[
            s.stepFill,
            { backgroundColor: i < currentStep ? C.accent : C.border },
          ]}
        />
      </View>
    ))}
  </View>
);

// ── Ana ekran ──────────────────────────────────────────────────────────────────
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

  const selectedTechData     = technologies.find((t) => t.id === selectedTech);
  const selectedMaterialData = selectedTechData?.materials.find((m) => m.id === selectedMaterial);
  const modelColor           = selectedColor ? (COLOR_HEX[selectedColor] ?? "#cccccc") : "#cccccc";
  const canProceed           = file && selectedTech && selectedMaterial && selectedColor;

  // ── İş mantığı (değiştirilmedi) ────────────────────────────────────────────
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
        gramPrice:    selectedMaterialData?.gramPrice    ?? 0,
        hourlyRate:   selectedMaterialData?.hourlyRate   ?? 0,
        fixedCost:    selectedMaterialData?.fixedCost    ?? 0,
        profitMargin: (selectedMaterialData as any)?.profitMargin ?? 30,
        service,
        fileName:     file.name,
        fileSize:     file.size,
        fileUri:      file.uri,
        unit,
        volumeCm3:    volumeData?.volumeCm3 ?? 0,
        tech:         selectedTech,
        techName:     selectedTechData?.name,
        material:     selectedMaterial,
        materialName: selectedMaterialData?.name,
        density:      selectedMaterialData?.density ?? 0,
        color:        selectedColor,
        infill:       selectedInfill,
        quantity,
      },
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024)            return `${bytes} B`;
    if (bytes < 1024 * 1024)     return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // ── Teknoloji kartı ────────────────────────────────────────────────────────
  const renderTechCard = (tech: Technology) => {
    const isSelected    = selectedTech === tech.id;
    const activeMaterials = tech.materials.filter((m) => m.active);
    const selMat        = activeMaterials.find((m) => m.id === selectedMaterial);

    return (
      <View
        key={tech.id}
        style={[
          s.techCard,
          isSelected && { borderColor: tech.color, borderWidth: 2 },
        ]}
      >
        <TouchableOpacity
          style={s.techCardHeader}
          onPress={() => handleTechSelect(tech.id)}
          activeOpacity={0.85}
        >
          <View style={[s.techIconWrap, { backgroundColor: tech.color + "22" }]}>
            <Text style={s.techIcon}>{tech.icon}</Text>
          </View>
          <View style={s.techInfo}>
            <Text style={s.techTitle}>{tech.name}</Text>
            <Text style={s.techDesc}>{activeMaterials.length} malzeme mevcut</Text>
          </View>
          <View
            style={[
              s.techRadio,
              isSelected && { borderColor: tech.color, backgroundColor: tech.color },
            ]}
          >
            {isSelected && <Text style={s.techRadioCheck}>✓</Text>}
          </View>
        </TouchableOpacity>

        {isSelected && (
          <View style={s.techExpanded}>
            <Text style={s.expandedLabel}>Malzeme</Text>
            <View style={s.chipRow}>
              {activeMaterials.map((mat) => (
                <TouchableOpacity
                  key={mat.id}
                  style={[
                    s.chip,
                    selectedMaterial === mat.id && {
                      backgroundColor: tech.color,
                      borderColor:     tech.color,
                    },
                  ]}
                  onPress={() => handleMaterialSelect(mat.id)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      s.chipText,
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
                <Text style={[s.expandedLabel, { marginTop: 16 }]}>Renk</Text>
                <View style={s.colorRow}>
                  {selMat.colors
                    .filter((c) => c.active)
                    .map((colorObj) => {
                      const isColorSelected = selectedColor === colorObj.name;
                      const dotHex = COLOR_HEX[colorObj.name] ?? "#94a3b8";
                      const isLight = colorObj.name === "Beyaz" || colorObj.name === "Şeffaf";
                      return (
                      <TouchableOpacity
                        key={colorObj.name}
                        style={s.colorItem}
                        onPress={() => setSelectedColor(colorObj.name)}
                        activeOpacity={0.8}
                      >
                        {/* Dış halka (seçildiğinde) */}
                        <View style={[s.colorRingOuter, isColorSelected && { borderColor: tech.color }]}>
                          <View style={s.colorRingInner}>
                            <View
                              style={[
                                s.colorDot,
                                {
                                  backgroundColor: dotHex,
                                  borderColor:     isLight ? C.border : "transparent",
                                  borderWidth:     isLight ? 1 : 0,
                                },
                              ]}
                            />
                          </View>
                        </View>
                        <Text
                          style={[
                            s.colorName,
                            isColorSelected && {
                              color:      tech.color,
                              fontWeight: "700",
                            },
                          ]}
                          numberOfLines={2}
                        >
                          {colorObj.name}
                        </Text>
                        {isColorSelected && (
                          <View style={[s.colorCheckBadge, { backgroundColor: tech.color }]}>
                            <Text style={s.colorCheckText}>✓</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                      );
                    })}
                </View>
              </>
            )}

            {selectedColor &&
              ![
                "sla", "dlp", "msla", "sls", "mjf", "dmls",
                "binder-jetting", "polyjet", "seramik", "karbon-fiber",
              ].includes(tech.id) && (
                <>
                  <Text style={[s.expandedLabel, { marginTop: 16 }]}>Dolgu Oranı</Text>
                  <View style={s.infillRow}>
                    {INFILL_OPTIONS.map((opt) => (
                      <TouchableOpacity
                        key={opt.value}
                        style={[
                          s.infillBtn,
                          selectedInfill === opt.value && {
                            borderColor:     tech.color,
                            backgroundColor: tech.color + "15",
                          },
                        ]}
                        onPress={() => setSelectedInfill(opt.value)}
                        activeOpacity={0.8}
                      >
                        {opt.recommended && (
                          <View style={s.infillRecommended}>
                            <Text style={[s.infillRecommendedText, { color: tech.color }]}>✦</Text>
                          </View>
                        )}
                        <Text
                          style={[
                            s.infillLabel,
                            selectedInfill === opt.value && { color: tech.color },
                          ]}
                        >
                          {opt.label}
                        </Text>
                        <Text
                          style={[
                            s.infillDesc,
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
                <Text style={[s.expandedLabel, { marginTop: 16 }]}>Adet</Text>
                <View style={s.quantityRow}>
                  <TouchableOpacity
                    style={[s.qtyBtn, quantity <= 1 && s.qtyBtnDisabled]}
                    onPress={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Text style={s.qtyBtnText}>−</Text>
                  </TouchableOpacity>
                  <View style={[s.qtyDisplay, { borderColor: tech.color + "44" }]}>
                    <Text style={s.qtyNumber}>{quantity}</Text>
                    <Text style={s.qtyUnit}>adet</Text>
                  </View>
                  <TouchableOpacity
                    style={[s.qtyBtn, quantity >= 999 && s.qtyBtnDisabled]}
                    onPress={() => setQuantity(Math.min(999, quantity + 1))}
                    disabled={quantity >= 999}
                  >
                    <Text style={s.qtyBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        )}
      </View>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <View style={[s.safe, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <Animated.View entering={FadeInDown.duration(400)} style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>3D Baskı Siparişi</Text>
          <Text style={s.headerSub}>Model yükle ve ayarları seç</Text>
        </View>
        <View style={s.fidropBadge}>
          <Text style={s.fidropText}>by fidrop</Text>
        </View>
      </Animated.View>

      {/* Adım göstergesi */}
      <StepIndicator currentStep={file ? 2 : 1} totalSteps={3} />
      <View style={s.stepLabelRow}>
        <Text style={s.stepLabel}>{file ? "Adım 2 / 3" : "Adım 1 / 3"}</Text>
        <Text style={s.stepLabelRight}>
          {file ? "Baskı Ayarları" : "Dosya Yükleme"}
        </Text>
      </View>

      {/* Viewer / Upload alanı */}
      <View style={s.viewerWrapper}>
        {!file ? (
          <TouchableOpacity
            style={s.uploadPlaceholder}
            onPress={handleFilePick}
            activeOpacity={0.85}
          >
            <Text style={s.uploadIcon}>📂</Text>
            <Text style={s.uploadTitle}>Dosya Seç</Text>
            <Text style={s.uploadHint}>STL, OBJ, STP, STEP, IGS</Text>
            <View style={s.uploadFormatRow}>
              {ACCEPTED_FORMATS.map((f) => (
                <View key={f} style={s.formatBadge}>
                  <Text style={s.formatBadgeText}>
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
                        infill:       selectedInfill,
                        gramPrice:    selectedMaterialData.gramPrice,
                        hourlyRate:   selectedMaterialData.hourlyRate,
                        fixedCost:    selectedMaterialData.fixedCost,
                        profitMargin: (selectedMaterialData as any).profitMargin ?? 30,
                        quantity,
                      }
                    : undefined
                }
              />
            ) : (
              <View style={s.nonStlPlaceholder}>
                <Text style={s.nonStlIcon}>📄</Text>
                <Text style={s.nonStlName} numberOfLines={1}>{file.name}</Text>
                <Text style={s.nonStlSize}>{formatFileSize(file.size)}</Text>
              </View>
            )}
            <View style={s.viewerBar}>
              <TouchableOpacity onPress={handleFilePick} style={s.changeBtn}>
                <Text style={s.changeBtnText}>✏️ Değiştir</Text>
              </TouchableOpacity>
              <Text style={s.viewerFileName} numberOfLines={1}>{file.name}</Text>
              {isSTL && (
                <TouchableOpacity
                  onPress={() => setFullscreen(true)}
                  style={s.fullscreenBtn}
                >
                  <Text style={s.fullscreenBtnText}>⛶</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>

      {/* Fullscreen modal */}
      <Modal visible={fullscreen} animationType="fade" statusBarTranslucent>
        <View style={s.modalContainer}>
          <TouchableOpacity
            style={s.modalClose}
            onPress={() => setFullscreen(false)}
          >
            <Text style={s.modalCloseText}>✕</Text>
          </TouchableOpacity>
          {file && isSTL && (
            <STLViewer uri={file.uri} color={modelColor} height={600} />
          )}
        </View>
      </Modal>

      {/* Scroll içeriği */}
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!file && (
          <Animated.View entering={FadeInDown.delay(100).duration(500)} style={s.infoBox}>
            <Text style={s.infoIcon}>💡</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.infoTitle}>Nasıl Çalışır?</Text>
              <Text style={s.infoText}>
                Yukarıdan 3D modelini seç → Teknoloji ve malzeme seç → Anında fiyat al → Sipariş ver
              </Text>
            </View>
          </Animated.View>
        )}

        {file && (
          <>
            {isSTL && (
              <Animated.View entering={FadeInDown.delay(80).duration(400)} style={s.sectionBlock}>
                <Text style={s.blockTitle}>Dosya Birimi</Text>
                <View style={s.unitRow}>
                  {[
                    { id: "mm",   label: "mm"  },
                    { id: "inch", label: "inç" },
                  ].map((opt) => (
                    <TouchableOpacity
                      key={opt.id}
                      style={[s.unitBtn, unit === opt.id && s.unitBtnActive]}
                      onPress={() => setUnit(opt.id as "mm" | "inch")}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          s.unitLabel,
                          unit === opt.id && s.unitLabelActive,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Animated.View>
            )}

            {(!isSTL || modelReady) && (
              <Animated.View entering={FadeInDown.delay(160).duration(400)}>
                <Text style={s.sectionTitle}>Üretim Teknolojisi</Text>
                {techLoading ? (
                  <ActivityIndicator color={C.accent} style={{ marginVertical: 20 }} />
                ) : (
                  TECH_GROUPS.map((group) => {
                    const groupTechs = technologies.filter((t) =>
                      group.ids.includes(t.id),
                    );
                    if (groupTechs.length === 0) return null;
                    return (
                      <View key={group.groupId}>
                        <Text style={s.groupLabel}>{group.label}</Text>
                        {groupTechs.map((tech) => renderTechCard(tech))}
                      </View>
                    );
                  })
                )}
              </Animated.View>
            )}
          </>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer CTA */}
      <Animated.View
        entering={FadeInUp.duration(400)}
        style={[s.footer, { paddingBottom: insets.bottom + 16 }]}
      >
        {canProceed && (
          <View style={s.selectionSummary}>
            <Text style={s.summaryText} numberOfLines={1}>
              {selectedTechData?.name} · {selectedMaterialData?.name} · {selectedColor} ·{" "}
              {FDM_TECHNOLOGIES.includes(selectedTech ?? "")
                ? `%${selectedInfill} · `
                : ""}
              {quantity} adet
            </Text>
            {priceResult && (
              <Text style={[s.summaryPrice, { color: selectedTechData?.color ?? C.accent }]}>
                ₺{priceResult.totalPrice.toLocaleString("tr-TR")}
              </Text>
            )}
          </View>
        )}
        <TouchableOpacity
          style={[s.devamBtn, !canProceed && s.devamBtnDisabled]}
          onPress={handleDevam}
          disabled={!canProceed}
          activeOpacity={0.85}
        >
          <Text style={s.devamBtnText}>
            {!file
              ? "Önce Dosya Seçiniz"
              : !canProceed
                ? "Teknoloji, Malzeme ve Renk Seçiniz"
                : "Devam Et — Fiyat Özeti →"}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// ── Stiller (Colors.dark token'ları) ──────────────────────────────────────────
const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: C.background },
  header: {
    flexDirection:    "row",
    alignItems:       "center",
    paddingHorizontal: 16,
    paddingVertical:  12,
    gap:              12,
  },
  backBtn: {
    width:           40,
    height:          40,
    borderRadius:    20,
    backgroundColor: C.surface2,
    borderWidth:     1,
    borderColor:     C.border,
    alignItems:      "center",
    justifyContent:  "center",
  },
  backArrow: { fontSize: 28, color: C.foreground, lineHeight: 32, marginTop: -2 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: C.foreground, letterSpacing: -0.5 },
  headerSub:   { fontSize: 12, color: C.mutedForeground, marginTop: 1 },
  fidropBadge: {
    backgroundColor: C.accent + "22",
    borderColor:     C.accent + "55",
    borderWidth:     1,
    borderRadius:    20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  fidropText: { color: C.accent, fontSize: 11, fontWeight: "600", letterSpacing: 0.5 },

  stepContainer: {
    flexDirection:    "row",
    paddingHorizontal: 16,
    gap:              6,
    marginTop:        4,
  },
  stepTrack: {
    flex:            1,
    height:          3,
    backgroundColor: C.border,
    borderRadius:    2,
    overflow:        "hidden",
  },
  stepFill:       { height: "100%", width: "100%", borderRadius: 2 },
  stepLabelRow: {
    flexDirection:    "row",
    justifyContent:   "space-between",
    paddingHorizontal: 16,
    marginTop:        6,
    marginBottom:     4,
  },
  stepLabel:      { fontSize: 11, color: C.subtleForeground },
  stepLabelRight: { fontSize: 11, color: C.accent, fontWeight: "600" },

  viewerWrapper: { width: "100%", height: 220, backgroundColor: "#1a1a2e" },
  uploadPlaceholder: {
    flex:           1,
    alignItems:     "center",
    justifyContent: "center",
    gap:            8,
  },
  uploadIcon:  { fontSize: 40 },
  uploadTitle: { fontSize: 16, fontWeight: "700", color: C.foreground },
  uploadHint:  { fontSize: 12, color: C.mutedForeground },
  uploadFormatRow: {
    flexDirection: "row",
    flexWrap:      "wrap",
    gap:           6,
    justifyContent:"center",
    marginTop:     4,
  },
  formatBadge: {
    backgroundColor: C.surface2,
    borderRadius:    6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth:     1,
    borderColor:     C.border,
  },
  formatBadgeText: { color: C.subtleForeground, fontSize: 10, fontWeight: "600" },

  viewerBar: {
    position:        "absolute",
    bottom:          32,
    left:            0,
    right:           0,
    flexDirection:   "row",
    alignItems:      "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap:             8,
  },
  changeBtn: {
    backgroundColor: C.surface2,
    borderRadius:    8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  changeBtnText:   { fontSize: 11, color: C.mutedForeground, fontWeight: "600" },
  viewerFileName:  { flex: 1, fontSize: 11, color: "#ffffff99" },
  fullscreenBtn: {
    width:           28,
    height:          28,
    alignItems:      "center",
    justifyContent:  "center",
    backgroundColor: C.surface2,
    borderRadius:    6,
  },
  fullscreenBtnText: { fontSize: 14, color: C.foreground },

  nonStlPlaceholder: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  nonStlIcon:  { fontSize: 40 },
  nonStlName:  { fontSize: 14, fontWeight: "600", color: C.foreground },
  nonStlSize:  { fontSize: 12, color: C.mutedForeground },

  modalContainer: { flex: 1, backgroundColor: "#0f0f1a", justifyContent: "center" },
  modalClose: {
    position:        "absolute",
    top:             50,
    right:           20,
    zIndex:          10,
    width:           36,
    height:          36,
    borderRadius:    18,
    backgroundColor: C.surface2,
    alignItems:      "center",
    justifyContent:  "center",
  },
  modalCloseText: { color: C.foreground, fontSize: 16, fontWeight: "700" },

  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16 },

  infoBox: {
    backgroundColor: C.surface,
    borderRadius:    14,
    borderWidth:     1,
    borderColor:     C.border,
    padding:         16,
    flexDirection:   "row",
    gap:             12,
    marginBottom:    16,
  },
  infoIcon:  { fontSize: 20, marginTop: 2 },
  infoTitle: { fontSize: 13, fontWeight: "700", color: C.foreground, marginBottom: 4 },
  infoText:  { fontSize: 12, color: C.mutedForeground, lineHeight: 19 },

  sectionBlock:   { marginBottom: 16 },
  blockTitle:     { fontSize: 14, fontWeight: "700", color: C.foreground, marginBottom: 8 },
  unitRow:        { flexDirection: "row", gap: 12 },
  unitBtn: {
    flex:            1,
    backgroundColor: C.surface,
    borderRadius:    12,
    borderWidth:     1,
    borderColor:     C.border,
    paddingVertical: 12,
    alignItems:      "center",
  },
  unitBtnActive:  { borderColor: C.accent, backgroundColor: C.accent + "15" },
  unitLabel:      { fontSize: 16, fontWeight: "700", color: C.mutedForeground },
  unitLabelActive:{ color: C.accent },

  sectionTitle: {
    fontSize:     16,
    fontWeight:   "700",
    color:        C.foreground,
    marginBottom: 4,
  },
  groupLabel: {
    fontSize:      11,
    fontWeight:    "700",
    color:         C.subtleForeground,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom:  8,
    marginTop:     12,
    paddingLeft:   4,
  },
  techCard: {
    backgroundColor: C.surface,
    borderRadius:    14,
    borderWidth:     1,
    borderColor:     C.border,
    marginBottom:    10,
    overflow:        "hidden",
  },
  techCardHeader: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  techIconWrap: {
    width:          42,
    height:         42,
    borderRadius:   12,
    justifyContent: "center",
    alignItems:     "center",
  },
  techIcon:  { fontSize: 20 },
  techInfo:  { flex: 1 },
  techTitle: { fontSize: 14, fontWeight: "600", color: C.foreground, marginBottom: 2 },
  techDesc:  { fontSize: 12, color: C.mutedForeground },
  techRadio: {
    width:          22,
    height:         22,
    borderRadius:   11,
    borderWidth:    2,
    borderColor:    C.border,
    justifyContent: "center",
    alignItems:     "center",
  },
  techRadioCheck: { color: "#fff", fontSize: 11, fontWeight: "700" },
  techExpanded: {
    borderTopWidth:  1,
    borderTopColor:  C.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  expandedLabel: {
    fontSize:      11,
    fontWeight:    "700",
    color:         C.mutedForeground,
    marginBottom:  10,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical:   8,
    borderRadius:      20,
    backgroundColor:   C.surface2,
    borderWidth:       1,
    borderColor:       C.border,
  },
  chipText: { fontSize: 13, fontWeight: "600", color: C.mutedForeground },

  colorRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  colorItem: {
    alignItems:      "center",
    width:           58,
    paddingVertical: 8,
    paddingHorizontal: 4,
    position:        "relative",
  },
  /* Dış çerçeve: yalnızca seçilince görünür (borderColor geçersiz olduğunda şeffaf) */
  colorRingOuter: {
    width:          44,
    height:         44,
    borderRadius:   22,
    borderWidth:    2,
    borderColor:    "transparent",
    padding:        3,
    marginBottom:   5,
    alignItems:     "center",
    justifyContent: "center",
  },
  /* İç boşluk (background rengi ile halka efekti) */
  colorRingInner: {
    width:          34,
    height:         34,
    borderRadius:   17,
    backgroundColor: C.surface2,
    alignItems:     "center",
    justifyContent: "center",
  },
  colorDot:  { width: 32, height: 32, borderRadius: 16 },
  colorName: { fontSize: 9, color: C.mutedForeground, textAlign: "center", lineHeight: 12 },
  colorCheckBadge: {
    position:       "absolute",
    top:            0,
    right:          2,
    width:          16,
    height:         16,
    borderRadius:   8,
    alignItems:     "center",
    justifyContent: "center",
  },
  colorCheckText: { color: "#fff", fontSize: 9, fontWeight: "700" },

  infillRow: { flexDirection: "row", gap: 6 },
  infillBtn: {
    flex:            1,
    backgroundColor: C.surface2,
    borderRadius:    10,
    borderWidth:     1,
    borderColor:     C.border,
    paddingVertical: 10,
    alignItems:      "center",
    position:        "relative",
  },
  infillRecommended:     { position: "absolute", top: -6, right: -4 },
  infillRecommendedText: { fontSize: 10 },
  infillLabel: { fontSize: 12, fontWeight: "700", color: C.mutedForeground, marginBottom: 2 },
  infillDesc:  { fontSize: 9, color: C.subtleForeground },

  quantityRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  qtyBtn: {
    width:           44,
    height:          44,
    backgroundColor: C.surface2,
    borderRadius:    12,
    borderWidth:     1,
    borderColor:     C.border,
    justifyContent:  "center",
    alignItems:      "center",
  },
  qtyBtnDisabled: { opacity: 0.4 },
  qtyBtnText:     { fontSize: 22, color: C.foreground, fontWeight: "300" },
  qtyDisplay: {
    flex:            1,
    alignItems:      "center",
    backgroundColor: C.surface2,
    borderRadius:    12,
    borderWidth:     1,
    paddingVertical: 8,
  },
  qtyNumber: { fontSize: 24, fontWeight: "700", color: C.foreground, lineHeight: 30 },
  qtyUnit:   { fontSize: 11, color: C.mutedForeground },

  footer: {
    padding:         16,
    backgroundColor: C.background,
    borderTopWidth:  1,
    borderTopColor:  C.border,
  },
  selectionSummary: {
    backgroundColor:   C.surface,
    borderRadius:      10,
    paddingHorizontal: 14,
    paddingVertical:   8,
    marginBottom:      10,
    borderWidth:       1,
    borderColor:       C.border,
    flexDirection:     "row",
    justifyContent:    "space-between",
    alignItems:        "center",
  },
  summaryText:  { fontSize: 12, color: C.mutedForeground, flex: 1 },
  summaryPrice: { fontSize: 14, fontWeight: "800", marginLeft: 8 },
  devamBtn: {
    backgroundColor: C.accent,
    borderRadius:    14,
    paddingVertical: 16,
    alignItems:      "center",
  },
  devamBtnDisabled: { backgroundColor: C.surface2 },
  devamBtnText: { color: "#fff", fontSize: 15, fontWeight: "700", letterSpacing: 0.2 },
});
