// ─── Satıcı Lite Envanter — App ───────────────────────────────────────────────
// Web tablosunun mobil karşılığı: kart görünümü.
// Fiyat ve Stok "Hızlı Güncelle" — tam ürün ekleme yok (Lite Panel kuralı).
// useTheme() ile dark/light uyumlu.
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../hooks/useTheme";
import {
  MOCK_PARTNER_PRODUCTS,
  type PartnerProduct,
  type ProductStatus,
} from "../../lib/mock-data/partner-products";

const TL = (n: number) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency", currency: "TRY", maximumFractionDigits: 0,
  }).format(n);

const totalStock = (p: PartnerProduct): number | null => {
  if (p.stock !== null) return p.stock;
  if (p.variations?.length) {
    return p.variations.flatMap(v => v.values).reduce((s, v) => s + v.stock, 0);
  }
  return null;
};

// ─── Hızlı Güncelle Modal ────────────────────────────────────────────────────
function QuickEditModal({ product, visible, onClose, onSave, colors }: {
  product: PartnerProduct | null;
  visible: boolean;
  onClose: () => void;
  onSave:  (id: string, price: number, stock: number | null) => void;
  colors:  ReturnType<typeof useTheme>["colors"];
}) {
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  React.useEffect(() => {
    if (product) {
      setPrice(String(product.price));
      setStock(product.stock !== null ? String(product.stock) : "");
    }
  }, [product]);

  const handleSave = () => {
    if (!product) return;
    const p = parseFloat(price);
    const s = stock ? parseInt(stock) : null;
    if (isNaN(p) || p <= 0) {
      Alert.alert("Hata", "Geçerli bir fiyat girin.");
      return;
    }
    onSave(product.id, p, s);
    onClose();
  };

  if (!product) return null;

  const inputStyle = {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    color: colors.foreground,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 16,
    fontFamily: "monospace" as const,
    marginBottom: 14,
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1, justifyContent: "flex-end" }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View style={{
          backgroundColor: colors.surface2,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: 24,
          borderTopWidth: 1,
          borderColor: colors.border,
        }}>
          {/* Handle */}
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: "center", marginBottom: 20 }} />

          <Text style={{ fontSize: 16, fontWeight: "800", color: colors.foreground, marginBottom: 4 }}>
            Hızlı Güncelle
          </Text>
          <Text style={{ fontSize: 12, color: colors.mutedForeground, marginBottom: 20 }} numberOfLines={1}>
            {product.name}
          </Text>

          <Text style={{ fontSize: 10, fontWeight: "800", color: colors.subtleForeground, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
            Fiyat (₺)
          </Text>
          <TextInput
            style={inputStyle}
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
            placeholderTextColor={colors.subtleForeground}
          />

          {product.type === "physical" && product.stock !== null && (
            <>
              <Text style={{ fontSize: 10, fontWeight: "800", color: colors.subtleForeground, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
                Stok Adedi
              </Text>
              <TextInput
                style={inputStyle}
                value={stock}
                onChangeText={setStock}
                keyboardType="number-pad"
                placeholderTextColor={colors.subtleForeground}
              />
            </>
          )}

          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity
              onPress={onClose}
              style={{ flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: "center" }}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 14, fontWeight: "700", color: colors.mutedForeground }}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              style={{ flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: "#ff6b2b", alignItems: "center" }}
              activeOpacity={0.85}
            >
              <Text style={{ fontSize: 14, fontWeight: "900", color: "#fff" }}>Kaydet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Ürün Kartı ───────────────────────────────────────────────────────────────
function ProductCard({ product, onQuickEdit, onToggle, colors }: {
  product:     PartnerProduct;
  onQuickEdit: (p: PartnerProduct) => void;
  onToggle:    (id: string) => void;
  colors:      ReturnType<typeof useTheme>["colors"];
}) {
  const stock    = totalStock(product);
  const lowStock = stock !== null && stock < 10 && product.type === "physical";

  return (
    <View style={{
      backgroundColor: colors.surface2,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 10,
      overflow: "hidden",
    }}>
      <View style={{ flexDirection: "row" }}>
        {/* Emoji kutusu */}
        <View style={{
          width: 72,
          backgroundColor: product.bgColor,
          alignItems: "center",
          justifyContent: "center",
        }}>
          <Text style={{ fontSize: 28 }}>{product.imageEmoji}</Text>
        </View>

        {/* İçerik */}
        <View style={{ flex: 1, padding: 12 }}>
          {/* Üst satır */}
          <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 }}>
            <Text style={{ fontSize: 13, fontWeight: "800", color: colors.foreground, flex: 1, marginRight: 8 }} numberOfLines={2}>
              {product.name}
            </Text>
            {/* Status toggle */}
            <TouchableOpacity
              onPress={() => onToggle(product.id)}
              activeOpacity={0.8}
              style={{
                width: 36, height: 20, borderRadius: 10,
                backgroundColor: product.status === "active" ? "#22c55e" : colors.border,
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <View style={{
                width: 16, height: 16, borderRadius: 8, backgroundColor: "#fff",
                marginLeft: product.status === "active" ? 18 : 2,
                shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 2, elevation: 2,
              }} />
            </TouchableOpacity>
          </View>

          {/* Meta */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Text style={{ fontSize: 15, fontWeight: "900", color: colors.foreground, fontFamily: "monospace" }}>
              {TL(product.price)}
            </Text>
            <Text style={{ fontSize: 11, color: colors.subtleForeground }}>·</Text>
            {product.type === "digital" ? (
              <Text style={{ fontSize: 11, color: colors.mutedForeground }}>∞ Dijital</Text>
            ) : (
              <Text style={{ fontSize: 11, fontWeight: "700", color: lowStock ? "#f59e0b" : colors.mutedForeground }}>
                {stock} adet{lowStock ? " ⚠" : ""}
              </Text>
            )}
            {product.variations?.length ? (
              <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 99, backgroundColor: "rgba(139,92,246,0.15)" }}>
                <Text style={{ fontSize: 9, fontWeight: "800", color: "#8b5cf6" }}>
                  {product.variations[0].values.length} var.
                </Text>
              </View>
            ) : null}
            {product.fileFormat && (
              <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 99, backgroundColor: "rgba(255,107,43,0.15)" }}>
                <Text style={{ fontSize: 9, fontWeight: "800", color: "#ff6b2b" }}>{product.fileFormat}</Text>
              </View>
            )}
          </View>

          {/* Hızlı Güncelle */}
          <TouchableOpacity
            onPress={() => onQuickEdit(product)}
            activeOpacity={0.8}
            style={{
              paddingVertical: 7,
              borderRadius: 10,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: "800", color: colors.foreground }}>
              ✏️ Hızlı Güncelle
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─── Ana Ekran ─────────────────────────────────────────────────────────────────
export default function InventoryScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const { colors } = useTheme();

  const [products,      setProducts]      = useState<PartnerProduct[]>(MOCK_PARTNER_PRODUCTS);
  const [search,        setSearch]        = useState("");
  const [filterType,    setFilterType]    = useState<"all" | "physical" | "digital">("all");
  const [editingProduct, setEditingProduct] = useState<PartnerProduct | null>(null);

  const styles = useMemo(() => StyleSheet.create({
    container:    { flex: 1, backgroundColor: colors.background },
    header:       { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 12 },
    backBtn:      { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
    backArrow:    { fontSize: 22, color: colors.foreground, lineHeight: 28, marginTop: -2 },
    headerTitle:  { fontSize: 16, fontWeight: "900", color: colors.foreground },
    headerSub:    { fontSize: 10, color: colors.mutedForeground, marginTop: 1 },
    searchBar:    { flexDirection: "row", alignItems: "center", marginHorizontal: 16, marginTop: 12, marginBottom: 8, height: 42, backgroundColor: colors.surface2, borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12 },
    searchInput:  { flex: 1, fontSize: 13, color: colors.foreground },
    filterRow:    { flexDirection: "row", paddingHorizontal: 16, gap: 8, marginBottom: 10 },
    chip:         { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99, backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border },
    chipActive:   { backgroundColor: "#ff6b2b", borderColor: "#ff6b2b" },
    chipText:     { fontSize: 11, fontWeight: "700", color: colors.mutedForeground },
    chipTextActive: { color: "#fff" },
    list:         { flex: 1 },
    listContent:  { paddingHorizontal: 16, paddingTop: 4 },
    emptyBox:     { alignItems: "center", paddingTop: 60, gap: 8 },
  }), [colors]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return products.filter(p => {
      const matchType = filterType === "all" || p.type === filterType;
      const matchQ    = !q || p.name.toLowerCase().includes(q);
      return matchType && matchQ;
    });
  }, [products, search, filterType]);

  const handleToggle = (id: string) => {
    setProducts(prev => prev.map(p =>
      p.id === id ? { ...p, status: (p.status === "active" ? "passive" : "active") as ProductStatus } : p
    ));
  };

  const handleSave = (id: string, price: number, stock: number | null) => {
    setProducts(prev => prev.map(p =>
      p.id === id ? { ...p, price, ...(stock !== null ? { stock } : {}) } : p
    ));
  };

  const typeChips = [
    { val: "all",      label: "Tümü"     },
    { val: "physical", label: "Fiziksel" },
    { val: "digital",  label: "Dijital"  },
  ] as const;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Ürünlerim</Text>
          <Text style={styles.headerSub}>
            {products.filter(p => p.status === "active").length} aktif · {products.length} toplam
          </Text>
        </View>
        <View style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ fontSize: 10, fontWeight: "700", color: colors.mutedForeground }}>Web'de tam yönet</Text>
        </View>
      </View>

      {/* Arama */}
      <View style={styles.searchBar}>
        <Text style={{ fontSize: 14, marginRight: 8 }}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Ürün ara…"
          placeholderTextColor={colors.subtleForeground}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Tip filtreleri */}
      <View style={styles.filterRow}>
        {typeChips.map(c => (
          <TouchableOpacity
            key={c.val}
            style={[styles.chip, filterType === c.val && styles.chipActive]}
            onPress={() => setFilterType(c.val)}
          >
            <Text style={[styles.chipText, filterType === c.val && styles.chipTextActive]}>
              {c.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Liste */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length > 0 ? (
          filtered.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              onQuickEdit={setEditingProduct}
              onToggle={handleToggle}
              colors={colors}
            />
          ))
        ) : (
          <View style={styles.emptyBox}>
            <Text style={{ fontSize: 48 }}>📭</Text>
            <Text style={{ fontSize: 16, fontWeight: "800", color: colors.foreground }}>Ürün bulunamadı</Text>
            <Text style={{ fontSize: 12, color: colors.mutedForeground }}>Aramayı değiştir</Text>
          </View>
        )}
      </ScrollView>

      {/* Hızlı Güncelle Modal */}
      <QuickEditModal
        product={editingProduct}
        visible={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        onSave={handleSave}
        colors={colors}
      />
    </View>
  );
}
