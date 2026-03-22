// ─── Dashboard Mock Verisi (App) ─────────────────────────────────────────────
// Bölüm 5 görsel testleri için. Gerçek WooCommerce/API entegrasyonu
// gelince bu dosya kaldırılır ve API çağrılarıyla değiştirilir.

export interface LiveOrderStep {
  label: string;
  sublabel: string;
  date: string | null;
}

export interface RecentProduct {
  id: string;
  name: string;
  price: string;
  emoji: string;
  href: string;
}

export interface MockDashboardData {
  stats: {
    activeOrders:  number;
    pendingQuotes: number;
    favorites:     number;
    walletBalance: number;
  };
  liveOrder: {
    id:                string;
    productName:       string;
    currentStep:       number; // 0=Alındı 1=Üretimde 2=Kalite 3=Kargo
    steps:             LiveOrderStep[];
    estimatedDelivery: string;
  };
  cartItemCount: number;
  cartTotal:     string;
  recentlyViewed: RecentProduct[];
}

export const MOCK_DASHBOARD: MockDashboardData = {
  stats: {
    activeOrders:  2,
    pendingQuotes: 1,
    favorites:     14,
    walletBalance: 150,
  },
  liveOrder: {
    id:          "FMT-2024-1847",
    productName: "PLA Filament Seti x3 + Nozzle Kit",
    currentStep: 1,
    steps: [
      { label: "Sipariş Alındı", sublabel: "Onaylandı",  date: "20 Mar" },
      { label: "Üretimde",       sublabel: "İşleniyor",  date: "21 Mar" },
      { label: "Kalite Kontrol", sublabel: "Bekliyor",   date: null     },
      { label: "Kargoda",        sublabel: "Bekliyor",   date: null     },
    ],
    estimatedDelivery: "24 Mart 2026",
  },
  cartItemCount: 3,
  cartTotal:     "1.249",
  recentlyViewed: [
    { id: "rv-1", name: "Prusa i3 MK4",         price: "18.500 ₺",  emoji: "🖨️", href: "/magaza/fdm-yazicilar"        },
    { id: "rv-2", name: "PLA+ Kırmızı 1kg",     price: "450 ₺",     emoji: "🎨", href: "/magaza/standart-filamentler" },
    { id: "rv-3", name: "Reçine Temizleyici",    price: "280 ₺",     emoji: "🧴", href: "/magaza/recine-yazicilar"     },
    { id: "rv-4", name: "3D Baskı: Dişli Mili", price: "Teklif Al", emoji: "⚙️", href: "/fidrop/hesapla"             },
  ],
};
