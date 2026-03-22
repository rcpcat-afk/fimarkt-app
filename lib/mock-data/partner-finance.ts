// ─── Satıcı Finans Mock Verisi ────────────────────────────────────────────────
// Bakiye · Ledger (şeffaf kesinti dökümü) · Yaklaşan Ödeme Takvimi
// App tarafıyla birebir aynı — fimarkt-app/lib/mock-data/partner-finance.ts

export type LedgerStatus  = "paid" | "pending" | "blocked";
export type PayoutStatus  = "upcoming" | "processing";

export interface FinanceBalance {
  withdrawable:  number;   // Çekilebilir bakiye (TL)
  pending:       number;   // Bekleyen / bloke (TL)
  totalRevenue:  number;   // Toplam ciro (TL) — ay başından bugüne
}

export interface LedgerEntry {
  id:                    string;
  orderNo:               string;
  customer:              string;
  product:               string;        // kısa ürün adı
  date:                  string;        // ISO
  grossAmount:           number;        // Satış Tutarı (TL)
  fimarktCommissionRate: number;        // % oran (örn. 10)
  fimarktCommission:     number;        // TL tutar
  iyzicoFee:             number;        // TL tutar
  shippingDeduction:     number;        // TL tutar (kargo kesintisi)
  netEarning:            number;        // Net Hakediş TL
  status:                LedgerStatus;
}

export interface PayoutSchedule {
  id:          string;
  date:        string;        // ISO
  dayLabel:    string;        // "20 Mart Çarşamba"
  amount:      number;        // Yatacak tutar TL
  orderCount:  number;
  status:      PayoutStatus;
}

export interface PartnerFinanceData {
  balance:        FinanceBalance;
  ledger:         LedgerEntry[];
  payoutSchedule: PayoutSchedule[];
}

// ─── Yardımcı: Net hesapla ────────────────────────────────────────────────────
const net = (gross: number, commRate: number, iyzico: number, kargo: number): number =>
  Math.round((gross - gross * commRate / 100 - iyzico - kargo) * 100) / 100;

// ─── Mock Veri ────────────────────────────────────────────────────────────────
export const MOCK_PARTNER_FINANCE: PartnerFinanceData = {

  balance: {
    withdrawable: 4_500,
    pending:      2_100,
    totalRevenue: 15_000,
  },

  ledger: [
    {
      id: "led-001", orderNo: "#FM-2024-892",
      customer: "Burak Şahin", product: "Mekanik Saat Dişlisi Seti",
      date: "2024-03-22T10:55:00Z",
      grossAmount: 59, fimarktCommissionRate: 10, fimarktCommission: 5.9,
      iyzicoFee: 2.5, shippingDeduction: 0,
      netEarning: net(59, 10, 2.5, 0),
      status: "pending",
    },
    {
      id: "led-002", orderNo: "#FM-2024-891",
      customer: "Ahmet Kaya", product: "PLA+ Filament ×2 (Kırmızı)",
      date: "2024-03-22T09:14:00Z",
      grossAmount: 698, fimarktCommissionRate: 10, fimarktCommission: 69.8,
      iyzicoFee: 9.5, shippingDeduction: 15,
      netEarning: net(698, 10, 9.5, 15),
      status: "pending",
    },
    {
      id: "led-003", orderNo: "#FM-2024-890",
      customer: "Zeynep Arslan", product: "PETG + TPU Filament",
      date: "2024-03-22T08:45:00Z",
      grossAmount: 518, fimarktCommissionRate: 10, fimarktCommission: 51.8,
      iyzicoFee: 8.5, shippingDeduction: 15,
      netEarning: net(518, 10, 8.5, 15),
      status: "pending",
    },
    {
      id: "led-004", orderNo: "#FM-2024-885",
      customer: "Tolga Yılmaz", product: "Özel Makine Dişlisi (Fidrop ×4)",
      date: "2024-03-21T09:00:00Z",
      grossAmount: 740, fimarktCommissionRate: 10, fimarktCommission: 74,
      iyzicoFee: 10.5, shippingDeduction: 0,
      netEarning: net(740, 10, 10.5, 0),
      status: "pending",
    },
    {
      id: "led-005", orderNo: "#FM-2024-887",
      customer: "Murat Demir", product: "Ender 3 V3 SE Ekstruder",
      date: "2024-03-21T15:20:00Z",
      grossAmount: 485, fimarktCommissionRate: 10, fimarktCommission: 48.5,
      iyzicoFee: 7.5, shippingDeduction: 15,
      netEarning: net(485, 10, 7.5, 15),
      status: "paid",
    },
    {
      id: "led-006", orderNo: "#FM-2024-879",
      customer: "Can Öztürk", product: "Dragon Skull — Articulated",
      date: "2024-03-19T18:33:00Z",
      grossAmount: 149, fimarktCommissionRate: 10, fimarktCommission: 14.9,
      iyzicoFee: 4.5, shippingDeduction: 0,
      netEarning: net(149, 10, 4.5, 0),
      status: "paid",
    },
    {
      id: "led-007", orderNo: "#FM-2024-875",
      customer: "Selin Çelik", product: "Modüler Şehir Binası — Low-Poly",
      date: "2024-03-18T14:10:00Z",
      grossAmount: 89, fimarktCommissionRate: 10, fimarktCommission: 8.9,
      iyzicoFee: 3.5, shippingDeduction: 0,
      netEarning: net(89, 10, 3.5, 0),
      status: "paid",
    },
  ],

  payoutSchedule: [
    {
      id: "pay-001",
      date: "2024-03-25T00:00:00Z",
      dayLabel: "25 Mart Pazartesi",
      amount: 2_100,
      orderCount: 4,
      status: "upcoming",
    },
    {
      id: "pay-002",
      date: "2024-04-05T00:00:00Z",
      dayLabel: "5 Nisan Cuma",
      amount: 1_850,
      orderCount: 3,
      status: "upcoming",
    },
  ],
};
