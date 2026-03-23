import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { type ThemeColors } from "../../constants/theme";
import { useTheme } from "../../hooks/useTheme";
import { useAuth } from "../../src/store/AuthContext";
import { useCart } from "../../src/store/CartContext";
import AddToCartSuccessModal from "../../components/fidrop/AddToCartSuccessModal";

// ── Sabitler ───────────────────────────────────────────────────────────────────
const TECH_LABELS: Record<string, { title: string; icon: string; color: string }> = {
  "fdm-standart":    { title: "FDM Standart",              icon: "🏭", color: "#ff6b2b" },
  "fdm-endustriyel": { title: "FDM Endüstriyel",           icon: "⚙️", color: "#f97316" },
  "fdm-yuksek":      { title: "FDM Yüksek Performans",     icon: "🔥", color: "#dc2626" },
  sla:               { title: "SLA Reçine",                icon: "💎", color: "#6366f1" },
  dlp:               { title: "DLP Reçine",                icon: "🔵", color: "#3b82f6" },
  msla:              { title: "MSLA (LCD) Reçine",         icon: "📱", color: "#8b5cf6" },
  sls:               { title: "SLS (Toz)",                 icon: "⚡", color: "#06b6d4" },
  mjf:               { title: "MJF (Multi Jet Fusion)",    icon: "🚀", color: "#0ea5e9" },
  dmls:              { title: "Metal (DMLS/SLM)",          icon: "🔩", color: "#94a3b8" },
  "binder-jetting":  { title: "Binder Jetting (Metal)",    icon: "🏗️", color: "#64748b" },
  polyjet:           { title: "Polyjet/Multijet",          icon: "🎨", color: "#ec4899" },
  seramik:           { title: "Seramik/Beton",             icon: "🏺", color: "#a16207" },
  "karbon-fiber":    { title: "Continuous Karbon Fiber",   icon: "🏎️", color: "#1e293b" },
};

const MATERIAL_LABELS: Record<string, { name: string; color: string; hex: string }> = {
  "abs-beyaz":  { name: "ABS",      color: "Beyaz",   hex: "#f1f5f9" },
  "abs-siyah":  { name: "ABS",      color: "Siyah",   hex: "#1e293b" },
  "abs-gri":    { name: "ABS",      color: "Gri",     hex: "#64748b" },
  "abs-kirmizi":{ name: "ABS",      color: "Kırmızı", hex: "#ef4444" },
  "abs-mavi":   { name: "ABS",      color: "Mavi",    hex: "#3b82f6" },
  "abs-sari":   { name: "ABS",      color: "Sarı",    hex: "#eab308" },
  "pla-siyah":  { name: "PLA",      color: "Siyah",   hex: "#1e293b" },
  "resin-beyaz":{ name: "Resin",    color: "Beyaz",   hex: "#f8fafc" },
  "resin-gri":  { name: "Resin",    color: "Gri",     hex: "#94a3b8" },
  "resin-seffaf":{ name: "Resin",   color: "Şeffaf",  hex: "#e0f2fe" },
  "pa12-gri":   { name: "PA12",     color: "Gri",     hex: "#94a3b8" },
  "pa12-siyah": { name: "PA12",     color: "Siyah",   hex: "#1e293b" },
  "pa11-dogal": { name: "PA11",     color: "Doğal",   hex: "#fef3c7" },
  "celik-316l": { name: "316L Çelik", color: "Gümüş", hex: "#cbd5e1" },
  titanium:     { name: "Titanyum", color: "Gümüş",   hex: "#b0c4de" },
};

const DELIVERY_DAYS: Record<string, string> = {
  "fdm-standart":    "2-4 iş günü",
  "fdm-endustriyel": "3-5 iş günü",
  "fdm-yuksek":      "4-7 iş günü",
  sla:               "3-5 iş günü",
  dlp:               "3-5 iş günü",
  msla:              "3-5 iş günü",
  sls:               "5-7 iş günü",
  mjf:               "5-7 iş günü",
  dmls:              "10-15 iş günü",
  "binder-jetting":  "10-15 iş günü",
  polyjet:           "5-8 iş günü",
  seramik:           "7-10 iş günü",
  "karbon-fiber":    "5-8 iş günü",
};

