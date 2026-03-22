// ─── Sipariş Detayı — Dikey Dinamik Stepper + Kargo Modülü ──────────────────
// physical: 4 adım dikey | 3d_print: 5 adım dikey (⚙️ Üretimde özel renk)
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
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
import { Colors } from "../../../constants";
import {
  MOCK_ORDERS,
  getOrderType,
  getCurrentStep,
  getStepperSteps,
  getTrackingNumber,
  getTrackingCarrier,
  CARRIER_LABELS,
  CARRIER_ICONS,
} from "../../../lib/mock-data/orders";

// ─── Durum Renk Haritası ──────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  processing:         { label: "Hazırlanıyor",     color: Colors.yellow, icon: "⏳" },
  "on-hold":          { label: "Beklemede",         color: Colors.yellow, icon: "⏸️" },
  pending:            { label: "Ödeme Bekleniyor",  color: Colors.yellow, icon: "💳" },
  shipped:            { label: "Kargoda",           color: "#3b82f6",     icon: "🚚" },
  "hezarfen-shipped": { label: "Kargoda",           color: "#3b82f6",     icon: "🚚" },
  completed:          { label: "Teslim Edildi",     color: Colors.green,  icon: "✅" },
  cancelled:          { label: "İptal Edildi",      color: Colors.red,    icon: "❌" },
  refunded:           { label: "İade Edildi",       color: Colors.red,    icon: "↩️" },
};

const DEFAULT_STATUS = { label: "Bilinmiyor", color: Colors.text2, icon: "❓" };

