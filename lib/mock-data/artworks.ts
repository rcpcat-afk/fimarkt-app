// ─── Fimarkt Sanatkat Mock Data ───────────────────────────────────────────────

export type ArtworkCategory = "heykel" | "mimari" | "karakter" | "organik" | "makine" | "sanat";
export type ArtworkBadge    = "yeni" | "one-cikan" | "cok-indirilen" | "ucretsiz" | "stokta-az";
export type ArtworkAspect   = "portrait" | "landscape" | "square";

export interface ArtworkMake {
  userId:     string;
  username:   string;
  avatarSeed: string;
  imageSeed:  string;
  date:       string;
}

export interface Artwork {
  id:              string;
  slug:            string;
  title:           string;
  description:     string;
  artistSlug:      string;
  artistName:      string;
  imageSeed:       string;
  additionalSeeds: string[];
  aspectRatio:     ArtworkAspect;

  // ── Ürün tipi ────────────────────────────────────────────────────────────────
  isDigital:       boolean;
  price:           number;
  originalPrice?:  number;
  isFree:          boolean;        // sadece dijital ürünlerde geçerli

  // ── Sadece dijital ürünlerde ─────────────────────────────────────────────────
  fileFormat?:     "stl" | "obj" | "fbx" | "blend";
  polygonCount?:   number;         // thousand
  printSettings?:  {
    layerHeight: string;
    infill:      string;
    supports:    boolean;
    material:    string;
    printTime:   string;
  };
  downloadsCount?: number;
  license?:        "kisisel" | "ticari";

  // ── Sadece fiziksel ürünlerde ────────────────────────────────────────────────
  physicalMaterial?: string;       // ör. "PLA+", "Reçine", "Bronz kaplı"
  dimensions?:       string;       // ör. "12 × 8 × 6 cm"
  weight?:           string;       // ör. "~180g"
  stock?:            number;       // mevcut stok adedi

  // ── Ortak ───────────────────────────────────────────────────────────────────
  category:       ArtworkCategory;
  likesCount:     number;
  makesCount:     number;          // dijital: kaç kişi bastı; fiziksel: satış adedi
  makes:          ArtworkMake[];
  tags:           string[];
  badge?:         ArtworkBadge;
  rating:         number;
  reviewCount:    number;
}

// ── Artwork image URL helper ───────────────────────────────────────────────────
export function artworkImageUrl(seed: string, aspect: ArtworkAspect): string {
  const dims: Record<ArtworkAspect, string> = {
    portrait:  "600/800",
    landscape: "800/450",
    square:    "600/600",
  };
  return `https://picsum.photos/seed/${seed}/${dims[aspect]}`;
}

// ── Artist avatar / cover helpers ─────────────────────────────────────────────
export function artistAvatarUrl(seed: string): string {
  return `https://picsum.photos/seed/${seed}/200/200`;
}
export function artistCoverUrl(seed: string): string {
  return `https://picsum.photos/seed/${seed}/1200/300`;
}

