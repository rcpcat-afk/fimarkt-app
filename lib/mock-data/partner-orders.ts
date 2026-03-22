// ─── Satıcı Sipariş Mock Verisi ───────────────────────────────────────────────
// 3 sipariş tipi: Fiziksel (Marketplace) · Dijital (Sanatkat) · Fidrop (3D Üretim)
// App tarafıyla birebir aynı — fimarkt-app/lib/mock-data/partner-orders.ts

export type SellerOrderType   = "physical" | "digital" | "fidrop";
export type SellerOrderStatus = "new" | "processing" | "shipped" | "completed" | "cancelled";
export type FidropStep =
  | "print_started"       // Baskı Başladı
  | "support_removal"     // Destekler Temizleniyor
  | "quality_control"     // Kalite Kontrol
  | "packaging"           // Paketleniyor
  | "ready";              // Teslime Hazır

export const FIDROP_STEPS: { value: FidropStep; label: string; emoji: string }[] = [
  { value: "print_started",   label: "Baskı Başladı",           emoji: "🖨️" },
  { value: "support_removal", label: "Destekler Temizleniyor",  emoji: "🔧" },
  { value: "quality_control", label: "Kalite Kontrol",          emoji: "🔍" },
  { value: "packaging",       label: "Paketleniyor",            emoji: "📦" },
  { value: "ready",           label: "Teslime Hazır",           emoji: "✅" },
];

export interface SellerOrderItem {
  id:         string;
  name:       string;
  sku:        string;
  quantity:   number;
  price:      number;
  imageEmoji: string;
  bgColor:    string;
  variant?:   string;  // "Renk: Kırmızı"
}

export interface ShippingAddress {
  fullName: string;
  phone:    string;
  address:  string;
  district: string;
  city:     string;
  zipCode:  string;
}

export interface SellerOrder {
  id:              string;
  orderNo:         string;       // "#FM-2024-001"
  type:            SellerOrderType;
  status:          SellerOrderStatus;
  customer: {
    name:  string;
    email: string;
  };
  items:           SellerOrderItem[];
  totalAmount:     number;       // TL
  commission:      number;       // TL (Fimarkt komisyonu)
  netEarning:      number;       // TL (satıcıya kalan)
  createdAt:       string;       // ISO date
  shippingAddress?: ShippingAddress;
  cargoTrackingNo?: string;
  cargoCompany?:    string;
  // Dijital
  downloadCount?:  number;
  fileFormat?:     string;
  // Fidrop
  fidropStep?:     FidropStep;
  estimatedPrintHours?: number;
  fidropNote?:     string;
}

