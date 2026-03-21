import { useState, useMemo, useEffect, useCallback } from "react";
import {
  View, Text, FlatList, Pressable, StyleSheet,
  ActivityIndicator, Platform,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, FontSizes, LineHeights } from "@/constants/theme";
import { TOP_CATEGORIES }              from "@/constants/categories";
import { getProductsByPillarCategory } from "@/lib/mock-data/products";
import { getFilterConfig }             from "@/lib/filter-config";
import AppProductCard                  from "@/components/product/AppProductCard";
import FilterBottomSheet               from "@/components/ui/FilterBottomSheet";
import type { ActiveFilters, Product } from "@/lib/types";

const C = Colors.dark;

type SortKey = "onerilen" | "fiyat-asc" | "fiyat-desc" | "puan" | "cok-satan";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "onerilen",   label: "Önerilen"         },
  { value: "cok-satan",  label: "Çok Satanlar"     },
  { value: "fiyat-asc",  label: "Fiyat: Artan"     },
  { value: "fiyat-desc", label: "Fiyat: Azalan"    },
  { value: "puan",       label: "En Yüksek Puan"   },
];

// ── Sıralama ──────────────────────────────────────────────────────────────────
function sortProducts(products: Product[], sort: SortKey): Product[] {
  return [...products].sort((a, b) => {
    switch (sort) {
      case "fiyat-asc":  return a.price - b.price;
      case "fiyat-desc": return b.price - a.price;
      case "puan":       return b.rating - a.rating;
      case "cok-satan":  return b.reviewCount - a.reviewCount;
      default:           return 0;
    }
  });
}

// ── Filtreleme ────────────────────────────────────────────────────────────────
function filterProducts(
  products:   Product[],
  active:     ActiveFilters,
  priceRange: [number, number],
): Product[] {
  return products.filter((p) => {
    if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
    for (const [groupId, values] of Object.entries(active)) {
      if (!values.length) continue;
      if (groupId === "brand") {
        const slug = p.brand.toLowerCase().replace(/\s+/g, "-");
        if (!values.includes(slug)) return false;
      } else {
        const spec  = String(p.specs[groupId] ?? "").toLowerCase();
        const match = values.some((v) => spec.includes(v.toLowerCase()));
        if (!match) return false;
      }
    }
    return true;
  });
}

// ── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonGrid() {
  return (
    <View style={skeletonStyles.row}>
      {[0, 1].map((i) => (
        <View key={i} style={skeletonStyles.card}>
          <View style={skeletonStyles.image} />
          <View style={skeletonStyles.body}>
            <View style={skeletonStyles.line} />
            <View style={[skeletonStyles.line, { width: "100%" }]} />
            <View style={[skeletonStyles.line, { width: "60%" }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  row:   { flexDirection: "row", gap: 10, marginBottom: 10 },
  card:  { flex: 1, backgroundColor: C.surface, borderRadius: 16, overflow: "hidden" },
  image: { aspectRatio: 1, backgroundColor: C.surface2 },
  body:  { padding: 10, gap: 6 },
  line:  { height: 10, width: "75%", backgroundColor: C.surface2, borderRadius: 4 },
});

// ── Sort Bottom Sheet (Hafif) ─────────────────────────────────────────────────
function SortSheet({
  current, onSelect, onClose,
}: { current: SortKey; onSelect: (s: SortKey) => void; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[sortStyles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      <View style={sortStyles.handle} />
      <Text style={sortStyles.title}>Sıralama</Text>
      {SORT_OPTIONS.map((opt) => (
        <Pressable
          key={opt.value}
          onPress={() => { onSelect(opt.value); onClose(); }}
          style={({ pressed }) => [
            sortStyles.option,
            current === opt.value && sortStyles.optionActive,
            pressed && { opacity: 0.8 },
          ]}
        >
          <Text style={[sortStyles.optionText, current === opt.value && sortStyles.optionTextActive]}>
            {opt.label}
          </Text>
          {current === opt.value && (
            <Text style={{ color: C.accent, fontSize: 16 }}>✓</Text>
          )}
        </Pressable>
      ))}
    </View>
  );
}

const sortStyles = StyleSheet.create({
  sheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderWidth: 1, borderBottomWidth: 0, borderColor: C.border,
    paddingHorizontal: 16,
  },
  handle: {
    width: 40, height: 4, backgroundColor: C.border,
    borderRadius: 2, alignSelf: "center", marginTop: 12, marginBottom: 8,
  },
  title:    { fontSize: FontSizes.lg, fontWeight: "700", color: C.foreground, marginBottom: 12 },
  option: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  optionActive: { borderBottomColor: `${C.accent}30` },
  optionText: { fontSize: FontSizes.base, color: C.mutedForeground },
  optionTextActive: { color: C.foreground, fontWeight: "700" },
});

// ── Ana Sayfa ─────────────────────────────────────────────────────────────────
export default function CategoryScreen() {
  const { pillar: pillarSlug, category: categorySlug } =
    useLocalSearchParams<{ pillar: string; category: string }>();
  const router  = useRouter();
  const insets  = useSafeAreaInsets();

  // Meta
  const pillarData   = TOP_CATEGORIES.find((p) => p.slug === pillarSlug);
  const categoryData = pillarData?.children
    .flatMap((c) => [c, ...(c.children ?? [])])
    .find((c) => c.slug === categorySlug);
  const title = categoryData?.title ?? categorySlug ?? "Kategori";

  // Veri
  const allProducts = useMemo(
    () => getProductsByPillarCategory(pillarSlug ?? "", categorySlug ?? ""),
    [pillarSlug, categorySlug],
  );
  const filterConfig = useMemo(() => getFilterConfig(categorySlug ?? ""), [categorySlug]);
  const defaultPrice = useMemo((): [number, number] => {
    if (allProducts.length > 0) {
      const prices = allProducts.map((p) => p.price);
      return [0, Math.max(...prices)];
    }
    const r = filterConfig.find((g) => g.type === "range");
    return [r?.min ?? 0, r?.max ?? 100000];
  }, [filterConfig, allProducts]);

  // State
  const [loading,       setLoading]       = useState(true);
  const [layout,        setLayout]        = useState<"grid" | "list">("grid");
  const [sort,          setSort]          = useState<SortKey>("onerilen");
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});
  const [priceRange,    setPriceRange]    = useState<[number, number]>(defaultPrice);
  const [filterOpen,    setFilterOpen]    = useState(false);
  const [sortOpen,      setSortOpen]      = useState(false);

  // Kategori değişince sıfırla
  useEffect(() => {
    setActiveFilters({});
    setPriceRange(defaultPrice);
    setSort("onerilen");
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, [categorySlug]);

  const totalActive = Object.values(activeFilters).flat().length;

  const handleFilterChange = useCallback(
    (groupId: string, value: string, checked: boolean) => {
      setActiveFilters((prev) => {
        const cur = prev[groupId] ?? [];
        return {
          ...prev,
          [groupId]: checked ? [...cur, value] : cur.filter((v) => v !== value),
        };
      });
    },
    [],
  );

  const handleClear = useCallback(() => {
    setActiveFilters({});
    setPriceRange(defaultPrice);
  }, [defaultPrice]);

  // Filtrelenmiş + sıralanmış ürünler
  const products = useMemo(
    () => sortProducts(filterProducts(allProducts, activeFilters, priceRange), sort),
    [allProducts, activeFilters, priceRange, sort],
  );

  // FlatList renderItem
  const renderItem = useCallback(
    ({ item }: { item: Product }) => (
      <View style={layout === "grid" ? listStyles.gridItem : listStyles.listItem}>
        <AppProductCard product={item} layout={layout} />
      </View>
    ),
    [layout],
  );

  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Önerilen";

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[listStyles.container, { paddingTop: insets.top }]}>

        {/* ── Header ────────────────────────────────────────────────────── */}
        <View style={listStyles.header}>
          <Pressable onPress={() => router.back()} style={listStyles.backBtn} hitSlop={8}>
            <Ionicons name="arrow-back" size={20} color={C.foreground} />
          </Pressable>
          <Text style={listStyles.headerTitle} numberOfLines={1}>{title}</Text>
          <View style={listStyles.layoutToggle}>
            <Pressable
              onPress={() => setLayout("grid")}
              style={[listStyles.toggleBtn, layout === "grid" && listStyles.toggleActive]}
            >
              <Ionicons name="grid-outline" size={16} color={layout === "grid" ? C.accent : C.mutedForeground} />
            </Pressable>
            <Pressable
              onPress={() => setLayout("list")}
              style={[listStyles.toggleBtn, layout === "list" && listStyles.toggleActive]}
            >
              <Ionicons name="list-outline" size={16} color={layout === "list" ? C.accent : C.mutedForeground} />
            </Pressable>
          </View>
        </View>

        {/* ── Sonuç Sayısı ──────────────────────────────────────────────── */}
        <View style={listStyles.metaBar}>
          <Text style={listStyles.resultCount}>
            {loading ? "Yükleniyor…" : `${products.length} ürün`}
          </Text>
          {/* Sort Butonu */}
          <Pressable
            onPress={() => setSortOpen(true)}
            style={listStyles.sortBtn}
          >
            <Text style={listStyles.sortBtnText}>{currentSortLabel}</Text>
            <Ionicons name="chevron-down" size={12} color={C.mutedForeground} />
          </Pressable>
        </View>

        {/* ── Ürün Listesi ──────────────────────────────────────────────── */}
        {loading ? (
          <View style={{ paddingHorizontal: 14, paddingTop: 8 }}>
            {[0, 1, 2].map((i) => <SkeletonGrid key={i} />)}
          </View>
        ) : (
          <FlatList
            data={products}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            numColumns={layout === "grid" ? 2 : 1}
            key={layout}   // layout değişince FlatList'i sıfırla (numColumns)
            columnWrapperStyle={layout === "grid" ? listStyles.columnWrapper : undefined}
            contentContainerStyle={listStyles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={listStyles.empty}>
                <Text style={listStyles.emptyIcon}>🔍</Text>
                <Text style={listStyles.emptyTitle}>Ürün bulunamadı</Text>
                <Text style={listStyles.emptyDesc}>Filtrelerinizi değiştirmeyi deneyin.</Text>
                <Pressable onPress={handleClear} style={listStyles.emptyBtn}>
                  <Text style={listStyles.emptyBtnText}>Filtreleri Temizle</Text>
                </Pressable>
              </View>
            }
          />
        )}

        {/* ── Sticky Alt Bar: Sırala + Filtrele ────────────────────────── */}
        <View style={[listStyles.bottomBar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
          <Pressable
            onPress={() => setSortOpen(true)}
            style={({ pressed }) => [listStyles.bottomBtn, pressed && { opacity: 0.8 }]}
          >
            <Ionicons name="chevron-down" size={15} color={C.foreground} />
            <Text style={listStyles.bottomBtnText}>Sırala</Text>
          </Pressable>

          <View style={listStyles.bottomDivider} />

          <Pressable
            onPress={() => setFilterOpen(true)}
            style={({ pressed }) => [listStyles.bottomBtn, pressed && { opacity: 0.8 }]}
          >
            <Ionicons name="options-outline" size={15} color={totalActive > 0 ? C.accent : C.foreground} />
            <Text style={[listStyles.bottomBtnText, totalActive > 0 && { color: C.accent }]}>
              Filtrele{totalActive > 0 ? ` (${totalActive})` : ""}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* ── Filter Bottom Sheet ───────────────────────────────────────────── */}
      <FilterBottomSheet
        visible={filterOpen}
        filters={filterConfig}
        active={activeFilters}
        priceRange={priceRange}
        totalActive={totalActive}
        onFilterChange={handleFilterChange}
        onPriceChange={setPriceRange}
        onClear={handleClear}
        onClose={() => setFilterOpen(false)}
      />

      {/* ── Sort Bottom Sheet ─────────────────────────────────────────────── */}
      {sortOpen && (
        <View style={sortSheetOverlayStyle.overlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setSortOpen(false)}
          />
          <SortSheet
            current={sort}
            onSelect={setSort}
            onClose={() => setSortOpen(false)}
          />
        </View>
      )}
    </>
  );
}

const sortSheetOverlayStyle = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 100,
  },
});

