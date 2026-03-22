// ─── Çözüm Ortağı (Partner) Tip Tanımları ────────────────────────────────────
// Bölüm 6: Satıcı & Mühendis paneli — tüm partner tipleri burada yönetilir.
// Web tarafıyla birebir aynı — fimarkt-web/lib/types/partner.ts ile senkron tut.

export type PartnerType =
  | "corporate_seller"   // Kurumsal Mağaza Satıcısı (Ltd., A.Ş., Kooperatif)
  | "individual_seller"  // Bireysel / Esnaf Muafiyetli Satıcı
  | "sanatkat_digital"   // Sanatkat Dijital Satıcı (STL/OBJ dosya)
  | "sanatkat_physical"  // Sanatkat Fiziksel C2C (Biblo/Heykel)
  | "fidrop_engineer"    // Fidrop Mühendisi (3D baskı üretici)
  | "rfq_designer";      // RFQ Tasarımcısı (özel tasarım)

export type OnboardingCategory = "corporate" | "individual";

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
