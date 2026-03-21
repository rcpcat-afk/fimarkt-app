// ── PDP Tip Tanımları ─────────────────────────────────────────────────────────

export interface PdpVariantOption {
  id: string;
  label: string;
  value: string;
  price?: number;
  imageIndex?: number;
  inStock: boolean;
  colorHex?: string;
}

export interface PdpVariantGroup {
  id: string;
  label: string;
  type: "color" | "button";
  options: PdpVariantOption[];
}

export interface PdpReview {
  id: string;
  author: string;
  initials: string;
  rating: number;
  date: string;
  title: string;
  body: string;
  verified: boolean;
}

export interface PdpSeller {
  id: string;
  name: string;
  slug: string;
  rating: number;
  reviewCount: number;
  responseRate: number;
  since: string;
  badges: string[];
}

export interface PdpRelatedProduct {
  id: string;
  slug: string;
  title: string;
  price: number;
  image: string;
  brand: string;
}

export interface PdpProduct {
  id: string;
  slug: string;
  title: string;
  brand: string;
  category: string;
  pillar: string;
  images: string[];
  basePrice: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  badge?: string;
  inStock: boolean;
  variantGroups: PdpVariantGroup[];
  description: string;
  specs: { label: string; value: string }[];
  seller: PdpSeller;
  reviews: PdpReview[];
  related: PdpRelatedProduct[];
}

// ── Mock Veri: Ürün 1 ─────────────────────────────────────────────────────────

const bambuP1S: PdpProduct = {
  id: "pdp-001",
  slug: "bambu-lab-p1s",
  title: "Bambu Lab P1S — Kapalı Gövde FDM Yazıcı",
  brand: "Bambu Lab",
  category: "3d-yazicilar",
  pillar: "magaza",
  images: [
    "https://picsum.photos/seed/p1s_a/800/800",
    "https://picsum.photos/seed/p1s_b/800/800",
    "https://picsum.photos/seed/p1s_c/800/800",
    "https://picsum.photos/seed/p1s_d/800/800",
    "https://picsum.photos/seed/p1s_e/800/800",
  ],
  basePrice: 34990,
  originalPrice: 39990,
  rating: 4.9,
  reviewCount: 312,
  badge: "cok-satan",
  inStock: true,
  variantGroups: [
    {
      id: "renk",
      label: "Renk",
      type: "color",
      options: [
        { id: "siyah", label: "Siyah", value: "siyah", colorHex: "#1a1a1a", imageIndex: 0, inStock: true },
        { id: "beyaz", label: "Beyaz", value: "beyaz", colorHex: "#f5f5f5", imageIndex: 1, inStock: true },
      ],
    },
    {
      id: "paket",
      label: "Paket",
      type: "button",
      options: [
        { id: "temel", label: "Sadece Yazıcı", value: "temel", inStock: true },
        { id: "ams", label: "AMS Combo (+5.000 ₺)", value: "ams", price: 39990, inStock: true },
      ],
    },
  ],
  description: `Bambu Lab P1S, kapalı gövde tasarımı ile yüksek performanslı FDM baskı dünyasına yeni bir standart getiriyor. Aktif ısı yönetimi ve gürültü azaltma teknolojisi sayesinde hem ev hem de ofis ortamlarında rahatça kullanılabilir. Dahili HEPA filtre sistemi ile baskı sırasında oluşan partiküller ve uçucu organik bileşikler (VOC) etkin biçimde temizlenir.

500 mm/s'ye ulaşan baskı hızı ve çok eksenli titreşim telafisi (AVC) teknolojisi sayesinde yüksek hızda bile mükemmel yüzey kalitesi elde edilir. 256 x 256 x 256 mm baskı hacmi, prototipten fonksiyonel parçalara kadar geniş bir kullanım yelpazesi sunar. Otomatik yatak seviyeleme, basınç sensörü kalibrasyonu ve akıllı filament algılama sistemi ilk baskıdan itibaren tutarlı sonuçlar almanızı sağlar.

AMS (Otomatik Malzeme Sistemi) ile kombine kullanıldığında dört farklı renkle çok renkli baskı imkânı sunar. Bambu Handy ve Bambu Studio yazılımları ile tam entegrasyon sağlanarak dilimleyiciden makineye kesintisiz bir iş akışı oluşturulur. Wi-Fi, LAN ve SD kart üzerinden uzaktan izleme ve kontrol desteği mevcuttur.`,
  specs: [
    { label: "Baskı Hacmi", value: "256 × 256 × 256 mm" },
    { label: "Maksimum Hız", value: "500 mm/s" },
    { label: "Teknoloji", value: "FDM (Fused Deposition Modeling)" },
    { label: "Isıtmalı Tabla", value: "Evet, maks. 120 °C" },
    { label: "Dosya Formatları", value: ".3mf, .stl, .obj, .step, .amf" },
    { label: "Ağırlık", value: "14,13 kg" },
    { label: "Boyutlar", value: "389 × 389 × 457 mm" },
    { label: "Garanti", value: "1 Yıl Resmi Garanti" },
  ],
  seller: {
    id: "s-001",
    name: "FiTeknik Mağazası",
    slug: "fiteknik",
    rating: 4.8,
    reviewCount: 1240,
    responseRate: 97,
    since: "2021",
    badges: ["Güvenilir Satıcı", "Hızlı Teslimat", "Gold Partner"],
  },
  reviews: [
    {
      id: "r-001",
      author: "Kerem Aydın",
      initials: "KA",
      rating: 5,
      date: "15 Mart 2026",
      title: "Fiyatına göre inanılmaz performans",
      body: "3 aydır aktif olarak kullanıyorum. Her sabah baskıya başlatıp işe gidiyorum, döndüğümde sorunsuz bir şekilde tamamlanmış baskılar buluyorum. Kapalı gövde özellikle ABS ve ASA için büyük fark yaratıyor. Kesinlikle tavsiye ederim.",
      verified: true,
    },
    {
      id: "r-002",
      author: "Selin Öztürk",
      initials: "SO",
      rating: 5,
      date: "28 Şubat 2026",
      title: "Profesyonel prototipleme için ideal",
      body: "Mühendislik alanında prototip üretimi yapıyorum. P1S'in hassasiyeti ve tekrar edilebilirliği beni çok etkiledi. AMS ile birlikte kullanınca çok renkli parçalar mükemmel çıkıyor. Bambu Studio yazılımı da son derece kullanıcı dostu.",
      verified: true,
    },
    {
      id: "r-003",
      author: "Murat Çelik",
      initials: "MC",
      rating: 4,
      date: "10 Şubat 2026",
      title: "Harika yazıcı, küçük bir eksiği var",
      body: "Genel olarak çok memnunum. Hızı ve kalitesi gerçekten üst düzey. Tek eksiğim ekran çözünürlüğünün biraz daha iyi olabilmesini isterdim. Bunun dışında her şey tam not.",
      verified: true,
    },
  ],
  related: [
    {
      id: "rel-001",
      slug: "bambu-lab-a1-mini",
      title: "Bambu Lab A1 Mini — Kompakt FDM Yazıcı",
      price: 14990,
      image: "https://picsum.photos/seed/a1mini/400/400",
      brand: "Bambu Lab",
    },
    {
      id: "rel-002",
      slug: "creality-ender-3-v3",
      title: "Creality Ender-3 V3 — Giriş Seviye FDM",
      price: 8490,
      image: "https://picsum.photos/seed/ender3v3/400/400",
      brand: "Creality",
    },
    {
      id: "rel-003",
      slug: "prusa-mk4s",
      title: "Prusa MK4S — Yüksek Kalite FDM Yazıcı",
      price: 27990,
      image: "https://picsum.photos/seed/prusamk4s/400/400",
      brand: "Prusa Research",
    },
  ],
};