// ── List Styles ───────────────────────────────────────────────────────────────
const listStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },

  header: {
    flexDirection:  "row",
    alignItems:     "center",
    paddingHorizontal: 14,
    paddingVertical:   10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: 10,
  },
  backBtn:     { padding: 2 },
  headerTitle: {
    flex: 1, fontSize: FontSizes.lg,
    fontWeight: "700", color: C.foreground,
  },
  layoutToggle: { flexDirection: "row", gap: 4 },
  toggleBtn: {
    width: 32, height: 32, borderRadius: 8,
    borderWidth: 1, borderColor: C.border,
    backgroundColor: C.surface2,
    alignItems: "center", justifyContent: "center",
  },
  toggleActive: { borderColor: C.accent, backgroundColor: `${C.accent}15` },

  metaBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 14, paddingVertical: 8,
  },
  resultCount: { fontSize: FontSizes.xs, color: C.mutedForeground },
  sortBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingVertical: 4, paddingHorizontal: 8,
    borderRadius: 8, borderWidth: 1, borderColor: C.border,
    backgroundColor: C.surface2,
  },
  sortBtnText: { fontSize: FontSizes.xs, color: C.mutedForeground },

  listContent:    { padding: 14, paddingBottom: 80 },
  columnWrapper:  { gap: 10 },
  gridItem:       { flex: 1, marginBottom: 10 },
  listItem:       { marginBottom: 10 },

  empty: { alignItems: "center", paddingVertical: 60 },
  emptyIcon:     { fontSize: 44, marginBottom: 12 },
  emptyTitle:    { fontSize: FontSizes.lg, fontWeight: "700", color: C.foreground, marginBottom: 4 },
  emptyDesc:     { fontSize: FontSizes.sm, color: C.mutedForeground, marginBottom: 20, textAlign: "center" },
  emptyBtn: {
    paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: C.accent, borderRadius: 12,
  },
  emptyBtnText: { fontSize: FontSizes.sm, fontWeight: "700", color: "#fff" },

  bottomBar: {
    flexDirection:  "row",
    borderTopWidth: 1,
    borderTopColor: C.border,
    backgroundColor: C.surface,
    paddingTop: 10,
  },
  bottomBtn: {
    flex: 1, flexDirection: "row",
    alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 4,
  },
  bottomBtnText: { fontSize: FontSizes.sm, fontWeight: "600", color: C.foreground },
  bottomDivider: { width: 1, backgroundColor: C.border, marginVertical: 4 },
});
