import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../constants";

const TECH_LABELS: Record<
  string,
  { title: string; icon: string; color: string }
> = {
  "fdm-standart": { title: "FDM Standart", icon: "🏭", color: "#ff6b2b" },
  "fdm-endustriyel": { title: "FDM Endüstriyel", icon: "⚙️", color: "#f97316" },
  "fdm-yuksek": {
    title: "FDM Yüksek Performans",
    icon: "🔥",
    color: "#dc2626",
  },
  sla: { title: "SLA Reçine", icon: "💎", color: "#6366f1" },
  dlp: { title: "DLP Reçine", icon: "🔵", color: "#3b82f6" },
  msla: { title: "MSLA (LCD) Reçine", icon: "📱", color: "#8b5cf6" },
  sls: { title: "SLS (Toz)", icon: "⚡", color: "#06b6d4" },
  mjf: { title: "MJF (Multi Jet Fusion)", icon: "🚀", color: "#0ea5e9" },
  dmls: { title: "Metal (DMLS/SLM)", icon: "🔩", color: "#94a3b8" },
  "binder-jetting": {
    title: "Binder Jetting (Metal)",
    icon: "🏗️",
    color: "#64748b",
  },
  polyjet: { title: "Polyjet/Multijet", icon: "🎨", color: "#ec4899" },
  seramik: { title: "Seramik/Beton", icon: "🏺", color: "#a16207" },
  "karbon-fiber": {
    title: "Continuous Karbon Fiber",
    icon: "🏎️",
    color: "#1e293b",
  },
};

const MATERIAL_LABELS: Record<
  string,
  { name: string; color: string; hex: string }
> = {
  "abs-beyaz": { name: "ABS", color: "Beyaz", hex: "#f1f5f9" },
  "abs-siyah": { name: "ABS", color: "Siyah", hex: "#1e293b" },
  "abs-gri": { name: "ABS", color: "Gri", hex: "#64748b" },
  "abs-kirmizi": { name: "ABS", color: "Kırmızı", hex: "#ef4444" },
  "abs-mavi": { name: "ABS", color: "Mavi", hex: "#3b82f6" },
  "abs-sari": { name: "ABS", color: "Sarı", hex: "#eab308" },
  "pla-siyah": { name: "PLA", color: "Siyah", hex: "#1e293b" },
  "resin-beyaz": { name: "Resin", color: "Beyaz", hex: "#f8fafc" },
  "resin-gri": { name: "Resin", color: "Gri", hex: "#94a3b8" },
  "resin-seffaf": { name: "Resin", color: "Şeffaf", hex: "#e0f2fe" },
  "pa12-gri": { name: "PA12", color: "Gri", hex: "#94a3b8" },
  "pa12-siyah": { name: "PA12", color: "Siyah", hex: "#1e293b" },
  "pa11-dogal": { name: "PA11", color: "Doğal", hex: "#fef3c7" },
  "celik-316l": { name: "316L Çelik", color: "Gümüş", hex: "#cbd5e1" },
  titanium: { name: "Titanyum", color: "Gümüş", hex: "#b0c4de" },
};