// ── Mock Veri: Ürün 2 ─────────────────────────────────────────────────────────

const bambuPlaBasic: PdpProduct = {
  id: "pdp-002",
  slug: "bambu-lab-pla-basic-siyah",
  title: "Bambu Lab PLA Basic Filament — 1 kg",
  brand: "Bambu Lab",
  category: "filament",
  pillar: "magaza",
  images: [
    "https://picsum.photos/seed/pla_a/800/800",
    "https://picsum.photos/seed/pla_b/800/800",
    "https://picsum.photos/seed/pla_c/800/800",
    "https://picsum.photos/seed/pla_d/800/800",
    "https://picsum.photos/seed/pla_e/800/800",
  ],
  basePrice: 549,
  rating: 4.7,
  reviewCount: 854,
  badge: "cok-satan",
  inStock: true,
  variantGroups: [
    {
      id: "renk",
      label: "Renk",
      type: "color",
      options: [
        { id: "siyah",   label: "Siyah",   value: "siyah",   colorHex: "#1a1a1a", imageIndex: 0, inStock: true },
        { id: "beyaz",   label: "Beyaz",   value: "beyaz",   colorHex: "#f5f5f5", imageIndex: 1, inStock: true },
        { id: "kirmizi", label: "Kırmızı", value: "kirmizi", colorHex: "#ef4444", imageIndex: 2, inStock: true },
        { id: "mavi",    label: "Mavi",    value: "mavi",    colorHex: "#3b82f6", imageIndex: 3, inStock: true },
        { id: "yesil",   label: "Yeşil",   value: "yesil",   colorHex: "#22c55e", imageIndex: 4, inStock: true },
      ],
    },
    {
      id: "cap",
      label: "Çap",
      type: "button",
      options: [
        { id: "175", label: "1.75 mm", value: "1.75", inStock: true },
      ],
    },
  ],
  description: `Bambu Lab PLA Basic, sıradan bir filament değildir. Titiz kalite kontrol süreçlerinden geçen her makara, hassas çap toleransı (±0,03 mm) ve homojen renk dağılımı ile üretilir. Bu sayede baskı sırasında ekstrüzyon sorunları, tıkanmalar ve renk tutarsızlıkları yaşamadan mükemmel yüzey kalitesi elde edersiniz.

Özellikle Bambu Lab yazıcıları için optimize edilmiş profilleri sayesinde RFID okuma ile otomatik filament tanıma sağlanır. Bambu Studio, filamanı tanıdığında sıcaklık, hız ve soğutma ayarlarını otomatik olarak optimum değerlere getirir; siz sadece baskı düğmesine basarsınız.

Geniş renk yelpazesi ile prototipler, hobi projeleri, dekoratif objeler ve fonksiyonel parçalar için ideal olan PLA Basic; biyobozunur yapısı ile çevre dostu bir tercih sunar. 1 kg net ağırlık ile uzun süreli projelerde ekonomik kullanım imkânı sağlar.`,
  specs: [
    { label: "Malzeme", value: "PLA (Polylactic Acid)" },
    { label: "Çap", value: "1.75 mm (±0.03 mm)" },
    { label: "Net Ağırlık", value: "1.000 g" },
    { label: "Baskı Sıcaklığı", value: "190 – 240 °C" },
    { label: "Tabla Sıcaklığı", value: "35 – 45 °C (opsiyonel)" },
    { label: "Renk", value: "Siyah (ve diğer seçenekler)" },
    { label: "Uyumluluk", value: "Tüm FDM yazıcılar, özellikle Bambu Lab serisi" },
  ],
  seller: {
    id: "s-005",
    name: "Filament Dükkânı",
    slug: "filament-dukkani",
    rating: 4.7,
    reviewCount: 892,
    responseRate: 94,
    since: "2020",
    badges: ["Güvenilir Satıcı", "Ücretsiz Kargo"],
  },
  reviews: [
    {
      id: "r-004",
      author: "Ahmet Yılmaz",
      initials: "AY",
      rating: 5,
      date: "20 Mart 2026",
      title: "En iyi PLA filament",
      body: "Bambu Lab filamentlerini diğer markalarla karşılaştırdım. Çap tutarlılığı ve yüzey kalitesi açısından açık ara en iyi. Hiç tıkanma yaşamadım, her renkten stokta bulundurmaya başladım.",
      verified: true,
    },
    {
      id: "r-005",
      author: "Deniz Kaya",
      initials: "DK",
      rating: 5,
      date: "5 Mart 2026",
      title: "RFID özelliği harika",
      body: "Bambu Lab P1S yazıcımda RFID ile otomatik tanıma mükemmel çalışıyor. Filament değiştirince yazıcı anında profil yükleyip optimize ediyor. Baskı kalitesi de gerçekten üst düzey.",
      verified: true,
    },
    {
      id: "r-006",
      author: "Elif Şahin",
      initials: "ES",
      rating: 4,
      date: "18 Şubat 2026",
      title: "Kaliteli ürün, fiyat biraz yüksek",
      body: "Filament kalitesi tartışmasız çok iyi. Renk homojenliği ve yüzey kalitesi mükemmel. Tek şikayetim fiyatının biraz yüksek olması, ama kalitesi düşünüldüğünde almaya değer.",
      verified: false,
    },
  ],
  related: [
    {
      id: "rel-004",
      slug: "bambu-lab-pla-matte-beyaz",
      title: "Bambu Lab PLA Matte — Beyaz 1 kg",
      price: 649,
      image: "https://picsum.photos/seed/plamatte/400/400",
      brand: "Bambu Lab",
    },
    {
      id: "rel-005",
      slug: "bambu-lab-petg-basic-siyah",
      title: "Bambu Lab PETG Basic — Siyah 1 kg",
      price: 699,
      image: "https://picsum.photos/seed/petgbasic/400/400",
      brand: "Bambu Lab",
    },
    {
      id: "rel-006",
      slug: "creality-hyper-pla-siyah",
      title: "Creality Hyper PLA — Siyah 1 kg",
      price: 389,
      image: "https://picsum.photos/seed/hyperpla/400/400",
      brand: "Creality",
    },
  ],
};

// ── Tüm Ürünler ──────────────────────────────────────────────────────────────

const PDP_PRODUCTS: PdpProduct[] = [bambuP1S, bambuPlaBasic];

// ── Yardımcı Fonksiyon ────────────────────────────────────────────────────────

export function getPdpProduct(slug: string): PdpProduct | null {
  return PDP_PRODUCTS.find((p) => p.slug === slug) ?? null;
}
