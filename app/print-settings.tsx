import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../constants";

const TECHNOLOGIES = [
  {
    id: "fdm-standart",
    group: "FDM Baskı",
    title: "Standart FDM",
    desc: "Bireysel ve hobi amaçlı üretimlere uygun.",
    icon: "🏭",
    color: "#ff6b2b",
    popular: true,
  },
  {
    id: "fdm-endustriyel",
    group: "FDM Baskı",
    title: "Endüstriyel FDM",
    desc: "Fabrika tipi, endüstriyel üretimlere uygun.",
    icon: "⚙️",
    color: "#f97316",
    popular: false,
  },
  {
    id: "sla-standart",
    group: "SLA / DLP",
    title: "Standart Reçine",
    desc: "Yüksek detaylı, pürüzsüz yüzey kalitesi.",
    icon: "💎",
    color: "#6366f1",
    popular: false,
  },
  {
    id: "sla-endustriyel",
    group: "SLA / DLP",
    title: "Endüstriyel Reçine",
    desc: "Yüksek toleranslı endüstriyel üretim.",
    icon: "🔬",
    color: "#8b5cf6",
    popular: false,
  },
  {
    id: "mjf",
    group: "SLS / MJF",
    title: "Multi Jet Fusion",
    desc: "PA tabanlı, yüksek performanslı üretim.",
    icon: "🚀",
    color: "#0ea5e9",
    popular: false,
  },
  {
    id: "sls",
    group: "SLS / MJF",
    title: "Seçici Lazer Sinterleme",
    desc: "Dayanıklı, hassas fonksiyonel prototipler.",
    icon: "⚡",
    color: "#06b6d4",
    popular: false,
  },
  {
    id: "metal",
    group: "Metal",
    title: "Metal Baskı (DMLS)",
    desc: "Doğrudan metal baskı ile dayanıklı üretim.",
    icon: "🔩",
    color: "#94a3b8",
    popular: false,
  },
];

const MATERIALS: Record<
  string,
  { id: string; name: string; color: string; hex: string }[]
> = {
  "fdm-standart": [
    { id: "abs-beyaz", name: "ABS", color: "Beyaz", hex: "#f1f5f9" },
    { id: "abs-siyah", name: "ABS", color: "Siyah", hex: "#1e293b" },
    { id: "abs-gri", name: "ABS", color: "Gri", hex: "#64748b" },
    { id: "abs-kirmizi", name: "ABS", color: "Kırmızı", hex: "#ef4444" },
    { id: "abs-mavi", name: "ABS", color: "Mavi", hex: "#3b82f6" },
    { id: "abs-sari", name: "ABS", color: "Sarı", hex: "#eab308" },
    { id: "pla-siyah", name: "PLA", color: "Siyah", hex: "#1e293b" },
  ],
  "fdm-endustriyel": [
    { id: "abs-beyaz", name: "ABS", color: "Beyaz", hex: "#f1f5f9" },
    { id: "abs-siyah", name: "ABS", color: "Siyah", hex: "#1e293b" },
    { id: "abs-gri", name: "ABS", color: "Gri", hex: "#64748b" },
  ],
  "sla-standart": [
    { id: "resin-beyaz", name: "Resin", color: "Beyaz", hex: "#f8fafc" },
    { id: "resin-gri", name: "Resin", color: "Gri", hex: "#94a3b8" },
    { id: "resin-seffaf", name: "Resin", color: "Şeffaf", hex: "#e0f2fe" },
  ],
  "sla-endustriyel": [
    { id: "resin-beyaz", name: "Resin", color: "Beyaz", hex: "#f8fafc" },
    { id: "resin-gri", name: "Resin", color: "Gri", hex: "#94a3b8" },
  ],
  mjf: [
    { id: "pa12-gri", name: "PA12", color: "Gri", hex: "#94a3b8" },
    { id: "pa12-siyah", name: "PA12", color: "Siyah", hex: "#1e293b" },
  ],
  sls: [
    { id: "pa12-gri", name: "PA12", color: "Gri", hex: "#94a3b8" },
    { id: "pa11-dogal", name: "PA11", color: "Doğal", hex: "#fef3c7" },
  ],
  metal: [
    { id: "celik-316l", name: "316L Çelik", color: "Gümüş", hex: "#cbd5e1" },
    { id: "titanium", name: "Titanyum", color: "Gümüş", hex: "#b0c4de" },
  ],
};

