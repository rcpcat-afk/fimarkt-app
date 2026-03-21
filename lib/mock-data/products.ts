// ─── Fimarkt Mock Ürün Verisi ─────────────────────────────────────────────────
// Gerçek WooCommerce entegrasyonu gelene kadar bu data kullanılır.
// Ürünler pillar + category slug'ına göre gruplandırılmıştır.

import { TOP_CATEGORIES, type Category } from "../../constants/categories";
import type { Product } from "../types";

// ── FDM Yazıcılar (magaza/fdm-yazicilar) ─────────────────────────────────────
const FDM_YAZICILAR: Product[] = [
  {
    id: "fdm-001",
    slug: "bambu-lab-p1s",
    title: "Bambu Lab P1S — Tam Kapalı Yüksek Hızlı 3D Yazıcı",
    brand: "Bambu Lab",
    images: [
      "https://picsum.photos/seed/fdm001a/600/600",
      "https://picsum.photos/seed/fdm001b/600/600",
    ],
    price: 34990,
    originalPrice: 39990,
    rating: 4.9,
    reviewCount: 312,
    badge: "cok-satan",
    seller: { id: "s-001", name: "FiTeknik Mağazası", slug: "fiteknik", rating: 4.8 },
    category: "fdm-yazicilar",
    pillar: "magaza",
    inStock: true,
    specs: {
      printVolume:   "256×256×256 mm",
      maxSpeed:      "500 mm/s",
      technology:    "FDM",
      connectivity:  "WiFi + Kamera",
      layerRes:      "0.05 – 0.35 mm",
      nozzleTemp:    "300°C max",
    },
  },
  {
    id: "fdm-002",
    slug: "bambu-lab-a1-mini",
    title: "Bambu Lab A1 Mini Combo — AMS Lite Dahil",
    brand: "Bambu Lab",
    images: [
      "https://picsum.photos/seed/fdm002a/600/600",
      "https://picsum.photos/seed/fdm002b/600/600",
    ],
    price: 18490,
    rating: 4.8,
    reviewCount: 198,
    badge: "yeni",
    seller: { id: "s-001", name: "FiTeknik Mağazası", slug: "fiteknik", rating: 4.8 },
    category: "fdm-yazicilar",
    pillar: "magaza",
    inStock: true,
    specs: {
      printVolume:  "180×180×180 mm",
      maxSpeed:     "500 mm/s",
      technology:   "FDM",
      connectivity: "WiFi + Kamera",
      layerRes:     "0.05 – 0.35 mm",
      nozzleTemp:   "300°C max",
    },
  },
  {
    id: "fdm-003",
    slug: "prusa-mk4s",
    title: "Prusa MK4S — Açık Kaynak Referans Yazıcı",
    brand: "Prusa",
    images: [
      "https://picsum.photos/seed/fdm003a/600/600",
      "https://picsum.photos/seed/fdm003b/600/600",
    ],
    price: 28750,
    originalPrice: 31000,
    rating: 4.7,
    reviewCount: 445,
    badge: "cok-satan",
    seller: { id: "s-002", name: "3D Dünya",  slug: "3d-dunya", rating: 4.9 },
    category: "fdm-yazicilar",
    pillar: "magaza",
    inStock: true,
    specs: {
      printVolume:  "250×210×220 mm",
      maxSpeed:     "300 mm/s",
      technology:   "FDM",
      connectivity: "WiFi + USB",
      layerRes:     "0.05 – 0.30 mm",
      nozzleTemp:   "300°C max",
    },
  },
  {
    id: "fdm-004",
    slug: "creality-k1-max",
    title: "Creality K1 Max — 300mm/s Kapalı Kasa",
    brand: "Creality",
    images: [
      "https://picsum.photos/seed/fdm004a/600/600",
    ],
    price: 22490,
    originalPrice: 27000,
    rating: 4.5,
    reviewCount: 267,
    badge: "indirim",
    seller: { id: "s-003", name: "CrealityTR", slug: "creality-tr", rating: 4.6 },
    category: "fdm-yazicilar",
    pillar: "magaza",
    inStock: true,
    specs: {
      printVolume:  "300×300×300 mm",
      maxSpeed:     "600 mm/s",
      technology:   "FDM",
      connectivity: "WiFi + Kamera",
      layerRes:     "0.10 – 0.35 mm",
      nozzleTemp:   "300°C max",
    },
  },
  {
    id: "fdm-005",
    slug: "creality-ender-3-v3-se",
    title: "Creality Ender-3 V3 SE — Başlangıç Seviyesi Akıllı Leveling",
    brand: "Creality",
    images: [
      "https://picsum.photos/seed/fdm005a/600/600",
    ],
    price: 5990,
    rating: 4.3,
    reviewCount: 892,
    badge: "cok-satan",
    seller: { id: "s-003", name: "CrealityTR", slug: "creality-tr", rating: 4.6 },
    category: "fdm-yazicilar",
    pillar: "magaza",
    inStock: true,
    specs: {
      printVolume:  "220×220×250 mm",
      maxSpeed:     "250 mm/s",
      technology:   "FDM",
      connectivity: "Yalnızca USB",
      layerRes:     "0.10 – 0.40 mm",
      nozzleTemp:   "260°C max",
    },
  },
  {
    id: "fdm-006",
    slug: "anycubic-kobra-2-pro",
    title: "Anycubic Kobra 2 Pro — 500mm/s Otomatik Leveling",
    brand: "Anycubic",
    images: [
      "https://picsum.photos/seed/fdm006a/600/600",
    ],
    price: 11490,
    originalPrice: 13900,
    rating: 4.4,
    reviewCount: 183,
    badge: "indirim",
    seller: { id: "s-004", name: "AnyCubeShop", slug: "anycubeshop", rating: 4.5 },
    category: "fdm-yazicilar",
    pillar: "magaza",
    inStock: true,
    specs: {
      printVolume:  "220×220×250 mm",
      maxSpeed:     "500 mm/s",
      technology:   "FDM",
      connectivity: "WiFi",
      layerRes:     "0.05 – 0.35 mm",
      nozzleTemp:   "260°C max",
    },
  },
  {
    id: "fdm-007",
    slug: "anycubic-kobra-s1",
    title: "Anycubic Kobra S1 Combo — Çok Renkli AMS Sistemi",
    brand: "Anycubic",
    images: [
      "https://picsum.photos/seed/fdm007a/600/600",
    ],
    price: 26990,
    rating: 4.6,
    reviewCount: 74,
    badge: "yeni",
    seller: { id: "s-004", name: "AnyCubeShop", slug: "anycubeshop", rating: 4.5 },
    category: "fdm-yazicilar",
    pillar: "magaza",
    inStock: false,
    specs: {
      printVolume:  "220×220×250 mm",
      maxSpeed:     "600 mm/s",
      technology:   "FDM",
      connectivity: "WiFi + Kamera",
      layerRes:     "0.05 – 0.35 mm",
      nozzleTemp:   "300°C max",
    },
  },
  {
    id: "fdm-008",
    slug: "creality-ender-3-v3-plus",
    title: "Creality Ender-3 V3 Plus — 300×300mm Geniş Alan",
    brand: "Creality",
    images: [
      "https://picsum.photos/seed/fdm008a/600/600",
    ],
    price: 13990,
    originalPrice: 15500,
    rating: 4.4,
    reviewCount: 219,
    badge: "stokta-az",
    seller: { id: "s-003", name: "CrealityTR", slug: "creality-tr", rating: 4.6 },
    category: "fdm-yazicilar",
    pillar: "magaza",
    inStock: true,
    specs: {
      printVolume:  "300×300×330 mm",
      maxSpeed:     "600 mm/s",
      technology:   "FDM",
      connectivity: "WiFi",
      layerRes:     "0.10 – 0.35 mm",
      nozzleTemp:   "300°C max",
    },
  },
];

