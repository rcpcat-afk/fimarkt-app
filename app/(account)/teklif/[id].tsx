// ─── Teklif Sohbet Ekranı (App) ────────────────────────────────────────────────
// B2B İletişim & Pazarlık Masası — Müşteri ↔ Mühendis güvenli sohbet.
// KeyboardAvoidingView + inverted FlatList · OfferCard → CartContext entegrasyonu

import React, { useState, useRef, useMemo } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, TextInput,
  KeyboardAvoidingView, Platform, StyleSheet, StatusBar,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { type ThemeColors } from "../../../constants/theme";
import { useTheme } from "../../../hooks/useTheme";
import { useCart } from "../../../src/store/CartContext";

// ── Tipler ────────────────────────────────────────────────────────────────────
type MsgType = "user" | "engineer" | "system" | "offer";

interface Attachment { name: string; size: string; type: "file" | "image"; }

interface Offer {
  id:           string;
  price:        number;
  deliveryDays: number;
  note:         string;
  status:       "pending" | "accepted" | "rejected";
}

interface Message {
  id:          string;
  type:        MsgType;
  content?:    string;
  timestamp:   string;
  attachment?: Attachment;
  offer?:      Offer;
}

// ── Mock veri ─────────────────────────────────────────────────────────────────
const PROJECT = {
  title:    "Kırık Dişli Mili — Yedek Parça",
  category: "Endüstriyel",
  engineer: { name: "Ali Yılmaz", title: "Makine Müh.", rating: 4.9, avatar: "AY" },
};

const MOCK_MESSAGES: Message[] = [
  {
    id: "m1", type: "user", timestamp: "09:14",
    content: "Merhaba, fabrikamızdaki konveyör bandına ait dişli milim kırıldı. Tersine mühendislikle 3D modellenmesine ihtiyacım var.",
    attachment: { name: "disli_mil_referans.jpg", size: "2.4 MB", type: "image" },
  },
  {
    id: "sys1", type: "system", timestamp: "09:14",
    content: "Bu konuşma Fimarkt Escrow Güvencesi kapsamındadır. Ödeme her iki taraf onaylayana kadar Fimarkt Havuzunda bekletilir. %0 komisyon.",
  },
  {
    id: "m2", type: "engineer", timestamp: "09:31",
    content: "Merhaba! Fotoğrafları inceledim. Özel toleranslı görünüyor — ölçüm sketsimi ekte attım. Kritik boyutları doğrulayabilir misiniz?",
    attachment: { name: "disli_skeci_v1.pdf", size: "1.1 MB", type: "file" },
  },
  {
    id: "m3", type: "offer", timestamp: "09:45",
    offer: {
      id: "offer-001", price: 500, deliveryDays: 14,
      note: "CATIA V5'te tam parametrik model, tolerans analizi raporu ve STEP dosyası teslim edilecektir.",
      status: "pending",
    },
  },
];

// ── SystemMessage ─────────────────────────────────────────────────────────────
function SystemMessage({ msg }: { msg: Message }) {
  const { colors: C } = useTheme();
  const s = useMemo(() => createStyles(C), [C]);
  return (
    <View style={s.sysWrap}>
      <View style={[s.sysCard, { backgroundColor: C.surface, borderColor: C.border }]}>
        <Text style={s.sysIcon}>🛡️</Text>
        <View style={s.sysBody}>
          <Text style={[s.sysTitle, { color: C.foreground }]}>Fimarkt Escrow Güvencesi</Text>
          <Text style={[s.sysSub, { color: C.mutedForeground }]}>{msg.content}</Text>
        </View>
      </View>
    </View>
  );
}

