import { useRef, useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../constants/theme";
import { TOP_CATEGORIES } from "../../constants/categories";
import { useAuth } from "../../src/store/AuthContext";

const C = Colors.dark;
const DRAWER_W = Math.min(Dimensions.get("window").width * 0.85, 360);

interface Props {
  visible: boolean;
  onClose: () => void;
}

const QUICK_LINKS = [
  { icon: "📦", label: "Siparişlerim",   href: "/(account)/orders" },
  { icon: "❤️", label: "Favorilerim",    href: "/favorites" },
  { icon: "🎧", label: "Destek",         href: "/messages" },
  { icon: "⚙️", label: "Ayarlar",        href: "/(account)/settings" },
];

export default function DrawerMenu({ visible, onClose }: Props) {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const { user } = useAuth();

  const slideAnim = useRef(new Animated.Value(-DRAWER_W)).current;
  const [openPillarId, setOpenPillarId] = useState<string | null>(null);

  // ── Slide-in when visible, slide-out on close ──────────────────────────────
  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 0,
        speed: 20,
      }).start();
    }
  }, [visible, slideAnim]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: -DRAWER_W,
      duration: 240,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const navigate = (href: string) => {
    handleClose();
    setTimeout(() => router.push(href as never), 260);
  };

  return (
    <Modal visible={visible} animationType="none" transparent statusBarTranslucent>
      <View style={s.overlay}>
        {/* Backdrop — tap to close */}
        <TouchableOpacity style={s.backdrop} onPress={handleClose} activeOpacity={1} />

        {/* ── Drawer panel ──────────────────────────────────────────────── */}
        <Animated.View
          style={[
            s.drawer,
            {
              paddingTop: insets.top,
              transform: [{ translateX: slideAnim }],
              backgroundColor: C.background,
              borderRightColor: C.border,
            },
          ]}
        >
          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>

            {/* ── 1. Profile Area ─────────────────────────────────────── */}
            <View style={[s.profileSection, { borderBottomColor: C.border }]}>
              {/* Close button — top right */}
              <TouchableOpacity
                onPress={handleClose}
                style={[s.closeBtn, { backgroundColor: C.surface2, borderColor: C.border }]}
              >
                <Text style={{ color: C.mutedForeground, fontSize: 13 }}>✕</Text>
              </TouchableOpacity>

              {user ? (
                /* Logged in: avatar + name + role */
                <TouchableOpacity onPress={() => navigate("/(account)/profile")}>
                  <View style={[s.avatar, { backgroundColor: C.accent + "22", borderColor: C.accent + "55" }]}>
                    <Text style={[s.avatarInitial, { color: C.accent }]}>
                      {user.name?.charAt(0)?.toUpperCase() ?? "?"}
                    </Text>
                  </View>
                  <Text style={[s.greeting, { color: C.subtleForeground }]}>Merhaba,</Text>
                  <Text style={[s.userName, { color: C.foreground }]}>{user.name}</Text>
                  {user.role ? (
                    <View style={[s.roleBadge, { backgroundColor: C.accent + "22", borderColor: C.accent + "44" }]}>
                      <Text style={[s.roleText, { color: C.accent }]}>{user.role}</Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
              ) : (
                /* Logged out: auth buttons */
                <View>
                  <Text style={[s.greeting, { color: C.subtleForeground }]}>Hoş geldiniz!</Text>
                  <Text style={[s.guestNote, { color: C.mutedForeground }]}>
                    Giriş yaparak siparişlerinizi takip edin.
                  </Text>
                  <View style={s.authRow}>
                    <TouchableOpacity
                      style={[s.btnPrimary, { backgroundColor: C.accent }]}
                      onPress={() => navigate("/(auth)/login")}
                    >
                      <Text style={s.btnPrimaryText}>Giriş Yap</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[s.btnSecondary, { borderColor: C.border }]}
                      onPress={() => navigate("/(auth)/register")}
                    >
                      <Text style={[s.btnSecondaryText, { color: C.foreground }]}>Kayıt Ol</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            {/* ── 2. Kategoriler (Accordion) ───────────────────────────── */}
            <View style={[s.section, { borderBottomColor: C.border }]}>
              <Text style={[s.sectionTitle, { color: C.subtleForeground }]}>KATEGORİLER</Text>

              {TOP_CATEGORIES.map((pillar) => {
                const isOpen = openPillarId === pillar.id;
                return (
                  <View key={pillar.id}>
                    {/* Pillar row — tap to expand/collapse */}
                    <TouchableOpacity
                      style={[s.pillarRow, { borderColor: C.border }]}
                      onPress={() => setOpenPillarId(isOpen ? null : pillar.id)}
                      activeOpacity={0.75}
                    >
                      <Text style={s.pillarIcon}>{pillar.icon}</Text>
                      <Text style={[s.pillarLabel, { color: isOpen ? C.accent : C.foreground }]}>
                        {pillar.title}
                      </Text>
                      <Text style={[s.pillarChevron, { color: C.subtleForeground }]}>
                        {isOpen ? "▲" : "▼"}
                      </Text>
                    </TouchableOpacity>

                    {/* Sub-categories */}
                    {isOpen && (
                      <View style={[s.subcatList, { backgroundColor: C.surface }]}>
                        {pillar.children.map((cat, idx) => (
                          <TouchableOpacity
                            key={cat.id}
                            style={[
                              s.subcatRow,
                              idx < pillar.children.length - 1 && { borderBottomColor: C.border + "80", borderBottomWidth: 1 },
                            ]}
                            onPress={() => navigate(`/${pillar.slug}/${cat.slug}`)}
                            activeOpacity={0.8}
                          >
                            {cat.icon ? (
                              <Text style={s.subcatIcon}>{cat.icon}</Text>
                            ) : null}
                            <Text style={[s.subcatLabel, { color: C.foreground }]}>{cat.title}</Text>
                            {cat.children?.length ? (
                              <View style={[s.subcatCountBadge, { backgroundColor: C.surface2 }]}>
                                <Text style={[s.subcatCount, { color: C.subtleForeground }]}>
                                  {cat.children.length}
                                </Text>
                              </View>
                            ) : null}
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>

            {/* ── 3. Hızlı Erişim ─────────────────────────────────────── */}
            <View style={[s.section, { paddingBottom: 24 }]}>
              <Text style={[s.sectionTitle, { color: C.subtleForeground }]}>HIZLI ERİŞİM</Text>

              {QUICK_LINKS.map((item) => (
                <TouchableOpacity
                  key={item.href + item.label}
                  style={[s.quickRow, { borderBottomColor: C.border + "60" }]}
                  onPress={() => navigate(item.href)}
                  activeOpacity={0.8}
                >
                  <Text style={s.quickIcon}>{item.icon}</Text>
                  <Text style={[s.quickLabel, { color: C.foreground }]}>{item.label}</Text>
                  <Text style={[s.quickArrow, { color: C.subtleForeground }]}>›</Text>
                </TouchableOpacity>
              ))}
            </View>

          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  overlay:  { flex: 1, flexDirection: "row" },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)" },

  drawer: {
    width:           DRAWER_W,
    height:          "100%",
    borderRightWidth: 1,
    shadowColor:     "#000",
    shadowOffset:    { width: 4, height: 0 },
    shadowOpacity:   0.35,
    shadowRadius:    12,
    elevation:       20,
  },

  // Profile section
  profileSection: {
    padding:          20,
    paddingTop:       16,
    borderBottomWidth: 1,
    position:         "relative",
    minHeight:        120,
  },
  closeBtn: {
    position:   "absolute",
    top:        16,
    right:      16,
    width:      32,
    height:     32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width:        52,
    height:       52,
    borderRadius: 26,
    borderWidth:  1,
    alignItems:   "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  avatarInitial: { fontSize: 22, fontWeight: "800" },
  greeting:      { fontSize: 12, marginBottom: 2 },
  userName:      { fontSize: 17, fontWeight: "800", letterSpacing: -0.4, marginBottom: 6 },
  roleBadge: {
    alignSelf:    "flex-start",
    paddingHorizontal: 10,
    paddingVertical:   3,
    borderRadius: 99,
    borderWidth:  1,
  },
  roleText:  { fontSize: 11, fontWeight: "700", textTransform: "capitalize" },
  guestNote: { fontSize: 12, marginBottom: 14, marginTop: 2 },
  authRow:   { flexDirection: "row", gap: 8, marginTop: 4 },
  btnPrimary: {
    flex: 1,
    paddingVertical: 11,
    borderRadius:    12,
    alignItems:      "center",
  },
  btnPrimaryText:    { color: "#fff", fontWeight: "700", fontSize: 13 },
  btnSecondary: {
    flex: 1,
    paddingVertical: 11,
    borderRadius:    12,
    borderWidth:     1,
    alignItems:      "center",
  },
  btnSecondaryText: { fontWeight: "600", fontSize: 13 },

  // Section
  section:      { borderBottomWidth: 1, paddingBottom: 8 },
  sectionTitle: {
    fontSize:       10,
    fontWeight:     "800",
    letterSpacing:  1.2,
    paddingHorizontal: 16,
    paddingTop:     16,
    paddingBottom:  8,
  },

  // Pillar (accordion)
  pillarRow: {
    flexDirection:  "row",
    alignItems:     "center",
    paddingHorizontal: 16,
    paddingVertical:   13,
    borderBottomWidth: 1,
  },
  pillarIcon:    { fontSize: 18, marginRight: 10 },
  pillarLabel:   { flex: 1, fontSize: 14, fontWeight: "600" },
  pillarChevron: { fontSize: 10 },

  // Sub-categories
  subcatList: { paddingHorizontal: 16, paddingVertical: 4 },
  subcatRow: {
    flexDirection:   "row",
    alignItems:      "center",
    paddingVertical: 11,
    gap:             10,
  },
  subcatIcon:       { fontSize: 16, width: 22, textAlign: "center" },
  subcatLabel:      { flex: 1, fontSize: 13 },
  subcatCountBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  subcatCount:      { fontSize: 11, fontWeight: "600" },

  // Quick links
  quickRow: {
    flexDirection:     "row",
    alignItems:        "center",
    paddingHorizontal: 16,
    paddingVertical:   14,
    borderBottomWidth: 1,
    gap:               12,
  },
  quickIcon:  { fontSize: 18 },
  quickLabel: { flex: 1, fontSize: 14 },
  quickArrow: { fontSize: 20 },
});
