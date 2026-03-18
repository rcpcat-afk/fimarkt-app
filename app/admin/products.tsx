import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BACKEND_URL, Colors } from "../../constants";
import { useAuth } from "../../src/store/AuthContext";

const STORES = ["sanatkat", "fimarkt", "fidrop"];

export default function AdminProductsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStore, setActiveStore] = useState("fimarkt");

  useEffect(() => {
    fetchProducts();
  }, [activeStore]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/products?store=${activeStore}&page=1&per_page=50`,
      );
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (e) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/admin/products/${id}?store=${activeStore}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${user?.token}` },
        },
      );
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (e) {}
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ürün Yönetimi</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() =>
            router.push({
              pathname: "/admin/product-edit",
              params: { store: activeStore },
            } as any)
          }
        >
          <Text style={styles.addBtnText}>+ Ekle</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.storeRow}>
        {STORES.map((s) => (
          <TouchableOpacity
            key={s}
            style={[
              styles.storeBtn,
              activeStore === s && styles.storeBtnActive,
            ]}
            onPress={() => setActiveStore(s)}
          >
            <Text
              style={[
                styles.storeBtnText,
                activeStore === s && styles.storeBtnTextActive,
              ]}
            >
              {s}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.accent} size="large" />
        </View>
      ) : products.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Ürün bulunamadı</Text>
        </View>
      ) : (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {products.map((product) => (
            <View key={product.id} style={styles.card}>
              <View style={styles.cardMain}>
                <View style={styles.cardInfo}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <Text style={styles.productPrice}>
                    {parseFloat(product.price || "0").toLocaleString("tr-TR")} ₺
                  </Text>
                  <View
                    style={[
                      styles.stockBadge,
                      {
                        backgroundColor:
                          product.stock_status === "instock"
                            ? Colors.green + "22"
                            : Colors.red + "22",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.stockText,
                        {
                          color:
                            product.stock_status === "instock"
                              ? Colors.green
                              : Colors.red,
                        },
                      ]}
                    >
                      {product.stock_status === "instock"
                        ? "Stokta"
                        : "Stok Yok"}
                    </Text>
                  </View>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() =>
                      router.push({
                        pathname: "/admin/product-edit",
                        params: { store: activeStore, productId: product.id },
                      } as any)
                    }
                  >
                    <Text style={styles.editBtnText}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(product.id)}
                  >
                    <Text style={styles.deleteBtnText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
          <View style={{ height: 32 }} />
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
  headerTitle: { fontSize: 20, fontWeight: "700", color: Colors.text, flex: 1 },
  addBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  addBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  storeRow: { flexDirection: "row", gap: 8, padding: 16 },
  storeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  storeBtnActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  storeBtnText: { fontSize: 12, color: Colors.text2, fontWeight: "600" },
  storeBtnTextActive: { color: "#fff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { color: Colors.text2, fontSize: 15 },
  scroll: { flex: 1, paddingHorizontal: 16 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 10,
  },
  cardMain: { flexDirection: "row", justifyContent: "space-between" },
  cardInfo: { flex: 1, marginRight: 12 },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.accent,
    marginBottom: 6,
  },
  stockBadge: {
    alignSelf: "flex-start",
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  stockText: { fontSize: 11, fontWeight: "600" },
  cardActions: { gap: 8 },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  editBtnText: { fontSize: 16 },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.red + "22",
    borderWidth: 1,
    borderColor: Colors.red + "44",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtnText: { fontSize: 16 },
});
