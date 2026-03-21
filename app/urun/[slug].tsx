import { useState, useMemo } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  FlatList,
  ScrollView,
  StyleSheet,
  Dimensions,
  StatusBar,
  useWindowDimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { Colors, FontSizes, LineHeights } from "@/constants/theme";
import { getPdpProduct, type PdpProduct } from "@/lib/mock-data/pdp-product";
import { useCart } from "../../src/store/CartContext";

const C = Colors.dark;
const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ── Yıldız bileşeni ───────────────────────────────────────────────────────────
function Stars({ rating, size = 12 }: { rating: number; size?: number }) {
  const full = Math.floor(rating);
  return (
    <Text style={{ fontSize: size, color: C.warning, letterSpacing: 1 }}>
      {"★".repeat(full)}
      {"☆".repeat(5 - full)}
    </Text>
  );
}

// ── Nokta indikatörü ──────────────────────────────────────────────────────────
function DotIndicator({ count, active }: { count: number; active: number }) {
  return (
    <View style={styles.dotContainer}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={[styles.dot, i === active && styles.dotActive]}
        />
      ))}
    </View>
  );
}

// ── Ana Bileşen ───────────────────────────────────────────────────────────────
export default function UrunDetaySayfasi() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { addToCart } = useCart();

  const product: PdpProduct | null = useMemo(
    () => getPdpProduct(slug ?? ""),
    [slug],
  );

  // Varsayılan varyantlar
  const defaultVariants = useMemo(() => {
    if (!product) return {} as Record<string, string>;
    const d: Record<string, string> = {};
    for (const g of product.variantGroups) {
      if (g.options.length > 0) d[g.id] = g.options[0].id;
    }
    return d;
  }, [product]);

  const [selectedVariants, setSelectedVariants] =
    useState<Record<string, string>>(defaultVariants);
  const [qty, setQty] = useState(1);
  const [isFav, setIsFav] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Aktif fiyat
  const activePrice = useMemo(() => {
    if (!product) return 0;
    let price = product.basePrice;
    for (const group of product.variantGroups) {
      const opt = group.options.find((o) => o.id === selectedVariants[group.id]);
      if (opt?.price !== undefined) price = opt.price;
    }
    return price;
  }, [product, selectedVariants]);

  // Scroll takibi (JS thread — worklet gerektirmez)
  const scrollY = useSharedValue(0);
  const onScroll = (e: { nativeEvent: { contentOffset: { y: number } } }) => {
    scrollY.value = e.nativeEvent.contentOffset.y;
  };

  const stickyStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: withSpring(scrollY.value > 380 ? 0 : 100, {
          damping: 15,
          stiffness: 200,
        }),
      },
    ],
    opacity: withTiming(scrollY.value > 380 ? 1 : 0, { duration: 200 }),
  }));

  const handleVariantChange = (groupId: string, optionId: string) => {
    setSelectedVariants((prev) => ({ ...prev, [groupId]: optionId }));
    // Renk grubu ise aktif resmi güncelle
    const group = product?.variantGroups.find((g) => g.id === groupId);
    if (group?.type === "color") {
      const opt = group.options.find((o) => o.id === optionId);
      if (opt?.imageIndex !== undefined) setActiveImageIndex(opt.imageIndex);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: parseInt(product.id.replace(/\D/g, "")) || 1,
      name: product.title,
      price: String(activePrice),
      regular_price: String(product.basePrice),
      sale_price: product.originalPrice ? String(product.basePrice) : "",
      images: [{ id: 0, src: product.images[0], alt: product.title }],
      categories: [],
      short_description: "",
      description: product.description,
      stock_status: product.inStock ? "instock" : "outofstock",
    });
  };

  if (!product) {
    return (
      <View style={[styles.notFound, { paddingTop: insets.top }]}>
        <Text style={styles.notFoundText}>Ürün bulunamadı</Text>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Geri Dön</Text>
        </Pressable>
      </View>
    );
  }

  const hasDiscount =
    product.originalPrice && product.originalPrice > product.basePrice;
  const discountPct = hasDiscount
    ? Math.round((1 - product.basePrice / product.originalPrice!) * 100)
    : 0;

  return (
    <View style={[styles.root, { backgroundColor: C.background }]}>
      <StatusBar barStyle="light-content" />

      {/* ── Custom Header ─────────────────────────────────────────────── */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 8,
            backgroundColor: C.background,
            borderBottomColor: C.border,
          },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.headerBtn} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={C.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: C.foreground }]} numberOfLines={1}>
          {product.title}
        </Text>
        <Pressable
          onPress={() => setIsFav((v) => !v)}
          style={styles.headerBtn}
          hitSlop={8}
        >
          <Ionicons
            name={isFav ? "heart" : "heart-outline"}
            size={22}
            color={isFav ? C.error : C.foreground}
          />
        </Pressable>
      </View>

      {/* ── Scroll İçeriği ────────────────────────────────────────────── */}
      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {/* 2. Resim Galerisi */}
        <View style={styles.galleryContainer}>
          <FlatList
            data={product.images}
            keyExtractor={(_, i) => String(i)}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / width);
              setActiveImageIndex(idx);
            }}
            renderItem={({ item }) => (
              <View style={{ width, height: width }}>
                <Image
                  source={{ uri: item }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                />
              </View>
            )}
          />
          <DotIndicator count={product.images.length} active={activeImageIndex} />
        </View>

        {/* 3. Ürün Bilgi Bloğu */}
        <View style={[styles.section, { borderBottomColor: C.border }]}>
          <Text style={[styles.brand, { color: C.accent }]}>
            {product.brand.toUpperCase()}
          </Text>
          <Text style={[styles.title, { color: C.foreground }]} numberOfLines={2}>
            {product.title}
          </Text>

          {/* Rating */}
          <View style={styles.ratingRow}>
            <Stars rating={product.rating} size={14} />
            <Text style={[styles.ratingText, { color: C.mutedForeground }]}>
              {product.rating.toFixed(1)} ({product.reviewCount.toLocaleString("tr-TR")} yorum)
            </Text>
          </View>

          {/* Fiyat */}
          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: C.accent }]}>
              {activePrice.toLocaleString("tr-TR")} ₺
            </Text>
            {hasDiscount && (
              <>
                <Text style={[styles.originalPrice, { color: C.mutedForeground }]}>
                  {product.originalPrice!.toLocaleString("tr-TR")} ₺
                </Text>
                <View style={[styles.discountChip, { backgroundColor: `${C.accent}20` }]}>
                  <Text style={[styles.discountText, { color: C.accent }]}>
                    %{discountPct}
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Stok */}
          <Text
            style={[
              styles.stockText,
              { color: product.inStock ? C.success : C.error },
            ]}
          >
            {product.inStock ? "✓ Stokta Mevcut" : "✗ Tükendi"}
          </Text>
        </View>

        {/* 4. Varyasyon Seçici */}
        <View style={[styles.section, { borderBottomColor: C.border }]}>
          {product.variantGroups.map((group) => {
            const selectedId = selectedVariants[group.id];
            const selectedOpt = group.options.find((o) => o.id === selectedId);
            return (
              <View key={group.id} style={styles.variantGroup}>
                <View style={styles.variantLabelRow}>
                  <Text style={[styles.variantLabel, { color: C.foreground }]}>
                    {group.label}:
                  </Text>
                  {selectedOpt && (
                    <Text style={[styles.variantSelected, { color: C.mutedForeground }]}>
                      {selectedOpt.label}
                    </Text>
                  )}
                </View>

                {group.type === "color" ? (
                  <View style={styles.colorRow}>
                    {group.options.map((opt) => (
                      <Pressable
                        key={opt.id}
                        onPress={() => handleVariantChange(group.id, opt.id)}
                        disabled={!opt.inStock}
                        style={[
                          styles.colorDot,
                          { backgroundColor: opt.colorHex ?? "#888" },
                          selectedId === opt.id && {
                            borderWidth: 2,
                            borderColor: C.accent,
                            transform: [{ scale: 1.15 }],
                          },
                          !opt.inStock && { opacity: 0.35 },
                        ]}
                      />
                    ))}
                  </View>
                ) : (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.buttonRow}
                  >
                    {group.options.map((opt) => (
                      <Pressable
                        key={opt.id}
                        onPress={() => handleVariantChange(group.id, opt.id)}
                        disabled={!opt.inStock}
                        style={[
                          styles.variantBtn,
                          {
                            borderColor:
                              selectedId === opt.id ? C.accent : C.border,
                            backgroundColor:
                              selectedId === opt.id ? C.accent : "transparent",
                          },
                          !opt.inStock && { opacity: 0.35 },
                        ]}
                      >
                        <Text
                          style={[
                            styles.variantBtnText,
                            {
                              color:
                                selectedId === opt.id ? "#fff" : C.foreground,
                            },
                          ]}
                        >
                          {opt.label}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                )}
              </View>
            );
          })}
        </View>

        {/* 5. Adet + Sepete Ekle */}
        <View
          style={[
            styles.section,
            styles.qtyRow,
            { borderBottomColor: C.border },
          ]}
        >
          {/* Stepper */}
          <View
            style={[styles.stepper, { borderColor: C.border, backgroundColor: C.surface }]}
          >
            <Pressable
              onPress={() => setQty((q) => Math.max(1, q - 1))}
              style={styles.stepperBtn}
            >
              <Text style={[styles.stepperIcon, { color: C.foreground }]}>−</Text>
            </Pressable>
            <Text style={[styles.stepperCount, { color: C.foreground, borderColor: C.border }]}>
              {qty}
            </Text>
            <Pressable
              onPress={() => setQty((q) => q + 1)}
              style={styles.stepperBtn}
            >
              <Text style={[styles.stepperIcon, { color: C.foreground }]}>+</Text>
            </Pressable>
          </View>

          {/* Sepete Ekle */}
          <Pressable
            onPress={handleAddToCart}
            disabled={!product.inStock}
            style={({ pressed }) => [
              styles.addToCartBtn,
              { backgroundColor: C.accent, opacity: pressed ? 0.85 : 1 },
              !product.inStock && { opacity: 0.5 },
            ]}
          >
            <Text style={styles.addToCartText}>Sepete Ekle</Text>
          </Pressable>
        </View>

        {/* 6. Açıklama (collapsible) */}
        <View style={[styles.section, { borderBottomColor: C.border }]}>
          <Text style={[styles.sectionTitle, { color: C.foreground }]}>Açıklama</Text>
          <Text
            style={[styles.description, { color: C.mutedForeground }]}
            numberOfLines={descExpanded ? undefined : 3}
          >
            {product.description}
          </Text>
          <Pressable onPress={() => setDescExpanded((v) => !v)} style={styles.expandBtn}>
            <Text style={[styles.expandText, { color: C.accent }]}>
              {descExpanded ? "Daha Az Göster" : "Devamını Göster"}
            </Text>
          </Pressable>
        </View>

        {/* 7. Teknik Özellikler */}
        <View style={[styles.section, { borderBottomColor: C.border }]}>
          <Text style={[styles.sectionTitle, { color: C.foreground }]}>Teknik Özellikler</Text>
          <View style={[styles.specsTable, { borderColor: C.border }]}>
            {product.specs.map((spec, i) => (
              <View
                key={spec.label}
                style={[
                  styles.specRow,
                  {
                    backgroundColor: i % 2 === 0 ? C.surface : C.surface2,
                    borderBottomColor: C.border,
                  },
                ]}
              >
                <Text style={[styles.specLabel, { color: C.mutedForeground, borderRightColor: C.border }]}>
                  {spec.label}
                </Text>
                <Text style={[styles.specValue, { color: C.foreground }]}>
                  {spec.value}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* 8. Satıcı Kartı */}
        <View style={[styles.section, { borderBottomColor: C.border }]}>
          <Text style={[styles.sectionTitle, { color: C.foreground }]}>Satıcı</Text>
          <View
            style={[
              styles.sellerCard,
              { backgroundColor: C.surface, borderColor: C.border },
            ]}
          >
            <View style={[styles.sellerAvatar, { backgroundColor: `${C.accent}20` }]}>
              <Text style={[styles.sellerInitials, { color: C.accent }]}>
                {product.seller.name
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </Text>
            </View>
            <View style={styles.sellerInfo}>
              <Text style={[styles.sellerName, { color: C.foreground }]}>
                {product.seller.name}
              </Text>
              <View style={styles.sellerRatingRow}>
                <Stars rating={product.seller.rating} size={11} />
                <Text style={[styles.sellerRatingText, { color: C.mutedForeground }]}>
                  {product.seller.rating.toFixed(1)}
                </Text>
              </View>
              <Text style={[styles.sellerMeta, { color: C.mutedForeground }]}>
                {`Yanıt Oranı: %${product.seller.responseRate} | ${product.seller.since}'den beri`}
              </Text>
              <View style={styles.badgeRow}>
                {product.seller.badges.map((b) => (
                  <View
                    key={b}
                    style={[styles.badge, { backgroundColor: `${C.accent}18` }]}
                  >
                    <Text style={[styles.badgeText, { color: C.accent }]}>{b}</Text>
                  </View>
                ))}
              </View>
              <Pressable style={styles.sellerLinkBtn}>
                <Text style={[styles.sellerLinkText, { color: C.accent }]}>
                  Mağazayı Gör →
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* 9. Yorumlar */}
        <View style={[styles.section, { borderBottomColor: C.border }]}>
          <Text style={[styles.sectionTitle, { color: C.foreground }]}>
            Yorumlar ({product.reviewCount.toLocaleString("tr-TR")})
          </Text>
          {/* Genel puan */}
          <View style={[styles.overallRating, { backgroundColor: C.surface, borderColor: C.border }]}>
            <Text style={[styles.overallScore, { color: C.accent }]}>
              {product.rating.toFixed(1)}
            </Text>
            <Stars rating={product.rating} size={16} />
            <Text style={[styles.overallCount, { color: C.mutedForeground }]}>
              {product.reviewCount.toLocaleString("tr-TR")} yorum
            </Text>
          </View>

          {product.reviews.map((review) => (
            <View
              key={review.id}
              style={[
                styles.reviewCard,
                { backgroundColor: C.surface, borderColor: C.border },
              ]}
            >
              <View style={styles.reviewHeader}>
                <View style={[styles.reviewAvatar, { backgroundColor: `${C.accent}20` }]}>
                  <Text style={[styles.reviewInitials, { color: C.accent }]}>
                    {review.initials}
                  </Text>
                </View>
                <View style={styles.reviewMeta}>
                  <Text style={[styles.reviewAuthor, { color: C.foreground }]}>
                    {review.author}
                  </Text>
                  <Text style={[styles.reviewDate, { color: C.mutedForeground }]}>
                    {review.date}
                  </Text>
                </View>
                <Stars rating={review.rating} size={11} />
              </View>
              <Text style={[styles.reviewTitle, { color: C.foreground }]}>
                {review.title}
              </Text>
              <Text style={[styles.reviewBody, { color: C.mutedForeground }]}>
                {review.body}
              </Text>
              {review.verified && (
                <View style={[styles.verifiedBadge, { backgroundColor: `${C.success}18` }]}>
                  <Text style={[styles.verifiedText, { color: C.success }]}>
                    ✓ Doğrulanmış Alışveriş
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* 10. Birlikte Alınanlar */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: C.foreground }]}>Birlikte Alınanlar</Text>
          <FlatList
            data={product.related}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.relatedList}
            renderItem={({ item }) => (
              <Pressable
                style={[
                  styles.relatedCard,
                  { backgroundColor: C.surface, borderColor: C.border },
                ]}
                onPress={() => router.push(`/urun/${item.slug}` as never)}
              >
                <Image
                  source={{ uri: item.image }}
                  style={styles.relatedImage}
                  resizeMode="cover"
                />
                <View style={styles.relatedInfo}>
                  <Text style={[styles.relatedBrand, { color: C.accent }]}>
                    {item.brand}
                  </Text>
                  <Text
                    style={[styles.relatedTitle, { color: C.foreground }]}
                    numberOfLines={2}
                  >
                    {item.title}
                  </Text>
                  <Text style={[styles.relatedPrice, { color: C.foreground }]}>
                    {item.price.toLocaleString("tr-TR")} ₺
                  </Text>
                  <Pressable
                    style={[styles.relatedAddBtn, { backgroundColor: C.accent }]}
                    onPress={() => router.push(`/urun/${item.slug}` as never)}
                  >
                    <Text style={styles.relatedAddText}>+</Text>
                  </Pressable>
                </View>
              </Pressable>
            )}
          />
        </View>
      </ScrollView>

      {/* ── Sticky Bottom Bar ─────────────────────────────────────────── */}
      <Animated.View
        style={[
          styles.stickyBar,
          {
            paddingBottom: insets.bottom + 8,
            backgroundColor: C.surface,
            borderTopColor: C.border,
          },
          stickyStyle,
        ]}
      >
        <View>
          <Text style={[styles.stickyLabel, { color: C.mutedForeground }]}>Fiyat</Text>
          <Text style={[styles.stickyPrice, { color: C.accent }]}>
            {activePrice.toLocaleString("tr-TR")} ₺
          </Text>
        </View>
        <Pressable
          onPress={handleAddToCart}
          disabled={!product.inStock}
          style={({ pressed }) => [
            styles.stickyBtn,
            { backgroundColor: C.accent, opacity: pressed ? 0.85 : 1 },
            !product.inStock && { opacity: 0.5 },
          ]}
        >
          <Text style={styles.stickyBtnText}>Sepete Ekle</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },

  // Not found
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: 24,
  },
  notFoundText: {
    fontSize: FontSizes["2xl"],
    fontWeight: "900",
    color: C.foreground,
  },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: C.accent,
  },
  backBtnText: { color: "#fff", fontWeight: "700", fontSize: FontSizes.sm },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    gap: 8,
  },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
  },
  headerTitle: {
    flex: 1,
    fontSize: FontSizes.sm,
    fontWeight: "700",
  },

  // Gallery
  galleryContainer: {
    position: "relative",
  },
  dotContainer: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  dotActive: {
    backgroundColor: C.accent,
    width: 18,
  },

  // Sections
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    gap: 8,
  },
  sectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: "900",
    marginBottom: 4,
  },

  // Ürün bilgi
  brand: {
    fontSize: FontSizes.xs,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: "700",
    lineHeight: LineHeights.lg,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  ratingText: {
    fontSize: FontSizes.xs,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  price: {
    fontSize: FontSizes["3xl"],
    fontWeight: "900",
  },
  originalPrice: {
    fontSize: FontSizes.md,
    textDecorationLine: "line-through",
  },
  discountChip: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountText: {
    fontSize: FontSizes.xs,
    fontWeight: "900",
  },
  stockText: {
    fontSize: FontSizes.sm,
    fontWeight: "700",
  },

  // Varyantlar
  variantGroup: { gap: 8 },
  variantLabelRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  variantLabel: { fontSize: FontSizes.sm, fontWeight: "700" },
  variantSelected: { fontSize: FontSizes.sm },
  colorRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  colorDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  buttonRow: { gap: 8, paddingRight: 16 },
  variantBtn: {
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  variantBtnText: { fontSize: FontSizes.xs, fontWeight: "700" },

  // Adet + Sepete Ekle
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  stepperBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  stepperIcon: {
    fontSize: FontSizes.lg,
    fontWeight: "900",
  },
  stepperCount: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: FontSizes.sm,
    fontWeight: "900",
    borderLeftWidth: 1,
    borderRightWidth: 1,
    minWidth: 44,
    textAlign: "center",
  },
  addToCartBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  addToCartText: {
    color: "#fff",
    fontSize: FontSizes.md,
    fontWeight: "900",
  },

  // Açıklama
  description: {
    fontSize: FontSizes.sm,
    lineHeight: LineHeights.md,
  },
  expandBtn: { marginTop: 4 },
  expandText: { fontSize: FontSizes.sm, fontWeight: "700" },

  // Teknik özellikler
  specsTable: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  specRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  specLabel: {
    flex: 1,
    padding: 10,
    fontSize: FontSizes.xs,
    fontWeight: "600",
    borderRightWidth: 1,
  },
  specValue: {
    flex: 1.5,
    padding: 10,
    fontSize: FontSizes.xs,
    fontWeight: "700",
  },

  // Satıcı kartı
  sellerCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    gap: 12,
  },
  sellerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  sellerInitials: {
    fontSize: FontSizes.sm,
    fontWeight: "900",
  },
  sellerInfo: { flex: 1, gap: 4 },
  sellerName: { fontSize: FontSizes.md, fontWeight: "800" },
  sellerRatingRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  sellerRatingText: { fontSize: FontSizes.xs },
  sellerMeta: { fontSize: FontSizes.xs },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 2 },
  badge: {
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeText: { fontSize: 9, fontWeight: "800" },
  sellerLinkBtn: { marginTop: 4 },
  sellerLinkText: { fontSize: FontSizes.sm, fontWeight: "700" },

  // Yorumlar
  overallRating: {
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  overallScore: {
    fontSize: FontSizes["4xl"],
    fontWeight: "900",
  },
  overallCount: {
    fontSize: FontSizes.xs,
    marginTop: 2,
  },
  reviewCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 6,
    marginTop: 8,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  reviewAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  reviewInitials: {
    fontSize: 11,
    fontWeight: "900",
  },
  reviewMeta: { flex: 1, gap: 1 },
  reviewAuthor: { fontSize: FontSizes.sm, fontWeight: "700" },
  reviewDate: { fontSize: FontSizes.xs },
  reviewTitle: { fontSize: FontSizes.sm, fontWeight: "800" },
  reviewBody: { fontSize: FontSizes.xs, lineHeight: LineHeights.sm },
  verifiedBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
    marginTop: 2,
  },
  verifiedText: { fontSize: 10, fontWeight: "700" },

  // İlgili ürünler
  relatedList: { gap: 10, paddingRight: 16 },
  relatedCard: {
    width: 150,
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  relatedImage: { width: "100%", aspectRatio: 1 },
  relatedInfo: { padding: 8, gap: 3 },
  relatedBrand: { fontSize: 9, fontWeight: "800", letterSpacing: 0.8 },
  relatedTitle: { fontSize: FontSizes.xs, fontWeight: "600", lineHeight: 16 },
  relatedPrice: { fontSize: FontSizes.sm, fontWeight: "900" },
  relatedAddBtn: {
    marginTop: 4,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
  },
  relatedAddText: { color: "#fff", fontSize: FontSizes.md, fontWeight: "900" },

  // Sticky bar
  stickyBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  stickyLabel: { fontSize: FontSizes.xs },
  stickyPrice: { fontSize: FontSizes.xl, fontWeight: "900" },
  stickyBtn: {
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  stickyBtnText: { color: "#fff", fontSize: FontSizes.md, fontWeight: "900" },
});
