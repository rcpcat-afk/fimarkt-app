// ─── Satıcı Dashboard Mock Verisi ────────────────────────────────────────────
// Web tarafıyla birebir aynı — fimarkt-web/lib/mock-data/partner-dashboard.ts
import type { SellerDashboardData } from "../types/partner";

export const MOCK_SELLER_DASHBOARD: SellerDashboardData = {
  storeName:        "TechPrint Mağazası",
  partnerType:      "corporate_seller",
  todayEarnings:    4_500,
  pendingShipments: 5,
  inProduction:     12,
  unreadMessages:   2,
  totalRevenueMTD:  68_400,
  commissionRate:   8,
  pendingPayout:    12_750,

  weeklyRevenue: [
    { day: "Pzt", revenue: 1_200 },
    { day: "Sal", revenue: 2_800 },
    { day: "Çar", revenue: 1_900 },
    { day: "Per", revenue: 3_400 },
    { day: "Cum", revenue: 4_500 },
    { day: "Cmt", revenue: 2_100 },
    { day: "Paz", revenue: 1_600 },
  ],

  recentOrders: [
    {
      id: "ORD-5521", customer: "Ahmet Y.",
      product: "FDM Filament PLA+ 1kg",
      amount: 349, status: "pending", date: "22 Mar 2026",
    },
    {
      id: "ORD-5520", customer: "Fatma K.",
      product: "Ender 3 V3 SE Yazıcı",
      amount: 3_299, status: "processing", date: "22 Mar 2026",
    },
    {
      id: "ORD-5518", customer: "Murat D.",
      product: "PETG Filament 500g ×3",
      amount: 680, status: "shipped", date: "21 Mar 2026",
    },
    {
      id: "ORD-5515", customer: "Zeynep A.",
      product: "Bambu Lab X1C",
      amount: 18_500, status: "delivered", date: "20 Mar 2026",
    },
    {
      id: "ORD-5512", customer: "Can B.",
      product: "TPU Esnek Filament",
      amount: 290, status: "delivered", date: "19 Mar 2026",
    },
  ],
};