// ── Standart Filamentler (magaza/standart-filamentler) ────────────────────────
const STANDART_FILAMENTLER: Product[] = [
  {
    id: "fil-001",
    slug: "bambu-lab-pla-basic-beyaz",
    title: "Bambu Lab PLA Basic — Beyaz 1kg",
    brand: "Bambu Lab",
    images: [
      "https://picsum.photos/seed/fil001a/600/600",
    ],
    price: 649,
    rating: 4.9,
    reviewCount: 1241,
    badge: "cok-satan",
    seller: { id: "s-001", name: "FiTeknik Mağazası", slug: "fiteknik", rating: 4.8 },
    category: "standart-filamentler",
    pillar: "magaza",
    inStock: true,
    specs: {
      material:   "PLA",
      diameter:   "1.75 mm",
      color:      "Beyaz",
      weight:     "1 kg",
      printTemp:  "190–230°C",
      bedTemp:    "0–60°C",
    },
  },
  {
    id: "fil-002",
    slug: "bambu-lab-petg-basic-siyah",
    title: "Bambu Lab PETG Basic — Siyah 1kg",
    brand: "Bambu Lab",
    images: [
      "https://picsum.photos/seed/fil002a/600/600",
    ],
    price: 699,
    rating: 4.8,
    reviewCount: 876,
    badge: "cok-satan",
    seller: { id: "s-001", name: "FiTeknik Mağazası", slug: "fiteknik", rating: 4.8 },
    category: "standart-filamentler",
    pillar: "magaza",
    inStock: true,
    specs: {
      material:  "PETG",
      diameter:  "1.75 mm",
      color:     "Siyah",
      weight:    "1 kg",
      printTemp: "220–250°C",
      bedTemp:   "70–90°C",
    },
  },
  {
    id: "fil-003",
    slug: "esun-pla-plus-beyaz",
    title: "eSUN PLA+ Beyaz 1kg — Yüksek Mukavemet",
    brand: "eSUN",
    images: [
      "https://picsum.photos/seed/fil003a/600/600",
    ],
    price: 379,
    originalPrice: 449,
    rating: 4.7,
    reviewCount: 2340,
    badge: "indirim",
    seller: { id: "s-005", name: "Filament Dükkânı", slug: "filament-dukkani", rating: 4.7 },
    category: "standart-filamentler",
    pillar: "magaza",
    inStock: true,
    specs: {
      material:  "PLA+",
      diameter:  "1.75 mm",
      color:     "Beyaz",
      weight:    "1 kg",
      printTemp: "205–225°C",
      bedTemp:   "0–60°C",
    },
  },
  {
    id: "fil-004",
    slug: "prusament-pla-galaxy-black",
    title: "Prusament PLA Galaxy Black — Glow Effect 1kg",
    brand: "Prusament",
    images: [
      "https://picsum.photos/seed/fil004a/600/600",
    ],
    price: 829,
    rating: 4.9,
    reviewCount: 567,
    badge: "yeni",
    seller: { id: "s-002", name: "3D Dünya", slug: "3d-dunya", rating: 4.9 },
    category: "standart-filamentler",
    pillar: "magaza",
    inStock: true,
    specs: {
      material:  "PLA",
      diameter:  "1.75 mm",
      color:     "Siyah (Galaxy)",
      weight:    "1 kg",
      printTemp: "210–230°C",
      bedTemp:   "0–60°C",
    },
  },
  {
    id: "fil-005",
    slug: "polymaker-polylite-asa-gri",
    title: "Polymaker PolyLite ASA Gri 1kg — UV Dayanımlı",
    brand: "Polymaker",
    images: [
      "https://picsum.photos/seed/fil005a/600/600",
    ],
    price: 549,
    originalPrice: 649,
    rating: 4.6,
    reviewCount: 312,
    badge: "indirim",
    seller: { id: "s-005", name: "Filament Dükkânı", slug: "filament-dukkani", rating: 4.7 },
    category: "standart-filamentler",
    pillar: "magaza",
    inStock: true,
    specs: {
      material:  "ASA",
      diameter:  "1.75 mm",
      color:     "Gri",
      weight:    "1 kg",
      printTemp: "240–260°C",
      bedTemp:   "80–100°C",
    },
  },
  {
    id: "fil-006",
    slug: "esun-tpu-95a-seffaf",
    title: "eSUN TPU 95A Şeffaf 1kg — Esnek Filament",
    brand: "eSUN",
    images: [
      "https://picsum.photos/seed/fil006a/600/600",
    ],
    price: 459,
    rating: 4.5,
    reviewCount: 189,
    badge: undefined,
    seller: { id: "s-005", name: "Filament Dükkânı", slug: "filament-dukkani", rating: 4.7 },
    category: "standart-filamentler",
    pillar: "magaza",
    inStock: true,
    specs: {
      material:  "TPU",
      diameter:  "1.75 mm",
      color:     "Şeffaf",
      weight:    "1 kg",
      printTemp: "220–235°C",
      bedTemp:   "0–60°C",
    },
  },
  {
    id: "fil-007",
    slug: "zaxe-z-pla-kirmizi",
    title: "Zaxe Z-PLA Kırmızı 1kg — Türk Üretim",
    brand: "Zaxe",
    images: [
      "https://picsum.photos/seed/fil007a/600/600",
    ],
    price: 349,
    rating: 4.4,
    reviewCount: 98,
    badge: "yeni",
    seller: { id: "s-006", name: "ZaxeShop", slug: "zaxeshop", rating: 4.6 },
    category: "standart-filamentler",
    pillar: "magaza",
    inStock: true,
    specs: {
      material:  "PLA",
      diameter:  "1.75 mm",
      color:     "Kırmızı",
      weight:    "1 kg",
      printTemp: "190–220°C",
      bedTemp:   "0–60°C",
    },
  },
  {
    id: "fil-008",
    slug: "polymaker-polylite-petg-mavi",
    title: "Polymaker PolyLite PETG Mavi 1kg",
    brand: "Polymaker",
    images: [
      "https://picsum.photos/seed/fil008a/600/600",
    ],
    price: 499,
    rating: 4.7,
    reviewCount: 421,
    badge: undefined,
    seller: { id: "s-005", name: "Filament Dükkânı", slug: "filament-dukkani", rating: 4.7 },
    category: "standart-filamentler",
    pillar: "magaza",
    inStock: false,
    specs: {
      material:  "PETG",
      diameter:  "1.75 mm",
      color:     "Mavi",
      weight:    "1 kg",
      printTemp: "230–250°C",
      bedTemp:   "70–90°C",
    },
  },
];

