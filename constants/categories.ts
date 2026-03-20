// ─────────────────────────────────────────────────────────────────────────────
// Fimarkt Master Kategori Ağacı
// 3 ana sütun: Fidrop (hizmet) | Pazaryeri (ürün) | Sanatkat (dijital)
// ─────────────────────────────────────────────────────────────────────────────

export type CategoryType = "service" | "product" | "digital";

export interface Category {
  id: string;
  title: string;
  slug: string;
  type: CategoryType;
  icon?: string;
  children?: Category[];
}

export interface TopCategory {
  id: string;
  title: string;
  slug: string;
  icon: string;
  /** Sütunun vurgu rengi (badge, aktif chip vb.) */
  accent: string;
  children: Category[];
}

// ─────────────────────────────────────────────────────────────────────────────
// MASTER AĞAÇ
// ─────────────────────────────────────────────────────────────────────────────
export const TOP_CATEGORIES: TopCategory[] = [
  // ── 1. FİDROP — 3D Üretim Hizmeti ──────────────────────────────────────────
  {
    id: "fidrop",
    title: "Fidrop",
    slug: "fidrop",
    icon: "🏭",
    accent: "#ff6b2b",
    children: [
      { id: "fdm-baski",      title: "FDM Baskı",                slug: "fdm-baski",      type: "service", icon: "🖨️" },
      { id: "sla-baski",      title: "SLA / Reçine Baskı",       slug: "sla-baski",      type: "service", icon: "🔦" },
      { id: "sls-baski",      title: "SLS Baskı",                slug: "sls-baski",      type: "service", icon: "✨" },
      { id: "metal-baski",    title: "Metal 3D Baskı",           slug: "metal-baski",    type: "service", icon: "⚙️" },
      { id: "prototip",       title: "Prototip Üretimi",         slug: "prototip",       type: "service", icon: "🔬" },
      { id: "yedek-parca",    title: "Yedek Parça Üretimi",      slug: "yedek-parca",    type: "service", icon: "🔩" },
      { id: "3d-modelleme",   title: "3D Modelleme & Tasarım",   slug: "3d-modelleme",   type: "service", icon: "🧊" },
      { id: "3d-tarama",      title: "3D Tarama & Tersine Müh.", slug: "3d-tarama",      type: "service", icon: "📡" },
      { id: "boyama",         title: "Boyama & Son İşlem",       slug: "boyama",         type: "service", icon: "🎨" },
      { id: "3d-danismanlik", title: "3D Danışmanlık",           slug: "3d-danismanlik", type: "service", icon: "💡" },
    ],
  },

  // ── 2. PAZARYERİ — Fiziksel Ürünler ─────────────────────────────────────────
  {
    id: "pazaryeri",
    title: "Pazaryeri",
    slug: "pazaryeri",
    icon: "🛍️",
    accent: "#3b82f6",
    children: [
      {
        id: "filament",
        title: "Filament & Malzeme",
        slug: "filament",
        type: "product",
        icon: "🧵",
        children: [
          { id: "pla",        title: "PLA",            slug: "filament-pla",      type: "product" },
          { id: "abs",        title: "ABS",            slug: "filament-abs",      type: "product" },
          { id: "petg",       title: "PETG",           slug: "filament-petg",     type: "product" },
          { id: "tpu",        title: "TPU / Esnek",    slug: "filament-tpu",      type: "product" },
          { id: "asa",        title: "ASA / Teknik",   slug: "filament-asa",      type: "product" },
          { id: "recine",     title: "Reçine (SLA)",   slug: "recine",            type: "product" },
          { id: "kompozit",   title: "Kompozit & Özel",slug: "filament-kompozit", type: "product" },
        ],
      },
      {
        id: "3d-yazicilar",
        title: "3D Yazıcılar",
        slug: "3d-yazicilar",
        type: "product",
        icon: "🖨️",
        children: [
          { id: "fdm-yazici",          title: "FDM Yazıcılar",          slug: "fdm-yazicilar",          type: "product" },
          { id: "sla-yazici",          title: "SLA / MSLA Yazıcılar",   slug: "sla-yazicilar",          type: "product" },
          { id: "endustriyel-yazici",  title: "Endüstriyel Yazıcılar",  slug: "endustriyel-yazicilar",  type: "product" },
        ],
      },
      {
        id: "yedek-parca-urun",
        title: "Yedek Parça & Aksesuar",
        slug: "yedek-parca-aksesuar",
        type: "product",
        icon: "🔧",
        children: [
          { id: "nozzle",       title: "Nozzle & Hotend",   slug: "nozzle-hotend",  type: "product" },
          { id: "ekstruder",    title: "Ekstrüder",          slug: "ekstruder",      type: "product" },
          { id: "yatak",        title: "Baskı Yatağı",       slug: "baski-yatagi",   type: "product" },
          { id: "kayis-rulman", title: "Kayış & Rulman",     slug: "kayis-rulman",   type: "product" },
        ],
      },
      {
        id: "kaplama-boya",
        title: "Kaplama & Boya",
        slug: "kaplama-boya",
        type: "product",
        icon: "🪣",
        children: [
          { id: "astar",  title: "Astar & Boya",      slug: "astar-boya",      type: "product" },
          { id: "epoksi", title: "Epoksi & Kaplama",  slug: "epoksi-kaplama",  type: "product" },
          { id: "zimapra", title: "Zımpara & Cila",   slug: "zimpara",         type: "product" },
        ],
      },
      {
        id: "arac-ekipman",
        title: "Araçlar & Ekipmanlar",
        slug: "arac-ekipman",
        type: "product",
        icon: "🛠️",
        children: [
          { id: "spatula",   title: "Spatula & El Aletleri", slug: "el-aletleri",       type: "product" },
          { id: "kurutucu",  title: "Filament Kurutucu",     slug: "filament-kurutucu", type: "product" },
          { id: "tarayici",  title: "3D Tarayıcılar",        slug: "3d-tarayicilar",    type: "product" },
        ],
      },
    ],
  },

  // ── 3. SANATKAT — Dijital Modeller ──────────────────────────────────────────
  {
    id: "sanatkat",
    title: "Sanatkat",
    slug: "sanatkat",
    icon: "🏛️",
    accent: "#a855f7",
    children: [
      { id: "figur-koleksiyon",     title: "Figür & Koleksiyon",     slug: "figur-koleksiyon",     type: "digital", icon: "🗿" },
      { id: "biblo-heykel",         title: "Biblo & Heykel",         slug: "biblo-heykel",         type: "digital", icon: "🎭" },
      { id: "mimari-mekan",         title: "Mimari & İç Mekan",      slug: "mimari-mekan",         type: "digital", icon: "🏗️" },
      { id: "oyun-fantezi",         title: "Oyun & Fantezi",         slug: "oyun-fantezi",         type: "digital", icon: "🎮" },
      { id: "mucevher-aksesuar",    title: "Mücevher & Aksesuar",    slug: "mucevher-aksesuar",    type: "digital", icon: "💍" },
      { id: "egitim-bilim",         title: "Eğitim & Bilim",         slug: "egitim-bilim",         type: "digital", icon: "🔭" },
      { id: "endustriyel-mekanik",  title: "Endüstriyel & Mekanik",  slug: "endustriyel-mekanik",  type: "digital", icon: "⚙️" },
      { id: "dekorasyon-ev",        title: "Dekorasyon & Ev",        slug: "dekorasyon-ev",        type: "digital", icon: "🏠" },
    ],
  },
];

// ── Yardımcılar ─────────────────────────────────────────────────────────────

/** Tüm yaprak kategorileri düz liste olarak döner */
export function flatCategories(): Category[] {
  const result: Category[] = [];
  const walk = (cats: Category[]) => {
    for (const c of cats) {
      result.push(c);
      if (c.children) walk(c.children);
    }
  };
  TOP_CATEGORIES.forEach((tc) => walk(tc.children));
  return result;
}

/** Bir kategori ID'sine göre parent TopCategory bulur */
export function findPillar(categoryId: string): TopCategory | undefined {
  const walk = (cats: Category[]): boolean =>
    cats.some((c) => c.id === categoryId || (c.children ? walk(c.children) : false));
  return TOP_CATEGORIES.find((p) => walk(p.children));
}
