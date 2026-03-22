// ─── Dijital Kütüphane Mock Data ──────────────────────────────────────────────
// hasUpdate: true  → mavi parlayan "Yeni Versiyon" rozeti tetikler
// category         → koleksiyon filtresi için kullanılır

export type LibraryCategory =
  | "Figür & Heykel"
  | "Yedek Parça"
  | "Mimari Model"
  | "Drone & Havacılık"
  | "Takı & Aksesuar"
  | "Sanat & Hobi";

export interface LibraryItem {
  id:           string;
  name:         string;
  designer:     string;
  category:     LibraryCategory;
  purchaseDate: string;
  fileFormat:   string;   // "STL" | "OBJ" | "STEP" | "ZIP"
  fileSize:     string;   // "24 MB"
  version:      string;   // "V1.0"
  hasUpdate:    boolean;
  newVersion?:  string;   // "V1.2" — hasUpdate true ise gösterilir
  emoji:        string;
  bgColor:      string;   // gradient rengi
  bgColor2:     string;   // gradient ikinci renk
  orderId:      string;
}

export const MOCK_LIBRARY: LibraryItem[] = [
  // ── Güncel versiyonu çıkan ürünler ────────────────────────────────────────
  {
    id:           "lib-001",
    name:         "Mandalorian Kask — Tam Ölçek",
    designer:     "SkyDesign",
    category:     "Figür & Heykel",
    purchaseDate: "12 Mar 2026",
    fileFormat:   "STL",
    fileSize:     "184 MB",
    version:      "V1.0",
    hasUpdate:    true,
    newVersion:   "V1.2",
    emoji:        "🪖",
    bgColor:      "#0f1923",
    bgColor2:     "#1e3a5f",
    orderId:      "order-112",
  },
  {
    id:           "lib-002",
    name:         "Modüler Dişli Seti — 12 Parça",
    designer:     "Mühendis3D",
    category:     "Yedek Parça",
    purchaseDate: "5 Mar 2026",
    fileFormat:   "STEP",
    fileSize:     "48 MB",
    version:      "V2.0",
    hasUpdate:    true,
    newVersion:   "V2.1",
    emoji:        "⚙️",
    bgColor:      "#1a1a2e",
    bgColor2:     "#16213e",
    orderId:      "order-108",
  },

  // ── Güncel ürünler ────────────────────────────────────────────────────────
  {
    id:           "lib-003",
    name:         "Drone Gövdesi 250mm FPV",
    designer:     "SkyDesign",
    category:     "Drone & Havacılık",
    purchaseDate: "28 Şub 2026",
    fileFormat:   "STL",
    fileSize:     "92 MB",
    version:      "V1.3",
    hasUpdate:    false,
    emoji:        "🚁",
    bgColor:      "#0d1b2a",
    bgColor2:     "#1b2838",
    orderId:      "order-099",
  },
  {
    id:           "lib-004",
    name:         "Art Deco Vazo Koleksiyonu",
    designer:     "ArtisMaker",
    category:     "Sanat & Hobi",
    purchaseDate: "20 Şub 2026",
    fileFormat:   "OBJ",
    fileSize:     "67 MB",
    version:      "V1.0",
    hasUpdate:    false,
    emoji:        "🏺",
    bgColor:      "#2e1a0e",
    bgColor2:     "#3d2314",
    orderId:      "order-094",
  },
  {
    id:           "lib-005",
    name:         "Minimalist Ev Maketi — A4",
    designer:     "ArchForm",
    category:     "Mimari Model",
    purchaseDate: "14 Şub 2026",
    fileFormat:   "STL",
    fileSize:     "210 MB",
    version:      "V1.1",
    hasUpdate:    false,
    emoji:        "🏠",
    bgColor:      "#0e2e1a",
    bgColor2:     "#143d23",
    orderId:      "order-088",
  },
  {
    id:           "lib-006",
    name:         "Gotik Ejderha Figürü — XL",
    designer:     "MythCraft",
    category:     "Figür & Heykel",
    purchaseDate: "2 Şub 2026",
    fileFormat:   "STL",
    fileSize:     "340 MB",
    version:      "V1.0",
    hasUpdate:    false,
    emoji:        "🐉",
    bgColor:      "#2e0e0e",
    bgColor2:     "#3d1414",
    orderId:      "order-081",
  },
  {
    id:           "lib-007",
    name:         "Geometrik Yüzük Seti — 5 Tasarım",
    designer:     "JewelPrint",
    category:     "Takı & Aksesuar",
    purchaseDate: "25 Oca 2026",
    fileFormat:   "STL",
    fileSize:     "18 MB",
    version:      "V1.0",
    hasUpdate:    false,
    emoji:        "💍",
    bgColor:      "#1a0e2e",
    bgColor2:     "#230e3d",
    orderId:      "order-075",
  },
  {
    id:           "lib-008",
    name:         "RC Araba Şasi Kiti",
    designer:     "Mühendis3D",
    category:     "Yedek Parça",
    purchaseDate: "18 Oca 2026",
    fileFormat:   "STEP",
    fileSize:     "56 MB",
    version:      "V3.1",
    hasUpdate:    false,
    emoji:        "🏎️",
    bgColor:      "#0e1a2e",
    bgColor2:     "#0e233d",
    orderId:      "order-068",
  },
];

export const LIBRARY_CATEGORIES: LibraryCategory[] = [
  "Figür & Heykel",
  "Yedek Parça",
  "Mimari Model",
  "Drone & Havacılık",
  "Takı & Aksesuar",
  "Sanat & Hobi",
];
