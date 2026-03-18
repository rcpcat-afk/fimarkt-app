import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants";
import {
  Category,
  getCategories,
  getProducts,
  Product,
} from "../../src/services/api";
import { useCart } from "../../src/store/CartContext";

export default function ShopScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { addToCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCat, setSelectedCat] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [addedIds, setAddedIds] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts(1, false);
  }, [selectedCat, searchQuery]);

  const loadCategories = async () => {
    const cats = await getCategories();
    setCategories(cats);
  };

  const loadProducts = async (pageNum = 1, append = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    const prods = await getProducts(
      pageNum,
      12,
      searchQuery ? undefined : selectedCat,
      searchQuery || undefined,
    );

    if (append) {
      setProducts((prev) => [...prev, ...prods]);
    } else {
      setProducts(prods);
    }

    setHasMore(prods.length === 12);
    setPage(pageNum);
    setLoading(false);
    setLoadingMore(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts(1, false);
    setRefreshing(false);
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    setAddedIds((prev) => [...prev, product.id]);
    setTimeout(() => {
      setAddedIds((prev) => prev.filter((id) => id !== product.id));
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.title}>
          Sanatkat <Text style={styles.accent}>Mağaza</Text>
        </Text>
        <Text style={styles.sub}>Soğuk döküm mermer heykel & biblolar</Text>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Ürün ara..."
            placeholderTextColor={Colors.text3}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Text style={styles.searchClear}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.catScroll}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
      >
        <TouchableOpacity
          style={styles.catItem}
          onPress={() => setSelectedCat(undefined)}
        >
          <View
            style={[styles.catImgWrap, !selectedCat && styles.catImgWrapActive]}
          >
            <Text style={{ fontSize: 22 }}>🏛️</Text>
          </View>
          <Text
            style={[styles.catLabel, !selectedCat && styles.catLabelActive]}
          >
            Tümü
          </Text>
        </TouchableOpacity>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={styles.catItem}
            onPress={() => setSelectedCat(cat.id)}
          >
            <View
              style={[
                styles.catImgWrap,
                selectedCat === cat.id && styles.catImgWrapActive,
              ]}
            >
              {cat.image?.src ? (
                <Image
                  source={{ uri: cat.image.src }}
                  style={styles.catImg}
                  resizeMode="cover"
                />
              ) : (
                <Text style={{ fontSize: 22 }}>🗿</Text>
              )}
            </View>
            <Text
              style={[
                styles.catLabel,
                selectedCat === cat.id && styles.catLabelActive,
              ]}
              numberOfLines={2}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.loadingArea}>
          <ActivityIndicator color={Colors.accent} size="large" />
          <Text style={styles.loadingText}>Ürünler yükleniyor...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.accent}
            />
          }
        >
          {products.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyTitle}>Ürün bulunamadı</Text>
              <Text style={styles.emptyDesc}>Arama sonucu bulunamadı</Text>
            </View>
          ) : (
            products.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={styles.card}
                onPress={() =>
                  router.push({
                    pathname: "/product-detail",
                    params: { id: product.id },
                  })
                }
                activeOpacity={0.9}
              >
                {product.images[0] ? (
                  <Image
                    source={{ uri: product.images[0].src }}
                    style={styles.cardImg}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.cardImg, styles.cardImgPlaceholder]}>
                    <Text style={{ fontSize: 40 }}>🏛️</Text>
                  </View>
                )}
                {product.sale_price && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>İNDİRİM</Text>
                  </View>
                )}
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.price}>
                      {product.sale_price || product.regular_price}₺
                    </Text>
                    {product.sale_price && (
                      <Text style={styles.oldPrice}>
                        {product.regular_price}₺
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.addBtn,
                      addedIds.includes(product.id) && styles.addBtnDone,
                    ]}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.addBtnText}>
                      {addedIds.includes(product.id)
                        ? "✓ Eklendi"
                        : "+ Sepete Ekle"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
          {hasMore && (
            <TouchableOpacity
              style={styles.loadMoreBtn}
              onPress={() => loadProducts(page + 1, true)}
              disabled={loadingMore}
            >
              {loadingMore ? (
                <ActivityIndicator color={Colors.accent} size="small" />
              ) : (
                <Text style={styles.loadMoreText}>Daha Fazla Yükle</Text>
              )}
            </TouchableOpacity>
          )}
          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { padding: 16, paddingTop: 12, paddingBottom: 8 },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.5,
  },
  accent: { color: Colors.accent },
  sub: { fontSize: 12, color: Colors.text2, marginTop: 3 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
    marginTop: 10,
  },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, fontSize: 13, color: Colors.text },
  searchClear: { fontSize: 12, color: Colors.text3 },
  catScroll: { marginBottom: 12, flexGrow: 0, flexShrink: 0 },
  catItem: { alignItems: "center" as const, width: 70 },
  catImgWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.surface2,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: 5,
  },
  catImgWrapActive: { borderColor: Colors.accent, borderWidth: 2.5 },
  catImg: { width: 56, height: 56 },
  catLabel: {
    fontSize: 10,
    color: Colors.text2,
    textAlign: "center" as const,
    lineHeight: 13,
  },
  catLabelActive: { color: Colors.accent, fontWeight: "700" },
  loadingArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: { fontSize: 13, color: Colors.text2 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    width: "47%",
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    overflow: "hidden",
  },
  cardImg: { width: "100%", height: 130 },
  cardImgPlaceholder: {
    backgroundColor: "#1a1a2e",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(239,68,68,0.9)",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 99,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
  },
  cardInfo: { padding: 10 },
  cardName: {
    fontSize: 11,
    color: Colors.text,
    marginBottom: 5,
    lineHeight: 16,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  price: { fontSize: 13, fontWeight: "700", color: Colors.accent },
  oldPrice: {
    fontSize: 10,
    color: Colors.text3,
    textDecorationLine: "line-through",
  },
  addBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 8,
    paddingVertical: 7,
    alignItems: "center",
  },
  addBtnDone: { backgroundColor: Colors.green },
  addBtnText: { fontSize: 11, fontWeight: "700", color: "#fff" },
  emptyWrap: { width: "100%", alignItems: "center", paddingTop: 60, gap: 8 },
  emptyEmoji: { fontSize: 40, marginBottom: 4 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: Colors.text },
  emptyDesc: { fontSize: 13, color: Colors.text2, textAlign: "center" },
  loadMoreBtn: {
    width: "100%",
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  loadMoreText: { fontSize: 13, fontWeight: "700", color: Colors.accent },
});
