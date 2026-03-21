import { useState } from "react";
import {
  View, Text, Image, Pressable, StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { Heart } from "lucide-react-native";
import { Colors, FontSizes, LineHeights } from "@/constants/theme";
import type { Product, ProductBadge } from "@/lib/types";

const C = Colors.dark;

// ── Badge ─────────────────────────────────────────────────────────────────────
const BADGE_STYLE: Record<ProductBadge, { label: string; color: string; bg: string }> = {
  "yeni":       { label: "Yeni",       color: "#fff", bg: "#3b82f6" },
  "indirim":    { label: "İndirim",    color: "#fff", bg: C.accent  },
  "cok-satan":  { label: "Çok Satan",  color: "#fff", bg: C.success },
  "stokta-az":  { label: "Stokta Az", color: "#fff", bg: C.warning },
};

// ── Yıldız ────────────────────────────────────────────────────────────────────
function Stars({ rating }: { rating: number }) {
  return (
    <Text style={styles.stars}>
      {"★".repeat(Math.floor(rating))}
      {"☆".repeat(5 - Math.floor(rating))}
      {" "}{rating.toFixed(1)}
    </Text>
  );
}

// ── İndirim yüzdesi ───────────────────────────────────────────────────────────
function DiscountChip({ original, current }: { original: number; current: number }) {
  const pct = Math.round((1 - current / original) * 100);
  return (
    <View style={styles.discountChip}>
      <Text style={styles.discountText}>%{pct}</Text>
    </View>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface AppProductCardProps {
  product:  Product;
  layout?:  "grid" | "list";
}

// ── Kart ─────────────────────────────────────────────────────────────────────
export default function AppProductCard({ product, layout = "grid" }: AppProductCardProps) {
  const router  = useRouter();
  const [fav, setFav] = useState(false);

  const badge      = product.badge ? BADGE_STYLE[product.badge] : null;
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const isList      = layout === "list";

  const handlePress = () => {
    router.push(`/${product.pillar}/${product.category}/${product.slug}` as never);
  };

  if (isList) {
    // ── Yatay (Liste) Kart ────────────────────────────────────────────────
    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [styles.listCard, pressed && { opacity: 0.85 }]}
      >
        {/* Görsel */}
        <View style={styles.listImageWrap}>
          <Image
            source={{ uri: product.images[0] }}
            style={styles.listImage}
            resizeMode="cover"
          />
          {badge && (
            <View style={[styles.badge, { backgroundColor: badge.bg }]}>
              <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
            </View>
          )}
        </View>

        {/* Bilgi */}
        <View style={styles.listInfo}>
          <Text style={styles.brand}>{product.brand}</Text>
          <Text style={styles.listTitle} numberOfLines={2}>{product.title}</Text>
          <Stars rating={product.rating} />
          <Text style={styles.seller} numberOfLines={1}>{product.seller.name}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>
              {product.price.toLocaleString("tr-TR")} ₺
            </Text>
            {hasDiscount && (
              <>
                <Text style={styles.originalPrice}>
                  {product.originalPrice!.toLocaleString("tr-TR")} ₺
                </Text>
                <DiscountChip original={product.originalPrice!} current={product.price} />
              </>
            )}
          </View>
        </View>

        {/* Favori */}
        <Pressable
          onPress={() => setFav((v) => !v)}
          style={styles.listFavBtn}
          hitSlop={8}
        >
          <Heart
            size={18}
            color={fav ? "#ef4444" : C.mutedForeground}
            fill={fav ? "#ef4444" : "transparent"}
          />
        </Pressable>
      </Pressable>
    );
  }

  // ── Dikey (Grid) Kart ────────────────────────────────────────────────────
  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.gridCard, pressed && { opacity: 0.85 }]}
    >
      {/* Görsel */}
      <View style={styles.gridImageWrap}>
        <Image
          source={{ uri: product.images[0] }}
          style={styles.gridImage}
          resizeMode="cover"
        />
        {badge && (
          <View style={[styles.badge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
          </View>
        )}
        {!product.inStock && (
          <View style={styles.outOfStock}>
            <Text style={styles.outOfStockText}>Stokta Yok</Text>
          </View>
        )}
        <Pressable
          onPress={() => setFav((v) => !v)}
          style={styles.favBtn}
          hitSlop={8}
        >
          <Heart
            size={14}
            color={fav ? "#ef4444" : C.mutedForeground}
            fill={fav ? "#ef4444" : "transparent"}
          />
        </Pressable>
      </View>

      {/* Bilgi */}
      <View style={styles.gridInfo}>
        <Text style={styles.brand}>{product.brand}</Text>
        <Text style={styles.gridTitle} numberOfLines={2}>{product.title}</Text>
        <Stars rating={product.rating} />
        <View style={styles.priceRow}>
          <Text style={styles.price}>
            {product.price.toLocaleString("tr-TR")} ₺
          </Text>
          {hasDiscount && (
            <DiscountChip original={product.originalPrice!} current={product.price} />
          )}
        </View>
        {hasDiscount && (
          <Text style={styles.originalPrice}>
            {product.originalPrice!.toLocaleString("tr-TR")} ₺
          </Text>
        )}
      </View>
    </Pressable>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Genel
  brand: {
    fontSize: FontSizes.xs, color: C.accent,
    fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5,
  },
  stars: {
    fontSize: FontSizes.xs, color: C.warning, marginTop: 2,
  },
  seller: {
    fontSize: FontSizes.xs, color: C.mutedForeground, marginTop: 2,
  },
  badge: {
    position: "absolute", top: 6, left: 6,
    borderRadius: 20, paddingHorizontal: 6, paddingVertical: 2,
  },
  badgeText: { fontSize: 9, fontWeight: "800" },
  priceRow:  { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  price:     { fontSize: FontSizes.md, fontWeight: "900", color: C.foreground },
  originalPrice: {
    fontSize: FontSizes.xs, color: C.mutedForeground,
    textDecorationLine: "line-through",
  },
  discountChip: {
    backgroundColor: `${C.accent}20`, borderRadius: 4,
    paddingHorizontal: 4, paddingVertical: 1,
  },
  discountText: { fontSize: 9, fontWeight: "800", color: C.accent },
  outOfStock: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(17,17,24,0.65)",
    alignItems: "center", justifyContent: "center", borderRadius: 12,
  },
  outOfStockText: {
    fontSize: FontSizes.xs, fontWeight: "700",
    color: C.mutedForeground, borderWidth: 1,
    borderColor: C.border, borderRadius: 20,
    paddingHorizontal: 8, paddingVertical: 3,
    backgroundColor: C.surface,
  },

  // Grid
  gridCard: {
    flex: 1, backgroundColor: C.surface,
    borderRadius: 16, borderWidth: 1, borderColor: C.border,
    overflow: "hidden",
  },
  gridImageWrap: { aspectRatio: 1, backgroundColor: C.surface2 },
  gridImage:     { width: "100%", height: "100%", borderRadius: 0 },
  gridInfo:      { padding: 10, gap: 2 },
  gridTitle: {
    fontSize: FontSizes.sm, fontWeight: "600",
    color: C.foreground, lineHeight: LineHeights.sm, marginTop: 2,
  },
  favBtn: {
    position: "absolute", top: 6, right: 6,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: "rgba(17,17,24,0.75)",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: C.border,
  },

  // List
  listCard: {
    flexDirection: "row", backgroundColor: C.surface,
    borderRadius: 16, borderWidth: 1, borderColor: C.border,
    overflow: "hidden", alignItems: "center",
  },
  listImageWrap: { width: 100, height: 100, backgroundColor: C.surface2, flexShrink: 0 },
  listImage:     { width: "100%", height: "100%" },
  listInfo:      { flex: 1, padding: 10, gap: 2 },
  listTitle: {
    fontSize: FontSizes.sm, fontWeight: "600",
    color: C.foreground, lineHeight: LineHeights.sm,
  },
  listFavBtn: { padding: 12 },
});
