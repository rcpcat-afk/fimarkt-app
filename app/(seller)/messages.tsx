// ─── Satıcı Mesaj Merkezi — App Lite ─────────────────────────────────────────
// selectedId === null → Konuşma listesi
// selectedId !== null → Tam ekran sohbet thread'i (← Geri ile listeye dön)
// Context Card + Quick Replies ⚡ mobilde de çalışır
// useTheme() — dark/light uyumlu
import { useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../hooks/useTheme";
import {
  MOCK_CONVERSATIONS,
  QUICK_REPLIES,
  type ChatMessage,
  type Conversation,
} from "../../lib/mock-data/partner-messages";

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("tr-TR", { day: "2-digit", month: "short" });

const uid = () => Math.random().toString(36).slice(2, 8);

// ─── Context Card ─────────────────────────────────────────────────────────────
function ContextCard({ conv, colors }: {
  conv:   Conversation;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  if (conv.type === "order_issue" && conv.orderContext) {
    const o = conv.orderContext;
    return (
      <View style={{
        flexDirection: "row", alignItems: "center", gap: 10,
        paddingHorizontal: 14, paddingVertical: 10,
        backgroundColor: "rgba(59,130,246,0.06)",
        borderBottomWidth: 1, borderBottomColor: "rgba(59,130,246,0.15)",
      }}>
        <Text style={{ fontSize: 22 }}>📦</Text>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={{ fontSize: 11, fontWeight: "900", color: colors.foreground, fontFamily: "monospace" }}>{o.orderNo}</Text>
            <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 99, backgroundColor: "rgba(59,130,246,0.15)" }}>
              <Text style={{ fontSize: 9, fontWeight: "800", color: "#3b82f6" }}>🔵 {o.status}</Text>
            </View>
            {conv.isUrgent && (
              <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 99, backgroundColor: "rgba(239,68,68,0.15)" }}>
                <Text style={{ fontSize: 9, fontWeight: "800", color: "#ef4444" }}>🚨 Acil</Text>
              </View>
            )}
          </View>
          <Text style={{ fontSize: 10, color: colors.mutedForeground, marginTop: 2 }} numberOfLines={1}>{o.product}</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ fontSize: 12, fontWeight: "900", color: colors.foreground, fontFamily: "monospace" }}>
            {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(o.amount)}
          </Text>
          {o.cargoNo && <Text style={{ fontSize: 9, color: colors.subtleForeground, fontFamily: "monospace" }}>{o.cargoNo}</Text>}
        </View>
      </View>
    );
  }

  if (conv.type === "product_question" && conv.productContext) {
    const p = conv.productContext;
    return (
      <View style={{
        flexDirection: "row", alignItems: "center", gap: 10,
        paddingHorizontal: 14, paddingVertical: 10,
        backgroundColor: "rgba(139,92,246,0.06)",
        borderBottomWidth: 1, borderBottomColor: "rgba(139,92,246,0.15)",
      }}>
        <View style={{ width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: p.bgColor }}>
          <Text style={{ fontSize: 18 }}>{p.imageEmoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 12, fontWeight: "700", color: colors.foreground }} numberOfLines={1}>{p.name}</Text>
          <Text style={{ fontSize: 10, color: colors.subtleForeground, fontFamily: "monospace" }}>{p.sku}</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ fontSize: 13, fontWeight: "900", color: colors.foreground, fontFamily: "monospace" }}>
            {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(p.price)}
          </Text>
          <Text style={{ fontSize: 9, color: colors.mutedForeground }}>{p.stock !== null ? `${p.stock} stok` : "∞ dijital"}</Text>
        </View>
      </View>
    );
  }
  return null;
}

