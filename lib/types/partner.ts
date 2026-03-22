// ─── Çözüm Ortağı (Partner) Tip Tanımları ────────────────────────────────────
// Bölüm 6: Satıcı & Mühendis paneli — tüm partner tipleri burada yönetilir.
// App tarafıyla birebir aynı — fimarkt-app/lib/types/partner.ts ile senkron tut.

export type PartnerType =
  | "corporate_seller"   // Kurumsal Mağaza Satıcısı (Ltd., A.Ş., Kooperatif)
  | "individual_seller"  // Bireysel / Esnaf Muafiyetli Satıcı
  | "sanatkat_digital"   // Sanatkat Dijital Satıcı (STL/OBJ dosya)
  | "sanatkat_physical"  // Sanatkat Fiziksel C2C (Biblo/Heykel)
  | "fidrop_engineer"    // Fidrop Mühendisi (3D baskı üretici)
  | "rfq_designer";      // RFQ Tasarımcısı (özel tasarım)

export type OnboardingCategory = "corporate" | "individual";

// ─── Onboarding Kart Metadata ─────────────────────────────────────────────────
// Her PartnerType için Adım 1'de gösterilecek kart içeriği ve KYC kategorisi.
export interface PartnerTypeMeta {
  label:       string;
  emoji:       string;
  description: string;
  tags:        string[];
  kycCategory: OnboardingCategory;
}

export const PARTNER_TYPE_META: Record<PartnerType, PartnerTypeMeta> = {
  corporate_seller: {
    label:       "Kurumsal Satıcı",
    emoji:       "🏢",
    description: "Ltd. Şti., A.Ş., Kooperatif veya diğer tüzel kişilikler",
    tags:        ["Vergi Levhası", "Mersis No", "Şirket IBAN"],
    kycCategory: "corporate",
  },
  individual_seller: {
    label:       "Bireysel Satıcı",
    emoji:       "👤",
    description: "Esnaf muafiyetli, serbest meslek veya kendi adına çalışan",
    tags:        ["TC Kimlik", "Esnaf Muafiyet Belgesi", "Şahsi IBAN"],
    kycCategory: "individual",
  },
  sanatkat_digital: {
    label:       "Sanatkat Dijital",
    emoji:       "🎨",
    description: "STL / OBJ dosya satan 3D tasarımcılar",
    tags:        ["TC Kimlik", "Tasarım Portföyü", "Şahsi IBAN"],
    kycCategory: "individual",
  },
  sanatkat_physical: {
    label:       "Sanatkat Fiziksel",
    emoji:       "🗿",
    description: "Biblo, heykel veya el yapımı fiziksel eser satan sanatçılar",
    tags:        ["TC Kimlik", "Ürün Fotoğrafı", "Şahsi IBAN"],
    kycCategory: "individual",
  },
  fidrop_engineer: {
    label:       "Fidrop Mühendisi",
    emoji:       "⚙️",
    description: "Fidrop sistemi üzerinden 3D baskı üretimi yapan mühendisler",
    tags:        ["TC Kimlik", "Makine/Ekipman Belgesi", "Şahsi IBAN"],
    kycCategory: "individual",
  },
  rfq_designer: {
    label:       "RFQ Tasarımcısı",
    emoji:       "✏️",
    description: "Müşteri taleplerini alan özel 3D tasarım hizmeti verenler",
    tags:        ["TC Kimlik", "Tasarım Portföyü", "Şahsi IBAN"],
    kycCategory: "individual",
  },
};

export type PartnerStatus = "pending" | "active" | "suspended" | "rejected";

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

// ─── Partner Profil ───────────────────────────────────────────────────────────
export interface PartnerProfile {
  id:                 string;
  name:               string;
  email:              string;
  type:               PartnerType;
  onboardingCategory: OnboardingCategory;
  status:             PartnerStatus;
  storeName?:         string;
  companyName?:       string;
  joinedAt:           string;
  iyzico: {
    subMerchantKey?:  string;
    verified:         boolean;
  };
}

// ─── Dashboard Veri Tipleri ───────────────────────────────────────────────────
export interface WeeklyRevenue {
  day:     string;   // "Pzt", "Sal", "Çar" ...
  revenue: number;   // TL cinsinden
}

export interface PartnerOrder {
  id:       string;
  customer: string;
  product:  string;
  amount:   number;
  status:   OrderStatus;
  date:     string;
}

export interface SellerDashboardData {
  storeName:        string;
  partnerType:      PartnerType;
  todayEarnings:    number;   // günlük hakediş TL
  pendingShipments: number;   // kargolanacak sipariş
  inProduction:     number;   // üretimdeki sipariş
  unreadMessages:   number;   // cevapsız mesaj
  weeklyRevenue:    WeeklyRevenue[];
  recentOrders:     PartnerOrder[];
  totalRevenueMTD:  number;   // ay başından bugüne toplam TL
  commissionRate:   number;   // Fimarkt komisyon yüzdesi
  pendingPayout:    number;   // bekleyen hakediş TL
}
