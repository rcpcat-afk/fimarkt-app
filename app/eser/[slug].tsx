import { useState, useMemo } from "react";
import {
  View, Text, Image, Pressable, ScrollView,
  StyleSheet, StatusBar,
} from "react-native";
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming, interpolate,
} from "react-native-reanimated";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { Colors, FontSizes, LineHeights } from "@/constants/theme";
import { getArtwork, getAllArtworks, artworkImageUrl } from "@/lib/mock-data/artworks";

const C = Colors.dark;

export default function EserDetaySayfasi() {
  const { slug }  = useLocalSearchParams<{ slug: string }>();
  const router    = useRouter();
  const insets    = useSafeAreaInsets();

  const artwork = getArtwork(slug ?? "");

  const [activeImg, setActiveImg] = useState(0);
  const [liked,     setLiked]     = useState(false);
  const [added,     setAdded]     = useState(false);

  // Sticky bottom bar animation — same pattern as urun/[slug].tsx
  const scrollY     = useSharedValue(0);
  const HEADER_H    = 300;

  const onScroll = (e: { nativeEvent: { contentOffset: { y: number } } }) => {
    scrollY.value = e.nativeEvent.contentOffset.y;
  };

  const stickyBarStyle = useAnimatedStyle(() => ({
    opacity: withSpring(scrollY.value > HEADER_H ? 1 : 0),
    transform: [{ translateY: withTiming(scrollY.value > HEADER_H ? 0 : 16, { duration: 200 }) }],
  }));

  const handleDownload = () => {
    if (added) return;
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const relatedArtworks = useMemo(
    () => getAllArtworks().filter((a) => a.category === artwork?.category && a.slug !== slug).slice(0, 4),
    [artwork?.category, slug],
  );

  if (!artwork) {
    return (
      <View style={[s.notFound, { paddingTop: insets.top + 16 }]}>
        <StatusBar barStyle="light-content" />
        <Pressable onPress={() => router.back()} style={s.backBtnAbs} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={C.foreground} />
        </Pressable>
        <Text style={s.notFoundEmoji}>🎨</Text>
        <Text style={s.notFoundTitle}>Eser bulunamadı</Text>
        <Text style={s.notFoundSub}>Bu eser mevcut değil.</Text>
      </View>
    );
  }

  const allImages = [artwork.imageSeed, ...artwork.additionalSeeds];
  const mainUrl   = (seed: string) =>
    artwork.aspectRatio === "landscape"
      ? `https://picsum.photos/seed/${seed}/800/450`
      : artwork.aspectRatio === "square"
      ? `https://picsum.photos/seed/${seed}/600/600`
      : `https://picsum.photos/seed/${seed}/600/800`;

  const FORMAT_LABEL: Record<string, string> = { stl: "STL", obj: "OBJ", fbx: "FBX", blend: "BLEND" };

  return (
    <View style={[s.root, { backgroundColor: C.background }]}>
      <StatusBar barStyle="light-content" />

      {/* Back button — always visible over image */}
      <Pressable
        onPress={() => router.back()}
        style={[s.backBtn, { top: insets.top + 8 }]}
        hitSlop={8}
      >
        <Ionicons name="arrow-back" size={22} color="#fff" />
      </Pressable>

      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {/* ── Main Image ───────────────────────────────────────────────── */}
        <View style={s.mainImgWrap}>
          <Image
            source={{ uri: mainUrl(allImages[activeImg]) }}
            style={s.mainImg}
            resizeMode="cover"
          />
          <View style={s.imgOverlay} />
        </View>

        {/* Thumbnail strip */}
        {allImages.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.thumbStrip}
          >
            {allImages.map((seed, i) => (
              <Pressable
                key={seed}
                onPress={() => setActiveImg(i)}
                style={[s.thumb, i === activeImg && s.thumbActive]}
              >
                <Image source={{ uri: `https://picsum.photos/seed/${seed}/120/120` }} style={s.thumbImg} resizeMode="cover" />
              </Pressable>
            ))}
          </ScrollView>
        )}

        <View style={s.body}>
          {/* ── Header ─────────────────────────────────────────────────── */}
          <View style={s.titleRow}>
            <View style={s.formatBadge}>
              <Text style={s.formatBadgeText}>{FORMAT_LABEL[artwork.fileFormat] ?? artwork.fileFormat}</Text>
            </View>
            {artwork.isFree && (
              <View style={s.freeBadge}>
                <Text style={s.freeBadgeText}>Ücretsiz</Text>
              </View>
            )}
            <Pressable
              onPress={() => setLiked((v) => !v)}
              style={s.likeBtn}
              hitSlop={8}
            >
              <Text style={[s.likeIcon, liked && { color: "#ef4444" }]}>
                {liked ? "♥" : "♡"}
              </Text>
            </Pressable>
          </View>

          <Text style={s.title}>{artwork.title}</Text>

          <Pressable onPress={() => router.push(`/sanatci/${artwork.artistSlug}`)}>
            <Text style={s.artistLink}>by {artwork.artistName} →</Text>
          </Pressable>

          {/* Stars */}
          <View style={s.ratingRow}>
            <Text style={s.stars}>{"★".repeat(Math.round(artwork.rating))}{"☆".repeat(5 - Math.round(artwork.rating))}</Text>
            <Text style={s.ratingText}>{artwork.rating.toFixed(1)} ({artwork.reviewCount} yorum)</Text>
            <Text style={s.ratingText}>· ♥ {artwork.likesCount.toLocaleString("tr-TR")}</Text>
          </View>

          {/* Description */}
          <Text style={s.description}>{artwork.description}</Text>

          {/* ── Print Settings ──────────────────────────────────────────── */}
          <View style={s.card}>
            <Text style={s.cardTitle}>🖨️ Baskı Ayarları</Text>
            <View style={s.gridSpec}>
              {[
                { label: "Katman",   value: artwork.printSettings.layerHeight },
                { label: "Dolgu",    value: artwork.printSettings.infill },
                { label: "Malzeme",  value: artwork.printSettings.material },
                { label: "Süre",     value: artwork.printSettings.printTime },
                { label: "Support",  value: artwork.printSettings.supports ? "Gerekli" : "Gerekmez" },
              ].map((row) => (
                <View key={row.label} style={s.specItem}>
                  <Text style={s.specLabel}>{row.label}</Text>
                  <Text style={[
                    s.specValue,
                    row.label === "Support" && !artwork.printSettings.supports && { color: "#10b981" },
                  ]}>
                    {row.value}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* ── Teknik Detaylar ─────────────────────────────────────────── */}
          <View style={s.card}>
            <Text style={s.cardTitle}>Teknik Detaylar</Text>
            {[
              { label: "Dosya Formatı",  value: FORMAT_LABEL[artwork.fileFormat] },
              { label: "Polygon Sayısı", value: `${artwork.polygonCount}K` },
              { label: "Lisans",         value: artwork.license === "kisisel" ? "Kişisel Kullanım" : "Ticari" },
              { label: "İndirme",        value: artwork.downloadsCount.toLocaleString("tr-TR") },
              { label: "Baskı Sayısı",   value: artwork.makesCount.toLocaleString("tr-TR") },
            ].map((row) => (
              <View key={row.label} style={s.infoRow}>
                <Text style={s.infoLabel}>{row.label}</Text>
                <Text style={s.infoValue}>{row.value}</Text>
              </View>
            ))}
          </View>

          {/* ── Ben de Bastım ────────────────────────────────────────────── */}
          {artwork.makes.length > 0 && (
            <View style={s.makesSection}>
              <Text style={s.sectionTitle}>
                🖨️ Ben de Bastım
                <Text style={s.sectionCount}> ({artwork.makesCount})</Text>
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.makesScroll}
              >
                {artwork.makes.map((make) => (
                  <View key={make.userId} style={s.makeCard}>
                    <Image
                      source={{ uri: `https://picsum.photos/seed/${make.imageSeed}/300/300` }}
                      style={s.makeImg}
                      resizeMode="cover"
                    />
                    <View style={s.makeFooter}>
                      <Image
                        source={{ uri: `https://picsum.photos/seed/${make.avatarSeed}/40/40` }}
                        style={s.makeAvatar}
                      />
                      <Text style={s.makeUsername} numberOfLines={1}>@{make.username}</Text>
                    </View>
                  </View>
                ))}
                {artwork.makesCount > artwork.makes.length && (
                  <View style={[s.makeCard, s.makeMoreCard]}>
                    <Text style={s.makeMoreCount}>+{artwork.makesCount - artwork.makes.length}</Text>
                    <Text style={s.makeMoreText}>daha</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          )}

          {/* ── Benzer Eserler ───────────────────────────────────────────── */}
          {relatedArtworks.length > 0 && (
            <View style={s.relatedSection}>
              <Text style={s.sectionTitle}>Benzer Eserler</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.relatedScroll}
              >
                {relatedArtworks.map((a) => (
                  <Pressable
                    key={a.id}
                    onPress={() => {
                      setActiveImg(0);
                      router.push(`/eser/${a.slug}`);
                    }}
                    style={s.relatedCard}
                  >
                    <Image
                      source={{ uri: `https://picsum.photos/seed/${a.imageSeed}/300/400` }}
                      style={s.relatedImg}
                      resizeMode="cover"
                    />
                    <View style={s.relatedInfo}>
                      <Text style={s.relatedTitle} numberOfLines={2}>{a.title}</Text>
                      <Text style={[s.relatedPrice, a.isFree && { color: "#10b981" }]}>
                        {a.isFree ? "Ücretsiz" : `${a.price}₺`}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── Sticky Bottom Bar ────────────────────────────────────────────── */}
      <Animated.View
        style={[
          s.stickyBar,
          { paddingBottom: insets.bottom + 8 },
          stickyBarStyle,
        ]}
      >
        <View style={s.stickyInner}>
          <View>
            {artwork.originalPrice && (
              <Text style={s.stickyOldPrice}>{artwork.originalPrice}₺</Text>
            )}
            <Text style={[s.stickyPrice, artwork.isFree && { color: "#10b981" }]}>
              {artwork.isFree ? "Ücretsiz" : `${artwork.price}₺`}
            </Text>
          </View>
          <Pressable
            onPress={handleDownload}
            style={[s.stickyBtn, added && s.stickyBtnAdded]}
          >
            <Text style={s.stickyBtnText}>
              {added
                ? "✓ İndiriliyor..."
                : artwork.isFree
                ? "↓ Ücretsiz İndir"
                : `Satın Al — ${artwork.price}₺`}
            </Text>
          </Pressable>
        </View>
      </Animated.View>

      {/* Inline download CTA (below scroll — always visible at top of body) */}
      <View style={[s.inlineCta, { display: "none" }]} />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },

  // Back button
  backBtn: {
    position: "absolute", left: 14, zIndex: 10,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center", justifyContent: "center",
  },

  // Main image
  mainImgWrap: { width: "100%", aspectRatio: 0.75, backgroundColor: C.surface2 },
  mainImg:     { width: "100%", height: "100%" },
  imgOverlay:  { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.1)" },

  // Thumbnails
  thumbStrip: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  thumb: {
    width: 56, height: 56, borderRadius: 10,
    overflow: "hidden", borderWidth: 2, borderColor: C.border,
  },
  thumbActive: { borderColor: C.accent },
  thumbImg:    { width: "100%", height: "100%" },

  // Body
  body: { padding: 16, gap: 16 },

  // Title area
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  formatBadge: {
    backgroundColor: `${C.accent}20`,
    borderRadius: 6, borderWidth: 1, borderColor: `${C.accent}40`,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  formatBadgeText: { fontSize: 9, fontWeight: "800", color: C.accent, letterSpacing: 0.5 },
  freeBadge: {
    backgroundColor: "#10b98120",
    borderRadius: 6, borderWidth: 1, borderColor: "#10b98140",
    paddingHorizontal: 7, paddingVertical: 2,
  },
  freeBadgeText: { fontSize: 9, fontWeight: "800", color: "#10b981" },
  likeBtn:  { marginLeft: "auto" as const },
  likeIcon: { fontSize: 22, color: C.mutedForeground },

  title:      { fontSize: FontSizes["2xl"], fontWeight: "900", color: C.foreground, lineHeight: 30 },
  artistLink: { fontSize: FontSizes.sm, color: C.accent, fontWeight: "700" },

  ratingRow:  { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  stars:      { color: "#f59e0b", fontSize: FontSizes.sm },
  ratingText: { fontSize: FontSizes.xs, color: C.mutedForeground },

  description: { fontSize: FontSizes.sm, color: C.mutedForeground, lineHeight: LineHeights.md },

  // Cards
  card: {
    backgroundColor: C.surface, borderRadius: 16,
    borderWidth: 1, borderColor: C.border, padding: 16, gap: 10,
  },
  cardTitle: { fontSize: FontSizes.md, fontWeight: "800", color: C.foreground, marginBottom: 4 },

  // Print specs grid
  gridSpec: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  specItem: {
    flex: 1, minWidth: "45%",
    backgroundColor: C.surface2, borderRadius: 10,
    borderWidth: 1, borderColor: C.border,
    padding: 10,
  },
  specLabel: { fontSize: 9, color: C.mutedForeground, marginBottom: 2 },
  specValue: { fontSize: FontSizes.sm, fontWeight: "700", color: C.foreground },

  // Info rows
  infoRow:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  infoLabel: { fontSize: FontSizes.xs, color: C.mutedForeground },
  infoValue: { fontSize: FontSizes.xs, fontWeight: "700", color: C.foreground },

  // Makes
  makesSection: { gap: 10 },
  sectionTitle: { fontSize: FontSizes.md, fontWeight: "900", color: C.foreground },
  sectionCount: { fontWeight: "600", color: C.mutedForeground },
  makesScroll:  { gap: 10 },
  makeCard: {
    width: 110, borderRadius: 12,
    overflow: "hidden", borderWidth: 1, borderColor: C.border,
    backgroundColor: C.surface,
  },
  makeImg:    { width: "100%", aspectRatio: 1 },
  makeFooter: { flexDirection: "row", alignItems: "center", gap: 6, padding: 6 },
  makeAvatar: { width: 18, height: 18, borderRadius: 9 },
  makeUsername: { flex: 1, fontSize: 9, color: C.mutedForeground, fontWeight: "600" },
  makeMoreCard: {
    alignItems: "center", justifyContent: "center",
    aspectRatio: 1, backgroundColor: C.surface2,
  },
  makeMoreCount: { fontSize: FontSizes.xl, fontWeight: "900", color: C.mutedForeground },
  makeMoreText:  { fontSize: 9, color: C.mutedForeground },

  // Related
  relatedSection: { gap: 10 },
  relatedScroll:  { gap: 10 },
  relatedCard: {
    width: 120, borderRadius: 12,
    overflow: "hidden", borderWidth: 1, borderColor: C.border,
    backgroundColor: C.surface,
  },
  relatedImg:   { width: "100%", aspectRatio: 0.75 },
  relatedInfo:  { padding: 8, gap: 3 },
  relatedTitle: { fontSize: 10, fontWeight: "700", color: C.foreground, lineHeight: 14 },
  relatedPrice: { fontSize: FontSizes.xs, fontWeight: "900", color: C.accent },

  // Sticky bar
  stickyBar: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: C.surface,
    borderTopWidth: 1, borderTopColor: C.border,
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  stickyInner: { flexDirection: "row", alignItems: "center", gap: 12 },
  stickyOldPrice: { fontSize: 11, color: C.mutedForeground, textDecorationLine: "line-through" },
  stickyPrice:    { fontSize: FontSizes.xl, fontWeight: "900", color: C.accent },
  stickyBtn: {
    flex: 1, paddingVertical: 14,
    borderRadius: 14, backgroundColor: C.accent,
    alignItems: "center",
  },
  stickyBtnAdded: { backgroundColor: "#059669" },
  stickyBtnText:  { fontSize: FontSizes.md, fontWeight: "800", color: "#fff" },

  inlineCta: {},

  // Not found
  notFound:      { flex: 1, alignItems: "center", justifyContent: "center", gap: 8, padding: 24 },
  backBtnAbs:    { position: "absolute", top: 16, left: 16 },
  notFoundEmoji: { fontSize: 56 },
  notFoundTitle: { fontSize: FontSizes["2xl"], fontWeight: "900", color: C.foreground },
  notFoundSub:   { fontSize: FontSizes.sm, color: C.mutedForeground },
});
