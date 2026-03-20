import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../constants/theme";
import { useCart } from "../../src/store/CartContext";
import { TOP_CATEGORIES } from "../../constants/categories";
import MegaMenu from "../../app/megamenu";

const C = Colors.dark;

// ── Helpers ───────────────────────────────────────────────────────────────────

function getCategoryRoute(
  pillarId: string,
  slug: string
): { pathname: string; params?: Record<string, string> } {
  if (pillarId === "fidrop") {
    if (slug === "fdm-baski") return { pathname: "/(print)/print-upload", params: { service: slug } };
    return { pathname: "/(print)/print-quote", params: { service: slug } };
  }
  if (pillarId === "pazaryeri") return { pathname: "/(tabs)/shop", params: { cat: slug } };
  if (pillarId === "sanatkat")  return { pathname: "/(tabs)/shop", params: { type: "digital", cat: slug } };
  return { pathname: "/(tabs)" };
}

// ── Notification Modal skeleton ───────────────────────────────────────────────
function NotifModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal visible animationType="slide" transparent statusBarTranslucent>
      <View style={ms.modalOverlay}>
        <TouchableOpacity style={ms.modalBackdrop} onPress={onClose} activeOpacity={1} />
        <View style={[ms.modalSheet, { backgroundColor: C.surface }]}>
          <View style={[ms.modalHeader, { borderBottomColor: C.border }]}>
            <Text style={[ms.modalTitle, { color: C.foreground }]}>Bildirimler</Text>
            <TouchableOpacity onPress={onClose} style={[ms.closeBtn, { backgroundColor: C.surface2, borderColor: C.border }]}>
              <Text style={[ms.closeBtnText, { color: C.mutedForeground }]}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={ms.modalEmpty}>
            <Text style={ms.modalEmoji}>🔔</Text>
            <Text style={[ms.modalEmptyTitle, { color: C.foreground }]}>Henüz bildirim yok</Text>
            <Text style={[ms.modalEmptyDesc, { color: C.mutedForeground }]}>Yeni bildirimler burada görünecek.</Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={[ms.modalFooterBtn, { backgroundColor: C.accent }]}
          >
            <Text style={ms.modalFooterBtnText}>Tüm Bildirimlere Git</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ── Support Modal skeleton ────────────────────────────────────────────────────
function SupportModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const ITEMS = [
    { icon: "📚", label: "Yardım Merkezi",  route: "/yardim" },
    { icon: "💬", label: "Canlı Destek",    route: "/messages" },
    { icon: "📧", label: "Bize Ulaşın",     route: "/messages" },
    { icon: "📋", label: "SSS",             route: "/yardim" },
  ];
  return (
    <Modal visible animationType="slide" transparent statusBarTranslucent>
      <View style={ms.modalOverlay}>
        <TouchableOpacity style={ms.modalBackdrop} onPress={onClose} activeOpacity={1} />
        <View style={[ms.modalSheet, { backgroundColor: C.surface }]}>
          <View style={[ms.modalHeader, { borderBottomColor: C.border }]}>
            <Text style={[ms.modalTitle, { color: C.foreground }]}>Destek</Text>
            <TouchableOpacity onPress={onClose} style={[ms.closeBtn, { backgroundColor: C.surface2, borderColor: C.border }]}>
              <Text style={[ms.closeBtnText, { color: C.mutedForeground }]}>✕</Text>
            </TouchableOpacity>
          </View>
          {ITEMS.map((it) => (
            <TouchableOpacity
              key={it.route + it.label}
              style={[ms.supportItem, { borderBottomColor: C.border }]}
              onPress={() => { onClose(); router.push(it.route as any); }}
            >
              <Text style={ms.supportItemIcon}>{it.icon}</Text>
              <Text style={[ms.supportItemLabel, { color: C.foreground }]}>{it.label}</Text>
              <Text style={[ms.supportItemArrow, { color: C.mutedForeground }]}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );
}

// ── GlobalHeader ──────────────────────────────────────────────────────────────
export default function GlobalHeader() {
  const router        = useRouter();
  const insets        = useSafeAreaInsets();
  const { totalItems } = useCart();

  const [search,       setSearch]       = useState("");
  const [activeChip,   setActiveChip]   = useState<string | null>(null);
  const [megaVisible,  setMegaVisible]  = useState(false);
  const [notifVisible, setNotifVisible] = useState(false);
  const [suppVisible,  setSuppVisible]  = useState(false);

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top, backgroundColor: C.background, borderBottomColor: C.border }]}>

      {/* ── 1. Kat: Logo + İkonlar ─────────────────────────────────────────── */}
      <View style={styles.row1}>
        {/* Logo */}
        <TouchableOpacity style={styles.logoRow} onPress={() => router.push("/(tabs)")}>
          <View style={styles.logoCube}>
            <View style={[styles.cubeTop,   { backgroundColor: C.accent }]} />
            <View style={[styles.cubeLeft,  { backgroundColor: C.accent + "99" }]} />
            <View style={[styles.cubeRight, { backgroundColor: C.accent + "59" }]} />
          </View>
          <Text style={[styles.logoText, { color: C.foreground }]}>fimarkt</Text>
        </TouchableOpacity>

        {/* İkonlar */}
        <View style={styles.icons}>
          {/* Bildirim */}
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: C.surface2, borderColor: C.border }]} onPress={() => setNotifVisible(true)}>
            <Text style={styles.iconEmoji}>🔔</Text>
          </TouchableOpacity>
          {/* Destek */}
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: C.surface2, borderColor: C.border }]} onPress={() => setSuppVisible(true)}>
            <Text style={styles.iconEmoji}>🎧</Text>
          </TouchableOpacity>
          {/* Sepet */}
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: C.surface2, borderColor: C.border }]} onPress={() => router.push("/(account)/cart")}>
            <Text style={styles.iconEmoji}>🛒</Text>
            {totalItems > 0 && (
              <View style={[styles.badge, { backgroundColor: C.accent }]}>
                <Text style={styles.badgeText}>{totalItems > 99 ? "99+" : totalItems}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── 2. Kat: Arama ─────────────────────────────────────────────────── */}
      <View style={styles.row2}>
        <View style={[styles.searchBox, { backgroundColor: C.surface2, borderColor: C.border }]}>
          <Text style={[styles.searchIcon, { color: C.subtleForeground }]}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: C.foreground }]}
            placeholder="Ürün, hizmet veya 3D tasarım ara..."
            placeholderTextColor={C.subtleForeground}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            onSubmitEditing={() => {
              if (search.trim()) router.push({ pathname: "/ara" as any, params: { q: search.trim() } });
            }}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Text style={[styles.searchClear, { color: C.subtleForeground }]}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── 3. Kat: ≡ + Kategori Şeridi ──────────────────────────────────── */}
      <View style={styles.row3}>
        {/* Hamburger */}
        <TouchableOpacity style={styles.hamburger} onPress={() => setMegaVisible(true)}>
          <View style={[styles.hamLine,              { backgroundColor: C.mutedForeground }]} />
          <View style={[styles.hamLine, { width: 14 }, { backgroundColor: C.mutedForeground }]} />
          <View style={[styles.hamLine,              { backgroundColor: C.mutedForeground }]} />
        </TouchableOpacity>

        {/* Separator */}
        <View style={[styles.vSep, { backgroundColor: C.border }]} />

        {/* Kategori chipleri */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {TOP_CATEGORIES.map((pillar, pi) => (
            <React.Fragment key={pillar.id}>
              {pi > 0 && <View style={[styles.pillarSep, { backgroundColor: C.border }]} />}
              {pillar.children.slice(0, 5).map((cat) => {
                const isActive = activeChip === cat.id;
                const route    = getCategoryRoute(pillar.id, cat.slug);
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.chip,
                      { backgroundColor: isActive ? C.accent : C.surface2, borderColor: isActive ? C.accent : C.border },
                    ]}
                    onPress={() => {
                      setActiveChip(cat.id);
                      router.push({ pathname: route.pathname as any, params: route.params });
                    }}
                  >
                    <Text style={[styles.chipText, { color: isActive ? "#fff" : C.mutedForeground }]}>
                      {cat.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </React.Fragment>
          ))}
        </ScrollView>
      </View>

      {/* Modals */}
      <MegaMenu visible={megaVisible}  onClose={() => setMegaVisible(false)} />
      {notifVisible && <NotifModal    onClose={() => setNotifVisible(false)} />}
      {suppVisible  && <SupportModal  onClose={() => setSuppVisible(false)} />}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper:     { borderBottomWidth: 1 },

  // Row 1
  row1:        { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, paddingTop: 8, paddingBottom: 6 },
  logoRow:     { flexDirection: "row", alignItems: "center", gap: 8 },
  logoCube:    { width: 28, height: 28, position: "relative" },
  cubeTop:     { position: "absolute", top: 0, left: 3, width: 22, height: 11, borderRadius: 3, transform: [{ skewX: "-20deg" }] },
  cubeLeft:    { position: "absolute", top: 9, left: 0,  width: 12, height: 14, borderRadius: 2 },
  cubeRight:   { position: "absolute", top: 9, left: 12, width: 12, height: 14, borderRadius: 2 },
  logoText:    { fontSize: 20, fontWeight: "900", letterSpacing: -0.8 },
  icons:       { flexDirection: "row", gap: 6 },
  iconBtn:     { width: 36, height: 36, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  iconEmoji:   { fontSize: 16 },
  badge:       { position: "absolute", top: -5, right: -5, borderRadius: 99, minWidth: 16, height: 16, alignItems: "center", justifyContent: "center", paddingHorizontal: 3 },
  badgeText:   { fontSize: 9, color: "#fff", fontWeight: "800" },

  // Row 2
  row2:        { paddingHorizontal: 12, paddingBottom: 8 },
  searchBox:   { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, height: 42, gap: 8 },
  searchIcon:  { fontSize: 14 },
  searchInput: { flex: 1, fontSize: 13 },
  searchClear: { fontSize: 12, paddingHorizontal: 2 },

  // Row 3
  row3:        { flexDirection: "row", alignItems: "center", paddingBottom: 10 },
  hamburger:   { paddingHorizontal: 12, paddingVertical: 4, alignItems: "flex-start", justifyContent: "center", gap: 4 },
  hamLine:     { width: 18, height: 2, borderRadius: 2 },
  vSep:        { width: 1, height: 18, marginRight: 6 },
  chipRow:     { flexDirection: "row", alignItems: "center", gap: 6, paddingRight: 12 },
  pillarSep:   { width: 1, height: 16, marginHorizontal: 2 },
  chip:        { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 99, borderWidth: 1 },
  chipText:    { fontSize: 12, fontWeight: "500" },
});

// ── Modal Styles ──────────────────────────────────────────────────────────────
const ms = StyleSheet.create({
  modalOverlay:     { flex: 1, justifyContent: "flex-end" },
  modalBackdrop:    { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)" },
  modalSheet:       { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 32 },
  modalHeader:      { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  modalTitle:       { fontSize: 15, fontWeight: "700" },
  closeBtn:         { width: 32, height: 32, borderRadius: 16, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  closeBtnText:     { fontSize: 13 },
  modalEmpty:       { alignItems: "center", paddingVertical: 40 },
  modalEmoji:       { fontSize: 40, marginBottom: 10 },
  modalEmptyTitle:  { fontSize: 15, fontWeight: "600", marginBottom: 4 },
  modalEmptyDesc:   { fontSize: 12 },
  modalFooterBtn:   { marginHorizontal: 16, marginTop: 16, borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  modalFooterBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  supportItem:      { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  supportItemIcon:  { fontSize: 18 },
  supportItemLabel: { flex: 1, fontSize: 14 },
  supportItemArrow: { fontSize: 20 },
});
