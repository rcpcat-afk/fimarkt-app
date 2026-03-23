// ─── Favorilerim & Makes (Değerlendirmeler) — App ─────────────────────────────
// Tab 1 — Favorilerim   : 2 kolonlu grid + hasPriceDrop rozeti + Sepete At / Kaldır
// Tab 2 — Değerlendirme : Teşvik banner + liste + Makes native Modal
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
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
import { type ThemeColors } from "../../constants/theme";
import { useTheme } from "../../hooks/useTheme";
import {
  MOCK_FAVORITES,
  MOCK_PENDING_REVIEWS,
  type FavoriteProduct,
  type PendingReview,
} from "../../lib/mock-data/favorites-reviews";

// ─── buildC helper ─────────────────────────────────────────────────────────────
function buildC(colors: ThemeColors) {
  return {
    ...colors,
    bg:    colors.background,
    text:  colors.foreground,
    text2: colors.mutedForeground,
    text3: colors.subtleForeground,
  };
}
type AliasedColors = ReturnType<typeof buildC>;

// ─── createStyles factory ──────────────────────────────────────────────────────
function createStyles(C: AliasedColors) {
  return StyleSheet.create({
    // ── StarRating ──
    srRow:      { flexDirection: "row", gap: 4 },
    srStar:     { padding: 2 },
    srStarText: { fontSize: 36 },

    // ── MakesModal ──
    mmBackdrop:     { flex: 1, backgroundColor: "rgba(0,0,0,0.75)", justifyContent: "flex-end" },
    mmSheet: {
      backgroundColor: C.surface2,
      borderTopLeftRadius: 24, borderTopRightRadius: 24,
      overflow: "hidden", maxHeight: "90%",
    },
    mmStripe:       { height: 3 },
    mmBody:         { padding: 20, paddingBottom: 36 },
    // Success
    mmSuccessBox:   { alignItems: "center", paddingVertical: 40, gap: 8 },
    mmSuccessEmoji: { fontSize: 56, marginBottom: 4 },
    mmSuccessTitle: { fontSize: 18, fontWeight: "800", color: C.text },
    mmSuccessSub:   { fontSize: 13, color: C.text2 },
    // Product row
    mmProductRow:   { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 20 },
    mmProductEmoji: { width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    mmProductSeller:{ fontSize: 10, color: C.text2 },
    mmProductName:  { fontSize: 13, fontWeight: "800", color: C.text, lineHeight: 18 },
    mmCloseBtn:     { width: 32, height: 32, borderRadius: 8, backgroundColor: C.surface, alignItems: "center", justifyContent: "center" },
    mmCloseBtnText: { fontSize: 14, color: C.text2 },
    // Section
    mmSection:      { marginBottom: 16 },
    mmSectionLabel: { fontSize: 9, fontWeight: "800", letterSpacing: 1, color: C.text2, textTransform: "uppercase", marginBottom: 8 },
    mmStarLabel:    { fontSize: 12, color: C.text2, marginTop: 6 },
    // Textarea
    mmTextarea: {
      backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
      borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
      fontSize: 13, color: C.text, minHeight: 90,
    },
    // Makes
    mmMakesLabelRow:   { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
    mmMakesBadge:      { backgroundColor: `${C.accent}20`, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99 },
    mmMakesBadgeText:  { fontSize: 9, fontWeight: "800", color: C.accent },
    mmImagePicker: {
      borderWidth: 2, borderColor: C.border, borderStyle: "dashed",
      borderRadius: 14, paddingVertical: 24,
      alignItems: "center", gap: 4,
      backgroundColor: C.surface,
    },
    mmImagePickerEmoji: { fontSize: 32, marginBottom: 4 },
    mmImagePickerTitle: { fontSize: 13, fontWeight: "700", color: C.text },
    mmImagePickerSub:   { fontSize: 11, color: C.text2 },
    // Submit
    mmSubmitBtn:         { backgroundColor: C.accent, paddingVertical: 15, borderRadius: 14, alignItems: "center", marginTop: 4 },
    mmSubmitBtnDisabled: { opacity: 0.4 },
    mmSubmitBtnText:     { fontSize: 14, fontWeight: "800", color: "#fff" },

    // ── FavoriteCard ──
    fcCard:         { backgroundColor: C.surface2, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: C.border, flex: 1 },
    fcCardDisabled: { opacity: 0.6 },
    fcDropBadge: {
      position: "absolute", top: 8, left: 8, zIndex: 10,
      backgroundColor: "#22c55e", paddingHorizontal: 7, paddingVertical: 3,
      borderRadius: 99,
    },
    fcDropBadgeText: { fontSize: 9, fontWeight: "900", color: "#fff" },
    fcImageArea:     { aspectRatio: 1, alignItems: "center", justifyContent: "center" },
    fcBody:          { padding: 10, gap: 3 },
    fcCategory:      { fontSize: 8, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, color: C.text2 },
    fcName:          { fontSize: 11, fontWeight: "800", color: C.text, lineHeight: 15 },
    fcRatingRow:     { flexDirection: "row", alignItems: "center", gap: 4 },
    fcRating:        { fontSize: 9, color: C.text3 },
    fcDot:           { fontSize: 9, color: C.text3 },
    fcSeller:        { fontSize: 9, color: C.text3, flex: 1 },
    fcPriceRow:      { flexDirection: "row", alignItems: "baseline", gap: 6 },
    fcPrice:         { fontSize: 13, fontWeight: "800", color: C.text },
    fcOriginalPrice: { fontSize: 10, color: C.text3, textDecorationLine: "line-through" },
    fcActions:       { flexDirection: "row", gap: 6, marginTop: 4 },
    fcCartBtn:       { flex: 1, paddingVertical: 7, borderRadius: 10, alignItems: "center" },
    fcCartBtnText:   { fontSize: 10, fontWeight: "700" },
    fcRemoveBtn:     { width: 32, height: 32, borderRadius: 10, backgroundColor: C.surface, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.border },
    fcRemoveBtnText: { fontSize: 14 },

    // ── Main Screen ──
    container: { flex: 1, backgroundColor: C.bg },

    // Header
    header: {
      flexDirection: "row", alignItems: "center",
      paddingHorizontal: 16, paddingVertical: 12, gap: 12,
    },
    backBtn: {
      width: 40, height: 40, borderRadius: 20,
      backgroundColor: C.surface2,
      borderWidth: 1, borderColor: C.border,
      alignItems: "center", justifyContent: "center",
    },
    backArrow:    { fontSize: 28, color: C.text, lineHeight: 32, marginTop: -2 },
    headerCenter: { flex: 1 },
    title:        { fontSize: 18, fontWeight: "800", color: C.text },
    subtitle:     { fontSize: 11, color: C.text2, marginTop: 1 },

    // Segment
    segmentWrap: { paddingHorizontal: 16, paddingBottom: 12 },
    segment: {
      flexDirection: "row",
      backgroundColor: C.surface2,
      borderRadius: 14, padding: 3,
      borderWidth: 1, borderColor: C.border,
    },
    segBtn: {
      flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
      gap: 6, paddingVertical: 8, borderRadius: 11,
    },
    segBtnActive:      { backgroundColor: C.accent },
    segBtnText:        { fontSize: 11, fontWeight: "700", color: C.text2 },
    segBtnTextActive:  { color: "#fff" },
    segCount: {
      minWidth: 16, height: 16, borderRadius: 8,
      backgroundColor: C.surface,
      alignItems: "center", justifyContent: "center", paddingHorizontal: 4,
    },
    segCountActive:    { backgroundColor: "rgba(255,255,255,0.25)" },
    segCountText:      { fontSize: 9, fontWeight: "900", color: C.text3 },
    segCountTextActive:{ color: "#fff" },

    // List
    listContent: { paddingHorizontal: 16, paddingBottom: 40 },

    // Grid
    grid:    { gap: 10 },
    gridRow: { flexDirection: "row", gap: 10 },

    // Banner
    banner: {
      flexDirection: "row", alignItems: "center",
      backgroundColor: `${C.accent}18`,
      borderWidth: 1, borderColor: `${C.accent}30`,
      borderRadius: 16, padding: 14, marginBottom: 12,
    },
    bannerTitle: { fontSize: 12, fontWeight: "800", color: C.text },
    bannerSub:   { fontSize: 11, color: C.text2, marginTop: 2 },

    // Review Card
    reviewCard: {
      flexDirection: "row", alignItems: "center", gap: 12,
      backgroundColor: C.surface2,
      borderWidth: 1, borderColor: C.border,
      borderRadius: 16, padding: 12, marginBottom: 10,
    },
    reviewEmoji:    { width: 52, height: 52, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    reviewCategory: { fontSize: 8, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, color: C.text2 },
    reviewName:     { fontSize: 13, fontWeight: "800", color: C.text },
    reviewMeta:     { fontSize: 9, color: C.text3, marginTop: 2 },
    reviewBtn: {
      backgroundColor: C.accent,
      paddingHorizontal: 10, paddingVertical: 8,
      borderRadius: 12, alignItems: "center", gap: 2,
    },
    reviewBtnText:  { fontSize: 16 },
    reviewBtnLabel: { fontSize: 9, fontWeight: "800", color: "#fff" },

    // Empty
    empty:      { alignItems: "center", paddingTop: 60, gap: 8 },
    emptyEmoji: { fontSize: 56, marginBottom: 8 },
    emptyTitle: { fontSize: 16, fontWeight: "800", color: C.text },
    emptySub:   { fontSize: 13, color: C.text2, textAlign: "center" },
  });
}

const STAR_LABELS = ["", "Çok Kötü 😞", "Kötü 😕", "Orta 😐", "İyi 😊", "Mükemmel! 🤩"];

// ─── Star Rating ──────────────────────────────────────────────────────────────
function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const { colors, isDark } = useTheme();
  const C      = useMemo(() => buildC(colors), [colors]);
  const styles = useMemo(() => createStyles(C), [C]);

  return (
    <View style={styles.srRow}>
      {[1, 2, 3, 4, 5].map(star => (
        <TouchableOpacity key={star} onPress={() => onChange(star)} style={styles.srStar}>
          <Text style={[styles.srStarText, { color: star <= value ? "#f59e0b" : C.border }]}>★</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

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
  const { colors, isDark } = useTheme();
  const C      = useMemo(() => buildC(colors), [colors]);
  const styles = useMemo(() => createStyles(C), [C]);

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
      <View style={styles.mmBackdrop}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.mmSheet}>
          {/* Şerit */}
          <View style={[styles.mmStripe, { backgroundColor: C.accent }]} />

          <ScrollView contentContainerStyle={styles.mmBody} showsVerticalScrollIndicator={false}>
            {submitted ? (
              <View style={styles.mmSuccessBox}>
                <Text style={styles.mmSuccessEmoji}>🏆</Text>
                <Text style={styles.mmSuccessTitle}>Değerlendirme Gönderildi!</Text>
                <Text style={styles.mmSuccessSub}>+50 Fimarkt Puan kazandın 🎉</Text>
              </View>
            ) : (
              <>
                {/* Ürün başlığı */}
                <View style={styles.mmProductRow}>
                  <View style={[styles.mmProductEmoji, { backgroundColor: product.bgColor }]}>
                    <Text style={{ fontSize: 22 }}>{product.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.mmProductSeller}>{product.seller} · {product.deliveredDate}</Text>
                    <Text style={styles.mmProductName} numberOfLines={2}>{product.productName}</Text>
                  </View>
                  <TouchableOpacity style={styles.mmCloseBtn} onPress={onClose}>
                    <Text style={styles.mmCloseBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>

                {/* Yıldız */}
                <View style={styles.mmSection}>
                  <Text style={styles.mmSectionLabel}>PUANIN</Text>
                  <StarRating value={rating} onChange={setRating} />
                  {rating > 0 && <Text style={styles.mmStarLabel}>{STAR_LABELS[rating]}</Text>}
                </View>

                {/* Yorum */}
                <View style={styles.mmSection}>
                  <Text style={styles.mmSectionLabel}>YORUMUN</Text>
                  <TextInput
                    value={comment}
                    onChangeText={setComment}
                    placeholder="Bu ürün hakkında deneyimini paylaş..."
                    placeholderTextColor={C.text3}
                    multiline
                    numberOfLines={4}
                    style={styles.mmTextarea}
                    textAlignVertical="top"
                  />
                </View>

                {/* Makes — Görsel Yükleme Placeholder */}
                <View style={styles.mmSection}>
                  <View style={styles.mmMakesLabelRow}>
                    <Text style={styles.mmSectionLabel}>MAKES — BASKINII GÖSTER</Text>
                    <View style={styles.mmMakesBadge}>
                      <Text style={styles.mmMakesBadgeText}>+20 Puan</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.mmImagePicker} onPress={handleImagePicker} activeOpacity={0.8}>
                    <Text style={styles.mmImagePickerEmoji}>📸</Text>
                    <Text style={styles.mmImagePickerTitle}>Fotoğraf Ekle</Text>
                    <Text style={styles.mmImagePickerSub}>3D baskının nasıl çıktığını göster</Text>
                  </TouchableOpacity>
                </View>

                {/* Submit */}
                <TouchableOpacity
                  style={[styles.mmSubmitBtn, rating === 0 && styles.mmSubmitBtnDisabled]}
                  onPress={handleSubmit}
                  disabled={rating === 0}
                  activeOpacity={0.85}
                >
                  <Text style={styles.mmSubmitBtnText}>⭐ Değerlendirmeyi Gönder</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── Favori Kartı ─────────────────────────────────────────────────────────────
function FavoriteCard({
  product,
  onRemove,
}: {
  product: FavoriteProduct;
  onRemove: (id: string) => void;
}) {
  const { colors, isDark } = useTheme();
  const C      = useMemo(() => buildC(colors), [colors]);
  const styles = useMemo(() => createStyles(C), [C]);

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
    <View style={[styles.fcCard, !product.inStock && styles.fcCardDisabled]}>
      {/* Price Drop Badge */}
      {product.hasPriceDrop && (
        <View style={styles.fcDropBadge}>
          <Text style={styles.fcDropBadgeText}>🏷️ %{product.discountPercent} İndirim!</Text>
        </View>
      )}

      {/* Görsel */}
      <View style={[styles.fcImageArea, { backgroundColor: product.bgColor }]}>
        <Text style={{ fontSize: 40 }}>{product.emoji}</Text>
      </View>

      <View style={styles.fcBody}>
        <Text style={styles.fcCategory}>{product.category}</Text>
        <Text style={styles.fcName} numberOfLines={2}>{product.name}</Text>
        <View style={styles.fcRatingRow}>
          <Text style={styles.fcRating}>⭐ {product.rating}</Text>
          <Text style={styles.fcDot}>·</Text>
          <Text style={styles.fcSeller} numberOfLines={1}>{product.seller}</Text>
        </View>
        <View style={styles.fcPriceRow}>
          <Text style={styles.fcPrice}>{product.price}</Text>
          {product.originalPrice && (
            <Text style={styles.fcOriginalPrice}>{product.originalPrice}</Text>
          )}
        </View>
        {/* Aksiyonlar */}
        <View style={styles.fcActions}>
          <TouchableOpacity
            style={[styles.fcCartBtn, { backgroundColor: cartAdded ? `${"#22c55e"}18` : `${C.accent}18` }]}
            onPress={handleCart}
            disabled={!product.inStock}
            activeOpacity={0.8}
          >
            <Text style={[styles.fcCartBtnText, { color: cartAdded ? "#22c55e" : C.accent }]}>
              {cartAdded ? "✓ Eklendi" : "🛒 Sepete At"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.fcRemoveBtn} onPress={handleRemove}>
            <Text style={styles.fcRemoveBtnText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─── Ana Ekran ─────────────────────────────────────────────────────────────────
export default function FavoritesScreen() {
  const { colors, isDark } = useTheme();
  const C      = useMemo(() => buildC(colors), [colors]);
  const styles = useMemo(() => createStyles(C), [C]);

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
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

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