// ── Animasyonlu fiyat sayacı ──────────────────────────────────────────────────
function AnimatedPriceText({ value, style }: { value: number; style?: any }) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const start = prevRef.current;
    const end   = value;
    if (start === end) return;
    const duration  = 700;
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed  = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress >= 1) {
        clearInterval(timer);
        prevRef.current = end;
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  return <Text style={style}>₺{display.toLocaleString("tr-TR")}</Text>;
}

// ── Adım göstergesi ────────────────────────────────────────────────────────────
const StepIndicator = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => {
  const { colors: C, isDark } = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);
  return (
    <View style={styles.stepContainer}>
      {Array.from({ length: totalSteps }).map((_, i) => (
        <View key={i} style={styles.stepTrack}>
          <View style={[styles.stepFill, { backgroundColor: i < currentStep ? C.accent : C.border }]} />
        </View>
      ))}
    </View>
  );
};

// ── Ana ekran ──────────────────────────────────────────────────────────────────
export default function PrintSummaryScreen() {
  const { colors: C, isDark } = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);
  const router  = useRouter();
  const { user } = useAuth();
  const insets  = useSafeAreaInsets();
  const params  = useLocalSearchParams();

  const [ordering,     setOrdering]     = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const { addItem } = useCart();
  const [priceData,    setPriceData]    = useState<{
    unitPrice:      number;
    totalPrice:     number;
    discount:       number;
    weightGram:     number;
    printHours:     number;
    volumeCm3?:     number;
    dimensionsMm?:  { x: number; y: number; z: number };
    triangleCount?: number;
    meshWarning?:   string;
    source?:        string;
    partWeightGram?: number;
  } | null>(null);
  const [priceLoading, setPriceLoading] = useState(true);
  const [stlUrl,       setStlUrl]       = useState<string | null>(null);

  const tech     = params.tech as string;
  const material = params.material as string;
  const FDM_TECHNOLOGIES = ["fdm-standart", "fdm-endustriyel", "fdm-yuksek"];
  const infill   = FDM_TECHNOLOGIES.includes(tech) ? Number(params.infill) || 20 : 0;
  const quantity = Number(params.quantity) || 1;
  const fileName = params.fileName as string;
  const unit     = params.unit as string;

  const techData     = TECH_LABELS[tech];
  const materialData = MATERIAL_LABELS[material] ?? {
    name:  (params.materialName as string) ?? material,
    color: (params.color as string) ?? "",
    hex:   "#94a3b8",
  };
  const deliveryDays = DELIVERY_DAYS[tech] || "3-7 iş günü";

  // ── Fiyat hesaplama (iş mantığı değiştirilmedi) ───────────────────────────
  useEffect(() => {
    setPriceLoading(true);
    const volCm3   = Number(params.volumeCm3) > 0.1 ? Number(params.volumeCm3) : 25;
    const fileUri  = params.fileUri as string;

    const backendForm = new FormData();
    backendForm.append("file", { uri: fileUri, name: "model.stl", type: "application/octet-stream" } as any);
    backendForm.append("volumeCm3",     String(volCm3));
    backendForm.append("technology_id", tech);
    backendForm.append("infill",        String(infill));
    backendForm.append("materialId",    material);
    backendForm.append("density_g_cm3", String(params.density ?? 0));
    backendForm.append("quantity",      String(quantity));

    fetch("https://fimarkt-backend-production.up.railway.app/api/print/calculate", {
      method: "POST",
      body:   backendForm,
    })
      .then((r) => r.json())
      .then((result) => {
        setPriceData({
          unitPrice:      result.unitPrice     ?? result.unit_price,
          totalPrice:     result.totalPrice    ?? result.total_price,
          discount:       result.discount      ?? 0,
          weightGram:     result.weightGram    ?? result.weight_gram,
          printHours:     result.printHours    ?? result.print_hours,
          volumeCm3:      result.volumeCm3     ?? result.volume_cm3,
          dimensionsMm:   result.dimensionsMm  ?? result.dimensions_mm,
          triangleCount:  result.triangleCount ?? result.triangle_count,
          meshWarning:    result.mesh_warning,
          source:         result.source,
          partWeightGram: result.part_weight_gram ?? result.weight_gram,
        });
        if (result.stl_url) setStlUrl(result.stl_url);
        setPriceLoading(false);
      })
      .catch(() => setPriceLoading(false));
  }, []);

  // ── Sipariş ver ──────────────────────────────────────────────────────────
  const handleSiparisVer = () => {
    if (!priceData) return;
    Alert.alert(
      "Siparişi Onayla",
      `Toplam tutar: ₺${priceData.totalPrice.toLocaleString("tr-TR")}\n\nSiparişiniz oluşturulsun mu?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Onayla",
          onPress: async () => {
            setOrdering(true);
            try {
              const currentStlUrl = stlUrl || (params.stlUrl as string) || null;
              const res = await fetch(
                "https://fimarkt-backend-production.up.railway.app/api/print-order",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user?.token || ""}`,
                  },
                  body: JSON.stringify({
                    stl_url:        currentStlUrl,
                    technology_id:  tech,
                    technology_name: techData?.title,
                    material_id:    material,
                    material_name:  materialData?.name,
                    color:          materialData?.color,
                    infill:         FDM_TECHNOLOGIES.includes(tech) ? infill : null,
                    quantity,
                    unit_price:     priceData.unitPrice,
                    total_price:    priceData.totalPrice,
                    weight_gram:    priceData.partWeightGram ?? priceData.weightGram,
                    print_hours:    priceData.printHours,
                    volume_cm3:     priceData.volumeCm3,
                    file_name:      fileName,
                    billing: {
                      first_name: user?.name?.split(" ")[0] || "",
                      last_name:  user?.name?.split(" ").slice(1).join(" ") || "",
                      email:      user?.email || "",
                    },
                  }),
                },
              );
              const result = await res.json();
              setOrdering(false);
              if (result.success) {
                Alert.alert(
                  "🎉 Sipariş Alındı!",
                  "Siparişiniz başarıyla alındı! Ekibimiz en kısa sürede üretime başlayacak.",
                  [{ text: "Tamam", onPress: () => router.push("/(tabs)/print") }],
                );
              } else {
                Alert.alert("Hata", result.error || "Sipariş oluşturulamadı.");
              }
            } catch {
              setOrdering(false);
              Alert.alert("Hata", "Bağlantı hatası, lütfen tekrar deneyin.");
            }
          },
        },
      ],
    );
  };

  const handleSepeteEkle = () => {
    if (!priceData) return;
    addItem({
      id:        Date.now(),
      name:      `Özel 3D Baskı — ${fileName}`,
      price:     priceData.totalPrice,
      storeName: "Fimarkt Bulut Üretim Ağı",
      type:      "print",
      isDigital: false,
      meta: {
        type:           "custom_print",
        fileName,
        technology:     tech,
        technologyName: techData?.title ?? tech,
        material,
        materialName:   materialData?.name ?? material,
        color:          materialData?.color ?? "",
        infill:         FDM_TECHNOLOGIES.includes(tech) ? infill : null,
        volumeCm3:      priceData.volumeCm3 ?? 0,
        weightGram:     priceData.partWeightGram ?? priceData.weightGram ?? 0,
        printHours:     priceData.printHours ?? 0,
        stlUrl:         stlUrl,
        source:         priceData.source,
      },
    });
    setShowCartModal(true);
  };

  const handleTeklifIste = () => {
    Alert.alert(
      "Detaylı Teklif",
      "Uzman ekibimiz dosyanızı inceleyerek en kısa sürede size ulaşacak.",
      [{ text: "Tamam" }],
    );
  };

  // ── Kaynak etiketi ─────────────────────────────────────────────────────────
  const sourceLabel = priceData?.source
    ? ({
        "volumetric-fdm": "Volumetric Flow ✓",
        resin:            "Reçine Motor ✓",
        powder:           "Toz Motor ✓",
        metal:            "Metal Motor ✓",
        polyjet:          "Polyjet Motor ✓",
        ceramic:          "Seramik Motor ✓",
        "carbon-fiber":   "Karbon Fiber Motor ✓",
      }[priceData.source] ?? "Hesaplama Motoru ✓")
    : null;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header */}
      <Animated.View entering={FadeInDown.duration(350)} style={styles.header}>
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
      </Animated.View>

      <StepIndicator currentStep={3} totalSteps={3} />
      <View style={styles.stepLabelRow}>
        <Text style={styles.stepLabel}>Adım 3 / 3</Text>
        <Text style={styles.stepLabelRight}>Fiyat Özeti</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Ana fiyat kartı */}
        <Animated.View entering={FadeInDown.delay(80).duration(400)} style={[styles.priceCard, { borderColor: (techData?.color ?? C.accent) + "55" }]}>
          <View style={styles.priceCardTop}>
            <Text style={styles.priceLabel}>Toplam Fiyat</Text>
            {sourceLabel && (
              <View style={[styles.priceBadge, { backgroundColor: (techData?.color ?? C.accent) + "22" }]}>
                <Text style={[styles.priceBadgeText, { color: techData?.color ?? C.accent }]}>{sourceLabel}</Text>
              </View>
            )}
          </View>

          {priceLoading ? (
            <View style={styles.priceLoadingRow}>
              <Text style={styles.priceLoadingText}>Hesaplanıyor</Text>
              <View style={styles.priceDots}>
                <Text style={styles.priceDot}>•</Text>
                <Text style={styles.priceDot}>•</Text>
                <Text style={styles.priceDot}>•</Text>
              </View>
            </View>
          ) : (
            <AnimatedPriceText
              value={priceData?.totalPrice ?? 0}
              style={[styles.priceAmount, { color: techData?.color ?? C.accent }]}
            />
          )}

          <View style={styles.priceBreakdown}>
            <View style={styles.priceRow}>
              <Text style={styles.priceRowLabel}>Birim Fiyat</Text>
              <Text style={styles.priceRowValue}>₺{(priceData?.unitPrice ?? 0).toLocaleString("tr-TR")}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceRowLabel}>Adet</Text>
              <Text style={styles.priceRowValue}>{quantity}</Text>
            </View>
            {priceData && priceData.discount > 0 && (
              <View style={styles.priceRow}>
                <Text style={[styles.priceRowLabel, { color: C.success }]}>İndirim</Text>
                <Text style={[styles.priceRowValue, { color: C.success }]}>
                  -₺{priceData.discount.toLocaleString("tr-TR")}
                </Text>
              </View>
            )}
            <View style={[styles.priceRow, styles.priceRowTotal]}>
              <Text style={styles.priceRowLabelTotal}>Toplam</Text>
              <Text style={[styles.priceRowValueTotal, { color: techData?.color ?? C.accent }]}>
                ₺{(priceData?.totalPrice ?? 0).toLocaleString("tr-TR")}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Teslimat */}
        <Animated.View entering={FadeInDown.delay(160).duration(400)} style={styles.deliveryCard}>
          <Text style={styles.deliveryIcon}>🚚</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.deliveryTitle}>Tahmini Teslimat</Text>
            <Text style={[styles.deliveryDays, { color: C.success }]}>{deliveryDays}</Text>
          </View>
          <Text style={styles.deliveryNote}>Onay sonrası</Text>
        </Animated.View>

        {/* Baskı detayları */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
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
                <Text style={[styles.detailValue, { color: techData?.color ?? C.accent }]}>{techData?.title}</Text>
              </View>
              <View style={[styles.colorDotSmall, { backgroundColor: materialData?.hex, borderWidth: materialData?.hex === "#f1f5f9" ? 1 : 0, borderColor: C.border }]} />
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Malzeme</Text>
                <Text style={styles.detailValue}>{materialData?.name} — {materialData?.color}</Text>
              </View>
            </View>
            <View style={styles.detailDivider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>⚖️</Text>
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Ağırlık</Text>
                <Text style={styles.detailValue}>{priceData?.partWeightGram ?? priceData?.weightGram ?? "-"} g</Text>
              </View>
              <Text style={styles.detailIcon}>⏱️</Text>
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Baskı Süresi</Text>
                <Text style={styles.detailValue}>{priceData?.printHours ?? "-"} saat</Text>
              </View>
            </View>
            <View style={styles.detailDivider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>📦</Text>
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Hacim</Text>
                <Text style={styles.detailValue}>{priceData?.volumeCm3 ?? "-"} cm³</Text>
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
                      {priceData.dimensionsMm.x} × {priceData.dimensionsMm.y} × {priceData.dimensionsMm.z} mm
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </Animated.View>

        {/* Sipariş detayları */}
        <Text style={styles.sectionTitle}>Sipariş Detayları</Text>

        <Animated.View entering={FadeInDown.delay(260).duration(400)} style={styles.detailCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📄</Text>
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Dosya</Text>
              <Text style={styles.detailValue} numberOfLines={1}>{fileName}</Text>
            </View>
            <Text style={styles.detailExtra}>{unit}</Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>{techData?.icon}</Text>
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Üretim Teknolojisi</Text>
              <Text style={[styles.detailValue, { color: techData?.color ?? C.accent }]}>{techData?.title}</Text>
            </View>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <View style={[styles.colorDotSmall, { backgroundColor: materialData?.hex, borderWidth: (materialData?.hex === "#f1f5f9" || materialData?.hex === "#f8fafc") ? 1 : 0, borderColor: C.border }]} />
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Malzeme & Renk</Text>
              <Text style={styles.detailValue}>{materialData?.name} — {materialData?.color}</Text>
            </View>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📦</Text>
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Adet</Text>
              <Text style={styles.detailValue}>{quantity} adet</Text>
            </View>
          </View>
        </Animated.View>

        {/* Uyarılar */}
        {priceData?.meshWarning && (
          <View style={[styles.warningBox, { borderColor: C.warning, marginBottom: 10 }]}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={[styles.warningText, { color: C.warning }]}>{priceData.meshWarning}</Text>
          </View>
        )}
        <View style={styles.warningBox}>
          <Text style={styles.warningIcon}>ℹ️</Text>
          <Text style={styles.warningText}>
            Fiyat, modelinizin gerçek geometrisine göre hesaplanmıştır. Sipariş onaylandıktan sonra üretim süreci başlar.
          </Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Footer */}
      <Animated.View entering={FadeInUp.duration(400)} style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity style={styles.teklifBtn} onPress={handleTeklifIste} activeOpacity={0.85}>
          <Text style={styles.teklifBtnText}>Detaylı Teklif İste</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.siparisBtn, { backgroundColor: techData?.color ?? C.accent }, (priceLoading || !priceData) && { opacity: 0.7 }]}
          onPress={handleSepeteEkle}
          disabled={priceLoading || !priceData}
          activeOpacity={0.85}
        >
          <Text style={styles.siparisBtnText}>
            {priceLoading
              ? "Hesaplanıyor..."
              : `🛒 Sepete Ekle — ₺${(priceData?.totalPrice ?? 0).toLocaleString("tr-TR")}`}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.siparisBtn, { backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border }, (ordering || priceLoading) && { opacity: 0.5 }]}
          onPress={handleSiparisVer}
          disabled={ordering || priceLoading}
          activeOpacity={0.85}
        >
          <Text style={[styles.siparisBtnText, { color: C.mutedForeground }]}>
            {ordering ? "İşleniyor..." : "veya Direkt Sipariş Ver →"}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <AddToCartSuccessModal
        visible={showCartModal}
        fileName={fileName}
        totalPrice={priceData?.totalPrice}
        onClose={() => setShowCartModal(false)}
        onNewModel={() => { setShowCartModal(false); router.back(); }}
      />
    </View>
  );
}