export const MOCK_SELLER_ORDERS: SellerOrder[] = [
  // ── Fiziksel — Yeni ───────────────────────────────────────────────────────
  {
    id: "so-001", orderNo: "#FM-2024-891",
    type: "physical", status: "new",
    customer: { name: "Ahmet Kaya", email: "ahmet@example.com" },
    items: [
      { id: "i-001", name: "PLA+ Filament 1kg Makarası", sku: "FIL-PLA-001",
        quantity: 2, price: 349, imageEmoji: "🧵", bgColor: "#1a1a28", variant: "Renk: Kırmızı" },
    ],
    totalAmount: 698, commission: 56, netEarning: 642,
    createdAt: "2024-03-22T09:14:00Z",
    shippingAddress: {
      fullName: "Ahmet Kaya", phone: "0532 111 2233",
      address: "Atatürk Mah. Gül Sok. No:12 D:4",
      district: "Kadıköy", city: "İstanbul", zipCode: "34710",
    },
  },
  {
    id: "so-002", orderNo: "#FM-2024-890",
    type: "physical", status: "new",
    customer: { name: "Zeynep Arslan", email: "zeynep@example.com" },
    items: [
      { id: "i-002", name: "PETG Filament 500g — Şeffaf", sku: "FIL-PETG-002",
        quantity: 1, price: 229, imageEmoji: "🧶", bgColor: "#0e2e1a" },
      { id: "i-003", name: "TPU Esnek Filament 250g", sku: "FIL-TPU-003",
        quantity: 1, price: 289, imageEmoji: "🫧", bgColor: "#1a0e2e", variant: "Shore: 95A (Sert)" },
    ],
    totalAmount: 518, commission: 41, netEarning: 477,
    createdAt: "2024-03-22T08:45:00Z",
    shippingAddress: {
      fullName: "Zeynep Arslan", phone: "0541 222 3344",
      address: "Bağcılar Cd. No:7 D:2",
      district: "Bağcılar", city: "İstanbul", zipCode: "34200",
    },
  },

  // ── Fiziksel — Hazırlanıyor ───────────────────────────────────────────────
  {
    id: "so-003", orderNo: "#FM-2024-887",
    type: "physical", status: "processing",
    customer: { name: "Murat Demir", email: "murat@example.com" },
    items: [
      { id: "i-004", name: "Ender 3 V3 SE Ekstruder", sku: "PART-E3-004",
        quantity: 1, price: 485, imageEmoji: "⚙️", bgColor: "#2e1a0e" },
    ],
    totalAmount: 485, commission: 39, netEarning: 446,
    createdAt: "2024-03-21T15:20:00Z",
    shippingAddress: {
      fullName: "Murat Demir", phone: "0555 333 4455",
      address: "Çiçek Sokak No:3",
      district: "Çankaya", city: "Ankara", zipCode: "06690",
    },
  },

  // ── Fiziksel — Kargoda ────────────────────────────────────────────────────
  {
    id: "so-004", orderNo: "#FM-2024-882",
    type: "physical", status: "shipped",
    customer: { name: "Elif Yıldız", email: "elif@example.com" },
    items: [
      { id: "i-005", name: "PLA+ Filament 1kg Makarası", sku: "FIL-PLA-001",
        quantity: 3, price: 349, imageEmoji: "🧵", bgColor: "#1a1a28", variant: "Renk: Siyah" },
    ],
    totalAmount: 1047, commission: 84, netEarning: 963,
    createdAt: "2024-03-20T11:00:00Z",
    cargoCompany: "Yurtiçi Kargo", cargoTrackingNo: "YK-8821047563",
    shippingAddress: {
      fullName: "Elif Yıldız", phone: "0505 444 5566",
      address: "Sahil Cad. No:22",
      district: "Alsancak", city: "İzmir", zipCode: "35220",
    },
  },

  // ── Dijital — Tamamlananlar (otomatik) ────────────────────────────────────
  {
    id: "so-005", orderNo: "#FM-2024-879",
    type: "digital", status: "completed",
    customer: { name: "Can Öztürk", email: "can@example.com" },
    items: [
      { id: "i-006", name: "Dragon Skull — Articulated", sku: "STL-DRAG-007",
        quantity: 1, price: 149, imageEmoji: "💀", bgColor: "#2e0e0e" },
    ],
    totalAmount: 149, commission: 12, netEarning: 137,
    createdAt: "2024-03-19T18:33:00Z",
    fileFormat: "ZIP", downloadCount: 1,
  },
  {
    id: "so-006", orderNo: "#FM-2024-875",
    type: "digital", status: "completed",
    customer: { name: "Selin Çelik", email: "selin@example.com" },
    items: [
      { id: "i-007", name: "Modüler Şehir Binası — Low-Poly", sku: "STL-CITY-006",
        quantity: 1, price: 89, imageEmoji: "🏙️", bgColor: "#0e1a2e" },
    ],
    totalAmount: 89, commission: 7, netEarning: 82,
    createdAt: "2024-03-18T14:10:00Z",
    fileFormat: "STL", downloadCount: 3,
  },

  // ── Dijital — Yeni ────────────────────────────────────────────────────────
  {
    id: "so-007", orderNo: "#FM-2024-892",
    type: "digital", status: "new",
    customer: { name: "Burak Şahin", email: "burak@example.com" },
    items: [
      { id: "i-008", name: "Mekanik Saat Dişlisi Seti", sku: "STL-GEAR-008",
        quantity: 1, price: 59, imageEmoji: "🕰️", bgColor: "#1a1a0e" },
    ],
    totalAmount: 59, commission: 5, netEarning: 54,
    createdAt: "2024-03-22T10:55:00Z",
    fileFormat: "OBJ",
  },

  // ── Fidrop 3D Üretim — Hazırlanıyor ──────────────────────────────────────
  {
    id: "so-008", orderNo: "#FM-2024-885",
    type: "fidrop", status: "processing",
    customer: { name: "Tolga Yılmaz", email: "tolga@example.com" },
    items: [
      { id: "i-009", name: "Özel Makine Dişlisi (x4)", sku: "FIDROP-CUSTOM-001",
        quantity: 4, price: 185, imageEmoji: "⚙️", bgColor: "#2e200e" },
    ],
    totalAmount: 740, commission: 74, netEarning: 666,
    createdAt: "2024-03-21T09:00:00Z",
    fidropStep: "print_started",
    estimatedPrintHours: 14,
    fidropNote: "PLA+ Siyah. Layer height 0.2mm. Destekler PETG.",
    shippingAddress: {
      fullName: "Tolga Yılmaz", phone: "0533 666 7788",
      address: "Sanayi Mah. Fabrika Cd. No:5",
      district: "Başakşehir", city: "İstanbul", zipCode: "34490",
    },
  },
  {
    id: "so-009", orderNo: "#FM-2024-883",
    type: "fidrop", status: "processing",
    customer: { name: "Nesrin Aktaş", email: "nesrin@example.com" },
    items: [
      { id: "i-010", name: "Medikal Protez Aparatı", sku: "FIDROP-MED-002",
        quantity: 1, price: 1200, imageEmoji: "🦾", bgColor: "#0e2e2e" },
    ],
    totalAmount: 1200, commission: 120, netEarning: 1080,
    createdAt: "2024-03-20T16:00:00Z",
    fidropStep: "quality_control",
    estimatedPrintHours: 22,
    fidropNote: "TPU 95A. Steril paketleme gerekli.",
    shippingAddress: {
      fullName: "Nesrin Aktaş", phone: "0542 777 8899",
      address: "Hastane Cad. No:18",
      district: "Şişli", city: "İstanbul", zipCode: "34360",
    },
  },

  // ── İptal ─────────────────────────────────────────────────────────────────
  {
    id: "so-010", orderNo: "#FM-2024-870",
    type: "physical", status: "cancelled",
    customer: { name: "Kemal Avcı", email: "kemal@example.com" },
    items: [
      { id: "i-011", name: "Borosilikat Cam Tabla 235x235", sku: "PART-CAM-005",
        quantity: 1, price: 165, imageEmoji: "🪟", bgColor: "#0d1b2a" },
    ],
    totalAmount: 165, commission: 0, netEarning: 0,
    createdAt: "2024-03-17T12:00:00Z",
  },
];
