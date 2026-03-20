// ─────────────────────────────────────────────────────────────────────────────
// Fimarkt Master Kategori Ağacı — v2 (Gerçek Veri)
// 4 ana sütun:
//   1. Fidrop            — 3D Üretim Hizmeti         (type: service)
//   2. Mühendislik       — Teknik Çözümler            (type: service)
//   3. Mağaza            — E-Ticaret & Ekipman        (type: product)
//   4. Sanatkat          — Model & Tasarım Pazaryeri  (type: digital)
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
    id:     "fidrop",
    title:  "Fidrop",
    slug:   "fidrop",
    icon:   "🏭",
    accent: "#ff6b2b",
    children: [
      {
        id: "plastik-baski", title: "Plastik Baskı (FDM)", slug: "plastik-baski",
        type: "service", icon: "🖨️",
        children: [
          { id: "pla",          title: "PLA",           slug: "pla",          type: "service" },
          { id: "abs",          title: "ABS",           slug: "abs",          type: "service" },
          { id: "petg",         title: "PETG",          slug: "petg",         type: "service" },
          { id: "asa",          title: "ASA",           slug: "asa",          type: "service" },
          { id: "karbon-fiber", title: "Karbon Fiber",  slug: "karbon-fiber", type: "service" },
          { id: "tpu",          title: "TPU",           slug: "tpu",          type: "service" },
        ],
      },
      {
        id: "recine-baski", title: "Reçine Baskı (SLA/DLP/LCD)", slug: "recine-baski",
        type: "service", icon: "🔦",
        children: [
          { id: "standart-recine",    title: "Standart Reçine",              slug: "standart-recine",    type: "service" },
          { id: "dayanikli-recine",   title: "Dayanıklı Reçine",             slug: "dayanikli-recine",   type: "service" },
          { id: "esnek-recine",       title: "Esnek Reçine",                 slug: "esnek-recine",       type: "service" },
          { id: "dental-recine",      title: "Dental Reçine",                slug: "dental-recine",      type: "service" },
          { id: "kuyumcu-recine",     title: "Kuyumcu Reçinesi",             slug: "kuyumcu-recine",     type: "service" },
        ],
      },
      {
        id: "endustriyel-metal", title: "Endüstriyel & Metal Baskı (SLS/SLM)", slug: "endustriyel-metal-baski",
        type: "service", icon: "⚙️",
        children: [
          { id: "naylon-pa12",      title: "Naylon-PA12",       slug: "naylon-pa12",      type: "service" },
          { id: "aluminyum",        title: "Alüminyum",         slug: "aluminyum",        type: "service" },
          { id: "paslanmaz-celik",  title: "Paslanmaz Çelik",   slug: "paslanmaz-celik",  type: "service" },
          { id: "titanyum",         title: "Titanyum",          slug: "titanyum",         type: "service" },
        ],
      },
      {
        id: "lazer-cnc", title: "Lazer Kesim & CNC", slug: "lazer-kesim-cnc",
        type: "service", icon: "✂️",
        children: [
          { id: "ahsap-kesim",   title: "Ahşap",                slug: "ahsap-kesim",    type: "service" },
          { id: "pleksiglas",    title: "Pleksiglas",           slug: "pleksiglas",     type: "service" },
          { id: "metal-plaka",   title: "Metal Plaka",          slug: "metal-plaka",    type: "service" },
          { id: "mermer-tas",    title: "Mermer / Taş İşleme",  slug: "mermer-tas",     type: "service" },
        ],
      },
      {
        id: "yuzey-isleme", title: "Yüzey İşleme & Boyama", slug: "yuzey-isleme",
        type: "service", icon: "🎨",
        children: [
          { id: "zimparalama",           title: "Zımparalama",                    slug: "zimparalama",           type: "service" },
          { id: "kimyasal-puruzlesme",   title: "Kimyasal Pürüzsüzleştirme",     slug: "kimyasal-puruzlesme",   type: "service" },
          { id: "profesyonel-boyama",    title: "Profesyonel Boyama",             slug: "profesyonel-boyama",    type: "service" },
        ],
      },
    ],
  },

  // ── 2. MÜHENDİSLİK & TEKNİK ÇÖZÜMLER ──────────────────────────────────────
  {
    id:     "muhendislik",
    title:  "Mühendislik",
    slug:   "muhendislik",
    icon:   "🔬",
    accent: "#0ea5e9",
    children: [
      {
        id: "3d-modelleme-tasarim", title: "3D Modelleme & Tasarım", slug: "3d-modelleme",
        type: "service", icon: "🧊",
        children: [
          { id: "mekanik-tasarim",    title: "Mekanik Tasarım",         slug: "mekanik-tasarim",    type: "service" },
          { id: "karakter-organik",   title: "Karakter / Organik",      slug: "karakter-organik",   type: "service" },
          { id: "mimari-modelleme",   title: "Mimari Modelleme",         slug: "mimari-modelleme",   type: "service" },
        ],
      },
      {
        id: "tersine-muhendislik", title: "Tersine Mühendislik", slug: "tersine-muhendislik",
        type: "service", icon: "📡",
        children: [
          { id: "optik-tarama-duzenleme", title: "Optik Tarama Verisi Düzenleme", slug: "optik-tarama",   type: "service" },
          { id: "cad-data",               title: "CAD Data Oluşturma",            slug: "cad-data",        type: "service" },
          { id: "kalite-kontrol",         title: "Kalite Kontrol Raporlama",      slug: "kalite-kontrol",  type: "service" },
        ],
      },
      {
        id: "prototipleme", title: "Prototipleme Hizmetleri", slug: "prototipleme",
        type: "service", icon: "⚗️",
        children: [
          { id: "fonksiyonel-prototip", title: "Fonksiyonel Prototip",   slug: "fonksiyonel-prototip", type: "service" },
          { id: "gorsel-maket",         title: "Görsel Maket",           slug: "gorsel-maket",         type: "service" },
          { id: "az-adetli-seri",       title: "Az Adetli Seri Üretim", slug: "az-adetli-seri",       type: "service" },
        ],
      },
      {
        id: "teknik-danismanlik", title: "Teknik Danışmanlık", slug: "teknik-danismanlik",
        type: "service", icon: "💡",
        children: [
          { id: "arge-destek",    title: "Ar-Ge Proje Desteği",      slug: "arge-destek",     type: "service" },
          { id: "malzeme-analizi",title: "Malzeme Analizi",          slug: "malzeme-analizi", type: "service" },
          { id: "yazici-egitim",  title: "Yazıcı Kurulum & Eğitim", slug: "yazici-egitim",   type: "service" },
        ],
      },
    ],
  },

  // ── 3. MAĞAZA — E-Ticaret & Ekipman ─────────────────────────────────────────
  {
    id:     "magaza",
    title:  "Mağaza",
    slug:   "magaza",
    icon:   "🛍️",
    accent: "#3b82f6",
    children: [
      {
        id: "3d-yazicilar", title: "3D Yazıcılar", slug: "3d-yazicilar",
        type: "product", icon: "🖨️",
        children: [
          { id: "fdm-yazicilar",         title: "FDM Yazıcılar",          slug: "fdm-yazicilar",         type: "product" },
          { id: "recine-yazicilar",      title: "Reçine Yazıcılar",       slug: "recine-yazicilar",      type: "product" },
          { id: "endustriyel-yazicilar", title: "Endüstriyel Yazıcılar",  slug: "endustriyel-yazicilar", type: "product" },
          { id: "ikinci-el-yazicilar",   title: "İkinci El Yazıcılar",    slug: "ikinci-el-yazicilar",   type: "product" },
        ],
      },
      {
        id: "filament-recine-sarf", title: "Filament & Reçine (Sarf)", slug: "filament-recine",
        type: "product", icon: "🧵",
        children: [
          { id: "standart-filamentler",   title: "Standart Filamentler",   slug: "standart-filamentler",   type: "product" },
          { id: "teknik-filamentler",     title: "Teknik Filamentler",     slug: "teknik-filamentler",     type: "product" },
          { id: "standart-recineler",     title: "Standart Reçineler",     slug: "standart-recineler",     type: "product" },
          { id: "muhendislik-recineleri", title: "Mühendislik Reçineleri", slug: "muhendislik-recineleri", type: "product" },
        ],
      },
      {
        id: "yedek-parca-yukseltme", title: "Yedek Parça & Yükseltme", slug: "yedek-parca",
        type: "product", icon: "🔧",
        children: [
          { id: "nozzle-gruplari",  title: "Nozzle Grupları",      slug: "nozzle-gruplari",  type: "product" },
          { id: "hotend-extruder",  title: "Hotend & Extruder",    slug: "hotend-extruder",  type: "product" },
          { id: "anakart-ekran",    title: "Anakart & Ekran",      slug: "anakart-ekran",    type: "product" },
          { id: "mekanik-parcalar", title: "Mekanik Parçalar",     slug: "mekanik-parcalar", type: "product" },
        ],
      },
      {
        id: "atolye-ekipmanlari", title: "Atölye Ekipmanları", slug: "atolye-ekipmanlari",
        type: "product", icon: "🛠️",
        children: [
          { id: "kurutma-yikama",  title: "Kurutma & Yıkama Üniteleri",  slug: "kurutma-yikama",  type: "product" },
          { id: "3d-tarayicilar",  title: "3D Tarayıcılar",              slug: "3d-tarayicilar",  type: "product" },
          { id: "el-aletleri",     title: "El Aletleri & Montaj Setleri",slug: "el-aletleri",     type: "product" },
        ],
      },
    ],
  },

  // ── 4. SANATKAT — Model & Tasarım Pazaryeri ─────────────────────────────────
  {
    id:     "sanatkat",
    title:  "Sanatkat",
    slug:   "sanatkat",
    icon:   "🏛️",
    accent: "#a855f7",
    children: [
      {
        id: "hazir-modeller", title: "Hazır Modeller (STL/OBJ)", slug: "hazir-modeller",
        type: "digital", icon: "📦",
        children: [
          { id: "oyun-figur",       title: "Oyun & Figür",      slug: "oyun-figur",       type: "digital" },
          { id: "ev-dekorasyon",    title: "Ev & Dekorasyon",   slug: "ev-dekorasyon",    type: "digital" },
          { id: "taki-moda",        title: "Takı & Moda",       slug: "taki-moda",        type: "digital" },
          { id: "mekanik-modeller", title: "Mekanik Modeller",  slug: "mekanik-modeller", type: "digital" },
        ],
      },
      {
        id: "sanatci-vitrinleri", title: "Sanatçı & Tasarımcı Vitrinleri", slug: "sanatci-vitrinleri",
        type: "digital", icon: "🎨",
        children: [
          { id: "sinirli-sayi",        title: "Sınırlı Sayıda Eserler", slug: "sinirli-sayi",        type: "digital" },
          { id: "imzali-tasarimlar",   title: "İmzalı Tasarımlar",      slug: "imzali-tasarimlar",   type: "digital" },
          { id: "koleksiyon-paketleri",title: "Koleksiyon Paketleri",   slug: "koleksiyon-paketleri",type: "digital" },
        ],
      },
      {
        id: "hobi-cosplay", title: "Hobi & Cosplay Dünyası", slug: "hobi-cosplay",
        type: "digital", icon: "🎭",
        children: [
          { id: "kask-zirh",     title: "Kask & Zırh Setleri",             slug: "kask-zirh",     type: "digital" },
          { id: "masaustu-oyun", title: "Masaüstü Oyun Aksesuarları",      slug: "masaustu-oyun", type: "digital" },
          { id: "diorama",       title: "Diorama Parçaları",               slug: "diorama",       type: "digital" },
        ],
      },
      {
        id: "egitim-diy", title: "Eğitim & DIY Kitleri", slug: "egitim-diy",
        type: "digital", icon: "📚",
        children: [
          { id: "yazici-yapim-kiti", title: "3D Yazıcı Yapım Kitleri",       slug: "yazici-yapim-kiti", type: "digital" },
          { id: "robotik-setler",    title: "Çocuklar İçin Robotik Setler",  slug: "robotik-setler",    type: "digital" },
          { id: "video-egitim",      title: "Video Eğitim Paketleri",        slug: "video-egitim",      type: "digital" },
        ],
      },
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