// ── Stiller ───────────────────────────────────────────────────────────────────
function createStyles(C: ThemeColors) {
  return StyleSheet.create({
  safe:   { flex: 1, backgroundColor: C.background },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border,
    alignItems: "center", justifyContent: "center",
  },
  backArrow:   { fontSize: 28, color: C.foreground, lineHeight: 32, marginTop: -2 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: C.foreground, letterSpacing: -0.5 },
  headerSub:   { fontSize: 12, color: C.mutedForeground, marginTop: 1 },
  fidropBadge: {
    backgroundColor: C.accent + "22", borderColor: C.accent + "55", borderWidth: 1,
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
  },
  fidropText: { color: C.accent, fontSize: 11, fontWeight: "600", letterSpacing: 0.5 },

  stepContainer:  { flexDirection: "row", paddingHorizontal: 16, gap: 6, marginTop: 4 },
  stepTrack:      { flex: 1, height: 3, backgroundColor: C.border, borderRadius: 2, overflow: "hidden" },
  stepFill:       { height: "100%", width: "100%", borderRadius: 2 },
  stepLabelRow:   { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, marginTop: 6, marginBottom: 4 },
  stepLabel:      { fontSize: 11, color: C.subtleForeground },
  stepLabelRight: { fontSize: 11, color: C.accent, fontWeight: "600" },

  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16 },

  priceCard: {
    backgroundColor: C.surface, borderRadius: 20, borderWidth: 1,
    padding: 20, marginBottom: 14,
  },
  priceCardTop:     { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  priceLabel:       { fontSize: 13, color: C.mutedForeground, fontWeight: "500" },
  priceBadge:       { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  priceBadgeText:   { fontSize: 10, fontWeight: "700" },
  priceLoadingRow:  { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  priceLoadingText: { fontSize: 32, fontWeight: "800", color: C.subtleForeground, letterSpacing: -1 },
  priceDots:        { flexDirection: "row", gap: 4, marginTop: 6 },
  priceDot:         { fontSize: 20, color: C.subtleForeground },
  priceAmount:      { fontSize: 42, fontWeight: "800", letterSpacing: -1, marginBottom: 8 },

  priceBreakdown:    { borderTopWidth: 1, borderTopColor: C.border, paddingTop: 12, gap: 8 },
  priceRow:          { flexDirection: "row", justifyContent: "space-between" },
  priceRowTotal:     { borderTopWidth: 1, borderTopColor: C.border, paddingTop: 8, marginTop: 4 },
  priceRowLabel:     { fontSize: 13, color: C.mutedForeground },
  priceRowValue:     { fontSize: 13, color: C.foreground, fontWeight: "600" },
  priceRowLabelTotal:{ fontSize: 14, color: C.foreground, fontWeight: "700" },
  priceRowValueTotal:{ fontSize: 14, fontWeight: "800" },

  deliveryCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: C.surface, borderRadius: 14, borderWidth: 1, borderColor: C.border,
    padding: 16, marginBottom: 14, gap: 12,
  },
  deliveryIcon:  { fontSize: 24 },
  deliveryTitle: { fontSize: 12, color: C.mutedForeground, marginBottom: 2 },
  deliveryDays:  { fontSize: 15, fontWeight: "700" },
  deliveryNote:  { fontSize: 11, color: C.subtleForeground },

  sectionTitle: { fontSize: 16, fontWeight: "700", color: C.foreground, marginBottom: 12, marginTop: 8 },

  detailCard:    { backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, marginBottom: 14, overflow: "hidden" },
  detailRow:     { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  detailIcon:    { fontSize: 18, width: 24, textAlign: "center" },
  detailInfo:    { flex: 1 },
  detailLabel:   { fontSize: 11, color: C.subtleForeground, marginBottom: 2 },
  detailValue:   { fontSize: 14, color: C.foreground, fontWeight: "500" },
  detailExtra: {
    fontSize: 11, color: C.accent, fontWeight: "600",
    backgroundColor: C.accent + "22", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
  },
  detailDivider: { height: 1, backgroundColor: C.border, marginHorizontal: 14 },
  colorDotSmall: { width: 24, height: 24, borderRadius: 12 },

  warningBox: {
    flexDirection: "row", backgroundColor: C.surface, borderRadius: 12,
    borderWidth: 1, borderColor: C.border, padding: 14, gap: 10, marginBottom: 10,
  },
  warningIcon: { fontSize: 16, marginTop: 1 },
  warningText: { flex: 1, fontSize: 12, color: C.mutedForeground, lineHeight: 18 },

  footer: {
    padding: 16, backgroundColor: C.background,
    borderTopWidth: 1, borderTopColor: C.border, gap: 10,
  },
  teklifBtn: {
    backgroundColor: C.surface, borderRadius: 14, paddingVertical: 14,
    alignItems: "center", borderWidth: 1, borderColor: C.border,
  },
  teklifBtnText: { color: C.mutedForeground, fontSize: 14, fontWeight: "600" },
  siparisBtn:    { borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  siparisBtnText:{ color: "#fff", fontSize: 15, fontWeight: "700", letterSpacing: 0.2 },
  });
}