const DELIVERY_DAYS: Record<string, string> = {
  "fdm-standart": "2-4 iş günü",
  "fdm-endustriyel": "3-5 iş günü",
  "fdm-yuksek": "4-7 iş günü",
  sla: "3-5 iş günü",
  dlp: "3-5 iş günü",
  msla: "3-5 iş günü",
  sls: "5-7 iş günü",
  mjf: "5-7 iş günü",
  dmls: "10-15 iş günü",
  "binder-jetting": "10-15 iş günü",
  polyjet: "5-8 iş günü",
  seramik: "7-10 iş günü",
  "karbon-fiber": "5-8 iş günü",
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

export default function PrintSummaryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const [ordering, setOrdering] = useState(false);
  const [priceData, setPriceData] = useState<{
    unitPrice: number;
    totalPrice: number;
    discount: number;
    weightGram: number;
    printHours: number;
    volumeCm3?: number;
    dimensionsMm?: { x: number; y: number; z: number };
    triangleCount?: number;
    meshWarning?: string;
    source?: string;
  } | null>(null);
  const [priceLoading, setPriceLoading] = useState(true);

  const tech = params.tech as string;
  const material = params.material as string;
  const FDM_TECHNOLOGIES = ["fdm-standart", "fdm-endustriyel", "fdm-yuksek"];
  const infill = FDM_TECHNOLOGIES.includes(tech)
    ? Number(params.infill) || 20
    : 20;
  const quantity = Number(params.quantity) || 1;
  const fileName = params.fileName as string;
  const unit = params.unit as string;

  const techData = TECH_LABELS[tech];
  const materialData = MATERIAL_LABELS[material] ?? {
    name: (params.materialName as string) ?? material,
    color: (params.color as string) ?? "",
    hex: "#94a3b8",
  };

  const deliveryDays = DELIVERY_DAYS[tech] || "3-7 iş günü";

  // Malzeme ID'sini backend formatına çevir

  useEffect(() => {
    setPriceLoading(true);
    const volCm3 =
      Number(params.volumeCm3) > 0.1 ? Number(params.volumeCm3) : 25;
    const fileUri = params.fileUri as string;

    const form = new FormData();
    form.append("file", {
      uri: fileUri,
      name: "model.stl",
      type: "application/octet-stream",
    } as any);
    form.append("volume_cm3", String(volCm3));
    form.append("technology_id", tech);
    form.append("infill", String(infill));
    form.append("gram_price", String(params.gramPrice ?? 0));
    form.append("hourly_rate", String(params.hourlyRate ?? 0));
    form.append("fixed_cost", String(params.fixedCost ?? 0));
    form.append("profit_margin", String(params.profitMargin ?? 30));
    form.append("quantity", String(quantity));

    const backendForm = new FormData();
    backendForm.append("file", {
      uri: fileUri,
      name: "model.stl",
      type: "application/octet-stream",
    } as any);
    backendForm.append("volumeCm3", String(volCm3));
    backendForm.append("technology_id", tech);
    backendForm.append("infill", String(infill));
    backendForm.append("materialId", material);
    backendForm.append("density_g_cm3", String(params.density ?? 0));
    backendForm.append("quantity", String(quantity));
    console.log(
      "fetch başlıyor, tech:",
      tech,
      "material:",
      material,
      "infill:",
      infill,
    );
    fetch(
      "https://fimarkt-backend-production.up.railway.app/api/print/calculate",
      {
        method: "POST",
        body: backendForm,
      },
    )
      .then((r) => r.json())
      .then((result) => {
        console.log("backend cevap:", JSON.stringify(result));
        setPriceData({
          unitPrice: result.unitPrice ?? result.unit_price,
          totalPrice: result.totalPrice ?? result.total_price,
          discount: result.discount ?? 0,
          weightGram: result.weightGram ?? result.weight_gram,
          printHours: result.printHours ?? result.print_hours,
          volumeCm3: result.volumeCm3 ?? result.volume_cm3,
          dimensionsMm: result.dimensionsMm ?? result.dimensions_mm,
          triangleCount: result.triangleCount ?? result.triangle_count,
          meshWarning: result.mesh_warning,
          source: result.source,
        });
        setPriceLoading(false);
      })
      .catch((err) => {
        console.log("fetch hata:", err);
        setPriceLoading(false);
      });
  }, []);
  const handleSiparisVer = () => {
    if (!priceData) return;
    Alert.alert(
      "Siparişi Onayla",
      `Toplam tutar: ₺${priceData.totalPrice.toLocaleString("tr-TR")}\n\nSiparişiniz oluşturulsun mu?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Onayla",
          onPress: () => {
            setOrdering(true);
            setTimeout(() => {
              setOrdering(false);
              Alert.alert(
                "🎉 Sipariş Alındı!",
                "Siparişiniz başarıyla oluşturuldu. Ekibimiz en kısa sürede üretimi başlatacak.",
                [
                  {
                    text: "Tamam",
                    onPress: () => router.push("/(tabs)/print"),
                  },
                ],
              );
            }, 1000);
          },
        },
      ],
    );
  };

  const handleTeklifIste = () => {
    Alert.alert(
      "Detaylı Teklif",
      "Uzman ekibimiz dosyanızı inceleyerek en kısa sürede size ulaşacak.",
      [{ text: "Tamam" }],
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
          <Text style={styles.headerTitle}>Fiyat Özeti</Text>
          <Text style={styles.headerSub}>Siparişini gözden geçir</Text>
        </View>
        <View style={styles.fidropBadge}>
          <Text style={styles.fidropText}>by fidrop</Text>
        </View>
      </View>

      <StepIndicator currentStep={3} totalSteps={3} />
      <View style={styles.stepLabelRow}>
        <Text style={styles.stepLabel}>Adım 3 / 3</Text>
        <Text style={styles.stepLabelRight}>Fiyat Özeti</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.priceCard}>
          <View style={styles.priceCardTop}>
            <Text style={styles.priceLabel}>Toplam Fiyat</Text>
            {priceData?.source && (
              <View style={styles.priceBadge}>
                <Text style={styles.priceBadgeText}>
                  {priceData.source === "volumetric-fdm"
                    ? "Volumetric Flow ✓"
                    : priceData.source === "resin"
                      ? "Reçine Motor ✓"
                      : priceData.source === "powder"
                        ? "Toz Motor ✓"
                        : priceData.source === "metal"
                          ? "Metal Motor ✓"
                          : priceData.source === "polyjet"
                            ? "Polyjet Motor ✓"
                            : priceData.source === "ceramic"
                              ? "Seramik Motor ✓"
                              : priceData.source === "carbon-fiber"
                                ? "Karbon Fiber Motor ✓"
                                : "Hesaplama Motoru ✓"}
                </Text>
              </View>
            )}
          </View>
          {priceLoading ? (
            <Text style={styles.priceAmount}>Hesaplanıyor...</Text>
          ) : (
            <Text style={styles.priceAmount}>
              ₺{(priceData?.totalPrice ?? 0).toLocaleString("tr-TR")}
            </Text>
          )}

          <View style={styles.priceBreakdown}>
            <View style={styles.priceRow}>
              <Text style={styles.priceRowLabel}>Birim Fiyat</Text>
              <Text style={styles.priceRowValue}>
                ₺{(priceData?.unitPrice ?? 0).toLocaleString("tr-TR")}
              </Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceRowLabel}>Adet</Text>
              <Text style={styles.priceRowValue}>{quantity}</Text>
            </View>
            {priceData && priceData.discount > 0 && (
              <View style={styles.priceRow}>
                <Text style={[styles.priceRowLabel, { color: Colors.green }]}>
                  İndirim
                </Text>
                <Text style={[styles.priceRowValue, { color: Colors.green }]}>
                  -₺{priceData.discount.toLocaleString("tr-TR")}
                </Text>
              </View>
            )}
            <View style={[styles.priceRow, styles.priceRowTotal]}>
              <Text style={styles.priceRowLabelTotal}>Toplam</Text>
              <Text style={styles.priceRowValueTotal}>
                ₺{(priceData?.totalPrice ?? 0).toLocaleString("tr-TR")}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.detailCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>🧊</Text>
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Model & Baskı Detayları</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>{techData?.icon}</Text>
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Teknoloji</Text>
              <Text style={[styles.detailValue, { color: techData?.color }]}>
                {techData?.title}
              </Text>
            </View>
            <View
              style={[
                styles.colorDotSmall,
                {
                  backgroundColor: materialData?.hex,
                  borderWidth: materialData?.hex === "#f1f5f9" ? 1 : 0,
                  borderColor: "#cbd5e1",
                },
              ]}
            />
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Malzeme</Text>
              <Text style={styles.detailValue}>
                {materialData?.name} — {materialData?.color}
              </Text>
            </View>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>⚖️</Text>
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Ağırlık</Text>
              <Text style={styles.detailValue}>
                {priceData?.weightGram ?? "-"} g
              </Text>
            </View>
            <Text style={styles.detailIcon}>⏱️</Text>
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Baskı Süresi</Text>
              <Text style={styles.detailValue}>
                {priceData?.printHours ?? "-"} saat
              </Text>
            </View>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📦</Text>
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Hacim</Text>
              <Text style={styles.detailValue}>
                {priceData?.volumeCm3 ?? "-"} cm³
              </Text>
            </View>
            {FDM_TECHNOLOGIES.includes(tech) && (
              <>
                <Text style={styles.detailIcon}>⬛</Text>
                <View style={styles.detailInfo}>
                  <Text style={styles.detailLabel}>Dolgu Oranı</Text>
                  <Text style={styles.detailValue}>%{infill}</Text>
                </View>
              </>
            )}
          </View>
          {priceData?.dimensionsMm && (
            <>
              <View style={styles.detailDivider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailIcon}>📐</Text>
                <View style={styles.detailInfo}>
                  <Text style={styles.detailLabel}>Boyutlar</Text>
                  <Text style={styles.detailValue}>
                    {priceData.dimensionsMm.x} × {priceData.dimensionsMm.y} ×{" "}
                    {priceData.dimensionsMm.z} mm
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>
        <View style={styles.deliveryCard}>
          <Text style={styles.deliveryIcon}>🚚</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.deliveryTitle}>Tahmini Teslimat</Text>
            <Text style={styles.deliveryDays}>{deliveryDays}</Text>
          </View>
          <Text style={styles.deliveryNote}>Onay sonrası</Text>
        </View>

        <Text style={styles.sectionTitle}>Sipariş Detayları</Text>

        <View style={styles.detailCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📄</Text>
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Dosya</Text>
              <Text style={styles.detailValue} numberOfLines={1}>
                {fileName}
              </Text>
            </View>
            <Text style={styles.detailExtra}>{unit}</Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>{techData?.icon}</Text>
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Üretim Teknolojisi</Text>
              <Text style={[styles.detailValue, { color: techData?.color }]}>
                {techData?.title}
              </Text>
            </View>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <View
              style={[
                styles.colorDotSmall,
                {
                  backgroundColor: materialData?.hex,
                  borderWidth:
                    materialData?.hex === "#f1f5f9" ||
                    materialData?.hex === "#f8fafc"
                      ? 1
                      : 0,
                  borderColor: "#cbd5e1",
                },
              ]}
            />
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Malzeme & Renk</Text>
              <Text style={styles.detailValue}>
                {materialData?.name} — {materialData?.color}
              </Text>
            </View>
          </View>
          <View style={styles.detailDivider} />

          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📦</Text>
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Adet</Text>
              <Text style={styles.detailValue}>{quantity} adet</Text>
            </View>
          </View>
        </View>

        {priceData?.meshWarning && (
          <View
            style={[
              styles.warningBox,
              { borderColor: "#f59e0b", marginBottom: 10 },
            ]}
          >
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={[styles.warningText, { color: "#f59e0b" }]}>
              {priceData.meshWarning}
            </Text>
          </View>
        )}

        <View style={styles.warningBox}>
          <Text style={styles.warningIcon}>ℹ️</Text>
          <Text style={styles.warningText}>
            Fiyat, modelinizin gerçek geometrisine göre hesaplanmıştır. Sipariş
            onaylandıktan sonra üretim süreci başlar.
          </Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={styles.teklifBtn}
          onPress={handleTeklifIste}
          activeOpacity={0.85}
        >
          <Text style={styles.teklifBtnText}>Detaylı Teklif İste</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.siparisBtn,
            (ordering || priceLoading) && { opacity: 0.7 },
          ]}
          onPress={handleSiparisVer}
          disabled={ordering || priceLoading}
          activeOpacity={0.85}
        >
          <Text style={styles.siparisBtnText}>
            {ordering
              ? "İşleniyor..."
              : priceLoading
                ? "Hesaplanıyor..."
                : `Sipariş Ver — ₺${(priceData?.totalPrice ?? 0).toLocaleString("tr-TR")}`}
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
  scrollContent: { paddingHorizontal: 16, paddingTop: 16 },
  priceCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.accent + "44",
    padding: 20,
    marginBottom: 14,
  },
  priceCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  priceLabel: { fontSize: 13, color: Colors.text2, fontWeight: "500" },
  priceBadge: {
    backgroundColor: Colors.accent + "22",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  priceBadgeText: { fontSize: 10, color: Colors.accent, fontWeight: "700" },
  priceAmount: {
    fontSize: 42,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -1,
    marginBottom: 8,
  },
  discountRow: {
    backgroundColor: Colors.green + "18",
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  discountText: { fontSize: 12, color: Colors.green, fontWeight: "500" },
  priceBreakdown: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
    gap: 8,
  },
  priceRow: { flexDirection: "row", justifyContent: "space-between" },
  priceRowTotal: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
    marginTop: 4,
  },
  priceRowLabel: { fontSize: 13, color: Colors.text2 },
  priceRowValue: { fontSize: 13, color: Colors.text, fontWeight: "600" },
  priceRowLabelTotal: { fontSize: 14, color: Colors.text, fontWeight: "700" },
  priceRowValueTotal: { fontSize: 14, color: Colors.accent, fontWeight: "800" },
  deliveryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  deliveryIcon: { fontSize: 24 },
  deliveryTitle: { fontSize: 12, color: Colors.text2, marginBottom: 2 },
  deliveryDays: { fontSize: 15, fontWeight: "700", color: Colors.green },
  deliveryNote: { fontSize: 11, color: Colors.text3 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 12,
  },
  detailCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 14,
    overflow: "hidden",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  detailIcon: { fontSize: 18, width: 24, textAlign: "center" },
  detailInfo: { flex: 1 },
  detailLabel: { fontSize: 11, color: Colors.text3, marginBottom: 2 },
  detailValue: { fontSize: 14, color: Colors.text, fontWeight: "500" },
  detailExtra: {
    fontSize: 11,
    color: Colors.accent,
    fontWeight: "600",
    backgroundColor: Colors.accent + "22",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  detailDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 14,
  },
  colorDotSmall: { width: 24, height: 24, borderRadius: 12 },
  warningBox: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    gap: 10,
  },
  warningIcon: { fontSize: 16, marginTop: 1 },
  warningText: { flex: 1, fontSize: 12, color: Colors.text2, lineHeight: 18 },
  footer: {
    padding: 16,
    backgroundColor: Colors.bg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 10,
  },
  teklifBtn: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  teklifBtnText: { color: Colors.text2, fontSize: 14, fontWeight: "600" },
  siparisBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  siparisBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
