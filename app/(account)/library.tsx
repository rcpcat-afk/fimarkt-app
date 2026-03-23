// ─── Dijital Kütüphanem ────────────────────────────────────────────────────────
// Yatay kart listesi (tekliflerim pattern) — grid layout yok
// • Arama + kategori filtresi
// • hasUpdate → mavi "Yeni Versiyon" rozeti
// • "Fimarkt'ta Ürettir" → /(print)/print-upload
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
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
  LIBRARY_CATEGORIES,
  MOCK_LIBRARY,
  type LibraryCategory,
  type LibraryItem,
} from "../../lib/mock-data/library";

const FORMAT_COLOR: Record<string, string> = {
  STL:  "#3b82f6",
  OBJ:  "#8b5cf6",
  STEP: "#f59e0b",
  ZIP:  "#6b7280",
};

// ─── Theme helpers ────────────────────────────────────────────────────────────
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

function createStyles(C: AliasedColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },

    // Header
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 12,
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
    updateBadge: {
      paddingHorizontal: 10, paddingVertical: 4,
      borderRadius: 99, backgroundColor: "#1d4ed8",
    },
    updateBadgeText: { fontSize: 11, fontWeight: "800", color: "#fff" },

    // Arama
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      marginHorizontal: 16,
      marginBottom: 8,
      height: 44,
      backgroundColor: C.surface2,
      borderRadius: 12,
      borderWidth: 1, borderColor: C.border,
      paddingHorizontal: 12,
    },
    searchIcon:  { fontSize: 14, marginRight: 8 },
    searchInput: { flex: 1, fontSize: 13, color: C.text },

    // Filtre — boş wrapper (tekliflerim tabsWrapper gibi)
    filterWrapper: {},
    filterContent: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    chip: {
      paddingHorizontal: 14, paddingVertical: 7,
      borderRadius: 99,
      backgroundColor: C.surface2,
      borderWidth: 1, borderColor: C.border,
      marginRight: 8,
    },
    chipActive:     { backgroundColor: C.accent, borderColor: C.accent },
    chipText:       { fontSize: 12, fontWeight: "600", color: C.text2 },
    chipTextActive: { color: "#fff" },

    // Liste
    list:        { flex: 1 },
    listContent: { paddingHorizontal: 16, paddingTop: 4 },

    // ── Kart (yatay, tekliflerim card gibi) ──
    card: {
      flexDirection: "row",
      backgroundColor: C.surface2,
      borderRadius: 16,
      borderWidth: 1, borderColor: C.border,
      marginBottom: 12,
      overflow: "hidden",
    },
    cardHighlight: {
      borderColor: "#1d4ed880",
      shadowColor: "#1d4ed8",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 8,
    },

    // Sol: emoji kutusu
    imageBox: {
      width: 80,
      alignItems: "center",
      justifyContent: "center",
    },
    emoji: { fontSize: 32 },
    updateDot: {
      position: "absolute",
      top: 8, right: 8,
      width: 10, height: 10,
      borderRadius: 5,
      backgroundColor: "#3b82f6",
      borderWidth: 1.5, borderColor: C.surface2,
    },

    // Sağ: içerik
    content: {
      flex: 1,
      paddingVertical: 12,
      paddingRight: 12,
      paddingLeft: 10,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 3,
    },
    name: { flex: 1, fontSize: 13, fontWeight: "700", color: C.text },
    formatTag: {
      paddingHorizontal: 6, paddingVertical: 2,
      borderRadius: 6,
    },
    formatText: { fontSize: 9, fontWeight: "800", color: "#fff" },

    designer: { fontSize: 11, color: C.text3, marginBottom: 4 },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 6,
    },
    metaChip: { fontSize: 10, color: C.text2, fontWeight: "600" },
    metaDot:  { fontSize: 10, color: C.text3, marginHorizontal: 4 },

    updateNotice: {
      fontSize: 10, fontWeight: "700", color: "#3b82f6",
      marginBottom: 6,
    },

    // Butonlar — yatay sıra
    actions: {
      flexDirection: "row",
      gap: 6,
    },
    btnUpdate: {
      paddingHorizontal: 12, paddingVertical: 6,
      borderRadius: 8, backgroundColor: "#1d4ed8",
    },
    btnUpdateText: { fontSize: 11, fontWeight: "800", color: "#fff" },

    btnDownload: {
      paddingHorizontal: 12, paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: C.surface,
      borderWidth: 1, borderColor: C.border,
    },
    btnDownloadText: { fontSize: 11, fontWeight: "700", color: C.text },

    btnPrint: {
      paddingHorizontal: 12, paddingVertical: 6,
      borderRadius: 8, backgroundColor: C.accent,
    },
    btnPrintText: { fontSize: 11, fontWeight: "800", color: "#fff" },

    // Boş durum
    empty:     { alignItems: "center", paddingTop: 60, gap: 8 },
    emptyEmoji: { fontSize: 56, marginBottom: 8 },
    emptyTitle: { fontSize: 18, fontWeight: "800", color: C.text },
    emptySub:   { fontSize: 13, color: C.text2, textAlign: "center" },

    // Footer
    footerNote: {
      fontSize: 11, color: C.text3, textAlign: "center",
      lineHeight: 16, paddingHorizontal: 16, marginTop: 8,
    },
  });
}

