// ─── Dijital Kütüphanem ────────────────────────────────────────────────────────
// Satın alınan STL/OBJ/STEP dosyaları koleksiyonu
// • Arama + kategori filtresi (yatay scroll chip'ler)
// • hasUpdate → mavi parlayan "Yeni Versiyon" rozeti
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
import { Colors } from "../../constants";
import {
  LIBRARY_CATEGORIES,
  MOCK_LIBRARY,
  type LibraryCategory,
  type LibraryItem,
} from "../../lib/mock-data/library";

// ─── Dosya formatı renkleri ───────────────────────────────────────────────────
const FORMAT_COLOR: Record<string, string> = {
  STL:  "#3b82f6",
  OBJ:  "#8b5cf6",
  STEP: "#f59e0b",
  ZIP:  "#6b7280",
};

// ─── Kart Bileşeni ────────────────────────────────────────────────────────────
function LibraryCard({ item, onPrint }: { item: LibraryItem; onPrint: () => void }) {
  return (
    <View style={styles.card}>
      {/* Görsel Alan */}
      <View style={[styles.cardImage, { backgroundColor: item.bgColor }]}>
        <Text style={styles.cardEmoji}>{item.emoji}</Text>

        {/* Yeni Versiyon rozeti */}
        {item.hasUpdate && (
          <View style={styles.updateBadge}>
            <Text style={styles.updateBadgeText}>↑ {item.newVersion}</Text>
          </View>
        )}

        {/* Format rozeti */}
        <View style={[styles.formatBadge, { backgroundColor: FORMAT_COLOR[item.fileFormat] ?? "#6b7280" }]}>
          <Text style={styles.formatBadgeText}>{item.fileFormat}</Text>
        </View>
      </View>

      {/* Bilgi */}
      <View style={styles.cardBody}>
        <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.cardDesigner}>by {item.designer}</Text>

        {/* Meta satırı */}
        <View style={styles.metaRow}>
          <Text style={styles.metaVersion}>{item.version}</Text>
          <Text style={styles.metaSize}>{item.fileSize}</Text>
        </View>

        {/* Aksiyon butonları — her biri ayrı marginTop ile ayrıldı (gap yerine) */}
        {item.hasUpdate ? (
          <TouchableOpacity style={styles.updateBtn} activeOpacity={0.8}>
            <Text style={styles.updateBtnText}>⬆ Güncelle {item.newVersion}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.downloadBtn} activeOpacity={0.8}>
            <Text style={styles.downloadBtnText}>⬇ İndir</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.printBtn} activeOpacity={0.8} onPress={onPrint}>
          <Text style={styles.printBtnText}>🖨 Ürettir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Ana Ekran ─────────────────────────────────────────────────────────────────
export default function LibraryScreen() {
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

  // 2-kolon grid: çiftlere böl
  const rows: LibraryItem[][] = [];
  for (let i = 0; i < filtered.length; i += 2) {
    rows.push(filtered.slice(i, i + 2));
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
          <Text style={styles.title}>Dijital Kütüphanem</Text>
          <Text style={styles.subtitle}>{MOCK_LIBRARY.length} dosya · bulut depolamada güvende</Text>
        </View>
        {updateCount > 0 && (
          <View style={styles.updateCountBadge}>
            <Text style={styles.updateCountText}>{updateCount} yeni</Text>
          </View>
        )}
      </View>

      {/* Arama */}
      <View style={styles.searchWrapper}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Dosya, tasarımcı veya kategori ara…"
          placeholderTextColor={Colors.text3}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Kategori filtresi — gap yerine marginRight ile */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {FILTER_TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.filterChip,
              category === tab && styles.filterChipActive,
            ]}
            onPress={() => setCategory(tab)}
          >
            <Text style={[
              styles.filterChipText,
              category === tab && styles.filterChipTextActive,
            ]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Kart listesi */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {rows.length > 0 ? (
          rows.map((row, rowIdx) => (
            <View key={rowIdx} style={styles.row}>
              {row.map(item => (
                <View key={item.id} style={styles.cardWrapper}>
                  <LibraryCard
                    item={item}
                    onPrint={() => router.push("/(print)/print-upload" as never)}
                  />
                </View>
              ))}
              {/* Tek elemanlı son satır için boşluk dolgusu */}
              {row.length === 1 && <View style={styles.cardWrapper} />}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyTitle}>Sonuç bulunamadı</Text>
            <Text style={styles.emptySubtitle}>Arama terimini veya filtreyi değiştir.</Text>
          </View>
        )}

        <Text style={styles.footerNote}>
          Tüm dosyalar bulut sunucularımızda güvende saklanmaktadır.
        </Text>
      </ScrollView>
    </View>
  );
}

// ─── Stiller ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surface2,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: "center", justifyContent: "center",
    marginRight: 12,
  },
  backArrow:        { fontSize: 28, color: Colors.text, lineHeight: 32, marginTop: -2 },
  headerCenter:     { flex: 1 },
  title:            { fontSize: 18, fontWeight: "800", color: Colors.text },
  subtitle:         { fontSize: 11, color: Colors.text2, marginTop: 1 },
  updateCountBadge: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 99, backgroundColor: "#1d4ed8",
    marginLeft: 8,
  },
  updateCountText: { fontSize: 11, fontWeight: "800", color: "#fff" },

  // Arama
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: Colors.surface2,
    borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon:  { fontSize: 14, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 13, color: Colors.text },

  // Filtre — marginRight yerine chip'lere marjin veriliyor
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 99,
    backgroundColor: Colors.surface2,
    borderWidth: 1, borderColor: Colors.border,
    marginRight: 8,
    alignSelf: "flex-start",
  },
  filterChipActive:     { borderColor: Colors.accent, backgroundColor: Colors.accent },
  filterChipText:       { fontSize: 12, fontWeight: "600", color: Colors.text2 },
  filterChipTextActive: { color: "#fff" },

  // Liste
  list:        { flex: 1 },
  listContent: { paddingHorizontal: 12, paddingTop: 8 },

  // 2-kolon grid: alignItems:"flex-start" → kartlar birbirinin yüksekliğine stretch olmaz
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  cardWrapper: {
    flex: 1,
    marginHorizontal: 5,
  },

  // Kart — overflow:hidden yerine borderRadius yeterli (absolute badge'ler için gerekli)
  card: {
    backgroundColor: Colors.surface2,
    borderRadius: 16,
    borderWidth: 1, borderColor: Colors.border,
    overflow: "hidden",
  },

  // Görsel alan — aspectRatio ile kare
  cardImage: {
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cardEmoji: { fontSize: 38 },

  // Rozet — Yeni Versiyon (position absolute)
  updateBadge: {
    position: "absolute",
    top: 7, left: 7,
    paddingHorizontal: 7, paddingVertical: 3,
    borderRadius: 99,
    backgroundColor: "#1d4ed8",
  },
  updateBadgeText: { fontSize: 9, fontWeight: "800", color: "#fff" },

  // Rozet — Format (position absolute)
  formatBadge: {
    position: "absolute",
    bottom: 7, right: 7,
    paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: 99,
  },
  formatBadgeText: { fontSize: 9, fontWeight: "800", color: "#fff" },

  // Kart içi bilgi — gap yerine her elemente marginBottom
  cardBody: { padding: 10 },
  cardName: {
    fontSize: 12, fontWeight: "700", color: Colors.text,
    lineHeight: 16, marginBottom: 3,
  },
  cardDesigner: { fontSize: 10, color: Colors.text3, marginBottom: 6 },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  metaVersion: { fontSize: 11, fontWeight: "700", color: Colors.accent, marginRight: 8 },
  metaSize:    { fontSize: 10, color: Colors.text2 },

  // Butonlar — paddingVertical ile boyut kontrolü, gap yerine marginBottom
  updateBtn: {
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#1d4ed8",
    marginBottom: 6,
  },
  updateBtnText: { fontSize: 11, fontWeight: "800", color: "#fff" },

  downloadBtn: {
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
    marginBottom: 6,
  },
  downloadBtnText: { fontSize: 11, fontWeight: "700", color: Colors.text },

  printBtn: {
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: Colors.accent,
  },
  printBtnText: { fontSize: 11, fontWeight: "800", color: "#fff" },

  // Boş durum
  emptyState:    { alignItems: "center", paddingTop: 60, paddingBottom: 40 },
  emptyEmoji:    { fontSize: 48, marginBottom: 12 },
  emptyTitle:    { fontSize: 15, fontWeight: "700", color: Colors.text },
  emptySubtitle: { fontSize: 12, color: Colors.text2, marginTop: 4 },

  // Footer
  footerNote: {
    fontSize: 11, color: Colors.text3, textAlign: "center",
    lineHeight: 16, paddingHorizontal: 16, marginTop: 16,
  },
});
