import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { getProduct, Product } from "../src/services/sanatkat";
import { useFavorites } from "../src/store/FavoritesContext";

export default function FavoritesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { favoriteIds, toggleFavorite } = useFavorites();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFavorites();
  }, [favoriteIds]);

  const loadFavorites = async () => {
    if (favoriteIds.length === 0) {
      setProducts([]);
      return;
    }
    setLoading(true);
    const results = await Promise.all(favoriteIds.map((id) => getProduct(id)));
    setProducts(results.filter(Boolean) as Product[]);
    setLoading(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Favorilerim</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.accent} size="large" />
        </View>
      ) : products.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>❤️</Text>
          <Text style={styles.emptyTitle}>Favori Ürün Yok</Text>
          <Text style={styles.emptySub}>
            Beğendiğiniz ürünleri favorilere ekleyin
          </Text>
          <TouchableOpacity
            style={styles.shopBtn}
            onPress={() => router.push("/(tabs)/shop")}
          >
            <Text style={styles.shopBtnText}>Alışverişe Başla</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <Text style={styles.count}>{products.length} ürün</Text>
          {products.map((item) => (
            <View key={item.id} style={styles.card}>
              {item.images[0]?.src ? (
                <Image
                  source={{ uri: item.images[0].src }}
                  style={styles.cardImg}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.cardImg, styles.cardImgPlaceholder]}>
                  <Text style={{ fontSize: 32 }}>🏛️</Text>
                </View>
              )}
              <View style={styles.cardInfo}>
                {item.categories[0] && (
                  <Text style={styles.cardCategory}>
                    {item.categories[0].name}
                  </Text>
                )}
                <Text style={styles.cardName} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.cardPrice}>
                  {item.sale_price || item.regular_price}₺
                </Text>
                <View style={styles.cardBtns}>
                  <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() =>
                      router.push({
                        pathname: "/product-detail",
                        params: { id: item.id },
                      })
                    }
                  >
                    <Text style={styles.addBtnText}>Ürüne Git</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => toggleFavorite(item.id)}
                  >
                    <Text style={styles.removeBtnText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
          <View style={{ height: 40 }} />
        </ScrollView>
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
  title: { fontSize: 17, fontWeight: "700", color: Colors.text },
  center: {
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
  content: { paddingHorizontal: 24 },
  count: { fontSize: 12, color: Colors.text2, marginBottom: 16 },
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
  cardImg: { width: 90, height: 90, borderRadius: 12 },
  cardImgPlaceholder: {
    backgroundColor: "#1a1a2e",
    alignItems: "center",
    justifyContent: "center",
  },
  cardInfo: { flex: 1 },
  cardCategory: {
    fontSize: 10,
    color: Colors.accent,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  cardName: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 6,
    lineHeight: 18,
  },
  cardPrice: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.accent,
    marginBottom: 8,
  },
  cardBtns: { flexDirection: "row", gap: 8, alignItems: "center" },
  addBtn: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  addBtnText: { fontSize: 12, fontWeight: "600", color: "#fff" },
  removeBtn: { padding: 6 },
  removeBtnText: { fontSize: 16 },
});