// ─── Dikey Stepper ─────────────────────────────────────────────────────────────
function VerticalStepper({ order }: { order: (typeof MOCK_ORDERS)[0] }) {
  const type        = getOrderType(order);
  const steps       = getStepperSteps(type);
  const currentStep = getCurrentStep(order);
  const isCancelled = order.status === "cancelled" || order.status === "refunded";

  if (isCancelled) {
    return (
      <View style={[styles.cancelledBox, { backgroundColor: `${Colors.red}14`, borderColor: `${Colors.red}30` }]}>
        <Text style={styles.cancelledIcon}>❌</Text>
        <View>
          <Text style={styles.cancelledTitle}>
            {order.status === "refunded" ? "İade Edildi" : "İptal Edildi"}
          </Text>
          <Text style={styles.cancelledSub}>Bu sipariş iptal edilmiştir. Destek için bize ulaşın.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.stepperWrap}>
      {steps.map((step, i) => {
        const isDone      = i < currentStep;
        const isActive    = i === currentStep;
        const is3DActive  = step.is3DPrint && isActive;
        const isLast      = i === steps.length - 1;

        const circleColor = isDone ? Colors.green : isActive ? Colors.accent : Colors.surface;
        const borderColor = isDone ? Colors.green : isActive ? Colors.accent : Colors.border;
        const lineColor   = isDone ? Colors.green : Colors.border;

        return (
          <View key={i} style={styles.stepRow}>
            {/* Sol: daire + dikey çizgi */}
            <View style={styles.stepLeft}>
              {/* Daire */}
              <View style={[styles.stepCircle, { backgroundColor: circleColor, borderColor }]}>
                <Text style={[styles.stepCircleText, { color: isDone || isActive ? "#fff" : Colors.text3 }]}>
                  {isDone ? "✓" : step.icon}
                </Text>
              </View>
              {/* Dikey çizgi */}
              {!isLast && (
                <View style={[styles.stepLine, { backgroundColor: lineColor }]} />
              )}
            </View>

            {/* Sağ: etiket + alt etiket */}
            <View style={[styles.stepContent, !isLast && { paddingBottom: 24 }]}>
              <Text
                style={[
                  styles.stepLabel,
                  {
                    color: isDone ? Colors.green : isActive ? Colors.accent : Colors.text2,
                    fontWeight: isActive ? "800" : "600",
                  },
                ]}
              >
                {step.label}
                {is3DActive ? " 🔄" : ""}
              </Text>
              {step.sublabel && (
                <Text style={[styles.stepSublabel, { color: isActive ? Colors.accent : Colors.text3 }]}>
                  {step.sublabel}
                </Text>
              )}
              {isActive && (
                <View style={[styles.activePill, { backgroundColor: `${Colors.accent}18`, borderColor: `${Colors.accent}35` }]}>
                  <Text style={[styles.activePillText, { color: Colors.accent }]}>● Şu an bu aşamada</Text>
                </View>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ─── Kargo Modülü ─────────────────────────────────────────────────────────────
function TrackingCard({ order }: { order: (typeof MOCK_ORDERS)[0] }) {
  const trackingNo = getTrackingNumber(order);
  const carrier    = getTrackingCarrier(order);

  if (!trackingNo) return null;

  const handleCopy = () => {
    Alert.alert(
      "Kargo Takip No",
      trackingNo,
      [{ text: "Tamam" }]
    );
  };

  return (
    <View style={styles.trackingCard}>
      <Text style={styles.sectionLabel}>🚚 Kargo Takibi</Text>
      <View style={styles.trackingRow}>
        <View style={{ flex: 1 }}>
          {carrier && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <Text style={styles.carrierIcon}>{CARRIER_ICONS[carrier]}</Text>
              <Text style={styles.carrierName}>{CARRIER_LABELS[carrier]}</Text>
            </View>
          )}
          <Text style={styles.trackingNo}>{trackingNo}</Text>
        </View>
        <TouchableOpacity style={styles.copyBtn} onPress={handleCopy}>
          <Text style={styles.copyBtnText}>📋 Görüntüle</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── 404 Durumu ───────────────────────────────────────────────────────────────
function NotFound({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.notFound}>
      <Text style={styles.notFoundEmoji}>📭</Text>
      <Text style={styles.notFoundTitle}>Sipariş bulunamadı</Text>
      <Text style={styles.notFoundSub}>Bu sipariş numarası mevcut değil.</Text>
      <TouchableOpacity style={styles.backCta} onPress={onBack}>
        <Text style={styles.backCtaText}>← Geri Dön</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Ana Ekran ─────────────────────────────────────────────────────────────────
export default function OrderDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const order  = MOCK_ORDERS.find(o => String(o.id) === id);

  if (!order) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sipariş Detayı</Text>
          <View style={{ width: 40 }} />
        </View>
        <NotFound onBack={() => router.back()} />
      </View>
    );
  }

  const type   = getOrderType(order);
  const status = STATUS_CONFIG[order.status] ?? DEFAULT_STATUS;
  const printNote = order.meta_data.find(m => m.key === "_print_note")?.value;

  const TYPE_LABELS: Record<string, string> = {
    physical:  "Pazaryeri",
    "3d_print": "Fidrop — Özel Üretim",
    digital:   "Dijital Teslimat",
  };

  const formatPrice = (v: string) =>
    Number(v).toLocaleString("tr-TR", { minimumFractionDigits: 2 });

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("tr-TR", {
      day: "numeric", month: "long", year: "numeric",
    });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sipariş #{order.number}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Sipariş kimlik satırı */}
        <View style={styles.orderMeta}>
          <View>
            <Text style={styles.orderTypeLabel}>{TYPE_LABELS[type]}</Text>
            <Text style={styles.orderDate}>{formatDate(order.date_created)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${status.color}20` }]}>
            <Text style={styles.statusIcon}>{status.icon}</Text>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>

        {/* ══ DİKEY STEPPER ══ */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            {type === "3d_print" ? "⚙️ Üretim Takibi" : "📍 Sipariş Durumu"}
          </Text>
          <VerticalStepper order={order} />

          {/* 3D Baskı notu */}
          {type === "3d_print" && printNote && (
            <View style={[styles.printNote, { backgroundColor: `${Colors.accent}10`, borderColor: `${Colors.accent}25` }]}>
              <Text style={styles.printNoteIcon}>📋</Text>
              <Text style={[styles.printNoteText, { color: Colors.text2 }]}>{printNote}</Text>
            </View>
          )}
        </View>

        {/* ══ KARGO TAKİP ══ */}
        {(order.status === "shipped" || order.status === "hezarfen-shipped" || order.status === "completed") && (
          <TrackingCard order={order} />
        )}

        {/* ══ SİPARİŞ İÇERİĞİ ══ */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>📦 Sipariş İçeriği</Text>
          {order.line_items.map(item => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemEmoji}>
                <Text style={styles.itemEmojiText}>{item.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.itemQty}>Adet: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>{formatPrice(item.total)} ₺</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Toplam</Text>
            <Text style={styles.totalPrice}>{formatPrice(order.total)} ₺</Text>
          </View>
        </View>

        {/* ══ TESLİMAT ADRESİ ══ */}
        {order.shipping.address_1 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>🏠 Teslimat Adresi</Text>
            <Text style={styles.addrName}>{order.shipping.first_name} {order.shipping.last_name}</Text>
            <Text style={styles.addrDetail}>
              {order.shipping.address_1}{order.shipping.city ? ` / ${order.shipping.city}` : ""}
            </Text>
          </View>
        )}

        {/* ══ AKSİYON BUTONLARI ══ */}
        {order.status === "completed" && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: `${Colors.green}14`, borderColor: `${Colors.green}35` }]}
            >
              <Text style={[styles.actionBtnText, { color: Colors.green }]}>📄 Fatura İndir</Text>
            </TouchableOpacity>
            {type === "digital" ? (
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.accent }]}>
                <Text style={[styles.actionBtnText, { color: "#fff" }]}>⬇️ Dosyaları İndir</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: `${Colors.accent}14`, borderColor: `${Colors.accent}35` }]}
              >
                <Text style={[styles.actionBtnText, { color: Colors.accent }]}>🔄 Tekrar Satın Al</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ─── Stiller ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surface2,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: "center", justifyContent: "center",
  },
  backArrow:   { fontSize: 28, color: Colors.text, lineHeight: 32, marginTop: -2 },
  headerTitle: { fontSize: 16, fontWeight: "700", color: Colors.text },
  content: { paddingHorizontal: 16, paddingBottom: 40 },

  // ── Sipariş meta ──
  orderMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  orderTypeLabel: { fontSize: 11, color: Colors.text3, textTransform: "uppercase", letterSpacing: 0.5 },
  orderDate:      { fontSize: 13, fontWeight: "600", color: Colors.text, marginTop: 3 },
  statusBadge: {
    flexDirection: "row", alignItems: "center",
    gap: 5, paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 99,
  },
  statusIcon: { fontSize: 12 },
  statusText: { fontSize: 11, fontWeight: "700" },

  // ── Section ──
  section: {
    backgroundColor: Colors.surface2,
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: 16, padding: 16, marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 11, fontWeight: "700", color: Colors.text2,
    textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 14,
  },

  // ── Dikey Stepper ──
  stepperWrap: { gap: 0 },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  stepLeft: {
    alignItems: "center",
    width: 44,
    marginRight: 14,
  },
  stepCircle: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 2,
    alignItems: "center", justifyContent: "center",
  },
  stepCircleText: { fontSize: 14, fontWeight: "800" },
  stepLine: { width: 2, flex: 1, minHeight: 20 },
  stepContent: { flex: 1, paddingTop: 6 },
  stepLabel:   { fontSize: 14 },
  stepSublabel: { fontSize: 11, marginTop: 2 },
  activePill: {
    alignSelf: "flex-start",
    marginTop: 6,
    borderRadius: 99,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  activePillText: { fontSize: 11, fontWeight: "700" },

  // ── İptal ──
  cancelledBox: {
    flexDirection: "row", alignItems: "center",
    gap: 10, borderWidth: 1, borderRadius: 12, padding: 14,
  },
  cancelledIcon:  { fontSize: 24 },
  cancelledTitle: { fontSize: 14, fontWeight: "700", color: Colors.text },
  cancelledSub:   { fontSize: 12, color: Colors.text2, marginTop: 2 },

  // ── 3D Print notu ──
  printNote: {
    flexDirection: "row", gap: 8,
    borderWidth: 1, borderRadius: 10,
    padding: 12, marginTop: 12,
    alignItems: "flex-start",
  },
  printNoteIcon: { fontSize: 14 },
  printNoteText: { flex: 1, fontSize: 12, lineHeight: 18 },

  // ── Kargo ──
  trackingCard: {
    backgroundColor: Colors.surface2,
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: 16, padding: 16, marginBottom: 12,
  },
  trackingRow: { flexDirection: "row", alignItems: "center" },
  carrierIcon: { fontSize: 16 },
  carrierName: { fontSize: 13, fontWeight: "600", color: Colors.text },
  trackingNo: {
    fontSize: 15, fontWeight: "800",
    color: Colors.text, letterSpacing: 1.5,
    fontVariant: ["tabular-nums"],
  },
  copyBtn: {
    backgroundColor: `${Colors.accent}1A`,
    borderWidth: 1, borderColor: `${Colors.accent}40`,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
  },
  copyBtnText: { fontSize: 12, fontWeight: "700", color: Colors.accent },

  // ── Sipariş içeriği ──
  itemRow: {
    flexDirection: "row", alignItems: "center",
    marginBottom: 12, gap: 12,
  },
  itemEmoji: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    alignItems: "center", justifyContent: "center",
  },
  itemEmojiText: { fontSize: 20 },
  itemName:  { fontSize: 13, fontWeight: "600", color: Colors.text, lineHeight: 18 },
  itemQty:   { fontSize: 11, color: Colors.text2, marginTop: 2 },
  itemPrice: { fontSize: 13, fontWeight: "800", color: Colors.text },
  totalRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", paddingTop: 12,
    borderTopWidth: 1, borderTopColor: Colors.border,
    marginTop: 4,
  },
  totalLabel: { fontSize: 13, fontWeight: "600", color: Colors.text2 },
  totalPrice: { fontSize: 20, fontWeight: "800", color: Colors.accent },

  // ── Adres ──
  addrName:   { fontSize: 14, fontWeight: "600", color: Colors.text },
  addrDetail: { fontSize: 12, color: Colors.text2, marginTop: 4, lineHeight: 18 },

  // ── Aksiyon ──
  actions: { flexDirection: "column", gap: 10, marginTop: 4, marginBottom: 12 },
  actionBtn: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  actionBtnText: { fontSize: 15, fontWeight: "700" },

  // ── 404 ──
  notFound: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 8 },
  notFoundEmoji: { fontSize: 56, marginBottom: 8 },
  notFoundTitle: { fontSize: 18, fontWeight: "800", color: Colors.text },
  notFoundSub:   { fontSize: 13, color: Colors.text2 },
  backCta: {
    marginTop: 12, backgroundColor: Colors.accent,
    paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12,
  },
  backCtaText: { fontSize: 14, fontWeight: "600", color: "#fff" },
});
