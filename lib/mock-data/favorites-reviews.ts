// ─── Favorilerim & Değerlendirme Bekleyenler — Mock Data ──────────────────────
// hasPriceDrop: true  → yeşil glow rozeti tetikler
// PendingReview       → "Makes" modal ile değerlendirme formu tetikler

export type ProductType = "physical" | "digital" | "3d_print";

export interface FavoriteProduct {
  id:               string;
  name:             string;
  category:         string;
  type:             ProductType;
  price:            string;
  originalPrice?:   string;
  emoji:            string;
  bgColor:          string;   // gradient rengi (CSS hex)
  seller:           string;
  rating:           number;
  reviewCount:      number;
  hasPriceDrop:     boolean;
  discountPercent?: number;
  inStock:          boolean;
}

export interface PendingReview {
  id:            string;
  orderId:       string;
  orderNumber:   string;
  productName:   string;
  category:      string;
  type:          ProductType;
  seller:        string;
  deliveredDate: string;
  emoji:         string;
  bgColor:       string;
}

// ─── Favoriler ─────────────────────────────────────────────────────────────────
export const MOCK_FAVORITES: FavoriteProduct[] = [
  // ── %10 İndirime Girdi — Glow Badge ───────────────────────────────────────
  {
    id:             "fav-001",
    name:           "Bambu Lab PLA+ Filament 1kg — Siyah",
    category:       "Filament",
    type:           "physical",
    price:          "269₺",
    originalPrice:  "299₺",
    emoji:          "🧵",
    bgColor:        "#1a1a2e",
    seller:         "FilamentDünyası",
    rating:         4.8,
    reviewCount:    312,
    hasPriceDrop:   true,
    discountPercent: 10,
    inStock:        true,
  },

  // ── %15 İndirime Girdi — Glow Badge ───────────────────────────────────────
  {
    id:             "fav-002",
    name:           "Mekanik Valf Modeli — STL Dosya Paketi",
    category:       "Sanatkat Dijital",
    type:           "digital",
    price:          "85₺",
    originalPrice:  "100₺",
    emoji:          "⚙️",
    bgColor:        "#0d1f2d",
    seller:         "Mühendis3D",
    rating:         4.9,
    reviewCount:    57,
    hasPriceDrop:   true,
    discountPercent: 15,
    inStock:        true,
  },

  // ── Normal Favori ──────────────────────────────────────────────────────────
  {
    id:             "fav-003",
    name:           "Çelik Rulman Seti 608ZZ (10 Adet)",
    category:       "Yazıcı Parçası",
    type:           "physical",
    price:          "149₺",
    emoji:          "🔩",
    bgColor:        "#1c1c2e",
    seller:         "MakerParts",
    rating:         4.5,
    reviewCount:    198,
    hasPriceDrop:   false,
    inStock:        true,
  },

  {
    id:             "fav-004",
    name:           "Drone Gövdesi 250mm — STL & Step",
    category:       "Sanatkat Dijital",
    type:           "digital",
    price:          "120₺",
    emoji:          "🚁",
    bgColor:        "#0f1923",
    seller:         "SkyDesign",
    rating:         4.7,
    reviewCount:    83,
    hasPriceDrop:   false,
    inStock:        true,
  },

  {
    id:             "fav-005",
    name:           "0.4mm Pirinç Nozzle (5'li Set)",
    category:       "Yazıcı Parçası",
    type:           "physical",
    price:          "89₺",
    emoji:          "🔧",
    bgColor:        "#1a2e1a",
    seller:         "TechStore3D",
    rating:         4.4,
    reviewCount:    421,
    hasPriceDrop:   false,
    inStock:        false,  // stokta yok durumu
  },

  {
    id:             "fav-006",
    name:           "PETG Şeffaf Filament 1kg",
    category:       "Filament",
    type:           "physical",
    price:          "349₺",
    emoji:          "💎",
    bgColor:        "#1a2a3a",
    seller:         "FilamentDünyası",
    rating:         4.6,
    reviewCount:    145,
    hasPriceDrop:   false,
    inStock:        true,
  },
];

// ─── Değerlendirme Bekleyenler ─────────────────────────────────────────────────
export const MOCK_PENDING_REVIEWS: PendingReview[] = [
  {
    id:            "rev-001",
    orderId:       "order-112",
    orderNumber:   "#FMK-1120",
    productName:   "Bambu Lab X1C Nozzle 0.4mm",
    category:      "Yazıcı Parçası",
    type:          "physical",
    seller:        "TechStore3D",
    deliveredDate: "15 Mar 2026",
    emoji:         "🔧",
    bgColor:       "#1c1c2e",
  },
  {
    id:            "rev-002",
    orderId:       "order-108",
    orderNumber:   "#FMK-1083",
    productName:   "PLA Beyaz 1kg — Premium Seri",
    category:      "Filament",
    type:          "physical",
    seller:        "FilamentDünyası",
    deliveredDate: "10 Mar 2026",
    emoji:         "🧵",
    bgColor:       "#2e1a1a",
  },
  {
    id:            "rev-003",
    orderId:       "order-099",
    orderNumber:   "#FMK-0992",
    productName:   "Endüstriyel Dişli Paketi — 12 STL",
    category:      "Sanatkat Dijital",
    type:          "digital",
    seller:        "Mühendis3D",
    deliveredDate: "5 Mar 2026",
    emoji:         "⚙️",
    bgColor:       "#0d1f2d",
  },
  {
    id:            "rev-004",
    orderId:       "order-094",
    orderNumber:   "#FMK-0941",
    productName:   "Özel Bisiklet Gidon Kılıfı — 3D Baskı",
    category:      "Fidrop Üretim",
    type:          "3d_print",
    seller:        "Fimarkt Üretim",
    deliveredDate: "28 Şub 2026",
    emoji:         "🚲",
    bgColor:       "#1a2e1a",
  },
];
