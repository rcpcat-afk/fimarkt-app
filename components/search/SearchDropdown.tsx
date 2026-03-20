import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../constants/theme";

const C = Colors.dark;

// ── Tipler ────────────────────────────────────────────────────────────────────
export interface SearchResult {
  query:             string;
  products:          { id: number; name: string; price: string; image: string | null; slug: string }[];
  experts:           { id: number; name: string; avatar: string | null; expertise: string; slug: string }[];
  services:          { id: string; label: string; desc: string; icon: string; route: string }[];
  autocomplete:      string | null;
  hasResults:        boolean;
  trending:          string[];
  popularCategories: { label: string; slug: string; icon: string }[];
  popularServices:   { id: string; label: string; desc: string; icon: string; route: string }[];
}

interface Props {
  visible:        boolean;
  query:          string;
  result:         SearchResult | null;
  loading:        boolean;
  recentSearches: string[];
  onSelect:       (q: string) => void;
  onDeleteRecent: (q: string) => void;
  onClose:        () => void;
}

// ── Bölüm Başlığı ─────────────────────────────────────────────────────────────
function SectionTitle({ text }: { text: string }) {
  return (
    <Text style={styles.sectionTitle}>{text}</Text>
  );
}

// ── Ana Bileşen ───────────────────────────────────────────────────────────────
export default function SearchDropdown({
  visible, query, result, loading, recentSearches, onSelect, onDeleteRecent, onClose,
}: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop */}
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        {/* Dropdown Panel */}
        <View style={[styles.panel, { marginTop: insets.top + 116, backgroundColor: C.background }]}>
          <ScrollView
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* LOADING */}
            {loading && (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={C.accent} />
                <Text style={[styles.loadingText, { color: C.mutedForeground }]}>Aranıyor...</Text>
              </View>
            )}

            {/* BOŞ DURUM */}
            {!loading && !query && result && (
              <>
                {/* Son Aramalar */}
                {recentSearches.length > 0 && (
                  <>
                    <SectionTitle text="Son Aramalar" />
                    {recentSearches.slice(0, 5).map((s) => (
                      <View key={s} style={[styles.recentRow, { borderBottomColor: C.border }]}>
                        <Text style={styles.recentIcon}>🕐</Text>
                        <TouchableOpacity style={styles.recentLabel} onPress={() => onSelect(s)}>
                          <Text style={[styles.recentText, { color: C.mutedForeground }]}>{s}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onDeleteRecent(s)} style={styles.deleteBtn}>
                          <Text style={[styles.deleteText, { color: C.subtleForeground }]}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </>
                )}

                {/* Popüler Kategoriler */}
                <SectionTitle text="Popüler Kategoriler" />
                <View style={styles.chipContainer}>
                  {result.popularCategories.map((c) => (
                    <TouchableOpacity
                      key={c.slug}
                      style={[styles.chip, { backgroundColor: C.surface2, borderColor: C.border }]}
                      onPress={() => { onClose(); router.push(`/${c.slug}` as any); }}
                    >
                      <Text style={styles.chipIcon}>{c.icon}</Text>
                      <Text style={[styles.chipText, { color: C.mutedForeground }]}>{c.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Trend Aramalar */}
                <SectionTitle text="Trend Aramalar" />
                <View style={styles.chipContainer}>
                  {result.trending.map((t) => (
                    <TouchableOpacity
                      key={t}
                      style={[styles.chip, { backgroundColor: C.accent + "18", borderColor: C.accent + "40" }]}
                      onPress={() => onSelect(t)}
                    >
                      <Text style={styles.chipIcon}>🔥</Text>
                      <Text style={[styles.chipText, { color: C.accent }]}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {/* SONUÇ YOK */}
            {!loading && query && result && !result.hasResults && (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyEmoji}>🔍</Text>
                <Text style={[styles.emptyTitle, { color: C.foreground }]}>
                  "{query}" için sonuç bulunamadı
                </Text>
                <Text style={[styles.emptyDesc, { color: C.mutedForeground }]}>
                  Ama şunlara bakabilirsin:
                </Text>
                <View style={styles.chipContainer}>
                  {result.popularServices.map((s) => (
                    <TouchableOpacity
                      key={s.id}
                      style={[styles.chip, { backgroundColor: C.accent + "18", borderColor: C.accent + "40" }]}
                      onPress={() => { onClose(); router.push(s.route as any); }}
                    >
                      <Text style={styles.chipIcon}>{s.icon}</Text>
                      <Text style={[styles.chipText, { color: C.accent }]}>{s.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* SONUÇLAR */}
            {!loading && result?.hasResults && (
              <>
                {/* Ürünler */}
                {result.products.length > 0 && (
                  <>
                    <SectionTitle text="Ürünler (Marketplace)" />
                    {result.products.map((p) => (
                      <TouchableOpacity
                        key={p.id}
                        style={[styles.resultRow, { borderBottomColor: C.border }]}
                        onPress={() => { onClose(); router.push(`/urun/${p.slug}` as any); }}
                      >
                        <View style={[styles.productThumb, { backgroundColor: C.surface2, borderColor: C.border }]}>
                          <Text style={{ fontSize: 18 }}>📦</Text>
                        </View>
                        <View style={styles.resultInfo}>
                          <Text style={[styles.resultName, { color: C.foreground }]} numberOfLines={1}>{p.name}</Text>
                          {p.price ? (
                            <Text style={[styles.resultSub, { color: C.accent }]}>{p.price} ₺</Text>
                          ) : null}
                        </View>
                        <Text style={[styles.arrow, { color: C.subtleForeground }]}>›</Text>
                      </TouchableOpacity>
                    ))}
                  </>
                )}

                {/* Uzmanlar */}
                {result.experts.length > 0 && (
                  <>
                    <View style={[styles.divider, { backgroundColor: C.border }]} />
                    <SectionTitle text="Uzmanlar" />
                    {result.experts.map((e) => (
                      <TouchableOpacity
                        key={e.id}
                        style={[styles.resultRow, { borderBottomColor: C.border }]}
                        onPress={() => { onClose(); router.push(`/uzman/${e.slug}` as any); }}
                      >
                        <View style={[styles.avatar, { backgroundColor: C.accent + "30", borderColor: C.accent + "50" }]}>
                          <Text style={[styles.avatarText, { color: C.accent }]}>{e.name[0]?.toUpperCase()}</Text>
                        </View>
                        <View style={styles.resultInfo}>
                          <Text style={[styles.resultName, { color: C.foreground }]} numberOfLines={1}>{e.name}</Text>
                          {e.expertise ? (
                            <Text style={[styles.resultSub, { color: C.mutedForeground }]} numberOfLines={1}>{e.expertise}</Text>
                          ) : null}
                        </View>
                        <Text style={[styles.arrow, { color: C.subtleForeground }]}>›</Text>
                      </TouchableOpacity>
                    ))}
                  </>
                )}

                {/* Hizmetler */}
                {result.services.length > 0 && (
                  <>
                    <View style={[styles.divider, { backgroundColor: C.border }]} />
                    <SectionTitle text="Fidrop Hizmetleri" />
                    {result.services.map((s) => (
                      <TouchableOpacity
                        key={s.id}
                        style={[styles.resultRow, { borderBottomColor: C.border }]}
                        onPress={() => { onClose(); router.push(s.route as any); }}
                      >
                        <View style={[styles.serviceIcon, { backgroundColor: C.accent + "18", borderColor: C.accent + "30" }]}>
                          <Text style={{ fontSize: 18 }}>{s.icon}</Text>
                        </View>
                        <View style={styles.resultInfo}>
                          <Text style={[styles.resultName, { color: C.foreground }]}>{s.label}</Text>
                          <Text style={[styles.resultSub, { color: C.mutedForeground }]}>{s.desc}</Text>
                        </View>
                        <View style={[styles.actionBadge, { backgroundColor: C.accent + "18" }]}>
                          <Text style={[styles.actionText, { color: C.accent }]}>{s.desc}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </>
                )}
              </>
            )}

            <View style={{ height: 24 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  overlay:       { flex: 1 },
  backdrop:      { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)" },
  panel: {
    marginHorizontal: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    maxHeight: 480,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
  scroll:        { flex: 1 },

  // Section
  sectionTitle: {
    fontSize: 10, fontWeight: "800", color: C.subtleForeground,
    letterSpacing: 1.2, textTransform: "uppercase",
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6,
  },

  // Loading
  loadingRow:   { flexDirection: "row", alignItems: "center", gap: 10, padding: 20 },
  loadingText:  { fontSize: 13 },

  // Recent
  recentRow:    { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  recentIcon:   { fontSize: 13, marginRight: 8 },
  recentLabel:  { flex: 1 },
  recentText:   { fontSize: 13 },
  deleteBtn:    { padding: 4 },
  deleteText:   { fontSize: 12 },

  // Chips
  chipContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 16, paddingBottom: 12 },
  chip:          { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 99, borderWidth: 1 },
  chipIcon:      { fontSize: 12 },
  chipText:      { fontSize: 11, fontWeight: "500" },

  // Empty
  emptyBox:     { alignItems: "center", paddingVertical: 24, paddingHorizontal: 16 },
  emptyEmoji:   { fontSize: 36, marginBottom: 10 },
  emptyTitle:   { fontSize: 14, fontWeight: "600", marginBottom: 4, textAlign: "center" },
  emptyDesc:    { fontSize: 12, marginBottom: 12, textAlign: "center" },

  // Results
  resultRow:    { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, gap: 12, borderBottomWidth: 1 },
  productThumb: { width: 38, height: 38, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  avatar:       { width: 38, height: 38, borderRadius: 19, borderWidth: 1, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  avatarText:   { fontSize: 15, fontWeight: "700" },
  serviceIcon:  { width: 38, height: 38, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  resultInfo:   { flex: 1, minWidth: 0 },
  resultName:   { fontSize: 13, fontWeight: "600" },
  resultSub:    { fontSize: 11, marginTop: 1 },
  arrow:        { fontSize: 20 },
  actionBadge:  { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 99 },
  actionText:   { fontSize: 10, fontWeight: "600" },

  // Divider
  divider: { height: 1, marginVertical: 4 },
});
