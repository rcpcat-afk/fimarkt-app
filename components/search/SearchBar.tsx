import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Keyboard,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../hooks/useTheme";
import { type SearchResult } from "./SearchDropdown";
import { BACKEND_URL } from "../../constants";

const RECENT_KEY = "fimarkt_recent_searches";
const MAX_RECENT  = 8;

async function loadRecent(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

async function saveRecent(q: string) {
  const prev    = await loadRecent();
  const updated = [q, ...prev.filter((r) => r !== q)].slice(0, MAX_RECENT);
  await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(updated));
}

// ── Bölüm Başlığı ─────────────────────────────────────────────────────────────
function SectionTitle({ text }: { text: string }) {
  const { colors: C } = useTheme();
  return <Text style={[styles.sectionTitle, { color: C.subtleForeground }]}>{text}</Text>;
}

// ── Skeleton Satırı ───────────────────────────────────────────────────────────
function SkeletonRow() {
  const { colors: C } = useTheme();
  return (
    <View style={styles.skeletonRow}>
      <View style={[styles.skeletonThumb, { backgroundColor: C.surface2 }]} />
      <View style={{ flex: 1, gap: 6 }}>
        <View style={[styles.skeletonLine, { width: "60%", backgroundColor: C.surface2 }]} />
        <View style={[styles.skeletonLine, { width: "35%", backgroundColor: C.surface2 }]} />
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SearchModal — input + sonuçlar birlikte tam ekran Modal içinde yaşar
// Klavye focus sorunu bu yapı sayesinde tamamen ortadan kalkar
// ─────────────────────────────────────────────────────────────────────────────
function SearchModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { colors: C } = useTheme();
  const router  = useRouter();
  const insets  = useSafeAreaInsets();

  const [query,   setQuery]   = useState("");
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState<SearchResult | null>(null);
  const [recents, setRecents] = useState<string[]>([]);

  const inputRef    = useRef<TextInput>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Modal açıldığında: recents yükle, empty-state getir, input'u odakla
  useEffect(() => {
    if (visible) {
      loadRecent().then(setRecents);
      fetchSearch("");
      // Kısa gecikme: Modal animasyonu tamamlandıktan sonra focus
      const t = setTimeout(() => inputRef.current?.focus(), 200);
      return () => clearTimeout(t);
    } else {
      setQuery("");
      setResult(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const fetchSearch = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const res  = await fetch(`${BACKEND_URL}/api/search?q=${encodeURIComponent(q)}&store=fimarkt`);
      const data = await res.json();
      setResult(data as SearchResult);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSearch(text), 300);
  };

  const handleSubmit = async () => {
    const q = query.trim();
    if (!q) return;
    await saveRecent(q);
    Keyboard.dismiss();
    onClose();
    router.push({ pathname: "/ara" as any, params: { q } });
  };

  const handleSelect = async (q: string) => {
    await saveRecent(q);
    setQuery(q);
    Keyboard.dismiss();
    onClose();
    router.push({ pathname: "/ara" as any, params: { q } });
  };

  const handleDeleteRecent = async (q: string) => {
    const updated = recents.filter((r) => r !== q);
    setRecents(updated);
    await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  };

  const handleClose = () => {
    Keyboard.dismiss();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={[styles.modalRoot, { backgroundColor: C.background, paddingTop: insets.top }]}>

        {/* ── Üst Bar ────────────────────────────────────────────────────── */}
        <View style={[styles.modalTopBar, { borderBottomColor: C.border }]}>
          <TouchableOpacity onPress={handleClose} style={styles.backBtn} activeOpacity={0.7}>
            <Text style={[styles.backIcon, { color: C.foreground }]}>‹</Text>
          </TouchableOpacity>

          {/* Search Input */}
          <View style={[styles.modalInputBox, {
            backgroundColor: C.surface2,
            borderColor: C.accent,
          }]}>
            <Text style={[styles.modalSearchIcon, { color: C.subtleForeground }]}>🔍</Text>
            <TextInput
              ref={inputRef}
              style={[styles.modalInput, { color: C.foreground }]}
              placeholder="Ürün, hizmet veya 3D tasarım ara..."
              placeholderTextColor={C.subtleForeground}
              value={query}
              onChangeText={handleChange}
              returnKeyType="search"
              onSubmitEditing={handleSubmit}
              autoCorrect={false}
              autoCapitalize="none"
              autoFocus
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => { setQuery(""); fetchSearch(""); }} activeOpacity={0.7}>
                <Text style={[styles.clearBtn, { color: C.subtleForeground }]}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Mikrofon */}
          <TouchableOpacity
            style={styles.modalIconBtn}
            onPress={() => Alert.alert("Sesli Arama", "Sesli arama yakında aktif olacak!")}
            activeOpacity={0.7}
          >
            <Text style={styles.modalIconEmoji}>🎙️</Text>
          </TouchableOpacity>
        </View>

        {/* ── Sonuç Alanı ────────────────────────────────────────────────── */}
        <ScrollView
          style={styles.modalScroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* LOADING */}
          {loading && (
            <>
              <SectionTitle text="Aranıyor..." />
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </>
          )}

          {/* BOŞ DURUM */}
          {!loading && !query && result && (
            <>
              {recents.length > 0 && (
                <>
                  <SectionTitle text="Son Aramalar" />
                  {recents.slice(0, 5).map((s) => (
                    <View key={s} style={[styles.recentRow, { borderBottomColor: C.border }]}>
                      <Text style={styles.recentIcon}>🕐</Text>
                      <TouchableOpacity style={{ flex: 1 }} onPress={() => handleSelect(s)}>
                        <Text style={[styles.recentText, { color: C.mutedForeground }]}>{s}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteRecent(s)} style={{ padding: 4 }}>
                        <Text style={{ fontSize: 11, color: C.subtleForeground }}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </>
              )}

              <SectionTitle text="Popüler Kategoriler" />
              <View style={styles.chipWrap}>
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

              <SectionTitle text="Trend Aramalar" />
              <View style={styles.chipWrap}>
                {result.trending.map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.chip, { backgroundColor: C.accent + "18", borderColor: C.accent + "40" }]}
                    onPress={() => handleSelect(t)}
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
              <Text style={[styles.emptyDesc, { color: C.mutedForeground }]}>Ama şunlara bakabilirsin:</Text>
              <View style={styles.chipWrap}>
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
              {result.products.length > 0 && (
                <>
                  <SectionTitle text="Ürünler (Marketplace)" />
                  {result.products.map((p) => (
                    <TouchableOpacity
                      key={p.id}
                      style={[styles.resultRow, { borderBottomColor: C.border }]}
                      onPress={() => { onClose(); router.push(`/urun/${p.slug}` as any); }}
                    >
                      <View style={[styles.thumb, { backgroundColor: C.surface2, borderColor: C.border }]}>
                        <Text style={{ fontSize: 18 }}>📦</Text>
                      </View>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={[styles.resultName, { color: C.foreground }]} numberOfLines={1}>{p.name}</Text>
                        {p.price ? <Text style={[styles.resultSub, { color: C.accent }]}>{p.price} ₺</Text> : null}
                      </View>
                      <Text style={{ fontSize: 20, color: C.subtleForeground }}>›</Text>
                    </TouchableOpacity>
                  ))}
                </>
              )}

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
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={[styles.resultName, { color: C.foreground }]} numberOfLines={1}>{e.name}</Text>
                        {e.expertise ? <Text style={[styles.resultSub, { color: C.mutedForeground }]} numberOfLines={1}>{e.expertise}</Text> : null}
                      </View>
                      <Text style={{ fontSize: 20, color: C.subtleForeground }}>›</Text>
                    </TouchableOpacity>
                  ))}
                </>
              )}

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
                      <View style={{ flex: 1, minWidth: 0 }}>
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

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SearchBar — GlobalHeader'da görünen sahte (fake) dokunulabilir bar
// Tıklanınca SearchModal açılır; klavye focus sorunu tamamen ortadan kalkar
// ─────────────────────────────────────────────────────────────────────────────
export default function SearchBar({ style }: { style?: object }) {
  const { colors: C } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={[styles.fakeBar, style]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <View style={[styles.fakeBox, { backgroundColor: C.surface2, borderColor: C.border }]}>
          <Text style={[styles.fakeIcon, { color: C.subtleForeground }]}>🔍</Text>
          <Text style={[styles.fakePlaceholder, { color: C.subtleForeground }]}>
            Ürün, hizmet veya 3D tasarım ara...
          </Text>
          <Text style={[styles.fakeIcon, { color: C.subtleForeground }]}>🎙️</Text>
          <Text style={[styles.fakeIcon, { color: C.subtleForeground }]}>📷</Text>
        </View>
      </TouchableOpacity>

      <SearchModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Fake bar
  fakeBar:         { paddingHorizontal: 12, paddingBottom: 8 },
  fakeBox:         { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, height: 42, gap: 8 },
  fakeIcon:        { fontSize: 14 },
  fakePlaceholder: { flex: 1, fontSize: 13 },

  // Modal root
  modalRoot:   { flex: 1 },
  modalTopBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 10, gap: 8, borderBottomWidth: 1 },
  backBtn:     { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  backIcon:    { fontSize: 28, fontWeight: "300", lineHeight: 34 },
  modalInputBox: {
    flex: 1, flexDirection: "row", alignItems: "center",
    borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 10, height: 40, gap: 6,
  },
  modalSearchIcon: { fontSize: 13 },
  modalInput:      { flex: 1, fontSize: 14, paddingVertical: 0 },
  clearBtn:        { fontSize: 11, paddingHorizontal: 2 },
  modalIconBtn:    { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  modalIconEmoji:  { fontSize: 18 },
  modalScroll:     { flex: 1 },

  // Section
  sectionTitle: {
    fontSize: 10, fontWeight: "800",
    letterSpacing: 1.2, textTransform: "uppercase",
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6,
  },

  // Skeleton
  skeletonRow:   { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  skeletonThumb: { width: 38, height: 38, borderRadius: 10 },
  skeletonLine:  { height: 10, borderRadius: 99 },

  // Recent
  recentRow:  { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  recentIcon: { fontSize: 13, marginRight: 10 },
  recentText: { fontSize: 13 },

  // Chips
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 16, paddingBottom: 12 },
  chip:     { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 99, borderWidth: 1 },
  chipIcon: { fontSize: 12 },
  chipText: { fontSize: 11, fontWeight: "500" },

  // Empty
  emptyBox:   { alignItems: "center", paddingVertical: 32, paddingHorizontal: 16 },
  emptyEmoji: { fontSize: 36, marginBottom: 10 },
  emptyTitle: { fontSize: 14, fontWeight: "600", marginBottom: 4, textAlign: "center" },
  emptyDesc:  { fontSize: 12, marginBottom: 12, textAlign: "center" },

  // Results
  resultRow:   { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, gap: 12, borderBottomWidth: 1 },
  thumb:       { width: 38, height: 38, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  avatar:      { width: 38, height: 38, borderRadius: 19, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  avatarText:  { fontSize: 15, fontWeight: "700" },
  serviceIcon: { width: 38, height: 38, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  resultName:  { fontSize: 13, fontWeight: "600" },
  resultSub:   { fontSize: 11, marginTop: 1 },
  actionBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 99 },
  actionText:  { fontSize: 10, fontWeight: "600" },
  divider:     { height: 1, marginVertical: 4 },
});