const INFILL_OPTIONS = [
  { value: 15, label: "%15", desc: "Hafif" },
  { value: 20, label: "%20", desc: "Standart", recommended: true },
  { value: 30, label: "%30", desc: "Sağlam" },
  { value: 50, label: "%50", desc: "Güçlü" },
  { value: 100, label: "%100", desc: "Tam Dolu" },
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

export default function PrintSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const [selectedTech, setSelectedTech] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [selectedInfill, setSelectedInfill] = useState<number>(20);
  const [quantity, setQuantity] = useState<number>(1);

  const availableMaterials = selectedTech ? MATERIALS[selectedTech] || [] : [];
  const selectedTechData = TECHNOLOGIES.find((t) => t.id === selectedTech);
  const selectedMaterialData = availableMaterials.find(
    (m) => m.id === selectedMaterial,
  );

  const handleTechSelect = (techId: string) => {
    setSelectedTech(techId);
    setSelectedMaterial(null);
  };

  const canProceed = selectedTech && selectedMaterial;

  const handleDevam = () => {
    if (!canProceed) return;
    router.push({
      pathname: "/print-summary",
      params: {
        ...params,
        tech: selectedTech,
        material: selectedMaterial,
        infill: selectedInfill,
        quantity,
      },
    });
  };

  const groups = [...new Set(TECHNOLOGIES.map((t) => t.group))];

  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Baskı Ayarları</Text>
          <Text style={styles.headerSub}>Teknoloji ve malzeme seç</Text>
        </View>
        <View style={styles.fidropBadge}>
          <Text style={styles.fidropText}>by fidrop</Text>
        </View>
      </View>

      <StepIndicator currentStep={3} totalSteps={4} />
      <View style={styles.stepLabelRow}>
        <Text style={styles.stepLabel}>Adım 3 / 4</Text>
        <Text style={styles.stepLabelRight}>Baskı Ayarları</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.fileInfoBar}>
          <Text style={styles.fileInfoIcon}>📄</Text>
          <Text style={styles.fileInfoName} numberOfLines={1}>
            {params.fileName || "model.stl"}
          </Text>
          <Text style={styles.fileInfoUnit}>{params.unit || "mm"}</Text>
        </View>

        <Text style={styles.sectionTitle}>Üretim Teknolojisi</Text>
        <Text style={styles.sectionSub}>
          Kullanım amacına göre bir teknoloji seç.
        </Text>

        {groups.map((group) => (
          <View key={group} style={styles.groupBlock}>
            <Text style={styles.groupLabel}>{group}</Text>
            {TECHNOLOGIES.filter((t) => t.group === group).map((tech) => (
              <TouchableOpacity
                key={tech.id}
                style={[
                  styles.techCard,
                  selectedTech === tech.id && {
                    borderColor: tech.color,
                    borderWidth: 2,
                  },
                ]}
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
                  <View style={styles.techTitleRow}>
                    <Text style={styles.techTitle}>{tech.title}</Text>
                    {tech.popular && (
                      <View style={styles.popularBadge}>
                        <Text style={styles.popularText}>Popüler</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.techDesc}>{tech.desc}</Text>
                </View>
                <View
                  style={[
                    styles.techRadio,
                    selectedTech === tech.id && {
                      borderColor: tech.color,
                      backgroundColor: tech.color,
                    },
                  ]}
                >
                  {selectedTech === tech.id && (
                    <Text style={styles.techRadioCheck}>✓</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {selectedTech && availableMaterials.length > 0 && (
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>Malzeme & Renk</Text>
            <Text style={styles.sectionSub}>
              {selectedTechData?.title} için mevcut malzemeler.
            </Text>
            <View style={styles.materialGrid}>
              {availableMaterials.map((mat) => (
                <TouchableOpacity
                  key={mat.id}
                  style={[
                    styles.materialCard,
                    selectedMaterial === mat.id && {
                      borderColor: selectedTechData?.color,
                      borderWidth: 2,
                      backgroundColor: selectedTechData?.color + "15",
                    },
                  ]}
                  onPress={() => setSelectedMaterial(mat.id)}
                  activeOpacity={0.85}
                >
                  <View
                    style={[
                      styles.colorDot,
                      {
                        backgroundColor: mat.hex,
                        borderColor:
                          mat.hex === "#f1f5f9" || mat.hex === "#f8fafc"
                            ? "#cbd5e1"
                            : "transparent",
                      },
                    ]}
                  />
                  <Text style={styles.materialName}>{mat.name}</Text>
                  <Text style={styles.materialColor}>{mat.color}</Text>
                  {selectedMaterial === mat.id && (
                    <Text style={styles.materialCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Dolgu Oranı</Text>
          <Text style={styles.sectionSub}>
            Modelin iç doluluk oranı. Varsayılan %20.
          </Text>
          <View style={styles.infillRow}>
            {INFILL_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.infillBtn,
                  selectedInfill === opt.value && styles.infillBtnActive,
                ]}
                onPress={() => setSelectedInfill(opt.value)}
                activeOpacity={0.8}
              >
                {opt.recommended && (
                  <View style={styles.infillRecommended}>
                    <Text style={styles.infillRecommendedText}>✦</Text>
                  </View>
                )}
                <Text
                  style={[
                    styles.infillLabel,
                    selectedInfill === opt.value && styles.infillLabelActive,
                  ]}
                >
                  {opt.label}
                </Text>
                <Text
                  style={[
                    styles.infillDesc,
                    selectedInfill === opt.value && { color: Colors.accent },
                  ]}
                >
                  {opt.desc}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Adet</Text>
          <Text style={styles.sectionSub}>Kaç adet üretilsin?</Text>
          <View style={styles.quantityRow}>
            <TouchableOpacity
              style={[styles.qtyBtn, quantity <= 1 && styles.qtyBtnDisabled]}
              onPress={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
            >
              <Text style={styles.qtyBtnText}>−</Text>
            </TouchableOpacity>
            <View style={styles.qtyDisplay}>
              <Text style={styles.qtyNumber}>{quantity}</Text>
              <Text style={styles.qtyUnit}>adet</Text>
            </View>
            <TouchableOpacity
              style={[styles.qtyBtn, quantity >= 999 && styles.qtyBtnDisabled]}
              onPress={() => setQuantity((q) => Math.min(999, q + 1))}
              disabled={quantity >= 999}
            >
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        {canProceed && (
          <View style={styles.selectionSummary}>
            <Text style={styles.summaryText} numberOfLines={1}>
              {selectedTechData?.title} · {selectedMaterialData?.name}{" "}
              {selectedMaterialData?.color} · %{selectedInfill} · {quantity}{" "}
              adet
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
            {canProceed
              ? "Devam Et — Fiyat Özeti →"
              : "Teknoloji ve Malzeme Seçiniz"}
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
  fileInfoBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 24,
    gap: 8,
  },
  fileInfoIcon: { fontSize: 16 },
  fileInfoName: {
    flex: 1,
    fontSize: 13,
    color: Colors.text,
    fontWeight: "500",
  },
  fileInfoUnit: {
    fontSize: 11,
    color: Colors.accent,
    fontWeight: "600",
    backgroundColor: Colors.accent + "22",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },
  sectionSub: { fontSize: 12, color: Colors.text2, marginBottom: 14 },
  sectionBlock: { marginTop: 8, marginBottom: 4 },
  groupBlock: { marginBottom: 16 },
  groupLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.text3,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  techCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 8,
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
  techTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  techTitle: { fontSize: 14, fontWeight: "600", color: Colors.text },
  popularBadge: {
    backgroundColor: Colors.accent + "22",
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  popularText: { fontSize: 10, color: Colors.accent, fontWeight: "700" },
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
  materialGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  materialCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    alignItems: "center",
    width: "30%",
    position: "relative",
  },
  colorDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginBottom: 6,
    borderWidth: 1,
  },
  materialName: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 2,
  },
  materialColor: { fontSize: 10, color: Colors.text2 },
  materialCheck: {
    position: "absolute",
    top: 6,
    right: 8,
    fontSize: 12,
    color: Colors.accent,
    fontWeight: "700",
  },
  infillRow: { flexDirection: "row", gap: 8 },
  infillBtn: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 12,
    alignItems: "center",
    position: "relative",
  },
  infillBtnActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent + "15",
  },
  infillRecommended: { position: "absolute", top: -6, right: -4 },
  infillRecommendedText: { fontSize: 10, color: Colors.accent },
  infillLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text2,
    marginBottom: 2,
  },
  infillLabelActive: { color: Colors.accent },
  infillDesc: { fontSize: 10, color: Colors.text3 },
  quantityRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  qtyBtn: {
    width: 48,
    height: 48,
    backgroundColor: Colors.surface,
    borderRadius: 14,
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
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 10,
  },
  qtyNumber: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.text,
    lineHeight: 34,
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
