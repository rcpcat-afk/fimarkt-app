// ─── Fimarkt Kampanya Config (Yarı Dinamik) ────────────────────────────────────
// Bölüm 8 Admin Overhaul'unda bu config CMS/API'ye bağlanacak.
// Web (fimarkt-web/lib/campaigns.ts) ile senkron tutulmalıdır.

export type CampaignCategory = "fidrop" | "muhendislik" | "magaza" | "sanatkat" | "genel";

export interface Campaign {
  id:           string;
  title:        string;
  description:  string;
  badge:        string;
  ctaText:      string;
  ctaLink:      string;
  ctaSecondary?: { text: string; link: string };
  gradient:     string;   // Kullanılmaz (RN'de LinearGradient yok) — ileride eklenecek
  accentColor:  string;   // Hex — kart border, badge, buton rengi
  emoji:        string;   // Görsel placeholder
  priority:     number;   // 1 = en yüksek (ilk slayt)
  category:     CampaignCategory;
}

export const CAMPAIGNS: Campaign[] = [
  {
    id:           "brand-hero",
    title:        "Fikrinden Ürüne,\nSaniyeler İçinde.",
    description:  "3D baskı siparişi ver, benzersiz sanat eserleri keşfet, mühendislik hizmetleri al — hepsi tek platformda.",
    badge:        "🏭 Türkiye'nin 3D Ekosistemi",
    ctaText:      "Hemen Teklif Al",
    ctaLink:      "/(tabs)/print",
    ctaSecondary: { text: "Keşfet", link: "/(tabs)/shop" },
    gradient:     "from-background via-surface to-background",
    accentColor:  "#ff6b2b",
    emoji:        "🏭",
    priority:     1,
    category:     "genel",
  },
  {
    id:           "fidrop-campaign",
    title:        "STL Yükle,\nAnında Fiyat Al.",
    description:  "Dosyanı yükle, saniyeler içinde üretim maliyetini hesapla. FDM, SLA, SLS — tüm teknolojiler.",
    badge:        "⚡ Fidrop Teknolojisi",
    ctaText:      "Fidrop'u Dene",
    ctaLink:      "/(tabs)/print",
    gradient:     "from-purple-950/60 via-surface to-background",
    accentColor:  "#7c3aed",
    emoji:        "🚀",
    priority:     2,
    category:     "fidrop",
  },
  {
    id:           "sanatkat-campaign",
    title:        "Benzersiz 3D\nSanat Eserleri.",
    description:  "El yapımı heykeller, figürler ve özel sipariş sanat eserleri. Her biri tek, her biri özel.",
    badge:        "🏛️ Sanatkat Koleksiyonu",
    ctaText:      "Eserleri Keşfet",
    ctaLink:      "/(tabs)/shop",
    gradient:     "from-violet-950/60 via-surface to-background",
    accentColor:  "#a855f7",
    emoji:        "🏛️",
    priority:     3,
    category:     "sanatkat",
  },
  {
    id:           "magaza-campaign",
    title:        "Filament Sezonunda\n%20 İndirim.",
    description:  "Seçili PLA, PETG ve ABS filamentlerde özel kampanya fiyatları. Stoklar sınırlı.",
    badge:        "🛍️ Kampanya",
    ctaText:      "Alışverişe Başla",
    ctaLink:      "/(tabs)/shop",
    gradient:     "from-orange-950/60 via-surface to-background",
    accentColor:  "#ff6b2b",
    emoji:        "🧵",
    priority:     4,
    category:     "magaza",
  },
  {
    id:           "muhendislik-campaign",
    title:        "Prototipini\nHayata Geçir.",
    description:  "Tasarımcı ve mühendis ekibimizle fikrinden ürüne adım at. Hızlı, güvenilir, profesyonel.",
    badge:        "🔧 Mühendislik Hizmetleri",
    ctaText:      "Teklif Al",
    ctaLink:      "/(tabs)/print",
    gradient:     "from-sky-950/60 via-surface to-background",
    accentColor:  "#0ea5e9",
    emoji:        "⚙️",
    priority:     5,
    category:     "muhendislik",
  },
];

// ── Smart Targeting: role'e göre kampanya sıralaması ──────────────────────────
const ROLE_ORDER: Record<string, CampaignCategory[]> = {
  muhendis: ["fidrop", "muhendislik", "genel", "sanatkat", "magaza"],
  satici:   ["fidrop", "muhendislik", "magaza", "genel",   "sanatkat"],
  musteri:  ["magaza", "sanatkat",    "genel",  "fidrop",  "muhendislik"],
};

export function sortCampaignsForRole(campaigns: Campaign[], role?: string): Campaign[] {
  const byPriority = [...campaigns].sort((a, b) => a.priority - b.priority);
  const order = role ? ROLE_ORDER[role] : null;
  if (!order) return byPriority;
  return byPriority.sort((a, b) => {
    const ai = order.indexOf(a.category);
    const bi = order.indexOf(b.category);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
}