// ── Tüm mock ürünler tek havuzda ───────────────────────────────────────────────
export const ALL_PRODUCTS: Product[] = [
  ...FDM_YAZICILAR,
  ...STANDART_FILAMENTLER,
];

// Kategori slug'ına göre ürünleri döner
export function getProductsByCategory(categorySlug: string): Product[] {
  return ALL_PRODUCTS.filter((p) => p.category === categorySlug);
}

// Verilen kategori slug'ı altındaki tüm yaprak slug'ları döner.
// Eğer slug zaten yapraksa sadece kendini döner.
function collectLeafSlugs(targetSlug: string, cats: Category[]): string[] | null {
  for (const cat of cats) {
    if (cat.slug === targetSlug) {
      if (!cat.children?.length) return [cat.slug];
      const leaves: string[] = [];
      const gather = (c: Category) => {
        if (!c.children?.length) { leaves.push(c.slug); return; }
        c.children.forEach(gather);
      };
      cat.children.forEach(gather);
      return leaves;
    }
    if (cat.children?.length) {
      const found = collectLeafSlugs(targetSlug, cat.children);
      if (found !== null) return found;
    }
  }
  return null;
}

// Pillar + kategori ikilisiyle filtreler.
// Üst kategori slug'ı verilirse tüm alt kategorilerin ürünlerini döner.
export function getProductsByPillarCategory(
  pillarSlug: string,
  categorySlug: string,
): Product[] {
  const pillar = TOP_CATEGORIES.find((p) => p.slug === pillarSlug);
  const slugs  = pillar
    ? (collectLeafSlugs(categorySlug, pillar.children) ?? [categorySlug])
    : [categorySlug];
  return ALL_PRODUCTS.filter(
    (p) => p.pillar === pillarSlug && slugs.includes(p.category),
  );
}