// ─── Ana Ekran ─────────────────────────────────────────────────────────────────
export default function SellerMessagesScreen() {
  const router     = useRouter();
  const insets     = useSafeAreaInsets();
  const { colors } = useTheme();

  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [selectedId,    setSelectedId]    = useState<string | null>(null);
  const [inputText,     setInputText]     = useState("");
  const [showQuick,     setShowQuick]     = useState(false);
  const [publicQA,      setPublicQA]      = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const activeConv = conversations.find(c => c.id === selectedId) ?? null;
  const totalUnread = conversations.reduce((s, c) => s + c.unreadCount, 0);

  const styles = useMemo(() => StyleSheet.create({
    container:    { flex: 1, backgroundColor: colors.background },
    header:       { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 12 },
    backBtn:      { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
    backArrow:    { fontSize: 22, color: colors.foreground, lineHeight: 28, marginTop: -2 },
    headerTitle:  { fontSize: 16, fontWeight: "900", color: colors.foreground, flex: 1 },
  }), [colors]);

  const openConv = (id: string) => {
    setSelectedId(id);
    setShowQuick(false);
    setPublicQA(false);
    setConversations(prev => prev.map(c =>
      c.id === id ? { ...c, unreadCount: 0, messages: c.messages.map(m => ({ ...m, read: true })) } : c
    ));
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const sendMessage = () => {
    const text = inputText.trim();
    if (!text || !selectedId) return;
    const msg: ChatMessage = {
      id: uid(), sender: "seller", text, read: true,
      timestamp: new Date().toISOString(),
    };
    setConversations(prev => prev.map(c =>
      c.id === selectedId
        ? { ...c, messages: [...c.messages, msg], lastMessage: text, lastMessageTime: msg.timestamp }
        : c
    ));
    setInputText("");
    setShowQuick(false);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  // ── Konuşma Listesi ────────────────────────────────────────────────────────
  if (!selectedId) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mesajlar</Text>
          {totalUnread > 0 && (
            <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, backgroundColor: "#ef4444" }}>
              <Text style={{ fontSize: 11, fontWeight: "900", color: "#fff" }}>{totalUnread} yeni</Text>
            </View>
          )}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
          {conversations.map(conv => (
            <TouchableOpacity
              key={conv.id}
              onPress={() => openConv(conv.id)}
              activeOpacity={0.7}
              style={{
                flexDirection: "row", alignItems: "center", gap: 12,
                paddingHorizontal: 16, paddingVertical: 14,
                borderBottomWidth: 1, borderBottomColor: colors.border,
                backgroundColor: conv.unreadCount > 0 ? colors.surface2 : colors.background,
              }}
            >
              {/* Avatar */}
              <View style={{ position: "relative" }}>
                <View style={{
                  width: 44, height: 44, borderRadius: 22,
                  backgroundColor: conv.isUrgent ? "rgba(239,68,68,0.15)" : "rgba(255,107,43,0.15)",
                  alignItems: "center", justifyContent: "center",
                }}>
                  <Text style={{ fontSize: 14, fontWeight: "900", color: conv.isUrgent ? "#ef4444" : "#ff6b2b" }}>
                    {conv.customer.initials}
                  </Text>
                </View>
                {conv.unreadCount > 0 && (
                  <View style={{
                    position: "absolute", top: -2, right: -2,
                    width: 18, height: 18, borderRadius: 9,
                    backgroundColor: "#ef4444", alignItems: "center", justifyContent: "center",
                  }}>
                    <Text style={{ fontSize: 9, fontWeight: "900", color: "#fff" }}>{conv.unreadCount}</Text>
                  </View>
                )}
              </View>

              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                  <Text style={{ fontSize: 14, fontWeight: conv.unreadCount > 0 ? "800" : "600", color: colors.foreground }}>
                    {conv.customer.name}
                  </Text>
                  <Text style={{ fontSize: 10, color: colors.mutedForeground }}>{fmtDate(conv.lastMessageTime)}</Text>
                </View>
                <Text style={{ fontSize: 12, fontWeight: "600", color: colors.mutedForeground }} numberOfLines={1}>{conv.subject}</Text>
                <Text style={{ fontSize: 11, color: colors.subtleForeground, marginTop: 1 }} numberOfLines={1}>{conv.lastMessage}</Text>
              </View>

              {/* Tip rozeti */}
              <View style={{ alignItems: "center", gap: 4 }}>
                {conv.isUrgent && (
                  <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: "rgba(239,68,68,0.12)" }}>
                    <Text style={{ fontSize: 8, fontWeight: "800", color: "#ef4444" }}>ACİL</Text>
                  </View>
                )}
                <Text style={{ fontSize: 16, color: colors.subtleForeground }}>›</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  // ── Sohbet Thread ──────────────────────────────────────────────────────────
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>

        {/* Thread Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setSelectedId(null)}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <View style={{
            width: 32, height: 32, borderRadius: 16, flexShrink: 0,
            backgroundColor: activeConv.isUrgent ? "rgba(239,68,68,0.15)" : "rgba(255,107,43,0.15)",
            alignItems: "center", justifyContent: "center",
          }}>
            <Text style={{ fontSize: 11, fontWeight: "900", color: activeConv.isUrgent ? "#ef4444" : "#ff6b2b" }}>
              {activeConv.customer.initials}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: "800", color: colors.foreground }}>{activeConv.customer.name}</Text>
            <Text style={{ fontSize: 10, color: colors.mutedForeground }} numberOfLines={1}>{activeConv.subject}</Text>
          </View>
          {activeConv.isUrgent && (
            <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: "rgba(239,68,68,0.12)" }}>
              <Text style={{ fontSize: 9, fontWeight: "900", color: "#ef4444" }}>🚨 ACİL</Text>
            </View>
          )}
        </View>

        {/* Context Card */}
        <ContextCard conv={activeConv} colors={colors} />

        {/* Mesajlar */}
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1, backgroundColor: colors.background }}
          contentContainerStyle={{ padding: 14 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {activeConv.messages.map(msg => {
            const isSeller = msg.sender === "seller";
            return (
              <View key={msg.id} style={{ flexDirection: "row", justifyContent: isSeller ? "flex-end" : "flex-start", marginBottom: 8 }}>
                <View style={{
                  maxWidth: "78%",
                  paddingHorizontal: 14, paddingVertical: 10,
                  borderRadius: 18,
                  borderBottomRightRadius: isSeller ? 4 : 18,
                  borderBottomLeftRadius: isSeller ? 18 : 4,
                  backgroundColor: isSeller ? "#ff6b2b" : colors.surface2,
                  borderWidth: isSeller ? 0 : 1,
                  borderColor: colors.border,
                }}>
                  <Text style={{ fontSize: 13, color: isSeller ? "#fff" : colors.foreground, lineHeight: 20 }}>
                    {msg.text}
                  </Text>
                  <Text style={{ fontSize: 9, color: isSeller ? "rgba(255,255,255,0.6)" : colors.subtleForeground, marginTop: 4, textAlign: isSeller ? "right" : "left" }}>
                    {fmtTime(msg.timestamp)}{isSeller ? " ✓✓" : ""}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Quick Replies */}
        {showQuick && (
          <View style={{ backgroundColor: colors.surface2, borderTopWidth: 1, borderTopColor: colors.border }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border }}>
              <Text style={{ fontSize: 10, fontWeight: "800", color: colors.subtleForeground, textTransform: "uppercase", letterSpacing: 0.5 }}>⚡ Hızlı Yanıtlar</Text>
              <TouchableOpacity onPress={() => setShowQuick(false)}>
                <Text style={{ fontSize: 16, color: colors.mutedForeground }}>✕</Text>
              </TouchableOpacity>
            </View>
            {QUICK_REPLIES.map((reply, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => { setInputText(reply); setShowQuick(false); }}
                style={{ paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: i < QUICK_REPLIES.length - 1 ? 1 : 0, borderBottomColor: colors.border }}
              >
                <Text style={{ fontSize: 13, color: colors.foreground }}>{reply}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Public Q&A Toggle */}
        {activeConv.type === "product_question" && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colors.surface2, borderTopWidth: 1, borderTopColor: colors.border }}>
            <TouchableOpacity
              onPress={() => setPublicQA(p => !p)}
              style={{
                width: 36, height: 20, borderRadius: 10,
                backgroundColor: publicQA ? "#ff6b2b" : colors.border,
                justifyContent: "center",
              }}
            >
              <View style={{
                width: 16, height: 16, borderRadius: 8, backgroundColor: "#fff",
                marginLeft: publicQA ? 18 : 2,
                shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 2, elevation: 2,
              }} />
            </TouchableOpacity>
            <Text style={{ fontSize: 11, color: colors.mutedForeground, flex: 1 }} numberOfLines={2}>
              Bu cevabı ürün sayfasında <Text style={{ fontWeight: "800", color: colors.foreground }}>Herkese Açık SSS</Text> olarak yayınla
            </Text>
          </View>
        )}

        {/* Input */}
        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8, paddingHorizontal: 12, paddingVertical: 10, paddingBottom: insets.bottom + 10, backgroundColor: colors.surface2, borderTopWidth: 1, borderTopColor: colors.border }}>
          <TouchableOpacity
            onPress={() => setShowQuick(p => !p)}
            style={{
              width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center",
              backgroundColor: showQuick ? "#ff6b2b" : colors.surface,
              borderWidth: 1, borderColor: showQuick ? "#ff6b2b" : colors.border,
            }}
          >
            <Text style={{ fontSize: 16 }}>⚡</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => Alert.alert("Mock", "Dosya/fotoğraf yükleme API entegrasyonunda aktif olacak.")}
            style={{ width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
          >
            <Text style={{ fontSize: 16 }}>📎</Text>
          </TouchableOpacity>

          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Mesaj yaz…"
            placeholderTextColor={colors.subtleForeground}
            multiline
            style={{
              flex: 1, maxHeight: 80, paddingHorizontal: 14, paddingVertical: 10,
              borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1,
              borderColor: colors.border, fontSize: 13, color: colors.foreground,
            }}
          />

          <TouchableOpacity
            onPress={sendMessage}
            disabled={!inputText.trim()}
            style={{
              width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center",
              backgroundColor: inputText.trim() ? "#ff6b2b" : colors.border,
            }}
          >
            <Text style={{ fontSize: 16, color: "#fff" }}>→</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