// ── AttachmentChip ────────────────────────────────────────────────────────────
function AttachmentChip({ att, isUser }: { att: Attachment; isUser: boolean }) {
  const { colors: C } = useTheme();
  const s = useMemo(() => createStyles(C), [C]);
  return (
    <View style={[
      s.attachChip,
      { backgroundColor: isUser ? C.surface2 : "#0ea5e915", borderColor: isUser ? C.border : "#0ea5e930" },
    ]}>
      <View style={[s.attachIcon, { backgroundColor: C.accent + "18" }]}>
        <Text style={{ fontSize: 14 }}>{att.type === "image" ? "🖼️" : "📄"}</Text>
      </View>
      <View style={s.attachInfo}>
        <Text style={[s.attachName, { color: C.foreground }]} numberOfLines={1}>{att.name}</Text>
        <Text style={[s.attachSize, { color: C.mutedForeground }]}>{att.size}</Text>
      </View>
      <Text style={[s.attachDown, { color: C.accent }]}>↓</Text>
    </View>
  );
}

// ── MessageBubble ─────────────────────────────────────────────────────────────
function MessageBubble({ msg }: { msg: Message }) {
  const { colors: C } = useTheme();
  const s = useMemo(() => createStyles(C), [C]);
  const isUser = msg.type === "user";
  return (
    <View style={[s.bubbleRow, isUser ? s.bubbleRowUser : s.bubbleRowEngineer]}>
      {!isUser && (
        <View style={[s.avatar, { backgroundColor: "#0ea5e920", borderColor: "#0ea5e930" }]}>
          <Text style={[s.avatarText, { color: "#0ea5e9" }]}>{PROJECT.engineer.avatar}</Text>
        </View>
      )}
      <View style={[s.bubbleCol, isUser ? s.bubbleColUser : s.bubbleColEngineer]}>
        {msg.content && (
          <View style={[
            s.bubble,
            isUser
              ? { backgroundColor: C.surface2, borderColor: C.border }
              : { backgroundColor: "#0ea5e910", borderColor: "#0ea5e925" },
          ]}>
            <Text style={[s.bubbleText, { color: C.foreground }]}>{msg.content}</Text>
          </View>
        )}
        {msg.attachment && <AttachmentChip att={msg.attachment} isUser={isUser} />}
        <Text style={[s.timestamp, { color: C.mutedForeground }, isUser ? s.tsRight : s.tsLeft]}>
          {msg.timestamp}
        </Text>
      </View>
    </View>
  );
}