// ── Data ──────────────────────────────────────────────────────────────────────
const ARTWORKS: Artwork[] = [
  {
    id: "aw-001",
    slug: "anadolu-maskesi",
    title: "Anadolu Maskesi",
    description:
      "Hitit mitolojisinden ilham alan, yüksek detaylı büst maskesi. Gerçek Hitit arkeolojik buluntularını referans alarak tasarlanmıştır. Support-free olarak tasarlanmış, 0.15mm katman kalınlığıyla mükemmel detay alır.",
    artistSlug: "mert-karakoc",
    artistName: "Mert Karakoç",
    imageSeed: "anadolu_maske",
    additionalSeeds: ["anadolu_maske_2", "anadolu_maske_3"],
    aspectRatio: "portrait",
    isDigital: true,
    price: 149,
    isFree: false,
    fileFormat: "stl",
    polygonCount: 256,
    printSettings: {
      layerHeight: "0.15mm",
      infill: "%20",
      supports: false,
      material: "PLA / Reçine",
      printTime: "9 saat",
    },
    category: "heykel",
    likesCount: 2840,
    downloadsCount: 1230,
    makesCount: 87,
    makes: [
      { userId: "u1",  username: "can_basar",    avatarSeed: "u1_av",  imageSeed: "make_maske_1", date: "2026-03-10" },
      { userId: "u2",  username: "elif_prints",  avatarSeed: "u2_av",  imageSeed: "make_maske_2", date: "2026-02-28" },
      { userId: "u3",  username: "tahsin3d",     avatarSeed: "u3_av",  imageSeed: "make_maske_3", date: "2026-02-15" },
    ],
    tags: ["hitit", "maske", "büst", "mitoloji", "anadolu"],
    badge: "one-cikan",
    rating: 4.9,
    reviewCount: 148,
    license: "kisisel",
  },
  {
    id: "aw-002",
    slug: "gotik-can-kulesi",
    title: "Gotik Çan Kulesi",
    description:
      "Neo-gotik mimari elemanlardan ilham alan, baskıya hazır parametrik çan kulesi. Parçalı yapısı sayesinde büyük formatta bile ev yazıcılarıyla üretilebilir.",
    artistSlug: "zeynep-aydin",
    artistName: "Zeynep Aydın",
    imageSeed: "gotik_kule",
    additionalSeeds: ["gotik_kule_2", "gotik_kule_3"],
    aspectRatio: "portrait",
    isDigital: true,
    price: 89,
    originalPrice: 129,
    isFree: false,
    fileFormat: "stl",
    polygonCount: 180,
    printSettings: {
      layerHeight: "0.2mm",
      infill: "%15",
      supports: true,
      material: "PLA / PETG",
      printTime: "12 saat",
    },
    category: "mimari",
    likesCount: 1640,
    downloadsCount: 870,
    makesCount: 54,
    makes: [
      { userId: "u4", username: "gorkem_maker", avatarSeed: "u4_av", imageSeed: "make_kule_1", date: "2026-03-05" },
      { userId: "u5", username: "prusa_pro",    avatarSeed: "u5_av", imageSeed: "make_kule_2", date: "2026-02-20" },
    ],
    tags: ["gotik", "kule", "mimari", "parametrik"],
    badge: "yeni",
    rating: 4.7,
    reviewCount: 63,
    license: "kisisel",
  },
  {
    id: "aw-003",
    slug: "uzay-kasifi",
    title: "Uzay Kaşifi",
    description:
      "Retrofütürist tarzda uzay keşifçisi karakter figürü. Tam eklem detayları ve modüler kask seçenekleriyle gelir. Hem tek parça hem eklemli (articulated) versiyonları pakete dahildir.",
    artistSlug: "kerem-yilmaz",
    artistName: "Kerem Yılmaz",
    imageSeed: "uzay_kasifi",
    additionalSeeds: ["uzay_kasifi_2", "uzay_kasifi_3"],
    aspectRatio: "square",
    isDigital: true,
    price: 79,
    isFree: false,
    fileFormat: "stl",
    polygonCount: 320,
    printSettings: {
      layerHeight: "0.15mm",
      infill: "%25",
      supports: true,
      material: "PLA / ABS",
      printTime: "16 saat",
    },
    category: "karakter",
    likesCount: 980,
    downloadsCount: 430,
    makesCount: 31,
    makes: [
      { userId: "u6", username: "neon_layer", avatarSeed: "u6_av", imageSeed: "make_kasif_1", date: "2026-03-12" },
    ],
    tags: ["uzay", "karakter", "scifi", "astronot", "figür"],
    badge: "yeni",
    rating: 4.6,
    reviewCount: 42,
    license: "kisisel",
  },
  {
    id: "aw-004",
    slug: "yaprak-vazo",
    title: "Yaprak Vazo",
    description:
      "Yaprak damarlarından ilham alan organik vazo. Support gerektirmez, taban sağlamdır. Herhangi bir 0.4mm nozzle ile mükemmel sonuç alırsınız. Ücretsiz sunulmaktadır — 'Ben de Bastım' görseli paylaşmayı unutmayın!",
    artistSlug: "asli-demir",
    artistName: "Aslı Demir",
    imageSeed: "yaprak_vazo",
    additionalSeeds: ["yaprak_vazo_2"],
    aspectRatio: "portrait",
    isDigital: true,
    price: 0,
    isFree: true,
    fileFormat: "stl",
    polygonCount: 95,
    printSettings: {
      layerHeight: "0.2mm",
      infill: "%10",
      supports: false,
      material: "PLA / PETG",
      printTime: "4 saat",
    },
    category: "organik",
    likesCount: 5320,
    downloadsCount: 8940,
    makesCount: 612,
    makes: [
      { userId: "u7",  username: "selin_craft", avatarSeed: "u7_av",  imageSeed: "make_vazo_1", date: "2026-03-15" },
      { userId: "u8",  username: "baris_3d",    avatarSeed: "u8_av",  imageSeed: "make_vazo_2", date: "2026-03-10" },
      { userId: "u9",  username: "filamentci",  avatarSeed: "u9_av",  imageSeed: "make_vazo_3", date: "2026-03-08" },
      { userId: "u10", username: "maker_hasan", avatarSeed: "u10_av", imageSeed: "make_vazo_4", date: "2026-02-25" },
    ],
    tags: ["vazo", "yaprak", "organik", "ücretsiz", "dekorasyon"],
    badge: "cok-indirilen",
    rating: 4.8,
    reviewCount: 392,
    license: "kisisel",
  },
  {
    id: "aw-005",
    slug: "horus-bustu",
    title: "Horus Büstü",
    description:
      "Mısır tanrısı Horus'un yüksek detaylı heykel büstü. Reçine baskı için optimize edilmiş 450K polygon detayı. Büyük format FDM için düşük-poly versiyonu da pakete dahil.",
    artistSlug: "mert-karakoc",
    artistName: "Mert Karakoç",
    imageSeed: "horus_bust",
    additionalSeeds: ["horus_bust_2", "horus_bust_3", "horus_bust_4"],
    aspectRatio: "portrait",
    isDigital: true,
    price: 199,
    isFree: false,
    fileFormat: "stl",
    polygonCount: 450,
    printSettings: {
      layerHeight: "0.05mm",
      infill: "%0",
      supports: true,
      material: "Reçine (önerilir) / PLA",
      printTime: "18 saat",
    },
    category: "heykel",
    likesCount: 3890,
    downloadsCount: 1870,
    makesCount: 134,
    makes: [
      { userId: "u11", username: "resin_wizard",  avatarSeed: "u11_av", imageSeed: "make_horus_1", date: "2026-03-18" },
      { userId: "u12", username: "sculptor_tr",   avatarSeed: "u12_av", imageSeed: "make_horus_2", date: "2026-03-02" },
      { userId: "u3",  username: "tahsin3d",      avatarSeed: "u3_av",  imageSeed: "make_horus_3", date: "2026-02-20" },
    ],
    tags: ["horus", "mısır", "büst", "mitoloji", "reçine"],
    badge: "one-cikan",
    rating: 4.9,
    reviewCount: 213,
    license: "kisisel",
  },
  {
    id: "aw-006",
    slug: "mekanik-kalp",
    title: "Mekanik Kalp",
    description:
      "Steampunk tarzı, hareket eden parçalara sahip mekanik kalp. 12 ayrı baskı parçasından oluşur, montaj talimatı PDF ile birlikte gelir. Tüm dişliler gerçekte birbirini döndürür.",
    artistSlug: "kerem-yilmaz",
    artistName: "Kerem Yılmaz",
    imageSeed: "mekanik_kalp",
    additionalSeeds: ["mekanik_kalp_2", "mekanik_kalp_3"],
    aspectRatio: "square",
    isDigital: true,
    price: 129,
    isFree: false,
    fileFormat: "obj",
    polygonCount: 215,
    printSettings: {
      layerHeight: "0.15mm",
      infill: "%40",
      supports: false,
      material: "PETG / PLA",
      printTime: "22 saat (tüm parçalar)",
    },
    category: "makine",
    likesCount: 1780,
    downloadsCount: 650,
    makesCount: 48,
    makes: [
      { userId: "u13", username: "disli_usta",    avatarSeed: "u13_av", imageSeed: "make_kalp_1", date: "2026-03-14" },
      { userId: "u14", username: "steam_punk_tr", avatarSeed: "u14_av", imageSeed: "make_kalp_2", date: "2026-02-28" },
    ],
    tags: ["steampunk", "mekanik", "kalp", "dişli", "hareketli"],
    rating: 4.7,
    reviewCount: 78,
    license: "kisisel",
  },
  {
    id: "aw-007",
    slug: "kafes-kure",
    title: "Kafes Küre",
    description:
      "Birbirinin içine geçmiş kafes formlarından oluşan dekoratif küre. Tek parça olarak basılır, hiçbir support veya montaj gerektirmez. Masanızı şık bir dekorasyon parçasıyla süsleyin.",
    artistSlug: "zeynep-aydin",
    artistName: "Zeynep Aydın",
    imageSeed: "kafes_kure",
    additionalSeeds: ["kafes_kure_2"],
    aspectRatio: "square",
    isDigital: true,
    price: 0,
    isFree: true,
    fileFormat: "stl",
    polygonCount: 88,
    printSettings: {
      layerHeight: "0.2mm",
      infill: "%0",
      supports: false,
      material: "PLA / PETG / ABS",
      printTime: "6 saat",
    },
    category: "sanat",
    likesCount: 4210,
    downloadsCount: 7620,
    makesCount: 520,
    makes: [
      { userId: "u15", username: "geometri_fan", avatarSeed: "u15_av", imageSeed: "make_kure_1", date: "2026-03-16" },
      { userId: "u16", username: "ev_dekor",     avatarSeed: "u16_av", imageSeed: "make_kure_2", date: "2026-03-11" },
      { userId: "u17", username: "bambu_user",   avatarSeed: "u17_av", imageSeed: "make_kure_3", date: "2026-03-05" },
    ],
    tags: ["küre", "kafes", "geometri", "ücretsiz", "dekorasyon"],
    badge: "cok-indirilen",
    rating: 4.8,
    reviewCount: 445,
    license: "kisisel",
  },
  {
    id: "aw-008",
    slug: "dalgali-kabuk",
    title: "Dalgalı Kabuk",
    description:
      "Deniz kabuğu formlarından ilham alan asimetrik kase. PETG ile baskı alınması halinde su geçirmez özellik kazanır. Yemek masası veya dekor olarak kullanılabilir.",
    artistSlug: "asli-demir",
    artistName: "Aslı Demir",
    imageSeed: "dalgali_kabuk",
    additionalSeeds: ["dalgali_kabuk_2"],
    aspectRatio: "landscape",
    isDigital: true,
    price: 59,
    isFree: false,
    fileFormat: "stl",
    polygonCount: 170,
    printSettings: {
      layerHeight: "0.2mm",
      infill: "%15",
      supports: false,
      material: "PETG (su geçirmez) / PLA",
      printTime: "7 saat",
    },
    category: "organik",
    likesCount: 1240,
    downloadsCount: 520,
    makesCount: 39,
    makes: [
      { userId: "u18", username: "mutfak_3d", avatarSeed: "u18_av", imageSeed: "make_kabuk_1", date: "2026-03-09" },
    ],
    tags: ["kabuk", "kase", "organik", "deniz", "dekorasyon"],
    rating: 4.6,
    reviewCount: 55,
    license: "kisisel",
  },
  {
    id: "aw-009",
    slug: "ejderha-kafasi",
    title: "Ejderha Kafası",
    description:
      "Oriental tarzda, yüksek detaylı ejderha kafası duvar dekoru. Duvara monte askı sistemi dahildir. Büyük format baskı veya reçine için optimize edilmiştir.",
    artistSlug: "kerem-yilmaz",
    artistName: "Kerem Yılmaz",
    imageSeed: "ejderha_kafasi",
    additionalSeeds: ["ejderha_kafasi_2", "ejderha_kafasi_3"],
    aspectRatio: "portrait",
    isDigital: true,
    price: 199,
    originalPrice: 249,
    isFree: false,
    fileFormat: "obj",
    polygonCount: 580,
    printSettings: {
      layerHeight: "0.1mm",
      infill: "%10",
      supports: true,
      material: "Reçine / PLA",
      printTime: "28 saat",
    },
    category: "karakter",
    likesCount: 2560,
    downloadsCount: 980,
    makesCount: 72,
    makes: [
      { userId: "u19", username: "dragon_maker", avatarSeed: "u19_av", imageSeed: "make_ejderha_1", date: "2026-03-17" },
      { userId: "u20", username: "resin_caster",  avatarSeed: "u20_av", imageSeed: "make_ejderha_2", date: "2026-03-01" },
    ],
    tags: ["ejderha", "fantezi", "duvar dekoru", "oriental", "mitoloji"],
    badge: "one-cikan",
    rating: 4.8,
    reviewCount: 124,
    license: "kisisel",
  },
  {
    id: "aw-010",
    slug: "osmanli-minare",
    title: "Osmanlı Minaresi",
    description:
      "Geleneksel Osmanlı mimari detaylarını modern 3D baskıyla buluşturan minyatür minare. Cami maketi veya koleksiyon amaçlı kullanılabilir. Tüm detaylar 0.2mm katmanda eksiksiz çıkar.",
    artistSlug: "zeynep-aydin",
    artistName: "Zeynep Aydın",
    imageSeed: "osmanli_minare",
    additionalSeeds: ["osmanli_minare_2"],
    aspectRatio: "portrait",
    isDigital: true,
    price: 89,
    isFree: false,
    fileFormat: "stl",
    polygonCount: 220,
    printSettings: {
      layerHeight: "0.2mm",
      infill: "%20",
      supports: true,
      material: "PLA / Reçine",
      printTime: "11 saat",
    },
    category: "mimari",
    likesCount: 1890,
    downloadsCount: 740,
    makesCount: 58,
    makes: [
      { userId: "u21", username: "tarih_sever", avatarSeed: "u21_av", imageSeed: "make_minare_1", date: "2026-03-13" },
    ],
    tags: ["osmanlı", "minare", "mimari", "tarihi", "minyatür"],
    rating: 4.7,
    reviewCount: 89,
    license: "kisisel",
  },

  // ── Fiziksel Ürünler ──────────────────────────────────────────────────────────
  {
    id: "aw-011",
    slug: "köklu-agac-heykeli",
    title: "Köklü Ağaç Heykeli",
    description:
      "Bronz kaplama PLA+ ile üretilmiş, elle cilalanmış dekoratif ağaç heykeli. Mert Karakoç'un özgün tasarımı, sınırlı üretim. Karton kutu + sertifika ile teslim edilir.",
    artistSlug: "mert-karakoc",
    artistName: "Mert Karakoç",
    imageSeed: "agac_heykel",
    additionalSeeds: ["agac_heykel_2", "agac_heykel_3"],
    aspectRatio: "portrait",
    isDigital: false,
    price: 490,
    originalPrice: 650,
    isFree: false,
    physicalMaterial: "Bronz kaplama PLA+",
    dimensions: "18 × 12 × 8 cm",
    weight: "~320g",
    stock: 4,
    category: "heykel",
    likesCount: 1240,
    makesCount: 23,
    makes: [],
    tags: ["ağaç", "heykel", "bronz", "dekorasyon", "sınırlı üretim"],
    badge: "stokta-az",
    rating: 4.9,
    reviewCount: 28,
  },
  {
    id: "aw-012",
    slug: "dalgali-kase-fiziksel",
    title: "Dalgalı Kase — Fiziksel",
    description:
      "Aslı Demir'in Dalgalı Kabuk tasarımının PETG ile üretilmiş, elle zımparalanmış ve parlatılmış fiziksel versiyonu. Yemek masasında kullanıma uygundur. Gıda güvenli kaplama uygulanmıştır.",
    artistSlug: "asli-demir",
    artistName: "Aslı Demir",
    imageSeed: "dalgali_kase_fiziksel",
    additionalSeeds: ["dalgali_kase_2"],
    aspectRatio: "landscape",
    isDigital: false,
    price: 280,
    isFree: false,
    physicalMaterial: "PETG + gıda güvenli kaplama",
    dimensions: "22 × 16 × 6 cm",
    weight: "~190g",
    stock: 9,
    category: "organik",
    likesCount: 870,
    makesCount: 41,
    makes: [],
    tags: ["kase", "organik", "sofra", "dekorasyon", "fiziksel"],
    rating: 4.8,
    reviewCount: 44,
  },
];

export function getArtwork(slug: string): Artwork | null {
  return ARTWORKS.find((a) => a.slug === slug) ?? null;
}

export function getAllArtworks(): Artwork[] {
  return ARTWORKS;
}

export function getArtworksByArtist(artistSlug: string): Artwork[] {
  return ARTWORKS.filter((a) => a.artistSlug === artistSlug);
}

export function getArtworksByCategory(category: ArtworkCategory): Artwork[] {
  return ARTWORKS.filter((a) => a.category === category);
}