// ─── Kart — Yatay layout (image sol, içerik sağ) ─────────────────────────────
function LibraryCard({ item, onPrint }: { item: LibraryItem; onPrint: () => void }) {
  const { colors, isDark } = useTheme();
  const C      = useMemo(() => buildC(colors), [colors]);
  const styles = useMemo(() => createStyles(C), [C]);

  return (
    <View style={[styles.card, item.hasUpdate && styles.cardHighlight]}>
      {/* Sol: emoji kutusu */}
      <View style={[styles.imageBox, { backgroundColor: item.bgColor }]}>
        <Text style={styles.emoji}>{item.emoji}</Text>
        {item.hasUpdate && (
          <View style={styles.updateDot} />
        )}
      </View>

      {/* Sağ: bilgi + butonlar */}
      <View style={styles.content}>
        {/* Üst satır: isim + format */}
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <View style={[styles.formatTag, { backgroundColor: FORMAT_COLOR[item.fileFormat] ?? "#6b7280" }]}>
            <Text style={styles.formatText}>{item.fileFormat}</Text>
          </View>
        </View>

        {/* Tasarımcı + meta */}
        <Text style={styles.designer}>by {item.designer}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaChip}>{item.version}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaChip}>{item.fileSize}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaChip}>{item.purchaseDate}</Text>
        </View>

        {/* Güncelleme bildirimi */}
        {item.hasUpdate && (
          <Text style={styles.updateNotice}>
            ↑ Yeni versiyon mevcut: {item.newVersion}
          </Text>
        )}

        {/* Butonlar */}
        <View style={styles.actions}>
          {item.hasUpdate ? (
            <TouchableOpacity style={styles.btnUpdate} activeOpacity={0.8}>
              <Text style={styles.btnUpdateText}>⬆ Güncelle</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.btnDownload} activeOpacity={0.8}>
              <Text style={styles.btnDownloadText}>⬇ İndir</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.btnPrint} activeOpacity={0.8} onPress={onPrint}>
            <Text style={styles.btnPrintText}>🖨 Ürettir</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─── Ana Ekran ─────────────────────────────────────────────────────────────────
export default function LibraryScreen() {
  const { colors, isDark } = useTheme();
  const C      = useMemo(() => buildC(colors), [colors]);
  const styles = useMemo(() => createStyles(C), [C]);

  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [search,   setSearch]   = useState("");
  const [category, setCategory] = useState<LibraryCategory | "Tümü">("Tümü");

  const FILTER_TABS = ["Tümü", ...LIBRARY_CATEGORIES] as (LibraryCategory | "Tümü")[];

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return MOCK_LIBRARY.filter(item => {
      const matchCat    = category === "Tümü" || item.category === category;
      const matchSearch = !q ||
        item.name.toLowerCase().includes(q) ||
        item.designer.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [search, category]);

  const updateCount = MOCK_LIBRARY.filter(i => i.hasUpdate).length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Dijital Kütüphanem</Text>
          <Text style={styles.subtitle}>{MOCK_LIBRARY.length} dosya · bulut depolamada güvende</Text>
        </View>
        {updateCount > 0 && (
          <View style={styles.updateBadge}>
            <Text style={styles.updateBadgeText}>{updateCount} yeni</Text>
          </View>
        )}
      </View>

      {/* Arama */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Dosya veya tasarımcı ara…"
          placeholderTextColor={C.text3}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Kategori filtresi — tekliflerim tabsWrapper pattern */}
      <View style={styles.filterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {FILTER_TABS.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.chip, category === tab && styles.chipActive]}
              onPress={() => setCategory(tab)}
            >
              <Text style={[styles.chipText, category === tab && styles.chipTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Kart listesi — tekliflerim gibi dikey ScrollView */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length > 0 ? (
          filtered.map(item => (
            <LibraryCard
              key={item.id}
              item={item}
              onPrint={() => router.push("/(print)/print-upload" as never)}
            />
          ))
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyTitle}>Sonuç bulunamadı</Text>
            <Text style={styles.emptySub}>Arama terimini veya filtreyi değiştir.</Text>
          </View>
        )}

        <Text style={styles.footerNote}>
          Tüm dosyalar bulut sunucularımızda güvende saklanmaktadır.
        </Text>
      </ScrollView>
    </View>
  );
}
