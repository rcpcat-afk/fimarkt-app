// ─── Siparişlerim Mock Data ───────────────────────────────────────────────────
// WooCommerce sınırını aşmak için _fimarkt_order_type meta_data key'i kullanılır.
// Backend entegrasyonunda bu key WC custom meta'dan okunacak.

// ─── Tipler ────────────────────────────────────────────────────────────────────
export type OrderType   = "physical" | "3d_print" | "digital";
export type OrderStatus =
  | "pending" | "processing" | "on-hold"
  | "shipped" | "hezarfen-shipped"
  | "completed" | "cancelled" | "refunded";

export interface MockLineItem {
  id: number;
  name: string;
  quantity: number;
  total: string;
  emoji: string;
}

export interface MockOrder {
  id: number;
  number: string;
  date_created: string;
  status: OrderStatus;
  total: string;
  line_items: MockLineItem[];
  shipping: {
    first_name: string;
    last_name: string;
    address_1?: string;
    city?: string;
  };
  /** WooCommerce meta_data — _fimarkt_order_type, _fimarkt_print_step, _tracking_number, _tracking_carrier */
  meta_data: Array<{ key: string; value: string }>;
}

// ─── Yardımcılar ───────────────────────────────────────────────────────────────
export function getOrderType(order: MockOrder): OrderType {
  const m = order.meta_data.find(x => x.key === "_fimarkt_order_type");
  return (m?.value as OrderType) ?? "physical";
}

export function getPrintStep(order: MockOrder): number {
  const m = order.meta_data.find(x => x.key === "_fimarkt_print_step");
  return m ? parseInt(m.value, 10) : 0;
}

export function getTrackingNumber(order: MockOrder): string | undefined {
  return order.meta_data.find(x => x.key === "_tracking_number")?.value;
}

export function getTrackingCarrier(
  order: MockOrder,
): "yurtici" | "aras" | "mng" | "ptt" | undefined {
  const v = order.meta_data.find(x => x.key === "_tracking_carrier")?.value;
  return v as "yurtici" | "aras" | "mng" | "ptt" | undefined;
}

// ─── Stepper Konfigürasyonu ────────────────────────────────────────────────────
export interface StepInfo {
  label: string;
  sublabel?: string;
  icon: string;
  is3DPrint?: boolean;
}

export const PHYSICAL_STEPS: StepInfo[] = [
  { label: "Sipariş Alındı",    icon: "✓"  },
  { label: "Hazırlanıyor",      icon: "📦" },
  { label: "Kargoya Verildi",   icon: "🚚" },
  { label: "Teslim Edildi",     icon: "🏠" },
];

export const PRINT_STEPS: StepInfo[] = [
  { label: "Sipariş Alındı",  icon: "✓"  },
  { label: "Dosya Onayı",     icon: "📄" },
  { label: "Üretimde",        icon: "⚙️", sublabel: "3D Yazıcıda", is3DPrint: true },
  { label: "Kalite Kontrol",  icon: "🔍" },
  { label: "Teslim Edildi",   icon: "🏠" },
];

export const DIGITAL_STEPS: StepInfo[] = [
  { label: "Sipariş Alındı",   icon: "✓"  },
  { label: "Ödeme Doğrulandı", icon: "💳" },
  { label: "Dosya Hazırlandı", icon: "📂" },
  { label: "Teslim Edildi",    icon: "✅" },
];

export function getStepperSteps(type: OrderType): StepInfo[] {
  if (type === "3d_print") return PRINT_STEPS;
  if (type === "digital")  return DIGITAL_STEPS;
  return PHYSICAL_STEPS;
}

/** WC status → stepper currentStep index (physical/digital) */
const STATUS_STEP_MAP: Partial<Record<OrderStatus, number>> = {
  "pending":           0,
  "on-hold":           0,
  "processing":        1,
  "shipped":           2,
  "hezarfen-shipped":  2,
  "completed":         3,
  "cancelled":        -1,
  "refunded":         -1,
};

