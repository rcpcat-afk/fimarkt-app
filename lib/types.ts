// ─── Fimarkt Paylaşımlı Tip Tanımları (App) ───────────────────────────────────

export interface WebUser {
  id:      number;
  name:    string;
  email:   string;
  token?:  string;
  isAdmin: boolean;
  role?:   "musteri" | "satici" | "muhendis" | "admin" | string;
}

export interface CartItem {
  id:     number;
  qty:    number;
  name?:  string;
  price?: number;
  image?: string;
  slug?:  string;
}
