// ─── Fimarkt Paylaşımlı Tip Tanımları (App) ───────────────────────────────────

// ── Ürün Tipleri ─────────────────────────────────────────────────────────────

export type ProductBadge = "yeni" | "indirim" | "cok-satan" | "stokta-az";

export interface ProductSeller {
  id:     string;
  name:   string;
  slug:   string;
  rating: number;
}

export interface Product {
  id:            string;
  slug:          string;
  title:         string;
  brand:         string;
  images:        string[];
  price:         number;
  originalPrice?: number;
  rating:        number;
  reviewCount:   number;
  badge?:        ProductBadge;
  seller:        ProductSeller;
  category:      string;
  pillar:        string;
  specs:         Record<string, string | number>;
  inStock:       boolean;
}

// ── Filtre Tipleri ────────────────────────────────────────────────────────────

export interface FilterOption {
  label:  string;
  value:  string;
  count?: number;
}

export type FilterGroupType = "checkbox" | "range" | "color";

export interface FilterGroup {
  id:       string;
  label:    string;
  type:     FilterGroupType;
  options?: FilterOption[];
  min?:     number;
  max?:     number;
}

export type ActiveFilters = Record<string, string[]>;

// ── Kullanıcı Tipleri ─────────────────────────────────────────────────────────

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
