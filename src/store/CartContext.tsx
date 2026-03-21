// ─── App CartContext ───────────────────────────────────────────────────────────
// AsyncStorage persist: uygulama kapansa bile sepet korunur.
// Bölüm 3'te addToCart(product) çağrısı cart.tsx ile uyumlu tutuldu.
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { type Product } from "../services/api";

const CART_KEY = "fimarkt_cart";

// ── Tipler ────────────────────────────────────────────────────────────────────
export interface CartItem {
  product:  Product;
  quantity: number;
}

interface CartContextType {
  items:          CartItem[];
  addToCart:      (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart:      () => void;
  totalItems:     number;
  totalPrice:     number;
}

// ── Context ───────────────────────────────────────────────────────────────────
const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items,   setItems]   = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // AsyncStorage'dan ilk yüklemede hydrate et
  useEffect(() => {
    AsyncStorage.getItem(CART_KEY)
      .then((raw) => {
        if (raw) setItems(JSON.parse(raw) as CartItem[]);
      })
      .catch(() => { /* bozuk veri — yoksay */ })
      .finally(() => setHydrated(true));
  }, []);

  // Her değişiklikte AsyncStorage'a yaz (hydrate tamamlandıktan sonra)
  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(CART_KEY, JSON.stringify(items)).catch(() => {});
  }, [items, hydrated]);

  const addToCart = useCallback((product: Product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const updateQuantity = useCallback(
    (productId: number, quantity: number) => {
      if (quantity <= 0) { removeFromCart(productId); return; }
      setItems((prev) =>
        prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i)),
      );
    },
    [removeFromCart],
  );

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce(
    (sum, i) =>
      sum + Number(i.product.sale_price || i.product.regular_price) * i.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};
