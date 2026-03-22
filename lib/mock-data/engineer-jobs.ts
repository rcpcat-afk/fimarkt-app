// ─── Mühendis İş Havuzu Mock Verisi ──────────────────────────────────────────
// Open RFQ'lar (teklif bekleyenler) + bid geçmişi (bekleyen/kazanılan)
// App tarafıyla birebir aynı — fimarkt-app/lib/mock-data/engineer-jobs.ts

export type JobCategory =
  | "industrial_design"
  | "character_modeling"
  | "architectural"
  | "mechanical"
  | "medical"
  | "jewelry"
  | "reverse_engineering";

export type JobStatus    = "open" | "closed" | "awarded";
export type BidStatus    = "pending" | "won" | "lost";
export type UrgencyLevel = "low" | "medium" | "high";

export interface JobAttachment {
  name:      string;
  type:      "image" | "reference" | "file";
  emoji:     string;
}

export interface RFQJob {
  id:            string;
  title:         string;
  category:      JobCategory;
  budgetMin:     number;
  budgetMax:     number;
  deadlineDays:  number;           // müşteri istediği teslim süresi
  urgency:       UrgencyLevel;
  status:        JobStatus;
  postedAt:      string;           // ISO
  description:   string;
  requirements:  string[];
  attachments:   JobAttachment[];
  bidCount:      number;
  thumbnailEmoji:string;
  thumbnailBg:   string;
  customer: {
    name:     string;
    initials: string;
    rating:   number;             // 1–5
    jobsDone: number;
  };
}

export interface MyBid {
  jobId:        string;
  jobTitle:     string;
  category:     JobCategory;
  thumbnailEmoji: string;
  thumbnailBg:  string;
  bidStatus:    BidStatus;
  myPrice:      number;
  myDays:       number;
  myCoverLetter:string;
  submittedAt:  string;           // ISO
  // Kazanılan bids için
  projectValue?: number;
  completedAt?:  string;
  clientName?:  string;
}

// ─── Kategori Etiketleri ─────────────────────────────────────────────────────
export const CATEGORY_LABELS: Record<JobCategory, string> = {
  industrial_design:  "Endüstriyel Tasarım",
  character_modeling: "Karakter Modelleme",
  architectural:      "Mimari",
  mechanical:         "Mekanik Parça",
  medical:            "Medikal",
  jewelry:            "Mücevher & Takı",
  reverse_engineering:"Tersine Mühendislik",
};

// ─── Açık RFQ İşleri ─────────────────────────────────────────────────────────
export const OPEN_JOBS: RFQJob[] = [
  // ── 1. Drone Pervanesi ──────────────────────────────────────────────────────
  {
    id:             "job-001",
    title:          "FPV Drone için Özel 5\" Pervane Tasarımı",
    category:       "mechanical",
    budgetMin:      800,
    budgetMax:      1500,
    deadlineDays:   7,
    urgency:        "high",
    status:         "open",
    postedAt:       "2024-03-22T08:00:00Z",
    bidCount:       6,
    thumbnailEmoji: "🚁",
    thumbnailBg:    "#0f172a",
    description:    "5 inç FPV yarış dronu için optimize edilmiş özel pervane takımı istiyorum. Mevcut değil veya piyasada bulunan standart tasarımlar yetersiz kalıyor. Hem ön hem arka pervane setini kapsayan 4 adet STL dosyası gerekiyor.",
    requirements:   [
      "4 bıçaklı, pitch: 4.1 inch",
      "Merkez delik: 5mm motor mili uyumlu",
      "Balans: minimum titreşim için optimize",
      "Format: STL + STEP dosyaları",
      "Sonlu Elemanlar Analizi raporu (opsiyonel ama tercih edilir)",
    ],
    attachments:    [
      { name: "drone_frame_ref.jpg", type: "reference", emoji: "🖼️" },
      { name: "motor_specs.pdf",     type: "file",      emoji: "📄" },
    ],
    customer: { name: "Kerem Arslan", initials: "KA", rating: 4.8, jobsDone: 12 },
  },

  // ── 2. Kırık Vazo Modelleme ─────────────────────────────────────────────────
  {
    id:             "job-002",
    title:          "Osmanlı Dönemi Vazonun Dijital Restorasyon Modeli",
    category:       "reverse_engineering",
    budgetMin:      500,
    budgetMax:      900,
    deadlineDays:   14,
    urgency:        "low",
    status:         "open",
    postedAt:       "2024-03-21T14:30:00Z",
    bidCount:       3,
    thumbnailEmoji: "🏺",
    thumbnailBg:    "#1c1410",
    description:    "Elimde Osmanlı dönemine ait kırık ve eksik parçalı bir vazo var. Fotoğraflardan yola çıkarak tamamlanmış 3D modelini istiyorum. Sonrasında filament ile baskı yapılıp orijinal parçayla birleştirilecek.",
    requirements:   [
      "Referans fotoğraflardan yüzey rekonstrüksiyonu",
      "Yüksek polikon yüzey detayı (min 500k poly)",
      "Orijinal parçayla örtüşen montaj toleransı",
      "Çıktı: STL (baskı ready) + OBJ (render için)",
    ],
    attachments:    [
      { name: "vazo_foto_1.jpg",  type: "image",     emoji: "📷" },
      { name: "vazo_foto_2.jpg",  type: "image",     emoji: "📷" },
      { name: "olculer.jpg",      type: "reference", emoji: "📐" },
    ],
    customer: { name: "Ayşe Çelik", initials: "AÇ", rating: 4.5, jobsDone: 3 },
  },

  // ── 3. Medikal Protez Bileşeni ──────────────────────────────────────────────
  {
    id:             "job-003",
    title:          "Üst Kol Protezi için Özelleştirilebilir El Tutucu",
    category:       "medical",
    budgetMin:      2000,
    budgetMax:      4000,
    deadlineDays:   21,
    urgency:        "medium",
    status:         "open",
    postedAt:       "2024-03-20T10:00:00Z",
    bidCount:       9,
    thumbnailEmoji: "🦾",
    thumbnailBg:    "#0c1929",
    description:    "Üst kol amputasyonu geçirmiş yetişkin bir kullanıcı için, günlük yaşamda kalem ve kaşık tutmaya yarayan modüler el tutucu tasarımı. Thingiverse'deki E-NABLE projesine benzer ama farklı boyut/bağlantı noktaları gerekiyor.",
    requirements:   [
      "ISO 10328 standartlarına uygun yük analizi",
      "Parametrik tasarım: 3 farklı kol boyutu için ölçeklendirilebilir",
      "Baskı malzemesi: PETG veya Nylon (PLA değil)",
      "Vidasz ve yapıştırıcısız montaj",
      "Gerekli konfigürasyon talimatı PDF dahil",
    ],
    attachments:    [
      { name: "kolcuk_olcu.pdf",     type: "file",      emoji: "📋" },
      { name: "referans_model.stl",  type: "reference", emoji: "📦" },
    ],
    customer: { name: "Dr. Mehmet Yıldız", initials: "MY", rating: 5.0, jobsDone: 7 },
  },

  // ── 4. Mimari Maket ─────────────────────────────────────────────────────────
  {
    id:             "job-004",
    title:          "Boğaz Köprüsü Minyatür Mimari Maketi (1:500)",
    category:       "architectural",
    budgetMin:      1200,
    budgetMax:      2200,
    deadlineDays:   10,
    urgency:        "medium",
    status:         "open",
    postedAt:       "2024-03-22T11:00:00Z",
    bidCount:       5,
    thumbnailEmoji: "🌉",
    thumbnailBg:    "#101828",
    description:    "Mimarlık öğrencisi olarak bitirme projem için 1:500 ölçekli köprü maketi istiyorum. FDM yazıcıda parçalı olarak basılacak, sonra monte edilecek. Kablolar ve pilonlar ayrı parçalar olmalı.",
    requirements:   [
      "1:500 ölçek, toplam uzunluk ~30cm",
      "Parçalı (8–12 adet) montaj tasarımı",
      "Pylon yüksekliği minimum 8cm",
      "Kablo simülasyonu filament ile",
      "Baskı toleransı: 0.3mm boşluk yeterli",
    ],
    attachments:    [
      { name: "kopru_plan.dwg",  type: "file",      emoji: "📐" },
      { name: "referans.jpg",    type: "image",     emoji: "🖼️" },
    ],
    customer: { name: "Selin Kaya", initials: "SK", rating: 4.2, jobsDone: 1 },
  },
];

