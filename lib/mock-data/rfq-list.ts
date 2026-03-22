// ─── RFQ Liste Mock Data ──────────────────────────────────────────────────────
// Başlık 24 (form) → Başlık 25 (chat) köprüsündeki 5 durum kartı.
// `unreadCount > 0` → "Yeni Teklif Var" glow + bildirim rozeti tetikler.

export type TeklifStatus =
  | "pending"
  | "offer_received"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface Teklif {
  id:           string;
  title:        string;
  category:     string;
  status:       TeklifStatus;
  engineer:     { name: string; initials: string } | null;
  budget:       string;
  date:         string;
  lastMessage:  string;
  /** > 0 → kart "Yeni Teklif" modunda: glow + bildirim badge gösterilir */
  unreadCount:  number;
}

export const MOCK_TEKLIFLER: Teklif[] = [
  // ── 1. Yeni Teklif Var (2 okunmamış) — GLOW ──────────────────────────────
  {
    id:          "rfq-001",
    title:       "Kırık Dişli Mili — Yedek Parça",
    category:    "Mühendislik Parçası",
    status:      "offer_received",
    engineer:    { name: "Ali Yılmaz", initials: "AY" },
    budget:      "500₺",
    date:        "12 Mar 2026",
    lastMessage: "500₺'ye teklif verdim, ne düşünürsünüz?",
    unreadCount: 2,
  },

  // ── 2. Yeni Teklif Var (1 okunmamış) — GLOW ──────────────────────────────
  {
    id:          "rfq-002",
    title:       "Drone Gövdesi Koruyucu Kapak",
    category:    "Havacılık & Drone",
    status:      "offer_received",
    engineer:    { name: "Burak Demir", initials: "BD" },
    budget:      "750₺",
    date:        "19 Mar 2026",
    lastMessage: "Ölçüleri inceledim, 2 günde teslim edebilirim.",
    unreadCount: 1,
  },

  // ── 3. Uzman Aranıyor (⋮ İptal menüsü) ───────────────────────────────────
  {
    id:          "rfq-003",
    title:       "Firma Logosu 3D Plaket",
    category:    "Kurumsal Tasarım",
    status:      "pending",
    engineer:    null,
    budget:      "300–600₺",
    date:        "18 Mar 2026",
    lastMessage: "Uzman araması yapılıyor...",
    unreadCount: 0,
  },

  // ── 4. Tasarım Devam Ediyor ───────────────────────────────────────────────
  {
    id:          "rfq-004",
    title:       "Özel Bisiklet Gidon Tutacağı",
    category:    "Spor & Outdoor",
    status:      "in_progress",
    engineer:    { name: "Selin Kara", initials: "SK" },
    budget:      "850₺",
    date:        "5 Mar 2026",
    lastMessage: "Tasarım dosyaları hazırlanıyor, %60 tamamlandı.",
    unreadCount: 0,
  },

  // ── 5. İptal Edildi ───────────────────────────────────────────────────────
  {
    id:          "rfq-005",
    title:       "Vintage Heykel Replikası",
    category:    "Sanat & Hobi",
    status:      "cancelled",
    engineer:    { name: "Mert Karakoç", initials: "MK" },
    budget:      "1.200₺",
    date:        "20 Şub 2026",
    lastMessage: "Proje bütçe nedeniyle iptal edildi.",
    unreadCount: 0,
  },
];
