import React from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Colors } from "@/constants/theme";
import { CAMPAIGNS, sortCampaignsForRole } from "@/lib/campaigns";

const { width } = Dimensions.get("window");
const CARD_PAD  = 16;
const GAP       = 8;
const INNER     = width - CARD_PAD * 2;
const SM_W      = (INNER - GAP) / 2;

interface Props { userRole?: string }

export default function BentoBanners({ userRole }: Props) {
  const C = Colors["dark"];
  const router = useRouter();
  const [large, topRight, bottomRight] = sortCampaignsForRole(CAMPAIGNS, userRole).slice(0, 3);
  const s = makeStyles(C);

  return (
    <View style={s.container}>
      {/* ── Büyük kart (üst, tam genişlik) ─────────────────────────── */}
      <Animated.View entering={FadeInDown.duration(400)}>
        <TouchableOpacity
          style={[s.largeCard, { backgroundColor: `${large.accentColor}10`, borderColor: `${large.accentColor}30` }]}
          onPress={() => router.push(large.ctaLink as any)}
          activeOpacity={0.88}
        >
          {/* Dekoratif emoji */}
          <Text style={s.largeEmoji}>{large.emoji}</Text>

          {/* Badge */}
          <View style={[s.badge, { backgroundColor: `${large.accentColor}20`, borderColor: `${large.accentColor}45` }]}>
            <Text style={[s.badgeText, { color: large.accentColor }]}>{large.badge}</Text>
          </View>

          <Text style={s.largeTitle} numberOfLines={2}>{large.title.replace("\n", " ")}</Text>
          <Text style={s.largeDesc}  numberOfLines={2}>{large.description}</Text>

          <View style={s.ctaRow}>
            <Text style={[s.ctaText, { color: large.accentColor }]}>{large.ctaText} →</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* ── Alt sıra: 2 küçük kart ──────────────────────────────────── */}
      <View style={s.smallRow}>
        {[topRight, bottomRight].map((card, i) => (
          <Animated.View key={card.id} entering={FadeInDown.delay((i + 1) * 80).duration(400)} style={s.smallCardWrap}>
            <TouchableOpacity
              style={[s.smallCard, { backgroundColor: `${card.accentColor}10`, borderColor: `${card.accentColor}30` }]}
              onPress={() => router.push(card.ctaLink as any)}
              activeOpacity={0.88}
            >
              {/* Dekoratif emoji */}
              <Text style={s.smallEmoji}>{card.emoji}</Text>

              <Text style={[s.smallBadge, { color: card.accentColor }]}>{card.badge}</Text>
              <Text style={s.smallTitle} numberOfLines={2}>{card.title.replace("\n", " ")}</Text>
              <Text style={[s.smallCta, { color: card.accentColor }]}>{card.ctaText} →</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

function makeStyles(C: typeof Colors.dark) {
  return StyleSheet.create({
    container:     { paddingHorizontal: CARD_PAD, paddingVertical: 10, gap: GAP },
    // Large card
    largeCard:     { borderRadius: 20, borderWidth: 1, padding: 18, overflow: "hidden", position: "relative", minHeight: 160 },
    largeEmoji:    { position: "absolute", right: 16, bottom: 12, fontSize: 72, opacity: 0.12 },
    badge:         { alignSelf: "flex-start", borderWidth: 1, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 8 },
    badgeText:     { fontSize: 9, fontWeight: "700" },
    largeTitle:    { fontSize: 18, fontWeight: "900", color: C.foreground, marginBottom: 6, lineHeight: 24 },
    largeDesc:     { fontSize: 11, color: C.mutedForeground, lineHeight: 16, marginBottom: 12, maxWidth: "75%" },
    ctaRow:        { flexDirection: "row" },
    ctaText:       { fontSize: 12, fontWeight: "700" },
    // Small cards
    smallRow:      { flexDirection: "row", gap: GAP },
    smallCardWrap: { flex: 1 },
    smallCard:     { borderRadius: 18, borderWidth: 1, padding: 14, overflow: "hidden", position: "relative", minHeight: 120 },
    smallEmoji:    { position: "absolute", right: 8, bottom: 8, fontSize: 44, opacity: 0.12 },
    smallBadge:    { fontSize: 8, fontWeight: "700", marginBottom: 4 },
    smallTitle:    { fontSize: 13, fontWeight: "700", color: C.foreground, lineHeight: 18, marginBottom: 8 },
    smallCta:      { fontSize: 10, fontWeight: "700" },
  });
}