export function getCurrentStep(order: MockOrder): number {
  const type = getOrderType(order);
  if (type === "3d_print") return getPrintStep(order);
  return STATUS_STEP_MAP[order.status] ?? 0;
}

// ─── Kargo Firma Etiketleri ────────────────────────────────────────────────────
export const CARRIER_LABELS: Record<string, string> = {
  yurtici: "Yurtiçi Kargo",
  aras:    "Aras Kargo",
  mng:     "MNG Kargo",
  ptt:     "PTT Kargo",
};

export const CARRIER_ICONS: Record<string, string> = {
  yurtici: "🟡",
  aras:    "🔴",
  mng:     "🔵",
  ptt:     "📮",
};

// ─── Durum Konfigürasyonu ──────────────────────────────────────────────────────
export const STATUS_CONFIG: Record<string, {
  label: string;
  colorVar: string;   // CSS var
  icon: string;
}> = {
  processing:         { label: "Hazırlanıyor",        colorVar: "var(--color-warning)", icon: "⏳" },
  "on-hold":          { label: "Beklemede",            colorVar: "var(--color-warning)", icon: "⏸️" },
  pending:            { label: "Ödeme Bekleniyor",     colorVar: "var(--color-warning)", icon: "💳" },
  shipped:            { label: "Kargoda",              colorVar: "#3b82f6",              icon: "🚚" },
  "hezarfen-shipped": { label: "Kargoda",              colorVar: "#3b82f6",              icon: "🚚" },
  completed:          { label: "Teslim Edildi",        colorVar: "var(--color-success)", icon: "✅" },
  cancelled:          { label: "İptal Edildi",         colorVar: "var(--color-error)",   icon: "❌" },
  refunded:           { label: "İade Edildi",          colorVar: "var(--color-error)",   icon: "↩️" },
};

export const DEFAULT_STATUS = {
  label: "Bilinmiyor", colorVar: "var(--color-muted-foreground)", icon: "❓",
};

