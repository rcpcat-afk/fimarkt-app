// ─── Satıcı Ürün Mock Verisi ──────────────────────────────────────────────────
// Fiziksel (filament, yazıcı parçası) + Dijital (STL/OBJ) ürün karışımı.
// Web tarafıyla birebir aynı — fimarkt-web/lib/mock-data/partner-products.ts

export type ProductType   = "physical" | "digital";
export type ProductStatus = "active" | "passive";

export interface ProductVariationValue {
  id:    string;
  label: string;
  stock: number;
  price: number;
}

export interface ProductVariation {
  id:     string;
  name:   string;
  values: ProductVariationValue[];
}

export interface PartnerProduct {
  id:          string;
  name:        string;
  sku:         string;
  type:        ProductType;
  category:    string;
  price:       number;
  stock:       number | null;
  status:      ProductStatus;
  imageEmoji:  string;
  bgColor:     string;
  weight?:     number;
  dimensions?: { l: number; w: number; h: number };
  fileFormat?: "STL" | "OBJ" | "ZIP";
  fileSize?:   string;
  variations?: ProductVariation[];
}

export const MOCK_PARTNER_PRODUCTS: PartnerProduct[] = [
  {
    id: "pp-001", name: "PLA+ Filament 1kg Makarası", sku: "FIL-PLA-001",
    type: "physical", category: "Filament", price: 349, stock: 0,
    status: "active", imageEmoji: "🧵", bgColor: "#1a1a28",
    weight: 1200, dimensions: { l: 20, w: 20, h: 7 },
    variations: [{
      id: "var-001", name: "Renk",
      values: [
        { id: "val-001", label: "Kırmızı", stock: 15, price: 349 },
        { id: "val-002", label: "Mavi",    stock: 22, price: 349 },
        { id: "val-003", label: "Siyah",   stock: 8,  price: 349 },
        { id: "val-004", label: "Beyaz",   stock: 30, price: 329 },
      ],
    }],
  },
  {
    id: "pp-002", name: "PETG Filament 500g — Şeffaf", sku: "FIL-PETG-002",
    type: "physical", category: "Filament", price: 229, stock: 47,
    status: "active", imageEmoji: "🧶", bgColor: "#0e2e1a",
    weight: 700, dimensions: { l: 18, w: 18, h: 6 },
  },
  {
    id: "pp-003", name: "TPU Esnek Filament 250g", sku: "FIL-TPU-003",
    type: "physical", category: "Filament", price: 289, stock: 12,
    status: "active", imageEmoji: "🫧", bgColor: "#1a0e2e",
    weight: 450,
    variations: [{
      id: "var-002", name: "Shore Sertliği",
      values: [
        { id: "val-005", label: "95A (Sert)", stock: 8, price: 289 },
        { id: "val-006", label: "87A (Orta)", stock: 4, price: 299 },
      ],
    }],
  },
  {
    id: "pp-004", name: "Ender 3 V3 SE Ekstruder", sku: "PART-E3-004",
    type: "physical", category: "Yedek Parça", price: 485, stock: 6,
    status: "active", imageEmoji: "⚙️", bgColor: "#2e1a0e",
    weight: 180, dimensions: { l: 8, w: 6, h: 5 },
  },
  {
    id: "pp-005", name: "Borosilikat Cam Tabla 235x235", sku: "PART-CAM-005",
    type: "physical", category: "Yedek Parça", price: 165, stock: 0,
    status: "passive", imageEmoji: "🪟", bgColor: "#0d1b2a",
  },
  {
    id: "pp-006", name: "Modüler Şehir Binası — Low-Poly", sku: "STL-CITY-006",
    type: "digital", category: "Mimari", price: 89, stock: null,
    status: "active", imageEmoji: "🏙️", bgColor: "#0e1a2e",
    fileFormat: "STL", fileSize: "48 MB",
  },
  {
    id: "pp-007", name: "Dragon Skull — Articulated", sku: "STL-DRAG-007",
    type: "digital", category: "Figür & Heykel", price: 149, stock: null,
    status: "active", imageEmoji: "💀", bgColor: "#2e0e0e",
    fileFormat: "ZIP", fileSize: "212 MB",
  },
  {
    id: "pp-008", name: "Mekanik Saat Dişlisi Seti", sku: "STL-GEAR-008",
    type: "digital", category: "Yedek Parça", price: 59, stock: null,
    status: "passive", imageEmoji: "🕰️", bgColor: "#1a1a0e",
    fileFormat: "OBJ", fileSize: "31 MB",
  },
];

export const PRODUCT_CATEGORIES = [
  "Filament", "Yedek Parça", "Mimari", "Figür & Heykel", "Sanat & Hobi",
] as const;
