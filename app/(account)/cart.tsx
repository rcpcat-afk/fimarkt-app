import React, { useMemo } from "react";
import {
  View, Text, Image, Pressable, ScrollView, Alert,
  StyleSheet, StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { FontSizes, type ThemeColors } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import {
  useCart,
  FREE_SHIPPING_THRESHOLD,
  type CartItem,
  type SellerGroup,
} from "@/src/store/CartContext";

function fmt(n: number) {
  return n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── Style factory ──────────────────────────────────────────────────────────────
function createStyles(C: ThemeColors) {
  return StyleSheet.create({
    root:    { flex: 1 },

    // Header
    header:      { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: C.border },
    backBtn:     { width: 36, height: 36, borderRadius: 10, backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border, alignItems: "center", justifyContent: "center" },
    headerTitle: { fontSize: FontSizes.lg, fontWeight: "800", color: C.foreground },
    clearBtn:    { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99, borderWidth: 1, borderColor: C.error + "44", backgroundColor: C.error + "11" },
    clearText:   { fontSize: 11, color: C.error, fontWeight: "600" },

    // Content
    content: { padding: 12, gap: 12 },

    // Seller group
    groupCard:       { backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, overflow: "hidden" },
    groupHeader:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: C.surface2, paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border },
    groupHeaderText: { fontSize: FontSizes.sm, fontWeight: "700", color: C.foreground, flex: 1 },
    groupCount:      { fontSize: FontSizes.xs, fontWeight: "400", color: C.mutedForeground },
    groupBody:       { paddingHorizontal: 12 },
    shipFreeBadge:   { fontSize: 9, fontWeight: "800", color: "#10b981", backgroundColor: "rgba(16,185,129,0.12)", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: "rgba(16,185,129,0.2)" },
    shippingBadge:   { fontSize: 9, color: C.mutedForeground },

    // FreeShippingBar
    shipBar:       { backgroundColor: C.surface2, borderRadius: 10, borderWidth: 1, borderColor: C.border, padding: 10, marginTop: 8, gap: 4 },
    shipFree:      { fontSize: 11, fontWeight: "700", color: "#10b981" },
    shipText:      { fontSize: 11, color: C.mutedForeground },
    progressTrack: { height: 5, borderRadius: 99, backgroundColor: C.border, overflow: "hidden" },
    progressFill:  { height: "100%", borderRadius: 99, backgroundColor: C.accent },
    progressLabel: { fontSize: 9, color: C.mutedForeground },

    // Item row
    itemRow:            { flexDirection: "row", gap: 10, paddingVertical: 12 },
    itemImg:            { position: "relative" },
    itemImgInner:       { width: 64, height: 64, borderRadius: 12 },
    itemImgPlaceholder: { backgroundColor: C.surface2, alignItems: "center", justifyContent: "center" },
    digitalBadge:       { position: "absolute", bottom: 4, left: 4, backgroundColor: "rgba(59,130,246,0.85)", borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1 },
    digitalBadgeText:   { fontSize: 7, fontWeight: "800", color: "#fff" },
    itemInfo:           { flex: 1 },
    itemName:           { fontSize: FontSizes.xs, fontWeight: "700", color: C.foreground, lineHeight: 16, marginBottom: 4 },
    itemPrice:          { fontSize: FontSizes.sm, fontWeight: "900", color: C.accent, marginBottom: 6 },
    itemPriceUnit:      { fontSize: 10, fontWeight: "400", color: C.mutedForeground },
    itemActions:        { flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" },
    qtyRow:             { flexDirection: "row", alignItems: "center", backgroundColor: C.surface2, borderRadius: 10, borderWidth: 1, borderColor: C.border, overflow: "hidden" },
    qtyBtn:             { width: 30, height: 28, alignItems: "center", justifyContent: "center" },
    qtyBtnText:         { fontSize: 18, fontWeight: "700", color: C.foreground, lineHeight: 22 },
    qtyNum:             { minWidth: 24, textAlign: "center", fontSize: FontSizes.sm, fontWeight: "700", color: C.foreground },
    saveLaterText:      { fontSize: 10, color: C.mutedForeground },
    removeText:         { fontSize: 10, color: C.error },
    divider:            { height: 1, backgroundColor: C.border },

    // Summary
    summaryCard:  { backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 14, gap: 8 },
    summaryTitle: { fontSize: FontSizes.md, fontWeight: "800", color: C.foreground, marginBottom: 4, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: C.border },
    summaryRow:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    summaryLabel: { fontSize: FontSizes.xs, color: C.mutedForeground },
    summaryValue: { fontSize: FontSizes.sm, fontWeight: "600", color: C.foreground },
    shipNote:     { fontSize: 9, color: C.mutedForeground },
    totalRow:     { borderTopWidth: 1, borderTopColor: C.border, paddingTop: 10, marginTop: 4 },
    totalLabel:   { fontSize: FontSizes.sm, fontWeight: "700", color: C.foreground },
    totalValue:   { fontSize: FontSizes.xl, fontWeight: "900", color: C.accent },

    // Trust badges
    trustRow:   { flexDirection: "row", justifyContent: "space-around", backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 14 },
    trustItem:  { alignItems: "center", gap: 4 },
    trustIcon:  { fontSize: 20 },
    trustLabel: { fontSize: 10, color: C.mutedForeground },

    // Saved items
    savedSection:   { backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 12, gap: 8 },
    savedTitle:     { fontSize: FontSizes.sm, fontWeight: "800", color: C.foreground },
    savedRow:       { flexDirection: "row", alignItems: "center", gap: 10 },
    savedImg:       { width: 44, height: 44, borderRadius: 10 },
    savedImgInner:  { width: "100%", height: "100%", borderRadius: 10 },
    savedInfo:      { flex: 1 },
    savedName:      { fontSize: 11, fontWeight: "600", color: C.foreground },
    savedPrice:     { fontSize: FontSizes.sm, fontWeight: "800", color: C.accent },
    moveToCartText: { fontSize: 11, fontWeight: "700", color: C.accent },

    // Empty
    emptyWrap:    { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 8 },
    emptyEmoji:   { fontSize: 64, marginBottom: 8 },
    emptyTitle:   { fontSize: FontSizes.xl, fontWeight: "900", color: C.foreground },
    emptySub:     { fontSize: FontSizes.xs, color: C.mutedForeground, textAlign: "center", lineHeight: 20 },
    emptyBtn:     { marginTop: 16, backgroundColor: C.accent, paddingHorizontal: 28, paddingVertical: 13, borderRadius: 14 },
    emptyBtnText: { fontSize: FontSizes.sm, fontWeight: "700", color: "#fff" },

    // Sticky bottom bar
    stickyBar:       { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: C.surface, borderTopWidth: 1, borderTopColor: C.border, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 12, gap: 12 },
    stickyLeft:      { gap: 2 },
    stickyLabel:     { fontSize: 10, color: C.mutedForeground },
    stickyTotal:     { fontSize: FontSizes.xl, fontWeight: "900", color: C.accent },
    checkoutBtn:     { flex: 1, backgroundColor: C.accent, paddingVertical: 14, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    checkoutBtnText: { fontSize: FontSizes.sm, fontWeight: "800", color: "#fff" },
  });
}

// ── FreeShippingBar ────────────────────────────────────────────────────────────
function FreeShippingBar({ group }: { group: SellerGroup }) {
  const { colors: C } = useTheme();
  const s = useMemo(() => createStyles(C), [C]);

  const hasPhysical = group.items.some((i) => !i.isDigital);
  if (!hasPhysical) return null;

  const pct = Math.min((group.physicalSubtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);

  return (
    <View style={s.shipBar}>
      {group.hasFreeShip ? (
        <Text style={s.shipFree}>🎉 Bu satıcıdan kargo ücretsiz!</Text>
      ) : (
        <>
          <Text style={s.shipText}>
            <Text style={{ color: C.accent, fontWeight: "700" }}>
              {fmt(group.remainingForFreeShip)}₺{" "}
            </Text>
            daha ekle, kargo ücretsiz olsun!
          </Text>
          <View style={s.progressTrack}>
            <View style={[s.progressFill, { width: `${pct}%` as any }]} />
          </View>
          <Text style={s.progressLabel}>
            {fmt(group.physicalSubtotal)}₺ / {FREE_SHIPPING_THRESHOLD}₺
          </Text>
        </>
      )}
    </View>
  );
}

// ── CartItemRow ────────────────────────────────────────────────────────────────
function CartItemRow({
  item,
  onUpdateQty,
  onRemove,
  onSaveLater,
}: {
  item: CartItem;
  onUpdateQty: (id: number, qty: number) => void;
  onRemove: (id: number) => void;
  onSaveLater: (id: number) => void;
}) {
  const { colors: C } = useTheme();
  const s = useMemo(() => createStyles(C), [C]);

  return (
    <View style={s.itemRow}>
      {/* Resim */}
      <View style={s.itemImg}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={s.itemImgInner} resizeMode="cover" />
        ) : (
          <View style={[s.itemImgInner, s.itemImgPlaceholder]}>
            <Text style={{ fontSize: 22 }}>{item.isDigital ? "🎨" : "📦"}</Text>
          </View>
        )}
        {item.isDigital && (
          <View style={s.digitalBadge}>
            <Text style={s.digitalBadgeText}>DİJİTAL</Text>
          </View>
        )}
      </View>

      {/* Bilgi */}
      <View style={s.itemInfo}>
        <Text style={s.itemName} numberOfLines={2}>{item.name}</Text>
        <Text style={s.itemPrice}>
          {fmt(item.price * item.qty)}₺
          {item.qty > 1 && (
            <Text style={s.itemPriceUnit}> ({fmt(item.price)}₺ × {item.qty})</Text>
          )}
        </Text>

        <View style={s.itemActions}>
          {!item.isDigital && (
            <View style={s.qtyRow}>
              <Pressable onPress={() => onUpdateQty(item.id, item.qty - 1)} style={s.qtyBtn} hitSlop={4}>
                <Text style={s.qtyBtnText}>−</Text>
              </Pressable>
              <Text style={s.qtyNum}>{item.qty}</Text>
              <Pressable onPress={() => onUpdateQty(item.id, item.qty + 1)} style={s.qtyBtn} hitSlop={4}>
                <Text style={s.qtyBtnText}>+</Text>
              </Pressable>
            </View>
          )}
          <Pressable onPress={() => onSaveLater(item.id)} hitSlop={6}>
            <Text style={s.saveLaterText}>Daha Sonra Al</Text>
          </Pressable>
          <Pressable onPress={() => onRemove(item.id)} hitSlop={6}>
            <Text style={s.removeText}>Sil</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// ── CartSellerGroup ────────────────────────────────────────────────────────────
function CartSellerGroup({
  group,
  onUpdateQty,
  onRemove,
  onSaveLater,
}: {
  group: SellerGroup;
  onUpdateQty: (id: number, qty: number) => void;
  onRemove: (id: number) => void;
  onSaveLater: (id: number) => void;
}) {
  const { colors: C } = useTheme();
  const s = useMemo(() => createStyles(C), [C]);

  const hasPhysical = group.items.some((i) => !i.isDigital);
  return (
    <View style={s.groupCard}>
      <View style={s.groupHeader}>
        <Text style={s.groupHeaderText}>
          {!hasPhysical ? "🎨" : "🏪"} {group.storeName}
          <Text style={s.groupCount}> ({group.items.length})</Text>
        </Text>
        {group.hasFreeShip && hasPhysical ? (
          <Text style={s.shipFreeBadge}>✓ Kargo Ücretsiz</Text>
        ) : group.shippingCost > 0 ? (
          <Text style={s.shippingBadge}>+{fmt(group.shippingCost)}₺ kargo</Text>
        ) : null}
      </View>

      <View style={s.groupBody}>
        <FreeShippingBar group={group} />
        {group.items.map((item, idx) => (
          <View key={item.id}>
            <CartItemRow item={item} onUpdateQty={onUpdateQty} onRemove={onRemove} onSaveLater={onSaveLater} />
            {idx < group.items.length - 1 && <View style={s.divider} />}
          </View>
        ))}
      </View>
    </View>
  );
}

// ── SavedItems ─────────────────────────────────────────────────────────────────
function SavedItems({ items, onMoveToCart }: { items: CartItem[]; onMoveToCart: (id: number) => void }) {
  const { colors: C } = useTheme();
  const s = useMemo(() => createStyles(C), [C]);

  if (items.length === 0) return null;
  return (
    <View style={s.savedSection}>
      <Text style={s.savedTitle}>Daha Sonra Alınacaklar ({items.length})</Text>
      {items.map((item) => (
        <View key={item.id} style={s.savedRow}>
          <View style={s.savedImg}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={s.savedImgInner} resizeMode="cover" />
            ) : (
              <View style={[s.savedImgInner, s.itemImgPlaceholder]}>
                <Text style={{ fontSize: 16 }}>{item.isDigital ? "🎨" : "📦"}</Text>
              </View>
            )}
          </View>
          <View style={s.savedInfo}>
            <Text style={s.savedName} numberOfLines={1}>{item.name}</Text>
            <Text style={s.savedPrice}>{fmt(item.price)}₺</Text>
          </View>
          <Pressable onPress={() => onMoveToCart(item.id)} hitSlop={8}>
            <Text style={s.moveToCartText}>Sepete Taşı</Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}

// ── Empty State ────────────────────────────────────────────────────────────────
function EmptyCart({ onShop }: { onShop: () => void }) {
  const { colors: C } = useTheme();
  const s = useMemo(() => createStyles(C), [C]);

  return (
    <View style={s.emptyWrap}>
      <Text style={s.emptyEmoji}>🛒</Text>
      <Text style={s.emptyTitle}>Sepetiniz Boş</Text>
      <Text style={s.emptySub}>Hayalindeki ürünleri keşfet ve sepetine ekle.</Text>
      <Pressable onPress={onShop} style={s.emptyBtn}>
        <Text style={s.emptyBtnText}>Alışverişe Başla</Text>
      </Pressable>
    </View>
  );
}

// ── Ana Ekran ──────────────────────────────────────────────────────────────────
export default function CartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors: C, isDark } = useTheme();
  const s = useMemo(() => createStyles(C), [C]);
  const {
    items, savedItems,
    updateQty, removeItem, saveForLater, moveToCart, clearCart,
    totalQty, totalPrice, shippingTotal, grandTotal,
    sellerGroups,
  } = useCart();

  const handleClear = () => {
    if (items.length === 0) return;
    Alert.alert(
      "Sepeti Temizle",
      "Tüm ürünler silinecek, emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        { text: "Temizle", style: "destructive", onPress: clearCart },
      ],
    );
  };

  return (
    <View style={[s.root, { backgroundColor: C.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Başlık */}
      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={s.backBtn} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={C.foreground} />
        </Pressable>
        <Text style={s.headerTitle}>
          Sepetim{totalQty > 0 ? ` (${totalQty})` : ""}
        </Text>
        {items.length > 0 ? (
          <Pressable onPress={handleClear} style={s.clearBtn}>
            <Text style={s.clearText}>Temizle</Text>
          </Pressable>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      {items.length === 0 ? (
        <EmptyCart onShop={() => router.push("/(tabs)")} />
      ) : (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
          >
            <View style={s.content}>
              {sellerGroups.map((group) => (
                <CartSellerGroup
                  key={group.storeName}
                  group={group}
                  onUpdateQty={updateQty}
                  onRemove={removeItem}
                  onSaveLater={saveForLater}
                />
              ))}

              <SavedItems items={savedItems} onMoveToCart={moveToCart} />

              {/* Özet */}
              <View style={s.summaryCard}>
                <Text style={s.summaryTitle}>Sipariş Özeti</Text>
                <View style={s.summaryRow}>
                  <Text style={s.summaryLabel}>Ara Toplam ({totalQty} ürün)</Text>
                  <Text style={s.summaryValue}>{fmt(totalPrice)}₺</Text>
                </View>
                <View style={s.summaryRow}>
                  <Text style={s.summaryLabel}>Kargo</Text>
                  {shippingTotal === 0 ? (
                    <Text style={[s.summaryValue, { color: "#10b981" }]}>Ücretsiz</Text>
                  ) : (
                    <Text style={s.summaryValue}>{fmt(shippingTotal)}₺</Text>
                  )}
                </View>
                {shippingTotal > 0 && (
                  <Text style={s.shipNote}>500₺ üzeri fiziksel ürünlerde her satıcıdan kargo bedava</Text>
                )}
                <View style={[s.summaryRow, s.totalRow]}>
                  <Text style={s.totalLabel}>Ödenecek Tutar</Text>
                  <Text style={s.totalValue}>{fmt(grandTotal)}₺</Text>
                </View>
              </View>

              {/* Güven rozetleri */}
              <View style={s.trustRow}>
                {[
                  { icon: "🚚", label: "Hızlı Kargo" },
                  { icon: "↩️", label: "14 Gün İade" },
                  { icon: "🔒", label: "Güvenli Ödeme" },
                ].map((b) => (
                  <View key={b.label} style={s.trustItem}>
                    <Text style={s.trustIcon}>{b.icon}</Text>
                    <Text style={s.trustLabel}>{b.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* ── Sticky Bottom Bar ────────────────────────────────────────── */}
          <View style={[s.stickyBar, { paddingBottom: insets.bottom + 12 }]}>
            <View style={s.stickyLeft}>
              <Text style={s.stickyLabel}>Ödenecek</Text>
              <Text style={s.stickyTotal}>{fmt(grandTotal)}₺</Text>
            </View>
            <Pressable onPress={() => router.push("/odeme")} style={s.checkoutBtn}>
              <Text style={s.checkoutBtnText}>Siparişi Onayla →</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}
