import { useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "../../constants/theme";
import SearchDropdown, { type SearchResult } from "./SearchDropdown";
import { BACKEND_URL } from "../../constants";

const C = Colors.dark;

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

interface Props {
  style?: object;
}

export default function SearchBar({ style }: Props) {
  const router = useRouter();

  const [query,          setQuery]          = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [loading,        setLoading]        = useState(false);
  const [result,         setResult]         = useState<SearchResult | null>(null);
  const [recents,        setRecents]        = useState<string[]>([]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef    = useRef<TextInput>(null);

  // ── Search API ────────────────────────────────────────────────────────────
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

  // ── Odaklanma ─────────────────────────────────────────────────────────────
  const handleFocus = async () => {
    const r = await loadRecent();
    setRecents(r);
    setDropdownVisible(true);
    if (!result && !query) fetchSearch("");
  };

  // ── 300ms Debounce ────────────────────────────────────────────────────────
  const handleChange = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSearch(text), 300);
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const q = query.trim();
    if (!q) return;
    await saveRecent(q);
    setDropdownVisible(false);
    inputRef.current?.blur();
    router.push({ pathname: "/ara" as any, params: { q } });
  };

  // ── Dropdown'dan seçim ────────────────────────────────────────────────────
  const handleSelect = async (q: string) => {
    setQuery(q);
    await saveRecent(q);
    setDropdownVisible(false);
    inputRef.current?.blur();
    router.push({ pathname: "/ara" as any, params: { q } });
  };

  // ── Son aramayı sil ───────────────────────────────────────────────────────
  const handleDeleteRecent = async (q: string) => {
    const updated = recents.filter((r) => r !== q);
    setRecents(updated);
    await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  };

  // ── Kapat ─────────────────────────────────────────────────────────────────
  const handleClose = () => {
    setDropdownVisible(false);
    inputRef.current?.blur();
  };

  // ── Mikrofon (Expo placeholder) ───────────────────────────────────────────
  const handleMic = () => {
    Alert.alert(
      "Sesli Arama",
      "Sesli arama yakında aktif olacak! (Expo Speech entegrasyonu)",
      [{ text: "Tamam" }]
    );
  };

  // ── Kamera (Görsel arama placeholder) ────────────────────────────────────
  const handleCamera = () => {
    Alert.alert(
      "Görsel Arama",
      "Görsel arama yakında aktif olacak! (fimarkt-python entegrasyonu)",
      [{ text: "Tamam" }]
    );
  };

  return (
    <>
      <View style={[styles.wrapper, style]}>
        <View
          style={[
            styles.box,
            {
              backgroundColor: C.surface2,
              borderColor: dropdownVisible ? C.accent : C.border,
            },
          ]}
        >
          {/* Büyüteç */}
          <TouchableOpacity onPress={handleSubmit} style={styles.iconBtn} activeOpacity={0.7}>
            <Text style={styles.icon}>🔍</Text>
          </TouchableOpacity>

          {/* Input */}
          <TextInput
            ref={inputRef}
            style={[styles.input, { color: C.foreground }]}
            placeholder="Ürün, hizmet veya 3D tasarım ara..."
            placeholderTextColor={C.subtleForeground}
            value={query}
            onChangeText={handleChange}
            onFocus={handleFocus}
            returnKeyType="search"
            onSubmitEditing={handleSubmit}
            autoCorrect={false}
            autoCapitalize="none"
          />

          {/* Temizle */}
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => { setQuery(""); fetchSearch(""); }}
              style={styles.iconBtn}
              activeOpacity={0.7}
            >
              <Text style={[styles.icon, { color: C.subtleForeground, fontSize: 11 }]}>✕</Text>
            </TouchableOpacity>
          )}

          {/* Mikrofon */}
          <TouchableOpacity onPress={handleMic} style={styles.iconBtn} activeOpacity={0.7}>
            <Text style={styles.icon}>🎙️</Text>
          </TouchableOpacity>

          {/* Kamera */}
          <TouchableOpacity onPress={handleCamera} style={styles.iconBtn} activeOpacity={0.7}>
            <Text style={styles.icon}>📷</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Dropdown (Modal) */}
      <SearchDropdown
        visible={dropdownVisible}
        query={query}
        result={result}
        loading={loading}
        recentSearches={recents}
        onSelect={handleSelect}
        onDeleteRecent={handleDeleteRecent}
        onClose={handleClose}
      />
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: { paddingHorizontal: 12, paddingBottom: 8 },
  box: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 4,
    height: 42,
    gap: 2,
  },
  iconBtn:  { padding: 6, alignItems: "center", justifyContent: "center" },
  icon:     { fontSize: 14 },
  input:    { flex: 1, fontSize: 13, paddingVertical: 0 },
});
