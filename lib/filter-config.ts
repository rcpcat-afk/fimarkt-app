// ─── Fimarkt Dinamik Filtre Konfigürasyonu ────────────────────────────────────
// Kural: Bir kategoriye yeni filtre eklemek için sadece bu dosyayı güncelle.
// Admin paneli (Bölüm 8) bu config'i DB'den okuyacak — mimari hazır.

import type { FilterGroup } from "./types";

// Kategori slug'ına göre filtre grupları haritası
const FILTER_CONFIG: Record<string, FilterGroup[]> = {

  // ── FDM Yazıcılar ──────────────────────────────────────────────────────────
  "fdm-yazicilar": [
    {
      id: "brand", label: "Marka", type: "checkbox",
      options: [
        { label: "Bambu Lab",  value: "bambu-lab",  count: 3 },
        { label: "Creality",   value: "creality",   count: 5 },
        { label: "Prusa",      value: "prusa",      count: 2 },
        { label: "Anycubic",   value: "anycubic",   count: 2 },
      ],
    },
    {
      id: "printVolume", label: "Baskı Hacmi", type: "checkbox",
      options: [
        { label: "Kompakt (≤220mm)",  value: "kompakt",  count: 4 },
        { label: "Orta (221–300mm)",  value: "orta",     count: 5 },
        { label: "Geniş (>300mm)",    value: "genis",    count: 3 },
      ],
    },
    {
      id: "connectivity", label: "Bağlantı", type: "checkbox",
      options: [
        { label: "WiFi + Kamera", value: "wifi-kamera", count: 5 },
        { label: "WiFi",          value: "wifi",        count: 3 },
        { label: "Yalnızca USB",  value: "usb",         count: 4 },
      ],
    },
    {
      id: "price", label: "Fiyat Aralığı (₺)", type: "range",
      min: 0, max: 50000,
    },
  ],

  // ── Reçine Yazıcılar ───────────────────────────────────────────────────────
  "recine-yazicilar": [
    {
      id: "brand", label: "Marka", type: "checkbox",
      options: [
        { label: "Anycubic",  value: "anycubic",  count: 4 },
        { label: "Elegoo",    value: "elegoo",    count: 5 },
        { label: "Phrozen",   value: "phrozen",   count: 3 },
      ],
    },
    {
      id: "technology", label: "Teknoloji", type: "checkbox",
      options: [
        { label: "MSLA (LCD)", value: "msla",  count: 8 },
        { label: "DLP",        value: "dlp",   count: 3 },
        { label: "SLA (Lazer)",value: "sla",   count: 1 },
      ],
    },
    {
      id: "price", label: "Fiyat Aralığı (₺)", type: "range",
      min: 0, max: 30000,
    },
  ],

  // ── Standart Filamentler ───────────────────────────────────────────────────
  "standart-filamentler": [
    {
      id: "brand", label: "Marka", type: "checkbox",
      options: [
        { label: "eSUN",       value: "esun",       count: 6 },
        { label: "Bambu Lab",  value: "bambu-lab",  count: 4 },
        { label: "Polymaker",  value: "polymaker",  count: 5 },
        { label: "Prusament",  value: "prusament",  count: 3 },
        { label: "Zaxe",       value: "zaxe",       count: 3 },
      ],
    },
    {
      id: "material", label: "Materyal", type: "checkbox",
      options: [
        { label: "PLA",    value: "pla",    count: 10 },
        { label: "PETG",   value: "petg",   count: 6  },
        { label: "ABS",    value: "abs",    count: 4  },
        { label: "ASA",    value: "asa",    count: 3  },
        { label: "TPU",    value: "tpu",    count: 2  },
      ],
    },
    {
      id: "diameter", label: "Çap", type: "checkbox",
      options: [
        { label: "1.75 mm", value: "1.75", count: 18 },
        { label: "2.85 mm", value: "2.85", count: 7  },
      ],
    },
    {
      id: "color", label: "Renk", type: "color",
      options: [
        { label: "Beyaz",   value: "beyaz",   count: 5 },
        { label: "Siyah",   value: "siyah",   count: 5 },
        { label: "Kırmızı", value: "kirmizi", count: 4 },
        { label: "Mavi",    value: "mavi",    count: 4 },
        { label: "Yeşil",   value: "yesil",   count: 3 },
        { label: "Sarı",    value: "sari",    count: 3 },
        { label: "Şeffaf",  value: "seffaf",  count: 2 },
      ],
    },
    {
      id: "price", label: "Fiyat Aralığı (₺)", type: "range",
      min: 0, max: 2000,
    },
  ],

  // ── Teknik Filamentler ─────────────────────────────────────────────────────
  "teknik-filamentler": [
    {
      id: "brand", label: "Marka", type: "checkbox",
      options: [
        { label: "Bambu Lab",  value: "bambu-lab",  count: 3 },
        { label: "Polymaker",  value: "polymaker",  count: 4 },
        { label: "Fiberlogy",  value: "fiberlogy",  count: 2 },
      ],
    },
    {
      id: "material", label: "Materyal", type: "checkbox",
      options: [
        { label: "PA (Naylon)",    value: "pa",    count: 3 },
        { label: "PC (Polikarbon)",value: "pc",    count: 2 },
        { label: "Carbon Fiber",   value: "cf",    count: 3 },
        { label: "PEEK",           value: "peek",  count: 1 },
      ],
    },
    {
      id: "price", label: "Fiyat Aralığı (₺)", type: "range",
      min: 0, max: 5000,
    },
  ],
};

// Varsayılan filtreler (config'de tanımlı olmayan kategoriler için)
const DEFAULT_FILTERS: FilterGroup[] = [
  {
    id: "price", label: "Fiyat Aralığı (₺)", type: "range",
    min: 0, max: 10000,
  },
];

export function getFilterConfig(categorySlug: string): FilterGroup[] {
  return FILTER_CONFIG[categorySlug] ?? DEFAULT_FILTERS;
}
