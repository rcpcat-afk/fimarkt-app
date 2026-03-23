// ─── Kayıtlı Kartlarım — Premium Gradient Card Vault ────────────────────────
// İyzico PCI-DSS güvenli altyapı. Yeni kart ekleme yoktur (İyzico checkout flow).
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { type ThemeColors } from "../../constants/theme";
import { useTheme } from "../../hooks/useTheme";

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
    container:   { flex: 1, backgroundColor: C.bg },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    headerTitle: { fontSize: 17, fontWeight: "700", color: C.text },
    backBtn: {
      width: 40, height: 40, borderRadius: 20,
      backgroundColor: C.surface2,
      borderWidth: 1, borderColor: C.border,
      alignItems: "center", justifyContent: "center",
    },
    backArrow: { fontSize: 28, color: C.text, lineHeight: 32, marginTop: -2 },
    content: { paddingHorizontal: 16, gap: 16 },

    // ── Kart ──
    cardWrapper: { gap: 8 },
    cardVisual: {
      borderRadius: 20,
      padding: 20,
      minHeight: 150,
      overflow: "hidden",
      position: "relative",
    },
    decCircle1: {
      position: "absolute",
      right: -30, top: -30,
      width: 110, height: 110,
      borderRadius: 55,
      backgroundColor: "rgba(255,255,255,0.08)",
    },
    decCircle2: {
      position: "absolute",
      right: -10, top: 40,
      width: 70, height: 70,
      borderRadius: 35,
      backgroundColor: "rgba(255,255,255,0.06)",
    },
    cardTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 20,
    },
    cardBank: { fontSize: 15, fontWeight: "700", color: "#fff" },
    cardType: { fontSize: 10, color: "rgba(255,255,255,0.6)", marginTop: 2 },
    defaultBadge: {
      backgroundColor: "rgba(255,255,255,0.2)",
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 99,
    },
    defaultBadgeText: { fontSize: 9, fontWeight: "700", color: "#fff" },
    cardNumber: {
      fontSize: 20,
      fontWeight: "600",
      color: "#fff",
      letterSpacing: 3,
      marginBottom: 20,
      fontVariant: ["tabular-nums"],
    },
    cardBottom: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
    },
    cardFieldLabel: { fontSize: 8, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 0.5 },
    cardFieldValue: { fontSize: 12, fontWeight: "700", color: "#fff", marginTop: 2 },
    networkLabel:   { fontSize: 11, fontWeight: "900", color: "rgba(255,255,255,0.75)", fontStyle: "italic", letterSpacing: -0.5 },

    // ── Aksiyon Butonları ──
    cardActions: { flexDirection: "row", gap: 8 },
    actionBtnSecondary: {
      flex: 1,
      paddingVertical: 9,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: C.border,
      backgroundColor: C.surface2,
      alignItems: "center",
    },
    actionBtnSecondaryText: { fontSize: 12, fontWeight: "600", color: C.text2 },
    actionBtnDelete: {
      flex: 1,
      paddingVertical: 9,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: "rgba(239,68,68,0.3)",
      backgroundColor: "rgba(239,68,68,0.08)",
      alignItems: "center",
    },
    actionBtnDeleteText: { fontSize: 12, fontWeight: "600", color: "#ef4444" },

    // ── Boş Durum ──
    emptyState: {
      alignItems: "center",
      paddingVertical: 50,
      gap: 8,
    },
    emptyIcon:  { fontSize: 48, marginBottom: 4 },
    emptyTitle: { fontSize: 16, fontWeight: "700", color: C.text },
    emptyHint:  { fontSize: 13, color: C.text2, textAlign: "center", lineHeight: 20 },

    // ── Ekleme Notu ──
    addNoteCard: {
      flexDirection: "row",
      gap: 10,
      backgroundColor: C.surface2,
      borderWidth: 1,
      borderColor: C.border,
      borderRadius: 14,
      padding: 14,
      alignItems: "flex-start",
    },
    addNoteIcon: { fontSize: 16 },
    addNoteText: { flex: 1, fontSize: 12, color: C.text2, lineHeight: 18 },

    // ── Trust Badge ──
    trustBadge: {
      flexDirection: "row",
      gap: 12,
      backgroundColor: C.surface2,
      borderWidth: 1,
      borderColor: C.border,
      borderRadius: 14,
      padding: 14,
      alignItems: "flex-start",
    },
    trustIconWrap: {
      width: 36, height: 36,
      borderRadius: 10,
      backgroundColor: `${C.success}22`,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    trustIcon:  { fontSize: 18 },
    trustTitle: { fontSize: 13, fontWeight: "700", color: C.text, marginBottom: 4 },
    trustText:  { fontSize: 11, color: C.text2, lineHeight: 17 },
  });
}

// ─── Tip ──────────────────────────────────────────────────────────────────────
interface SavedCard {
  id: string;
  type: "credit" | "debit";
  bank: string;
  bin: string;
  last4: string;
  expiry: string;
  holder: string;
  isDefault: boolean;
}

// ─── Mock Veri ─────────────────────────────────────────────────────────────────
const MOCK_CARDS: SavedCard[] = [
  {
    id: "1",
    type: "credit",
    bank: "Ziraat Bankası",
    bin: "400000",
    last4: "4242",
    expiry: "12/26",
    holder: "AHMET YILMAZ",
    isDefault: true,
  },
  {
    id: "2",
    type: "debit",
    bank: "Garanti BBVA",
    bin: "520000",
    last4: "1234",
    expiry: "08/25",
    holder: "AHMET YILMAZ",
    isDefault: false,
  },
  {
    id: "3",
    type: "credit",
    bank: "İş Bankası",
    bin: "979200",
    last4: "8888",
    expiry: "03/27",
    holder: "AHMET YILMAZ",
    isDefault: false,
  },
];