// ── OfferCard ─────────────────────────────────────────────────────────────────
function OfferCard({ offer, onAccept, onReject }: {
  offer: Offer;
  onAccept: () => void;
  onReject: () => void;
}) {
  const { colors: C } = useTheme();
  const s = useMemo(() => createStyles(C), [C]);
  const [status, setStatus] = useState<Offer["status"]>(offer.status);

  if (status === "accepted") {
    return (
      <View style={s.offerWrap}>
        <View style={[s.offerAccepted, { backgroundColor: "#10b98114", borderColor: "#10b98133" }]}>
          <Text style={{ fontSize: 28, marginBottom: 8 }}>✅</Text>
          <Text style={[s.offerAcceptedTitle, { color: "#10b981" }]}>Teklif Kabul Edildi!</Text>
          <Text style={[s.offerAcceptedSub, { color: C.mutedForeground }]}>Sepete eklendi, yönlendiriliyorsunuz...</Text>
        </View>
      </View>
    );
  }

  if (status === "rejected") {
    return (
      <View style={s.offerWrap}>
        <View style={[s.offerRejected, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Text style={[s.offerRejectedText, { color: C.mutedForeground }]}>Teklif Reddedildi</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={s.offerWrap}>
      <View style={[s.offerCard, { backgroundColor: C.surface, borderColor: C.accent + "40" }]}>
        {/* Kart başlığı */}
        <View style={[s.offerHeader, { backgroundColor: C.accent + "12", borderBottomColor: C.accent + "25" }]}>
          <Text style={{ fontSize: 14 }}>📋</Text>
          <Text style={[s.offerHeaderTitle, { color: C.accent }]}>PROJE TEKLİFİ</Text>
          <View style={[s.offerEngineerBadge, { backgroundColor: C.accent + "18", borderColor: C.accent + "30" }]}>
            <Text style={[s.offerEngineerText, { color: C.accent }]}>Ali Yılmaz</Text>
          </View>
        </View>

        <View style={s.offerBody}>
          {/* Fiyat */}
          <View style={s.offerPriceRow}>
            <Text style={[s.offerPrice, { color: C.foreground }]}>₺{offer.price.toLocaleString("tr-TR")}</Text>
            <Text style={[s.offerPriceSub, { color: C.mutedForeground }]}>sabit fiyat</Text>
          </View>

          {/* Detay grid */}
          <View style={s.offerGrid}>
            <View style={[s.offerGridItem, { backgroundColor: C.background, borderColor: C.border }]}>
              <Text style={[s.offerGridLabel, { color: C.mutedForeground }]}>TESLİM</Text>
              <Text style={[s.offerGridValue, { color: C.foreground }]}>{offer.deliveryDays} İş Günü</Text>
            </View>
            <View style={[s.offerGridItem, { backgroundColor: C.background, borderColor: C.border }]}>
              <Text style={[s.offerGridLabel, { color: C.mutedForeground }]}>ÖDEME</Text>
              <Text style={[s.offerGridValue, { color: C.foreground }]}>Escrow</Text>
            </View>
          </View>

          {/* Not */}
          <View style={[s.offerNote, { borderLeftColor: C.accent + "50" }]}>
            <Text style={[s.offerNoteText, { color: C.mutedForeground }]}>{offer.note}</Text>
          </View>

          {/* Escrow rozet */}
          <View style={s.escrowRow}>
            <Text style={{ fontSize: 12 }}>🛡️</Text>
            <Text style={[s.escrowText, { color: C.mutedForeground }]}>Ödeme tamamlanana kadar Fimarkt Havuzunda güvende</Text>
          </View>

          {/* CTA butonları */}
          <View style={s.offerBtns}>
            <TouchableOpacity
              style={[s.rejectBtn, { borderColor: C.border }]}
              onPress={() => {
                Alert.alert("Teklifi Reddet", "Bu teklifi reddetmek istiyor musunuz?", [
                  { text: "İptal", style: "cancel" },
                  { text: "Reddet", style: "destructive", onPress: () => { setStatus("rejected"); onReject(); } },
                ]);
              }}
              activeOpacity={0.8}
            >
              <Text style={[s.rejectBtnText, { color: C.mutedForeground }]}>❌ Reddet</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.acceptBtn, { backgroundColor: C.accent }]}
              onPress={() => { setStatus("accepted"); onAccept(); }}
              activeOpacity={0.88}
            >
              <Text style={s.acceptBtnText}>✅ Kabul Et</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

// ── Ana Ekran ─────────────────────────────────────────────────────────────────
export default function TeklifChatScreen() {
  const { colors: C, isDark } = useTheme();
  const s = useMemo(() => createStyles(C), [C]);

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addItem } = useCart();
  const [inputText, setInputText] = useState("");

  const handleAccept = () => {
    addItem({
      id:        Date.now(),
      name:      `Özel Tasarım — ${PROJECT.title}`,
      price:     500,
      storeName: PROJECT.engineer.name,
      type:      "custom_design",
      isDigital: true,
      meta: {
        type:         "custom_design",
        engineerName: PROJECT.engineer.name,
        projectTitle: PROJECT.title,
        deliveryDays: 14,
        offerId:      "offer-001",
      },
    });
    setTimeout(() => router.push("/(account)/cart" as never), 1200);
  };

  return (
    <KeyboardAvoidingView
      style={[s.root, { backgroundColor: C.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* ── Header ──────────────────────────────────────────────────── */}
      <View style={[s.header, { paddingTop: insets.top + 8, borderBottomColor: C.border, backgroundColor: C.surface }]}>
        <TouchableOpacity style={[s.backBtn, { backgroundColor: C.surface2, borderColor: C.border }]} onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={18} color={C.foreground} />
        </TouchableOpacity>

        <View style={[s.engAvatar, { backgroundColor: "#0ea5e920", borderColor: "#0ea5e935" }]}>
          <Text style={[s.engAvatarText, { color: "#0ea5e9" }]}>{PROJECT.engineer.avatar}</Text>
        </View>

        <View style={s.headerInfo}>
          <View style={s.headerRow}>
            <Text style={[s.headerName, { color: C.foreground }]}>{PROJECT.engineer.name}</Text>
            <View style={[s.onlineDot, { backgroundColor: "#10b981" }]} />
          </View>
          <Text style={[s.headerSub, { color: C.mutedForeground }]} numberOfLines={1}>
            {PROJECT.engineer.title} · ⭐ {PROJECT.engineer.rating}
          </Text>
        </View>

        <View style={[s.projectBadge, { backgroundColor: C.accent + "15", borderColor: C.accent + "30" }]}>
          <Text style={[s.projectBadgeText, { color: C.accent }]} numberOfLines={1}>Aktif Proje</Text>
        </View>
      </View>

      {/* ── Mesaj listesi ────────────────────────────────────────────── */}
      <ScrollView
        style={s.scroll}
        contentContainerStyle={[s.scrollContent, { paddingBottom: 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {MOCK_MESSAGES.map((msg, i) => (
          <Animated.View key={msg.id} entering={FadeInDown.delay(i * 80).duration(350)}>
            {msg.type === "system" && <SystemMessage msg={msg} />}
            {(msg.type === "user" || msg.type === "engineer") && <MessageBubble msg={msg} />}
            {msg.type === "offer" && (
              <OfferCard offer={msg.offer!} onAccept={handleAccept} onReject={() => {}} />
            )}
          </Animated.View>
        ))}
      </ScrollView>

      {/* ── Input bar ────────────────────────────────────────────────── */}
      <View style={[s.inputBar, { borderTopColor: C.border, backgroundColor: C.surface, paddingBottom: insets.bottom + 8 }]}>
        <TouchableOpacity style={[s.attachBtn, { backgroundColor: C.surface2, borderColor: C.border }]} activeOpacity={0.7}>
          <Ionicons name="attach" size={20} color={C.mutedForeground} />
        </TouchableOpacity>

        <TextInput
          style={[s.textInput, { backgroundColor: C.background, borderColor: C.border, color: C.foreground }]}
          placeholder="Mesajınızı yazın..."
          placeholderTextColor={C.mutedForeground}
          value={inputText}
          onChangeText={setInputText}
          multiline
        />

        <TouchableOpacity
          style={[s.sendBtn, { backgroundColor: inputText.trim() ? C.accent : C.surface2, borderColor: inputText.trim() ? C.accent : C.border }]}
          activeOpacity={0.85}
        >
          <Ionicons name="send" size={16} color={inputText.trim() ? "#fff" : C.mutedForeground} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// ── Stiller ───────────────────────────────────────────────────────────────────
function createStyles(C: ThemeColors) { return StyleSheet.create({
  root:   { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: 14, gap: 8 },

  // Header
  header:      { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingBottom: 10, borderBottomWidth: 1 },
  backBtn:     { width: 34, height: 34, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  engAvatar:   { width: 36, height: 36, borderRadius: 18, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  engAvatarText: { fontSize: 11, fontWeight: "900" },
  headerInfo:  { flex: 1 },
  headerRow:   { flexDirection: "row", alignItems: "center", gap: 6 },
  headerName:  { fontSize: 13, fontWeight: "800" },
  onlineDot:   { width: 6, height: 6, borderRadius: 3 },
  headerSub:   { fontSize: 10, marginTop: 1 },
  projectBadge:{ paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderRadius: 20 },
  projectBadgeText: { fontSize: 9, fontWeight: "800" },

  // System message
  sysWrap:  { alignItems: "center", marginVertical: 4 },
  sysCard:  { flexDirection: "row", gap: 10, borderWidth: 1, borderRadius: 16, padding: 12, maxWidth: 300, alignItems: "flex-start" },
  sysIcon:  { fontSize: 16, marginTop: 1 },
  sysBody:  { flex: 1 },
  sysTitle: { fontSize: 10, fontWeight: "800", marginBottom: 3 },
  sysSub:   { fontSize: 10, lineHeight: 14 },

  // Message bubbles
  bubbleRow:         { flexDirection: "row", gap: 8, marginVertical: 3 },
  bubbleRowUser:     { justifyContent: "flex-end" },
  bubbleRowEngineer: { justifyContent: "flex-start" },
  bubbleCol:         { maxWidth: "75%", gap: 4 },
  bubbleColUser:     { alignItems: "flex-end" },
  bubbleColEngineer: { alignItems: "flex-start" },
  avatar:     { width: 28, height: 28, borderRadius: 14, borderWidth: 1, alignItems: "center", justifyContent: "center", marginTop: 4 },
  avatarText: { fontSize: 9, fontWeight: "900" },
  bubble:     { borderWidth: 1, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleText: { fontSize: 13, lineHeight: 19 },
  timestamp:  { fontSize: 9 },
  tsRight:    { textAlign: "right" },
  tsLeft:     { textAlign: "left" },

  // Attachment
  attachChip: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderRadius: 12, padding: 10, marginTop: 4 },
  attachIcon: { width: 34, height: 34, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  attachInfo: { flex: 1 },
  attachName: { fontSize: 11, fontWeight: "600" },
  attachSize: { fontSize: 9, marginTop: 1 },
  attachDown: { fontSize: 14, fontWeight: "700" },

  // Offer card
  offerWrap:    { alignItems: "center", marginVertical: 8 },
  offerCard:    { width: "100%", maxWidth: 340, borderWidth: 1.5, borderRadius: 20, overflow: "hidden" },
  offerHeader:  { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  offerHeaderTitle: { fontSize: 10, fontWeight: "900", letterSpacing: 0.8, flex: 1 },
  offerEngineerBadge: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  offerEngineerText:  { fontSize: 9, fontWeight: "800" },
  offerBody:    { padding: 16, gap: 12 },
  offerPriceRow:{ flexDirection: "row", alignItems: "flex-end", gap: 6 },
  offerPrice:   { fontSize: 28, fontWeight: "900", letterSpacing: -0.5 },
  offerPriceSub:{ fontSize: 12, marginBottom: 4 },
  offerGrid:    { flexDirection: "row", gap: 8 },
  offerGridItem:{ flex: 1, borderWidth: 1, borderRadius: 12, padding: 10 },
  offerGridLabel:{ fontSize: 8, fontWeight: "800", letterSpacing: 0.8, marginBottom: 4 },
  offerGridValue:{ fontSize: 13, fontWeight: "900" },
  offerNote:    { borderLeftWidth: 2, paddingLeft: 10 },
  offerNoteText:{ fontSize: 11, lineHeight: 16 },
  escrowRow:    { flexDirection: "row", alignItems: "center", gap: 6 },
  escrowText:   { fontSize: 10, flex: 1, lineHeight: 14 },
  offerBtns:    { flexDirection: "row", gap: 8 },
  rejectBtn:    { flex: 1, borderWidth: 1, borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  rejectBtnText:{ fontSize: 13, fontWeight: "700" },
  acceptBtn:    { flex: 1.5, borderRadius: 12, paddingVertical: 12, alignItems: "center", shadowColor: "#ff6b2b", shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
  acceptBtnText:{ fontSize: 13, fontWeight: "900", color: "#fff" },

  // Offer states
  offerAccepted:    { borderWidth: 1, borderRadius: 20, padding: 24, alignItems: "center", width: "100%", maxWidth: 340 },
  offerAcceptedTitle:{ fontSize: 15, fontWeight: "900", marginBottom: 4 },
  offerAcceptedSub: { fontSize: 11 },
  offerRejected:    { borderWidth: 1, borderRadius: 16, padding: 16, alignItems: "center", width: "100%", maxWidth: 340, opacity: 0.6 },
  offerRejectedText:{ fontSize: 13, fontWeight: "600" },

  // Input bar
  inputBar:   { flexDirection: "row", alignItems: "flex-end", gap: 10, paddingHorizontal: 14, paddingTop: 10, borderTopWidth: 1 },
  attachBtn:  { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  textInput:  { flex: 1, borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, fontSize: 13, maxHeight: 100 },
  sendBtn:    { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
}); }
