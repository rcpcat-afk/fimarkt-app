import { useRouter } from "expo-router";
import React, { useState } from "react";
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
import { Colors } from "../../constants";

interface PaymentMethod {
  id: string;
  type: "credit" | "debit";
  bank: string;
  last4: string;
  expiry: string;
  isDefault: boolean;
}

const MOCK_CARDS: PaymentMethod[] = [
  {
    id: "1",
    type: "credit",
    bank: "Ziraat Bankası",
    last4: "4242",
    expiry: "12/26",
    isDefault: true,
  },
  {
    id: "2",
    type: "debit",
    bank: "Garanti BBVA",
    last4: "1234",
    expiry: "08/25",
    isDefault: false,
  },
];

const BANK_COLORS: Record<string, string> = {
  "Ziraat Bankası": "#00a650",
  "Garanti BBVA": "#00a3e0",
  "İş Bankası": "#004b87",
  Akbank: "#e3000b",
  "Yapı Kredi": "#003087",
  Halkbank: "#005baa",
};

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [cards, setCards] = useState<PaymentMethod[]>(MOCK_CARDS);

  const handleDelete = (id: string) => {
    Alert.alert("Kartı Sil", "Bu kartı silmek istediğinize emin misiniz?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: () => setCards((prev) => prev.filter((c) => c.id !== id)),
      },
    ]);
  };

  const handleSetDefault = (id: string) => {
    setCards((prev) => prev.map((c) => ({ ...c, isDefault: c.id === id })));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Ödeme Yöntemlerim</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* KARTLAR */}
        {cards.map((card) => (
          <View key={card.id} style={styles.card}>
            {/* KART GÖRSELİ */}
            <View
              style={[
                styles.cardVisual,
                { backgroundColor: BANK_COLORS[card.bank] || Colors.accent },
              ]}
            >
              <View style={styles.cardVisualTop}>
                <Text style={styles.cardBank}>{card.bank}</Text>
                <Text style={styles.cardType}>
                  {card.type === "credit" ? "Kredi Kartı" : "Banka Kartı"}
                </Text>
              </View>
              <Text style={styles.cardNumber}>•••• •••• •••• {card.last4}</Text>
              <View style={styles.cardVisualBottom}>
                <Text style={styles.cardExpiry}>
                  Son Kullanma: {card.expiry}
                </Text>
                {card.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>Varsayılan</Text>
                  </View>
                )}
              </View>
            </View>

            {/* BUTONLAR */}
            <View style={styles.cardActions}>
              {!card.isDefault && (
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleSetDefault(card.id)}
                >
                  <Text style={styles.actionBtnText}>Varsayılan Yap</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.actionBtn, styles.deleteBtn]}
                onPress={() => handleDelete(card.id)}
              >
                <Text style={styles.deleteBtnText}>🗑️ Sil</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* YENİ KART EKLE */}
        <TouchableOpacity style={styles.addCard}>
          <Text style={styles.addCardIcon}>+</Text>
          <Text style={styles.addCardText}>Yeni Kart Ekle</Text>
          <Text style={styles.addCardSub}>Kredi veya banka kartı ekleyin</Text>
        </TouchableOpacity>

        {/* GÜVENLİ ÖDEME NOTU */}
        <View style={styles.secureNote}>
          <Text style={styles.secureIcon}>🔒</Text>
          <Text style={styles.secureText}>
            Kart bilgileriniz 256-bit SSL şifreleme ile güvende. İyzico
            güvencesiyle ödeme yapın.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: { fontSize: 17, fontWeight: "700", color: Colors.text },
  container: { flex: 1, backgroundColor: Colors.bg },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: {
    fontSize: 28,
    color: Colors.text,
    lineHeight: 32,
    marginTop: -2,
  },

  content: { paddingHorizontal: 24 },
  card: { marginBottom: 16 },
  cardVisual: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 8,
    minHeight: 120,
  },
  cardVisualTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  cardBank: { fontSize: 14, fontWeight: "700", color: "#fff" },
  cardType: { fontSize: 11, color: "rgba(255,255,255,0.7)" },
  cardNumber: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    letterSpacing: 2,
    marginBottom: 16,
  },
  cardVisualBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardExpiry: { fontSize: 12, color: "rgba(255,255,255,0.8)" },
  defaultBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
  },
  defaultBadgeText: { fontSize: 10, color: "#fff", fontWeight: "600" },
  cardActions: { flexDirection: "row", gap: 8 },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center" as const,
  },
  actionBtnText: { fontSize: 12, color: Colors.text2 },
  deleteBtn: {
    borderColor: "rgba(239,68,68,0.3)",
    backgroundColor: "rgba(239,68,68,0.08)",
  },
  deleteBtnText: { fontSize: 12, color: "#ef4444" },
  addCard: {
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: "dashed",
    borderRadius: 16,
    padding: 20,
    alignItems: "center" as const,
    marginBottom: 16,
  },
  addCardIcon: { fontSize: 28, color: Colors.accent, marginBottom: 6 },
  addCardText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  addCardSub: { fontSize: 12, color: Colors.text2 },
  secureNote: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
  },
  secureIcon: { fontSize: 16 },
  secureText: { flex: 1, fontSize: 12, color: Colors.text2, lineHeight: 18 },
});