// ─── Mühendisin Kendi Teklifleri ─────────────────────────────────────────────
export const MY_BIDS: MyBid[] = [
  // Bekleyen — yanıt bekleniyor
  {
    jobId:          "job-010",
    jobTitle:       "RC Araba Gövde Tasarımı (Drift)",
    category:       "mechanical",
    thumbnailEmoji: "🏎️",
    thumbnailBg:    "#1a0a0a",
    bidStatus:      "pending",
    myPrice:        650,
    myDays:         5,
    myCoverLetter:  "5 yıldır RC araç parçaları üzerinde çalışıyorum. Aeredinamik drag katsayısı optimizasyonu konusunda deneyimim var. Referans portföyüm için DM atabilirsiniz.",
    submittedAt:    "2024-03-21T16:00:00Z",
  },
  {
    jobId:          "job-011",
    jobTitle:       "Kahve Makinesi Gövde Parça Replika",
    category:       "reverse_engineering",
    thumbnailEmoji: "☕",
    thumbnailBg:    "#150f08",
    bidStatus:      "pending",
    myPrice:        420,
    myDays:         3,
    myCoverLetter:  "Tersine mühendislik konusunda 3+ yıl deneyimim var. Calipers ve fotoğraflardan hassas ölçü çıkarmak benim uzmanlık alanım.",
    submittedAt:    "2024-03-22T09:15:00Z",
  },

  // Kazanılan
  {
    jobId:          "job-008",
    jobTitle:       "Çocuk Oyuncak Figür Karakter Seti",
    category:       "character_modeling",
    thumbnailEmoji: "🧸",
    thumbnailBg:    "#1a1028",
    bidStatus:      "won",
    myPrice:        1100,
    myDays:         8,
    myCoverLetter:  "ZBrush ve Blender ile 50+ karakter tasarladım.",
    submittedAt:    "2024-03-10T10:00:00Z",
    projectValue:   1100,
    completedAt:    "2024-03-18T17:00:00Z",
    clientName:     "Oyuncak Dünyası A.Ş.",
  },
  {
    jobId:          "job-007",
    jobTitle:       "Altın Yüzük Mücevher Kalıbı",
    category:       "jewelry",
    thumbnailEmoji: "💍",
    thumbnailBg:    "#1a1400",
    bidStatus:      "won",
    myPrice:        750,
    myDays:         4,
    myCoverLetter:  "Kuyumcu kalıp tasarımında Rhino Gold uzmanıyım.",
    submittedAt:    "2024-03-05T11:00:00Z",
    projectValue:   750,
    completedAt:    "2024-03-09T14:00:00Z",
    clientName:     "Altın Çarşı Kuyumculuk",
  },
];
