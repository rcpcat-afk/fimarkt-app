import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../constants";
import { getProduct, getProducts, Product } from "../src/services/sanatkat";
import { useCart } from "../src/store/CartContext";
import { useFavorites } from "../src/store/FavoritesContext";

const { width } = Dimensions.get("window");

export default function ProductDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addToCart, items } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [favState, setFavState] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [zoomVisible, setZoomVisible] = useState(false);
  const [zoomImg, setZoomImg] = useState("");
  const [showFullDesc, setShowFullDesc] = useState(false);

  useEffect(() => {
    if (id) loadProduct();
  }, [id]);

  useEffect(() => {
    if (product) {
      setAdded(!!items.find((i) => i.product.id === product.id));
      setFavState(isFavorite(product.id));
      loadRelated();
    }
  }, [items, product]);

  const loadProduct = async () => {
    setLoading(true);
    const p = await getProduct(Number(id));
    setProduct(p);
    setLoading(false);
  };

  const loadRelated = async () => {
    if (!product) return;
    const catId = product.categories[0]?.id;
    const prods = await getProducts(1, 8, catId);
    setRelated(prods.filter((p) => p.id !== product.id).slice(0, 6));
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveImg(index);
  };

  if (loading)
    return (
      <View style={styles.loadingArea}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );

  if (!product)
    return (
      <View style={styles.loadingArea}>
        <Text style={{ color: Colors.text2 }}>Ürün bulunamadı</Text>
      </View>
    );

  const images = product.images.length > 0 ? product.images : [{ src: "" }];
  const longDesc = product.description.replace(/<[^>]*>/g, "").trim();
  const shortDesc = product.short_description.replace(/<[^>]*>/g, "").trim();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* GERİ BUTONU */}
      <TouchableOpacity
        style={[styles.backBtn, { top: insets.top + 10 }]}
        onPress={() => router.back()}
      >
        <Text style={styles.backArrow}>‹</Text>
      </TouchableOpacity>

      {/* FAVORİ BUTONU */}
      <TouchableOpacity
        style={[styles.iconBtn, { top: insets.top + 10, right: 64 }]}
        onPress={() => {
          if (!product) return;
          toggleFavorite(product.id);
          setFavState(!favState);
        }}
      >
        <Text
          style={[
            styles.iconBtnText,
            { color: favState ? "#ef4444" : Colors.text2 },
          ]}
        >
          ♥
        </Text>
      </TouchableOpacity>

      {/* SEPET BUTONU */}
      <TouchableOpacity
        style={[styles.iconBtn, { top: insets.top + 10, right: 16 }]}
        onPress={() => router.push("/cart")}
      >
        <Text style={styles.iconBtnText}>🛒</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* RESİM GALERİSİ */}
        <FlatList
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => {
                setZoomImg(item.src);
                setZoomVisible(true);
              }}
            >
              {item.src ? (
                <Image
                  source={{ uri: item.src }}
                  style={styles.image}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.image, styles.imagePlaceholder]}>
                  <Text style={{ fontSize: 80 }}>🏛️</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        />

        {/* NOKTA GÖSTERGESİ */}
        {images.length > 1 && (
          <View style={styles.dots}>
            {images.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === activeImg && styles.dotActive]}
              />
            ))}
          </View>
        )}

        <View style={styles.content}>
          {/* KATEGORİ */}
          {product.categories[0] && (
            <Text style={styles.category}>{product.categories[0].name}</Text>
          )}

          {/* İSİM */}
          <Text style={styles.name}>{product.name}</Text>

          {/* FİYAT */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>
              {product.sale_price || product.regular_price}₺
            </Text>
            {product.sale_price && (
              <>
                <Text style={styles.oldPrice}>{product.regular_price}₺</Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>
                    %
                    {Math.round(
                      (1 -
                        Number(product.sale_price) /
                          Number(product.regular_price)) *
                        100,
                    )}{" "}
                    İNDİRİM
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* STOK */}
          <View style={styles.stockRow}>
            <View
              style={[
                styles.stockDot,
                {
                  backgroundColor:
                    product.stock_status === "instock"
                      ? Colors.green
                      : Colors.red,
                },
              ]}
            />
            <Text style={styles.stockText}>
              {product.stock_status === "instock" ? "Stokta Var" : "Stok Yok"}
            </Text>
          </View>

          {/* KISA AÇIKLAMA */}
          {shortDesc ? (
            <View style={styles.descBox}>
              <Text style={styles.descTitle}>Ürün Hakkında</Text>
              <Text style={styles.desc}>{shortDesc}</Text>
            </View>
          ) : null}

          {/* UZUN AÇIKLAMA */}
          {longDesc ? (
            <View style={styles.descBox}>
              <Text style={styles.descTitle}>Ürün Detayları</Text>
              <Text
                style={styles.desc}
                numberOfLines={showFullDesc ? undefined : 4}
              >
                {longDesc}
              </Text>
              <TouchableOpacity
                style={styles.showMoreBtn}
                onPress={() => setShowFullDesc(!showFullDesc)}
              >
                <Text style={styles.showMoreText}>
                  {showFullDesc ? "Daha Az Göster ▲" : "Devamını Göster ▼"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* BENZER ÜRÜNLER */}
          {related.length > 0 && (
            <View style={styles.relatedSection}>
              <Text style={styles.relatedTitle}>Benzer Ürünler</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.relatedScroll}
              >
                {related.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.relatedCard}
                    onPress={() =>
                      router.push({
                        pathname: "/product-detail",
                        params: { id: item.id },
                      })
                    }
                    activeOpacity={0.85}
                  >
                    {item.images[0]?.src ? (
                      <Image
                        source={{ uri: item.images[0].src }}
                        style={styles.relatedImg}
                        resizeMode="cover"
                      />
                    ) : (
                      <View
                        style={[
                          styles.relatedImg,
                          styles.relatedImgPlaceholder,
                        ]}
                      >
                        <Text style={{ fontSize: 28 }}>🏛️</Text>
                      </View>
                    )}
                    <View style={styles.relatedInfo}>
                      <Text style={styles.relatedName} numberOfLines={2}>
                        {item.name}
                      </Text>
                      <Text style={styles.relatedPrice}>
                        {item.sale_price || item.regular_price}₺
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* SEPETE EKLE — STICKY FOOTER */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.footerInner}>
          <View>
            <Text style={styles.footerPriceLabel}>Toplam Fiyat</Text>
            <Text style={styles.footerPrice}>
              {product.sale_price || product.regular_price}₺
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.addBtn,
              added && styles.addBtnAdded,
              product.stock_status !== "instock" && styles.addBtnDisabled,
            ]}
            onPress={handleAddToCart}
            disabled={product.stock_status !== "instock"}
          >
            <Text style={styles.addBtnText}>
              {product.stock_status !== "instock"
                ? "Stok Yok"
                : added
                  ? "✓ Sepete Eklendi"
                  : "🛒 Sepete Ekle"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ZOOM MODAL */}
      <Modal visible={zoomVisible} transparent animationType="fade">
        <View style={styles.modal}>
          <FlatList
            data={images}
            horizontal
            pagingEnabled
            style={{ flexGrow: 0 }}
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={activeImg}
            getItemLayout={(_, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
            keyExtractor={(_, i) => String(i)}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item.src }}
                style={styles.zoomImg}
                resizeMode="contain"
              />
            )}
          />
          <TouchableOpacity
            style={styles.zoomCloseBtn}
            onPress={() => setZoomVisible(false)}
          >
            <Text style={styles.zoomCloseText}>✕ Kapat</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  loadingArea: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },

  // Üst butonlar
  backBtn: {
    position: "absolute",
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(10,10,20,0.85)",
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: {
    fontSize: 28,
    color: Colors.text,
    lineHeight: 32,
    marginTop: -2,
  },
  iconBtn: {
    position: "absolute",
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(10,10,20,0.85)",
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnText: { fontSize: 16, color: Colors.text2 },

  // Görsel
  image: { width, height: 380 },
  imagePlaceholder: {
    backgroundColor: "#1a1a2e",
    alignItems: "center",
    justifyContent: "center",
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 99,
    backgroundColor: Colors.border,
  },
  dotActive: { backgroundColor: Colors.accent, width: 18 },

  // İçerik
  content: { padding: 24 },
  category: {
    fontSize: 11,
    color: Colors.accent,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  name: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.5,
    lineHeight: 30,
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  price: { fontSize: 26, fontWeight: "800", color: Colors.accent },
  oldPrice: {
    fontSize: 14,
    color: Colors.text3,
    textDecorationLine: "line-through",
  },
  discountBadge: {
    backgroundColor: "rgba(239,68,68,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 99,
  },
  discountText: { fontSize: 11, color: "#ef4444", fontWeight: "600" },
  stockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  stockDot: { width: 8, height: 8, borderRadius: 99 },
  stockText: { fontSize: 13, color: Colors.text2 },
  descBox: {
    backgroundColor: Colors.surface2,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  descTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.text2,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  desc: { fontSize: 13, color: Colors.text2, lineHeight: 21 },
  showMoreBtn: { marginTop: 10, alignSelf: "flex-start" },
  showMoreText: { fontSize: 12, color: Colors.accent, fontWeight: "600" },

  // Benzer Ürünler
  relatedSection: { marginTop: 8 },
  relatedTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 14,
  },
  relatedScroll: { gap: 12, paddingRight: 4 },
  relatedCard: {
    width: 130,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    overflow: "hidden",
  },
  relatedImg: { width: "100%", height: 100 },
  relatedImgPlaceholder: {
    backgroundColor: "#1a1a2e",
    alignItems: "center",
    justifyContent: "center",
  },
  relatedInfo: { padding: 8 },
  relatedName: {
    fontSize: 10,
    color: Colors.text,
    marginBottom: 4,
    lineHeight: 14,
  },
  relatedPrice: { fontSize: 12, fontWeight: "700", color: Colors.accent },

  // Footer
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerPriceLabel: { fontSize: 11, color: Colors.text2, marginBottom: 2 },
  footerPrice: { fontSize: 20, fontWeight: "800", color: Colors.text },
  addBtn: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
  },
  addBtnAdded: { backgroundColor: Colors.green },
  addBtnDisabled: { backgroundColor: Colors.border },
  addBtnText: { fontSize: 15, fontWeight: "700", color: "#fff" },

  // Zoom
  modal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
  },
  zoomImg: { width, height: width * 1.1 },
  zoomCloseBtn: { alignSelf: "center", marginTop: 24, padding: 12 },
  zoomCloseText: { color: "#fff", fontSize: 14, opacity: 0.7 },
});
