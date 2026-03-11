import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BACKEND_URL, Colors } from "../../constants";
import { useAuth } from "../../src/store/AuthContext";

export default function ProductEditScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { store, productId } = useLocalSearchParams<{
    store: string;
    productId?: string;
  }>();

  const isEdit = !!productId;
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [regularPrice, setRegularPrice] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [stockStatus, setStockStatus] = useState<"instock" | "outofstock">(
    "instock",
  );
  const [status, setStatus] = useState<"publish" | "draft">("publish");

  useEffect(() => {
    if (isEdit) fetchProduct();
  }, []);

  const fetchProduct = async () => {
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/products/${productId}?store=${store}`,
      );
      const data = await res.json();
      setName(data.name || "");
      setPrice(data.price || "");
      setRegularPrice(data.regular_price || "");
      setDescription(data.description?.replace(/<[^>]*>/g, "") || "");
      setShortDescription(
        data.short_description?.replace(/<[^>]*>/g, "") || "",
      );
      setStockStatus(data.stock_status || "instock");
      setStatus(data.status || "publish");
    } catch (e) {
      Alert.alert("Hata", "Ürün bilgisi alınamadı");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Hata", "Ürün adı zorunludur");
      return;
    }
    setSaving(true);
    try {
      const body = {
        name,
        price,
        regular_price: regularPrice || price,
        description,
        short_description: shortDescription,
        stock_status: stockStatus,
        status,
      };

      const url = isEdit
        ? `${BACKEND_URL}/api/admin/products/${productId}?store=${store}`
        : `${BACKEND_URL}/api/admin/products?store=${store}`;

      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${user?.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        Alert.alert("Başarılı", isEdit ? "Ürün güncellendi" : "Ürün eklendi", [
          { text: "Tamam", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert("Hata", "İşlem başarısız");
      }
    } catch (e) {
      Alert.alert("Hata", "Bağlantı hatası");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top,
            alignItems: "center",
            justifyContent: "center",
          },
        ]}
      >
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEdit ? "Ürün Düzenle" : "Yeni Ürün"}
        </Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.field}>
          <Text style={styles.label}>Ürün Adı *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Ürün adını gir"
            placeholderTextColor={Colors.text3}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Fiyat (₺)</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              placeholder="0.00"
              placeholderTextColor={Colors.text3}
              keyboardType="decimal-pad"
            />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Normal Fiyat (₺)</Text>
            <TextInput
              style={styles.input}
              value={regularPrice}
              onChangeText={setRegularPrice}
              placeholder="0.00"
              placeholderTextColor={Colors.text3}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Kısa Açıklama</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={shortDescription}
            onChangeText={setShortDescription}
            placeholder="Kısa açıklama..."
            placeholderTextColor={Colors.text3}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Açıklama</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Ürün açıklaması..."
            placeholderTextColor={Colors.text3}
            multiline
            numberOfLines={5}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Stok Durumu</Text>
          <View style={styles.toggleRow}>
            {(["instock", "outofstock"] as const).map((s) => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.toggleBtn,
                  stockStatus === s && styles.toggleBtnActive,
                ]}
                onPress={() => setStockStatus(s)}
              >
                <Text
                  style={[
                    styles.toggleText,
                    stockStatus === s && styles.toggleTextActive,
                  ]}
                >
                  {s === "instock" ? "Stokta" : "Stok Yok"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Yayın Durumu</Text>
          <View style={styles.toggleRow}>
            {(["publish", "draft"] as const).map((s) => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.toggleBtn,
                  status === s && styles.toggleBtnActive,
                ]}
                onPress={() => setStatus(s)}
              >
                <Text
                  style={[
                    styles.toggleText,
                    status === s && styles.toggleTextActive,
                  ]}
                >
                  {s === "publish" ? "Yayında" : "Taslak"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>
              {isEdit ? "Güncelle" : "Ürün Ekle"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
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
  headerTitle: { fontSize: 20, fontWeight: "700", color: Colors.text },
  scroll: { flex: 1, padding: 16 },
  field: { marginBottom: 16 },
  row: { flexDirection: "row", gap: 12 },
  label: {
    fontSize: 13,
    color: Colors.text2,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: Colors.text,
    fontSize: 14,
  },
  textArea: { minHeight: 80, textAlignVertical: "top" },
  toggleRow: { flexDirection: "row", gap: 10 },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  toggleBtnActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  toggleText: { fontSize: 13, color: Colors.text2, fontWeight: "600" },
  toggleTextActive: { color: "#fff" },
  footer: {
    padding: 16,
    backgroundColor: Colors.bg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  saveBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
