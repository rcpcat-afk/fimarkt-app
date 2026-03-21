// ─── App CartContext v2 ─────────────────────────────────────────────────────────
// Generic CartItem — WooCommerce bağımlılığı kaldırıldı.
// Seller grouping, kargo hesabı, "Daha Sonra Al" desteği eklendi.
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from "react";

const CART_KEY  = "fimarkt_cart";
const SAVED_KEY = "fimarkt_saved";

export const FREE_SHIPPING_THRESHOLD  = 500;    // TL
export const SHIPPING_COST_PER_SELLER = 29.99;  // TL

// ── Tipler ─────────────────────────────────────────────────────────────────────
export type CartItemType = "product" | "print" | "design" | "custom_design";

export interface CartItem {
  id:          number;
  name:        string;
  price:       number;       // her zaman sayısal TL
  qty:         number;
  image?:      string;
  slug?:       string;
  storeId?:    number;
  storeName?:  string;
  type?:       CartItemType;
  isDigital?:  boolean;
  meta?:       Record<string, unknown>;
}

export interface SellerGroup {
  storeName:            string;
  storeId?:             number;
  items:                CartItem[];
  subtotal:             number;
  physicalSubtotal:     number;
  shippingCost:         number;
  hasFreeShip:          boolean;
  remainingForFreeShip: number;
}

interface CartContextType {
  items:          CartItem[];
  savedItems:     CartItem[];
  addItem:        (item: Omit<CartItem, "qty"> & { qty?: number }) => void;
  removeItem:     (id: number) => void;
  updateQty:      (id: number, qty: number) => void;
  saveForLater:   (id: number) => void;
  moveToCart:     (id: number) => void;
  clearCart:      () => void;
  totalQty:       number;
  totalItems:     number;   // alias — GlobalHeader uyumluluğu için
  totalPrice:     number;
  shippingTotal:  number;
  grandTotal:     number;
  sellerGroups:   SellerGroup[];
}

// ── Mock başlangıç sepeti (demo) ───────────────────────────────────────────────
const MOCK_INITIAL_ITEMS: CartItem[] = [
  {
    id: 1001, name: "PLA Filament 1kg — Beyaz", price: 249, qty: 1,
    image: "https://picsum.photos/seed/filament-pla/300/300",
    storeId: 101, storeName: "FilamentHub", type: "product", isDigital: false,
  },
  {
    id: 1002, name: "3D Baskı Yatağı Kaplaması", price: 89, qty: 2,
    image: "https://picsum.photos/seed/yatakkapla/300/300",
    storeId: 101, storeName: "FilamentHub", type: "product", isDigital: false,
  },
  {
    id: 1003, name: "Hotend Nozzle Seti 0.4mm", price: 149, qty: 1,
    image: "https://picsum.photos/seed/nozzle/300/300",
    storeId: 102, storeName: "TechStore TR", type: "product", isDigital: false,
  },
  {
    id: 10001, name: "Mekanik Kalp — STL Dosyası", price: 149, qty: 1,
    image: "https://picsum.photos/seed/mekanik-kalp/300/300",
    slug: "mekanik-kalp", storeName: "Mert Karakoç",
    type: "design", isDigital: true,
  },
];

// ── Selector yardımcı ──────────────────────────────────────────────────────────
function buildSellerGroups(items: CartItem[]): SellerGroup[] {
  const map = new Map<string, SellerGroup>();

  for (const item of items) {
    const key  = String(item.storeId ?? item.storeName ?? "fimarkt");
    const name = item.storeName ?? (item.storeId ? `Mağaza #${item.storeId}` : "Fimarkt");
    if (!map.has(key)) {
      map.set(key, {
        storeName: name, storeId: item.storeId, items: [],
        subtotal: 0, physicalSubtotal: 0,
        shippingCost: 0, hasFreeShip: true, remainingForFreeShip: 0,
      });
    }
    map.get(key)!.items.push(item);
  }

  for (const group of map.values()) {
    group.subtotal         = group.items.reduce((s, i) => s + i.price * i.qty, 0);
    group.physicalSubtotal = group.items.filter((i) => !i.isDigital).reduce((s, i) => s + i.price * i.qty, 0);

    const hasPhysical = group.items.some((i) => !i.isDigital);
    if (!hasPhysical || group.physicalSubtotal >= FREE_SHIPPING_THRESHOLD) {
      group.shippingCost = 0; group.hasFreeShip = true; group.remainingForFreeShip = 0;
    } else {
      group.shippingCost         = SHIPPING_COST_PER_SELLER;
      group.hasFreeShip          = false;
      group.remainingForFreeShip = FREE_SHIPPING_THRESHOLD - group.physicalSubtotal;
    }
  }
  return Array.from(map.values());
}

// ── Context ────────────────────────────────────────────────────────────────────
const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items,    setItems]    = useState<CartItem[]>([]);
  const [saved,    setSaved]    = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(CART_KEY),
      AsyncStorage.getItem(SAVED_KEY),
    ])
      .then(([cartRaw, savedRaw]) => {
        const parsed = cartRaw ? (JSON.parse(cartRaw) as CartItem[]) : [];
        setItems(parsed.length > 0 ? parsed : MOCK_INITIAL_ITEMS);
        if (savedRaw) setSaved(JSON.parse(savedRaw) as CartItem[]);
      })
      .catch(() => setItems(MOCK_INITIAL_ITEMS))
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(CART_KEY,  JSON.stringify(items)).catch(() => {});
    AsyncStorage.setItem(SAVED_KEY, JSON.stringify(saved)).catch(() => {});
  }, [items, saved, hydrated]);

  const addItem = useCallback((item: Omit<CartItem, "qty"> & { qty?: number }) => {
    setItems((prev) => {
      const ex = prev.find((i) => i.id === item.id);
      if (ex) return prev.map((i) => i.id === item.id ? { ...i, qty: i.qty + (item.qty ?? 1) } : i);
      return [...prev, { ...item, qty: item.qty ?? 1 }];
    });
  }, []);

  const removeItem = useCallback((id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQty = useCallback((id: number, qty: number) => {
    if (qty <= 0) { removeItem(id); return; }
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, qty } : i));
  }, [removeItem]);

  const saveForLater = useCallback((id: number) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) setSaved((s) => [...s.filter((i) => i.id !== id), { ...item, qty: 1 }]);
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  const moveToCart = useCallback((id: number) => {
    setSaved((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) {
        setItems((c) => {
          const ex = c.find((i) => i.id === id);
          if (ex) return c.map((i) => i.id === id ? { ...i, qty: i.qty + 1 } : i);
          return [...c, { ...item, qty: 1 }];
        });
      }
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const sellerGroups  = useMemo(() => buildSellerGroups(items), [items]);
  const totalQty      = items.reduce((s, i) => s + i.qty, 0);
  const totalPrice    = items.reduce((s, i) => s + i.price * i.qty, 0);
  const shippingTotal = sellerGroups.reduce((s, g) => s + g.shippingCost, 0);
  const grandTotal    = totalPrice + shippingTotal;

  return (
    <CartContext.Provider value={{
      items, savedItems: saved,
      addItem, removeItem, updateQty, saveForLater, moveToCart, clearCart,
      totalQty, totalItems: totalQty, totalPrice, shippingTotal, grandTotal, sellerGroups,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};
