// ─── Satıcı Mesaj Merkezi Mock Verisi ────────────────────────────────────────
// 3 senaryo: Acil Sipariş Sorunu · Ürün Sorusu · Genel
// App tarafıyla birebir aynı — fimarkt-app/lib/mock-data/partner-messages.ts

export type ConversationType = "order_issue" | "product_question" | "general";
export type MessageSender    = "customer" | "seller";

export interface ChatMessage {
  id:        string;
  sender:    MessageSender;
  text:      string;
  timestamp: string;   // ISO
  read:      boolean;
}

export interface OrderContext {
  orderNo:  string;
  status:   string;
  amount:   number;
  product:  string;
  cargoNo?: string;
}

export interface ProductContext {
  name:       string;
  price:      number;
  stock:      number | null;
  imageEmoji: string;
  bgColor:    string;
  sku:        string;
}

export interface Conversation {
  id:             string;
  type:           ConversationType;
  customer: {
    name:    string;
    email:   string;
    initials:string;
  };
  subject:        string;
  lastMessage:    string;
  lastMessageTime:string;
  unreadCount:    number;
  isUrgent:       boolean;
  orderContext?:  OrderContext;
  productContext?:ProductContext;
  messages:       ChatMessage[];
}

export const QUICK_REPLIES = [
  "Evet, ürünümüz stokta mevcut! 🟢",
  "Siparişiniz bugün kargoya verilecektir. 📦",
  "Bilgileri kontrol edip 1 saat içinde dönüyorum.",
  "Harika bir seçim, yardımcı olmaktan memnuniyet duyarım!",
  "Lütfen sipariş numaranızı paylaşır mısınız?",
  "Teşekkür ederiz, iyi günler! 😊",
];

export const MOCK_CONVERSATIONS: Conversation[] = [
  // ── 1. Acil Sipariş Sorunu ─────────────────────────────────────────────────
  {
    id: "conv-001",
    type: "order_issue",
    isUrgent: true,
    unreadCount: 3,
    customer: { name: "Ahmet Kaya", email: "ahmet@example.com", initials: "AK" },
    subject: "Kargom 3 gündür gelmiyor!",
    lastMessage: "Hâlâ ulaşmadı, ne zaman gelir acaba?",
    lastMessageTime: "2024-03-22T10:42:00Z",
    orderContext: {
      orderNo: "#FM-2024-882",
      status:  "Kargoda",
      amount:  1047,
      product: "PLA+ Filament ×3 (Siyah)",
      cargoNo: "YK-8821047563",
    },
    messages: [
      { id: "m-001", sender: "customer", read: true,
        text: "Merhaba, #FM-2024-882 numaralı siparişim 3 gündür yolda. Bir sorun var mı?",
        timestamp: "2024-03-22T09:10:00Z" },
      { id: "m-002", sender: "seller", read: true,
        text: "Merhaba Ahmet Bey, siparişinizi kontrol ediyorum. Takip numaranız: YK-8821047563",
        timestamp: "2024-03-22T09:25:00Z" },
      { id: "m-003", sender: "seller", read: true,
        text: "Yurtiçi Kargo sistemine göre siparişiniz dağıtım merkezinde. Bugün teslim edilmesi bekleniyor.",
        timestamp: "2024-03-22T09:26:00Z" },
      { id: "m-004", sender: "customer", read: false,
        text: "Tamam teşekkür ederim, bekleyeceğim.",
        timestamp: "2024-03-22T10:15:00Z" },
      { id: "m-005", sender: "customer", read: false,
        text: "Akşam oldu hâlâ ulaşmadı, ne zaman gelir acaba?",
        timestamp: "2024-03-22T10:42:00Z" },
      { id: "m-006", sender: "customer", read: false,
        text: "Yarına ertelenecek mi?",
        timestamp: "2024-03-22T10:43:00Z" },
    ],
  },

  // ── 2. Ürün Sorusu (Satın Alınmamış) ──────────────────────────────────────
  {
    id: "conv-002",
    type: "product_question",
    isUrgent: false,
    unreadCount: 1,
    customer: { name: "Zeynep Arslan", email: "zeynep@example.com", initials: "ZA" },
    subject: "PLA+ filament sertlik değeri?",
    lastMessage: "Esnek mi yoksa kırılgan mı?",
    lastMessageTime: "2024-03-22T08:30:00Z",
    productContext: {
      name:       "PLA+ Filament 1kg Makarası",
      price:      349,
      stock:      75,
      imageEmoji: "🧵",
      bgColor:    "#1a1a28",
      sku:        "FIL-PLA-001",
    },
    messages: [
      { id: "m-007", sender: "customer", read: true,
        text: "Merhaba! PLA+ filamentinizin sertlik değeri nedir?",
        timestamp: "2024-03-22T07:55:00Z" },
      { id: "m-008", sender: "seller", read: true,
        text: "Merhaba Zeynep Hanım! PLA+ Shore D 80 sertliğindedir; standart PLA'dan daha dayanıklı ama esnek değil.",
        timestamp: "2024-03-22T08:10:00Z" },
      { id: "m-009", sender: "customer", read: false,
        text: "Peki darbeye karşı dayanıklı mı? Esnek mi yoksa kırılgan mı?",
        timestamp: "2024-03-22T08:30:00Z" },
    ],
  },

  // ── 3. Genel Soru ─────────────────────────────────────────────────────────
  {
    id: "conv-003",
    type: "general",
    isUrgent: false,
    unreadCount: 0,
    customer: { name: "Murat Demir", email: "murat@example.com", initials: "MD" },
    subject: "Toplu sipariş indirimi",
    lastMessage: "Anlıyorum, teşekkür ederim.",
    lastMessageTime: "2024-03-21T16:00:00Z",
    messages: [
      { id: "m-010", sender: "customer", read: true,
        text: "Merhaba, 10 makara ve üzeri siparişlerde indirim yapıyor musunuz?",
        timestamp: "2024-03-21T14:30:00Z" },
      { id: "m-011", sender: "seller", read: true,
        text: "Merhaba Murat Bey! Evet, 10 makara ve üzeri siparişlerde %8, 20 ve üzerinde %12 indirim uyguluyoruz.",
        timestamp: "2024-03-21T15:10:00Z" },
      { id: "m-012", sender: "seller", read: true,
        text: "Sipariş vermeden önce bizimle iletişime geçirseniz özel fiyat oluşturabiliriz.",
        timestamp: "2024-03-21T15:11:00Z" },
      { id: "m-013", sender: "customer", read: true,
        text: "Anlıyorum, teşekkür ederim.",
        timestamp: "2024-03-21T16:00:00Z" },
    ],
  },
];
