import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../constants";
import { useCart } from "../src/store/CartContext";

export default function CartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    items,
    removeFromCart,
    updateQuantity,
    totalItems,
    totalPrice,
    clearCart,
  } = useCart();

  const handleCheckout = () => {
    if (items.length === 0) return;
    router.push("/checkout");
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Sepetim</Text>
        {items.length > 0 ? (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() => {
              Alert.alert(
                "Sepeti Temizle",
                "Tüm ürünler silinecek, emin misiniz?",
                [
                  { text: "İptal", style: "cancel" },
                  { text: "Temizle", style: "destructive", onPress: clearCart },
                ],
              );
            }}
          >
            <Text style={styles.clearText}>Temizle</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyArea}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={styles.emptyTitle}>Sepetiniz Boş</Text>
          <Text style={styles.emptySub}>
            Sanatkat mağazasından ürün ekleyin
          </Text>
          <TouchableOpacity
            style={styles.shopBtn}
            onPress={() => router.push("/(tabs)/shop")}
          >
            <Text style={styles.shopBtnText}>Alışverişe Başla</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView showsVerticalScrollIndicator={false} style={styles.list}>
            {items.map((item) => (
              <View key={item.product.id} style={styles.card}>
                {item.product.images[0] ? (
                  <Image
                    source={{ uri: item.product.images[0].src }}
                    style={styles.cardImg}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.cardImg, styles.cardImgPlaceholder]}>
                    <Text style={{ fontSize: 28 }}>🏛️</Text>
                  </View>
                )}
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName} numberOfLines={2}>
                    {item.product.name}
                  </Text>
                  <Text style={styles.cardPrice}>
                    {(
                      Number(
                        item.product.sale_price || item.product.regular_price,
                      ) * item.quantity
                    ).toLocaleString("tr-TR")}
                    ₺
                  </Text>
                  {item.product.sale_price && (
                    <Text style={styles.cardUnitPrice}>
                      Birim:{" "}
                      {Number(item.product.sale_price).toLocaleString("tr-TR")}₺
                    </Text>
                  )}
                  <View style={styles.qtyRow}>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() =>
                        updateQuantity(item.product.id, item.quantity - 1)
                      }
                    >
                      <Text style={styles.qtyBtnText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() =>
                        updateQuantity(item.product.id, item.quantity + 1)
                      }
                    >
                      <Text style={styles.qtyBtnText}>+</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.removeBtn}
                      onPress={() => removeFromCart(item.product.id)}
                    >
                      <Text style={styles.removeBtnText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
            <View style={{ height: 120 }} />
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.totalRow}>
              <View>
                <Text style={styles.totalLabel}>Toplam</Text>
                <Text style={styles.totalCount}>{totalItems} ürün</Text>
              </View>
              <Text style={styles.totalPrice}>
                {totalPrice.toLocaleString("tr-TR")}₺
              </Text>
            </View>
            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={handleCheckout}
            >
              <Text style={styles.checkoutBtnText}>Siparişi Tamamla →</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
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
  title: { fontSize: 18, fontWeight: "800", color: Colors.text },
  clearBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: Colors.red + "44",
    backgroundColor: Colors.red + "11",
  },
  clearText: { fontSize: 12, color: Colors.red, fontWeight: "600" },
  emptyArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyEmoji: { fontSize: 60, marginBottom: 16 },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 13,
    color: Colors.text2,
    marginBottom: 24,
    textAlign: "center",
  },
  shopBtn: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  shopBtnText: { fontSize: 14, fontWeight: "600", color: "#fff" },
  list: { flex: 1, paddingHorizontal: 16 },
  card: {
    flexDirection: "row",
    gap: 14,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  cardImg: { width: 84, height: 84, borderRadius: 12 },
  cardImgPlaceholder: {
    backgroundColor: "#1a1a2e",
    alignItems: "center",
    justifyContent: "center",
  },
  cardInfo: { flex: 1 },
  cardName: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
    lineHeight: 18,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.accent,
    marginBottom: 2,
  },
  cardUnitPrice: { fontSize: 11, color: Colors.text3, marginBottom: 6 },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 6 },
  qtyBtn: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtnText: { fontSize: 16, fontWeight: "700", color: Colors.text },
  qtyText: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
    minWidth: 22,
    textAlign: "center",
  },
  removeBtn: { marginLeft: "auto" as any, padding: 4 },
  removeBtnText: { fontSize: 18 },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  totalLabel: { fontSize: 12, color: Colors.text2, marginBottom: 2 },
  totalCount: { fontSize: 11, color: Colors.text3 },
  totalPrice: { fontSize: 24, fontWeight: "800", color: Colors.text },
  checkoutBtn: {
    backgroundColor: Colors.accent,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  checkoutBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
});