// ─── Mock Sipariş Verileri ─────────────────────────────────────────────────────
export const MOCK_ORDERS: MockOrder[] = [
  // ── 1: Fiziksel — Hazırlanıyor ─────────────────────────────────────────────
  {
    id: 1001,
    number: "1001",
    date_created: "2026-03-20T10:30:00",
    status: "processing",
    total: "847.90",
    shipping: { first_name: "Ahmet", last_name: "Yılmaz", address_1: "Atatürk Cad. No:5", city: "İstanbul" },
    line_items: [
      { id: 1, name: "Anycubic PLA+ Filament 3kg — Gri",       quantity: 2, total: "599.90", emoji: "🧵" },
      { id: 2, name: "Bambu Lab A1 Baskı Yüzeyi (Çift Taraflı)", quantity: 1, total: "248.00", emoji: "🔲" },
    ],
    meta_data: [{ key: "_fimarkt_order_type", value: "physical" }],
  },

  // ── 2: 3D Baskı — Üretimde (step 2) ──────────────────────────────────────
  {
    id: 1002,
    number: "1002",
    date_created: "2026-03-18T14:15:00",
    status: "processing",
    total: "340.00",
    shipping: { first_name: "Ahmet", last_name: "Yılmaz", address_1: "Atatürk Cad. No:5", city: "İstanbul" },
    line_items: [
      { id: 3, name: "Fidrop 3D Baskı — Özel Makine Parçası (PLA, 0.2mm katman)", quantity: 1, total: "340.00", emoji: "⚙️" },
    ],
    meta_data: [
      { key: "_fimarkt_order_type",  value: "3d_print" },
      { key: "_fimarkt_print_step",  value: "2" },
      { key: "_print_material",      value: "PLA" },
      { key: "_print_layer",         value: "0.2mm" },
      { key: "_print_note",          value: "Destek yapısı otomatik eklenecek. Baskı süresi ~6 saat." },
    ],
  },

  // ── 3: Fiziksel — Kargoda ─────────────────────────────────────────────────
  {
    id: 1003,
    number: "1003",
    date_created: "2026-03-15T09:00:00",
    status: "shipped",
    total: "1250.00",
    shipping: { first_name: "Ahmet", last_name: "Yılmaz", address_1: "Atatürk Cad. No:5", city: "İstanbul" },
    line_items: [
      { id: 4, name: "Creality Filament Kurutma Makinesi Fildryer S2", quantity: 1, total: "1250.00", emoji: "🌡️" },
    ],
    meta_data: [
      { key: "_fimarkt_order_type", value: "physical" },
      { key: "_tracking_number",    value: "YK123456789TR" },
      { key: "_tracking_carrier",   value: "yurtici" },
    ],
  },

  // ── 4: Dijital — Teslim Edildi ─────────────────────────────────────────────
  {
    id: 1004,
    number: "1004",
    date_created: "2026-03-12T16:45:00",
    status: "completed",
    total: "129.00",
    shipping: { first_name: "Ahmet", last_name: "Yılmaz" },
    line_items: [
      { id: 5, name: "STL Dosyası — Chibi Karakter Biblosu (Baskıya Hazır)", quantity: 1, total: "79.00",  emoji: "🎭" },
      { id: 6, name: "Makine Parçası Model Pack (5 dosya, STEP+STL)",         quantity: 1, total: "50.00",  emoji: "📦" },
    ],
    meta_data: [
      { key: "_fimarkt_order_type",    value: "digital" },
      { key: "_download_link_expires", value: "2026-06-12" },
    ],
  },

  // ── 5: 3D Baskı — Teslim Edildi (step 4) ──────────────────────────────────
  {
    id: 1005,
    number: "1005",
    date_created: "2026-03-05T11:00:00",
    status: "completed",
    total: "780.00",
    shipping: { first_name: "Ahmet", last_name: "Yılmaz", address_1: "Atatürk Cad. No:5", city: "İstanbul" },
    line_items: [
      { id: 7, name: "Fidrop 3D Baskı — Özel Masa Üstü Biblo Seti (Reçine)", quantity: 1, total: "780.00", emoji: "🏺" },
    ],
    meta_data: [
      { key: "_fimarkt_order_type", value: "3d_print" },
      { key: "_fimarkt_print_step", value: "4" },
      { key: "_print_material",     value: "Reçine" },
      { key: "_tracking_number",    value: "AR987654321TR" },
      { key: "_tracking_carrier",   value: "aras" },
    ],
  },

  // ── 6: Fiziksel — İptal Edildi ────────────────────────────────────────────
  {
    id: 1006,
    number: "1006",
    date_created: "2026-03-01T08:20:00",
    status: "cancelled",
    total: "156.50",
    shipping: { first_name: "Ahmet", last_name: "Yılmaz" },
    line_items: [
      { id: 8, name: "Creality Ender 5 S1 Nozzle Seti (0.4mm / 0.6mm / 0.8mm)", quantity: 1, total: "156.50", emoji: "🔩" },
    ],
    meta_data: [{ key: "_fimarkt_order_type", value: "physical" }],
  },

  // ── 7: Fiziksel — Teslim Edildi ───────────────────────────────────────────
  {
    id: 1007,
    number: "1007",
    date_created: "2026-02-20T13:30:00",
    status: "completed",
    total: "2340.00",
    shipping: { first_name: "Ahmet", last_name: "Yılmaz", address_1: "Atatürk Cad. No:5", city: "İstanbul" },
    line_items: [
      { id: 9,  name: "Bambu Lab A1 Mini 3D Yazıcı",          quantity: 1, total: "2100.00", emoji: "🖨️" },
      { id: 10, name: "PLA Filament Başlangıç Paketi (4 renk)", quantity: 1, total: "240.00",  emoji: "🧵" },
    ],
    meta_data: [
      { key: "_fimarkt_order_type", value: "physical" },
      { key: "_tracking_number",    value: "MN456789012TR" },
      { key: "_tracking_carrier",   value: "mng" },
    ],
  },
];
