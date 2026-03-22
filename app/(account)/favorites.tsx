// ─── Favorilerim & Makes (Değerlendirmeler) — App ─────────────────────────────
// Tab 1 — Favorilerim   : 2 kolonlu grid + hasPriceDrop rozeti + Sepete At / Kaldır
// Tab 2 — Değerlendirme : Teşvik banner + liste + Makes native Modal
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../constants";
import {
  MOCK_FAVORITES,
  MOCK_PENDING_REVIEWS,
  type FavoriteProduct,
  type PendingReview,
} from "../../lib/mock-data/favorites-reviews";

// ─── Star Rating ──────────────────────────────────────────────────────────────
function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <View style={sr.row}>
      {[1, 2, 3, 4, 5].map(star => (
        <TouchableOpacity key={star} onPress={() => onChange(star)} style={sr.star}>
          <Text style={[sr.starText, { color: star <= value ? "#f59e0b" : Colors.border }]}>★</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
const sr = StyleSheet.create({
  row:      { flexDirection: "row", gap: 4 },
  star:     { padding: 2 },
  starText: { fontSize: 36 },
});

const STAR_LABELS = ["", "Çok Kötü 😞", "Kötü 😕", "Orta 😐", "İyi 😊", "Mükemmel! 🤩"];

// ─── Makes Modal ──────────────────────────────────────────────────────────────
function MakesModal({
  product,
  onClose,
  onSubmit,
}: {
  product: PendingReview | null;
  onClose: () => void;
  onSubmit: (id: string) => void;
}) {
  const [rating, setRating]       = useState(0);
  const [comment, setComment]     = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleImagePicker = () => {
    Alert.alert("Fotoğraf Ekle", "Bu özellik yakında aktif olacak.", [{ text: "Tamam" }]);
  };

  const handleSubmit = () => {
    if (!product || rating === 0) return;
    setSubmitted(true);
    setTimeout(() => {
      onSubmit(product.id);
      onClose();
      setRating(0);
      setComment("");
      setSubmitted(false);
    }, 1400);
  };

  if (!product) return null;

  return (
    <Modal visible={!!product} transparent animationType="slide" onRequestClose={onClose}>
      <View style={mm.backdrop}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={mm.sheet}>
          {/* Şerit */}
          <View style={[mm.stripe, { backgroundColor: Colors.accent }]} />

          <ScrollView contentContainerStyle={mm.body} showsVerticalScrollIndicator={false}>
            {submitted ? (
              <View style={mm.successBox}>
                <Text style={mm.successEmoji}>🏆</Text>
                <Text style={mm.successTitle}>Değerlendirme Gönderildi!</Text>
                <Text style={mm.successSub}>+50 Fimarkt Puan kazandın 🎉</Text>
              </View>
            ) : (
              <>
                {/* Ürün başlığı */}
                <View style={mm.productRow}>
                  <View style={[mm.productEmoji, { backgroundColor: product.bgColor }]}>
                    <Text style={{ fontSize: 22 }}>{product.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={mm.productSeller}>{product.seller} · {product.deliveredDate}</Text>
                    <Text style={mm.productName} numberOfLines={2}>{product.productName}</Text>
                  </View>
                  <TouchableOpacity style={mm.closeBtn} onPress={onClose}>
                    <Text style={mm.closeBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>

                {/* Yıldız */}
                <View style={mm.section}>
                  <Text style={mm.sectionLabel}>PUANIN</Text>
                  <StarRating value={rating} onChange={setRating} />
                  {rating > 0 && <Text style={mm.starLabel}>{STAR_LABELS[rating]}</Text>}
                </View>

                {/* Yorum */}
                <View style={mm.section}>
                  <Text style={mm.sectionLabel}>YORUMUN</Text>
                  <TextInput
                    value={comment}
                    onChangeText={setComment}
                    placeholder="Bu ürün hakkında deneyimini paylaş..."
                    placeholderTextColor={Colors.text3}
                    multiline
                    numberOfLines={4}
                    style={mm.textarea}
                    textAlignVertical="top"
                  />
                </View>

                {/* Makes — Görsel Yükleme Placeholder */}
                <View style={mm.section}>
                  <View style={mm.makesLabelRow}>
                    <Text style={mm.sectionLabel}>MAKES — BASKINII GÖSTER</Text>
                    <View style={mm.makesBadge}>
                      <Text style={mm.makesBadgeText}>+20 Puan</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={mm.imagePicker} onPress={handleImagePicker} activeOpacity={0.8}>
                    <Text style={mm.imagePickerEmoji}>📸</Text>
                    <Text style={mm.imagePickerTitle}>Fotoğraf Ekle</Text>
                    <Text style={mm.imagePickerSub}>3D baskının nasıl çıktığını göster</Text>
                  </TouchableOpacity>
                </View>

                {/* Submit */}
                <TouchableOpacity
                  style={[mm.submitBtn, rating === 0 && mm.submitBtnDisabled]}
                  onPress={handleSubmit}
                  disabled={rating === 0}
                  activeOpacity={0.85}
                >
                  <Text style={mm.submitBtnText}>⭐ Değerlendirmeyi Gönder</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const mm = StyleSheet.create({
  backdrop:     { flex: 1, backgroundColor: "rgba(0,0,0,0.75)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: Colors.surface2,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    overflow: "hidden", maxHeight: "90%",
  },
  stripe:       { height: 3 },
  body:         { padding: 20, paddingBottom: 36 },
  // Success
  successBox:   { alignItems: "center", paddingVertical: 40, gap: 8 },
  successEmoji: { fontSize: 56, marginBottom: 4 },
  successTitle: { fontSize: 18, fontWeight: "800", color: Colors.text },
  successSub:   { fontSize: 13, color: Colors.text2 },
  // Product row
  productRow:   { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 20 },
  productEmoji: { width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  productSeller:{ fontSize: 10, color: Colors.text2 },
  productName:  { fontSize: 13, fontWeight: "800", color: Colors.text, lineHeight: 18 },
  closeBtn:     { width: 32, height: 32, borderRadius: 8, backgroundColor: Colors.surface, alignItems: "center", justifyContent: "center" },
  closeBtnText: { fontSize: 14, color: Colors.text2 },
  // Section
  section:      { marginBottom: 16 },
  sectionLabel: { fontSize: 9, fontWeight: "800", letterSpacing: 1, color: Colors.text2, textTransform: "uppercase", marginBottom: 8 },
  starLabel:    { fontSize: 12, color: Colors.text2, marginTop: 6 },
  // Textarea
  textarea: {
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 13, color: Colors.text, minHeight: 90,
  },
  // Makes
  makesLabelRow:   { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  makesBadge:      { backgroundColor: `${Colors.accent}20`, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99 },
  makesBadgeText:  { fontSize: 9, fontWeight: "800", color: Colors.accent },
  imagePicker: {
    borderWidth: 2, borderColor: Colors.border, borderStyle: "dashed",
    borderRadius: 14, paddingVertical: 24,
    alignItems: "center", gap: 4,
    backgroundColor: Colors.surface,
  },
  imagePickerEmoji: { fontSize: 32, marginBottom: 4 },
  imagePickerTitle: { fontSize: 13, fontWeight: "700", color: Colors.text },
  imagePickerSub:   { fontSize: 11, color: Colors.text2 },
  // Submit
  submitBtn:         { backgroundColor: Colors.accent, paddingVertical: 15, borderRadius: 14, alignItems: "center", marginTop: 4 },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText:     { fontSize: 14, fontWeight: "800", color: "#fff" },
});

// ─── Favori Kartı ─────────────────────────────────────────────────────────────
function FavoriteCard({
  product,
  onRemove,
}: {
  product: FavoriteProduct;
  onRemove: (id: string) => void;
}) {
  const [cartAdded, setCartAdded] = useState(false);

  const handleCart = () => {
    setCartAdded(true);
    setTimeout(() => setCartAdded(false), 1500);
  };

  const handleRemove = () => {
    Alert.alert("Favoriden Kaldır", `"${product.name}" favorilerden kaldırılsın mı?`, [
      { text: "Vazgeç", style: "cancel" },
      { text: "Kaldır", style: "destructive", onPress: () => onRemove(product.id) },
    ]);
  };

  return (
    <View style={[fc.card, !product.inStock && fc.cardDisabled]}>
      {/* Price Drop Badge */}
      {product.hasPriceDrop && (
        <View style={fc.dropBadge}>
          <Text style={fc.dropBadgeText}>🏷️ %{product.discountPercent} İndirim!</Text>
        </View>
      )}

      {/* Görsel */}
      <View style={[fc.imageArea, { backgroundColor: product.bgColor }]}>
        <Text style={{ fontSize: 40 }}>{product.emoji}</Text>
      </View>

      <View style={fc.body}>
        <Text style={fc.category}>{product.category}</Text>
        <Text style={fc.name} numberOfLines={2}>{product.name}</Text>
        <View style={fc.ratingRow}>
          <Text style={fc.rating}>⭐ {product.rating}</Text>
          <Text style={fc.dot}>·</Text>
          <Text style={fc.seller} numberOfLines={1}>{product.seller}</Text>
        </View>
        <View style={fc.priceRow}>
          <Text style={fc.price}>{product.price}</Text>
          {product.originalPrice && (
            <Text style={fc.originalPrice}>{product.originalPrice}</Text>
          )}
        </View>
        {/* Aksiyonlar */}
        <View style={fc.actions}>
          <TouchableOpacity
            style={[fc.cartBtn, { backgroundColor: cartAdded ? `${Colors.green}18` : `${Colors.accent}18` }]}
            onPress={handleCart}
            disabled={!product.inStock}
            activeOpacity={0.8}
          >
            <Text style={[fc.cartBtnText, { color: cartAdded ? Colors.green : Colors.accent }]}>
              {cartAdded ? "✓ Eklendi" : "🛒 Sepete At"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={fc.removeBtn} onPress={handleRemove}>
            <Text style={fc.removeBtnText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const fc = StyleSheet.create({
  card:         { backgroundColor: Colors.surface2, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: Colors.border, flex: 1 },
  cardDisabled: { opacity: 0.6 },
  dropBadge: {
    position: "absolute", top: 8, left: 8, zIndex: 10,
    backgroundColor: Colors.green, paddingHorizontal: 7, paddingVertical: 3,
    borderRadius: 99,
  },
  dropBadgeText: { fontSize: 9, fontWeight: "900", color: "#fff" },
  imageArea:     { aspectRatio: 1, alignItems: "center", justifyContent: "center" },
  body:          { padding: 10, gap: 3 },
  category:      { fontSize: 8, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, color: Colors.text2 },
  name:          { fontSize: 11, fontWeight: "800", color: Colors.text, lineHeight: 15 },
  ratingRow:     { flexDirection: "row", alignItems: "center", gap: 4 },
  rating:        { fontSize: 9, color: Colors.text3 },
  dot:           { fontSize: 9, color: Colors.text3 },
  seller:        { fontSize: 9, color: Colors.text3, flex: 1 },
  priceRow:      { flexDirection: "row", alignItems: "baseline", gap: 6 },
  price:         { fontSize: 13, fontWeight: "800", color: Colors.text },
  originalPrice: { fontSize: 10, color: Colors.text3, textDecorationLine: "line-through" },
  actions:       { flexDirection: "row", gap: 6, marginTop: 4 },
  cartBtn:       { flex: 1, paddingVertical: 7, borderRadius: 10, alignItems: "center" },
  cartBtnText:   { fontSize: 10, fontWeight: "700" },
  removeBtn:     { width: 32, height: 32, borderRadius: 10, backgroundColor: Colors.surface, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: Colors.border },
  removeBtnText: { fontSize: 14 },
});

// ─── Ana Ekran ─────────────────────────────────────────────────────────────────
export default function FavoritesScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const [activeTab, setActiveTab]     = useState<"favorites" | "reviews">("favorites");
  const [favorites, setFavorites]     = useState<FavoriteProduct[]>(MOCK_FAVORITES);
  const [reviews, setReviews]         = useState<PendingReview[]>(MOCK_PENDING_REVIEWS);
  const [modalTarget, setModalTarget] = useState<PendingReview | null>(null);

  const handleRemove     = (id: string) => setFavorites(prev => prev.filter(f => f.id !== id));
  const handleReviewDone = (id: string) => setReviews(prev => prev.filter(r => r.id !== id));

  // Favorileri çift kolonlu satırlara böl
  const favRows: FavoriteProduct[][] = [];
  for (let i = 0; i < favorites.length; i += 2) {
    favRows.push(favorites.slice(i, i + 2));
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Favorilerim</Text>
          <Text style={styles.subtitle}>
            {favorites.length} favori · {reviews.length} değerlendirme bekliyor
          </Text>
        </View>
      </View>

      {/* Segment Control */}
      <View style={styles.segmentWrap}>
        <View style={styles.segment}>
          {([
            { key: "favorites" as const, label: "❤️  Favorilerim",    count: favorites.length },
            { key: "reviews"   as const, label: "⭐ Değerlendirmeler", count: reviews.length   },
          ]).map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.segBtn, activeTab === tab.key && styles.segBtnActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.segBtnText, activeTab === tab.key && styles.segBtnTextActive]}>
                {tab.label}
              </Text>
              <View style={[styles.segCount, activeTab === tab.key && styles.segCountActive]}>
                <Text style={[styles.segCountText, activeTab === tab.key && styles.segCountTextActive]}>
                  {tab.count}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* İçerik */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>

        {/* ── TAB 1: Favorilerim ── */}
        {activeTab === "favorites" && (
          favorites.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>💔</Text>
              <Text style={styles.emptyTitle}>Favori listeniz boş</Text>
              <Text style={styles.emptySub}>Beğendiğin ürünleri favorile.</Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {favRows.map((row, i) => (
                <View key={i} style={styles.gridRow}>
                  {row.map(product => (
                    <FavoriteCard key={product.id} product={product} onRemove={handleRemove} />
                  ))}
                  {/* Tek ürünlü satırda boş yer tutucu */}
                  {row.length === 1 && <View style={{ flex: 1 }} />}
                </View>
              ))}
            </View>
          )
        )}

        {/* ── TAB 2: Değerlendirmeler ── */}
        {activeTab === "reviews" && (
          <>
            {/* Teşvik Banner */}
            <View style={styles.banner}>
              <Text style={{ fontSize: 32, marginRight: 12 }}>🏆</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.bannerTitle}>Bu ürünleri değerlendir, Fimarkt Puan kazan!</Text>
                <Text style={styles.bannerSub}>
                  Her değerlendirme +50 · Fotoğraflı Makes +20 Puan
                </Text>
              </View>
            </View>

            {reviews.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyEmoji}>✅</Text>
                <Text style={styles.emptyTitle}>Tüm değerlendirmeler tamamlandı!</Text>
              </View>
            ) : (
              reviews.map(review => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={[styles.reviewEmoji, { backgroundColor: review.bgColor }]}>
                    <Text style={{ fontSize: 22 }}>{review.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reviewCategory}>{review.category}</Text>
                    <Text style={styles.reviewName} numberOfLines={1}>{review.productName}</Text>
                    <Text style={styles.reviewMeta}>{review.seller} · Teslim: {review.deliveredDate}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.reviewBtn}
                    onPress={() => setModalTarget(review)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.reviewBtnText}>⭐</Text>
                    <Text style={styles.reviewBtnLabel}>Değerlendir</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>

      {/* Makes Modal */}
      <MakesModal
        product={modalTarget}
        onClose={() => setModalTarget(null)}
        onSubmit={handleReviewDone}
      />
    </View>
  );
}

// ─── Stiller ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  // Header
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 12, gap: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surface2,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: "center", justifyContent: "center",
  },
  backArrow:    { fontSize: 28, color: Colors.text, lineHeight: 32, marginTop: -2 },
  headerCenter: { flex: 1 },
  title:        { fontSize: 18, fontWeight: "800", color: Colors.text },
  subtitle:     { fontSize: 11, color: Colors.text2, marginTop: 1 },

  // Segment
  segmentWrap: { paddingHorizontal: 16, paddingBottom: 12 },
  segment: {
    flexDirection: "row",
    backgroundColor: Colors.surface2,
    borderRadius: 14, padding: 3,
    borderWidth: 1, borderColor: Colors.border,
  },
  segBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 8, borderRadius: 11,
  },
  segBtnActive:      { backgroundColor: Colors.accent },
  segBtnText:        { fontSize: 11, fontWeight: "700", color: Colors.text2 },
  segBtnTextActive:  { color: "#fff" },
  segCount: {
    minWidth: 16, height: 16, borderRadius: 8,
    backgroundColor: Colors.surface,
    alignItems: "center", justifyContent: "center", paddingHorizontal: 4,
  },
  segCountActive:    { backgroundColor: "rgba(255,255,255,0.25)" },
  segCountText:      { fontSize: 9, fontWeight: "900", color: Colors.text3 },
  segCountTextActive:{ color: "#fff" },

  // List
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },

  // Grid
  grid:    { gap: 10 },
  gridRow: { flexDirection: "row", gap: 10 },

  // Banner
  banner: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: `${Colors.accent}18`,
    borderWidth: 1, borderColor: `${Colors.accent}30`,
    borderRadius: 16, padding: 14, marginBottom: 12,
  },
  bannerTitle: { fontSize: 12, fontWeight: "800", color: Colors.text },
  bannerSub:   { fontSize: 11, color: Colors.text2, marginTop: 2 },

  // Review Card
  reviewCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: Colors.surface2,
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: 16, padding: 12, marginBottom: 10,
  },
  reviewEmoji:    { width: 52, height: 52, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  reviewCategory: { fontSize: 8, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, color: Colors.text2 },
  reviewName:     { fontSize: 13, fontWeight: "800", color: Colors.text },
  reviewMeta:     { fontSize: 9, color: Colors.text3, marginTop: 2 },
  reviewBtn: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 10, paddingVertical: 8,
    borderRadius: 12, alignItems: "center", gap: 2,
  },
  reviewBtnText:  { fontSize: 16 },
  reviewBtnLabel: { fontSize: 9, fontWeight: "800", color: "#fff" },

  // Empty
  empty:      { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyEmoji: { fontSize: 56, marginBottom: 8 },
  emptyTitle: { fontSize: 16, fontWeight: "800", color: Colors.text },
  emptySub:   { fontSize: 13, color: Colors.text2, textAlign: "center" },
});
