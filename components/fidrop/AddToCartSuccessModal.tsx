// ─── AddToCartSuccessModal (App) ───────────────────────────────────────────────
// Fidrop print sepete eklenince açılır — RN Modal + Reanimated slide-up.

import React, { useMemo } from "react";
import {
  Modal, View, Text, TouchableOpacity, StyleSheet,
} from "react-native";
import Animated, { FadeIn, SlideInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { type ThemeColors } from "../../constants/theme";
import { useTheme } from "../../hooks/useTheme";

interface AddToCartSuccessModalProps {
  visible:      boolean;
  fileName?:    string;
  totalPrice?:  number;
  onClose:      () => void;
  onNewModel:   () => void;
}

export default function AddToCartSuccessModal({
  visible, fileName, totalPrice, onClose, onNewModel,
}: AddToCartSuccessModalProps) {
  const { colors: C } = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleGoToCart = () => {
    onClose();
    router.push("/(account)/cart" as any);
  };

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <Animated.View entering={FadeIn.duration(200)} style={styles.overlay}>
        <Animated.View
          entering={SlideInDown.springify().damping(18).stiffness(200)}
          style={[styles.sheet, { paddingBottom: insets.bottom + 24 }]}
        >
          {/* Handle */}
          <View style={styles.handle} />

          {/* İkon */}
          <View style={styles.iconWrap}>
            <Text style={styles.iconText}>✅</Text>
          </View>

          <Text style={styles.title}>Sepete Eklendi!</Text>

          {fileName && (
            <Text style={styles.fileName} numberOfLines={1}>{fileName}</Text>
          )}

          {/* Güven mesajı */}
          <View style={styles.trustBox}>
            <Text style={styles.trustIcon}>🏭</Text>
            <Text style={styles.trustText}>
              Dosyanız{" "}
              <Text style={styles.trustBold}>Fimarkt mühendisleri</Text>
              {" "}tarafından kalite kontrolünden geçirilip, standartlarımıza uyan{" "}
              <Text style={styles.trustBold}>onaylı Çözüm Ortağımıza</Text>
              {" "}otomatik yönlendirilecektir.
            </Text>
          </View>

          {/* Rozet üçlüsü */}
          <View style={styles.badgeRow}>
            {[
              { icon: "🔍", label: "Kalite\nKontrol"    },
              { icon: "✦",  label: "Onaylı\nÜretici"    },
              { icon: "🛡️", label: "Fimarkt\nGüvencesi" },
            ].map(b => (
              <View key={b.label} style={styles.badge}>
                <Text style={styles.badgeIcon}>{b.icon}</Text>
                <Text style={styles.badgeLabel}>{b.label}</Text>
              </View>
            ))}
          </View>

          {/* Fiyat */}
          {totalPrice != null && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Sepet toplamı güncellendi</Text>
              <Text style={styles.priceValue}>₺{totalPrice.toLocaleString("tr-TR")}</Text>
            </View>
          )}

          {/* CTA'ler */}
          <TouchableOpacity style={styles.primaryBtn} onPress={handleGoToCart} activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>🛒  Sepete Git →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={onNewModel} activeOpacity={0.85}>
            <Text style={styles.secondaryBtnText}>+ Başka Model Yükle</Text>
          </TouchableOpacity>

        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

function createStyles(C: ThemeColors) {
  return StyleSheet.create({
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "flex-end" },
    sheet: {
      backgroundColor:   C.surface,
      borderTopLeftRadius:  28,
      borderTopRightRadius: 28,
      paddingTop:        12,
      paddingHorizontal: 20,
      borderTopWidth:    1,
      borderColor:       C.border,
    },
    handle: {
      width: 40, height: 4, backgroundColor: C.border,
      borderRadius: 2, alignSelf: "center", marginBottom: 20,
    },
    iconWrap: {
      width: 72, height: 72, borderRadius: 20,
      backgroundColor: "#22c55e1a", borderWidth: 1, borderColor: "#22c55e33",
      alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: 12,
    },
    iconText:  { fontSize: 32 },
    title: {
      fontSize: 20, fontWeight: "800", color: C.foreground,
      textAlign: "center", marginBottom: 4, letterSpacing: -0.5,
    },
    fileName: {
      fontSize: 12, color: C.accent, fontWeight: "600",
      textAlign: "center", marginBottom: 16, paddingHorizontal: 16,
    },
    trustBox: {
      flexDirection: "row", backgroundColor: C.accent + "12",
      borderRadius: 14, borderWidth: 1, borderColor: C.accent + "25",
      padding: 14, gap: 10, marginBottom: 14,
    },
    trustIcon: { fontSize: 18, marginTop: 1 },
    trustText: { flex: 1, fontSize: 12, color: C.mutedForeground, lineHeight: 18 },
    trustBold: { color: C.foreground, fontWeight: "700" },
    badgeRow:  { flexDirection: "row", gap: 8, marginBottom: 16 },
    badge: {
      flex: 1, backgroundColor: C.surface2, borderRadius: 12,
      borderWidth: 1, borderColor: C.border, padding: 10, alignItems: "center",
    },
    badgeIcon:  { fontSize: 16, marginBottom: 4 },
    badgeLabel: { fontSize: 9, color: C.mutedForeground, fontWeight: "700", textAlign: "center", lineHeight: 13 },
    priceRow: {
      flexDirection: "row", justifyContent: "space-between",
      alignItems: "center", marginBottom: 16, paddingHorizontal: 2,
    },
    priceLabel: { fontSize: 11, color: C.mutedForeground },
    priceValue: { fontSize: 18, fontWeight: "800", color: C.accent },
    primaryBtn: {
      backgroundColor: C.accent, borderRadius: 14,
      paddingVertical: 16, alignItems: "center", marginBottom: 10,
    },
    primaryBtnText:  { color: "#fff", fontSize: 15, fontWeight: "800", letterSpacing: 0.2 },
    secondaryBtn: {
      backgroundColor: C.surface2, borderRadius: 14,
      paddingVertical: 14, alignItems: "center",
      borderWidth: 1, borderColor: C.border,
    },
    secondaryBtnText: { color: C.mutedForeground, fontSize: 14, fontWeight: "600" },
  });
}