// ─── Banka → Gradient renkleri ─────────────────────────────────────────────────
const BANK_GRADIENTS: Record<string, [string, string]> = {
  "Ziraat Bankası": ["#00a650", "#007a3a"],
  "Garanti BBVA":   ["#00a3e0", "#006fa8"],
  "İş Bankası":     ["#004b87", "#002d54"],
  "Akbank":         ["#e3000b", "#a80008"],
  "Yapı Kredi":     ["#003087", "#001a4d"],
  "Halkbank":       ["#005baa", "#003d72"],
};

// ─── Kart Ağı Tespiti ──────────────────────────────────────────────────────────
function detectNetwork(bin: string): string {
  if (bin.startsWith("4"))               return "VISA";
  if (/^5[1-5]/.test(bin) || bin.startsWith("2")) return "MASTERCARD";
  if (bin.startsWith("9792"))            return "TROY";
  if (/^3[47]/.test(bin))               return "AMEX";
  return "";
}

// ─── Kart Bileşeni ─────────────────────────────────────────────────────────────
function CardItem({
  card,
  onDelete,
  onSetDefault,
}: {
  card: SavedCard;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
}) {
  const { colors, isDark } = useTheme();
  const C      = useMemo(() => buildC(colors), [colors]);
  const styles = useMemo(() => createStyles(C), [C]);

  const [g1, g2] = BANK_GRADIENTS[card.bank] ?? [C.accent, "#cc4a15"];
  const network  = detectNetwork(card.bin);

  return (
    <View style={styles.cardWrapper}>
      {/* ── Kart Görseli ── */}
      <View style={[styles.cardVisual, { backgroundColor: g1 }]}>
        {/* Dekoratif daire */}
        <View style={styles.decCircle1} />
        <View style={styles.decCircle2} />

        {/* Üst: banka + tip */}
        <View style={styles.cardTop}>
          <View>
            <Text style={styles.cardBank}>{card.bank}</Text>
            <Text style={styles.cardType}>
              {card.type === "credit" ? "Kredi Kartı" : "Banka Kartı"}
            </Text>
          </View>
          {card.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultBadgeText}>Varsayılan</Text>
            </View>
          )}
        </View>

        {/* Kart numarası */}
        <Text style={styles.cardNumber}>•••• •••• •••• {card.last4}</Text>

        {/* Alt: kart sahibi + tarih + ağ */}
        <View style={styles.cardBottom}>
          <View>
            <Text style={styles.cardFieldLabel}>Kart Sahibi</Text>
            <Text style={styles.cardFieldValue}>{card.holder}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.cardFieldLabel}>Son Kul.</Text>
            <Text style={styles.cardFieldValue}>{card.expiry}</Text>
          </View>
          {network ? (
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.networkLabel}>{network}</Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* ── Aksiyon Butonları ── */}
      <View style={styles.cardActions}>
        {!card.isDefault && (
          <TouchableOpacity
            style={styles.actionBtnSecondary}
            onPress={() => onSetDefault(card.id)}
          >
            <Text style={styles.actionBtnSecondaryText}>✓ Varsayılan Yap</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.actionBtnDelete}
          onPress={() => onDelete(card.id)}
        >
          <Text style={styles.actionBtnDeleteText}>🗑️ Sil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Ana Ekran ─────────────────────────────────────────────────────────────────
export default function PaymentMethodsScreen() {
  const { colors, isDark } = useTheme();
  const C      = useMemo(() => buildC(colors), [colors]);
  const styles = useMemo(() => createStyles(C), [C]);

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [cards, setCards] = useState<SavedCard[]>(MOCK_CARDS);

  const handleDelete = (id: string) => {
    Alert.alert(
      "Kartı Sil",
      "Bu kartı silmek istediğinize emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: () => setCards(prev => prev.filter(c => c.id !== id)),
        },
      ],
    );
  };

  const handleSetDefault = (id: string) => {
    setCards(prev => prev.map(c => ({ ...c, isDefault: c.id === id })));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kayıtlı Kartlarım</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Boş durum */}
        {cards.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💳</Text>
            <Text style={styles.emptyTitle}>Kayıtlı kart yok</Text>
            <Text style={styles.emptyHint}>
              Ödeme sırasında "Kartı kaydet" seçeneğini kullanabilirsiniz.
            </Text>
          </View>
        )}

        {/* Kartlar */}
        {cards.map(card => (
          <CardItem
            key={card.id}
            card={card}
            onDelete={handleDelete}
            onSetDefault={handleSetDefault}
          />
        ))}

        {/* Kart ekleme yönlendirmesi */}
        <View style={styles.addNoteCard}>
          <Text style={styles.addNoteIcon}>💡</Text>
          <Text style={styles.addNoteText}>
            Yeni kart eklemek için ödeme adımında "Kartı kaydet" seçeneğini kullanın.
          </Text>
        </View>

        {/* İyzico Trust Badge */}
        <View style={styles.trustBadge}>
          <View style={styles.trustIconWrap}>
            <Text style={styles.trustIcon}>🔒</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.trustTitle}>Güvenli Kart Saklama</Text>
            <Text style={styles.trustText}>
              Kartlarınız İyzico PCI-DSS Level 1 sertifikalı altyapısında şifrelenerek saklanır.
              Fimarkt kart numaralarınıza hiçbir zaman erişemez.
            </Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}
