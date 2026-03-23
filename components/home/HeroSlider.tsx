import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  View, Text, TouchableOpacity, FlatList, Dimensions,
  StyleSheet, NativeSyntheticEvent, NativeScrollEvent,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { type ThemeColors } from "@/constants/theme";
import { CAMPAIGNS, sortCampaignsForRole, type Campaign } from "@/lib/campaigns";

const { width } = Dimensions.get("window");
const SLIDE_HEIGHT = 380;

interface Props { userRole?: string }

export default function HeroSlider({ userRole }: Props) {
  const { colors: C } = useTheme();
  const router  = useRouter();
  const slides  = sortCampaignsForRole(CAMPAIGNS, userRole);
  const flatRef = useRef<FlatList<Campaign>>(null);
  const [idx, setIdx]       = useState(0);
  const [paused, setPaused] = useState(false);
  const s = makeStyles(C);

  const scrollTo = useCallback((i: number) => {
    flatRef.current?.scrollToIndex({ index: i, animated: true });
    setIdx(i);
  }, []);

  const next = useCallback(() => {
    const nextIdx = (idx + 1) % slides.length;
    scrollTo(nextIdx);
  }, [idx, slides.length, scrollTo]);

  // Otomatik geçiş
  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [paused, next]);

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const newIdx = Math.round(e.nativeEvent.contentOffset.x / width);
    setIdx(newIdx);
  };

  const renderSlide = ({ item: slide }: { item: Campaign }) => (
    <View style={[s.slide, { backgroundColor: `${slide.accentColor}08` }]}>
      {/* Dekoratif glow */}
      <View style={[s.glow, { backgroundColor: slide.accentColor }]} />

      {/* Büyük emoji dekor */}
      <Text style={s.bgEmoji} numberOfLines={1}>{slide.emoji}</Text>

      {/* İçerik */}
      <View style={s.content}>
        {/* Badge */}
        <View style={[s.badge, { backgroundColor: `${slide.accentColor}20`, borderColor: `${slide.accentColor}50` }]}>
          <Text style={[s.badgeText, { color: slide.accentColor }]}>{slide.badge}</Text>
        </View>

        {/* Başlık */}
        <Text style={s.title}>{slide.title}</Text>

        {/* Açıklama */}
        <Text style={s.desc} numberOfLines={3}>{slide.description}</Text>

        {/* CTA */}
        <View style={s.ctaRow}>
          <TouchableOpacity
            style={[s.ctaPrimary, { backgroundColor: slide.accentColor }]}
            onPress={() => router.push(slide.ctaLink as any)}
            activeOpacity={0.85}
          >
            <Text style={s.ctaPrimaryText}>{slide.ctaText} →</Text>
          </TouchableOpacity>
          {slide.ctaSecondary && (
            <TouchableOpacity
              style={s.ctaSecondary}
              onPress={() => router.push(slide.ctaSecondary!.link as any)}
              activeOpacity={0.85}
            >
              <Text style={[s.ctaSecondaryText, { color: C.foreground }]}>
                {slide.ctaSecondary.text}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View
      style={s.container}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <FlatList
        ref={flatRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumEnd}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        initialScrollIndex={0}
      />

      {/* Dot göstergeler */}
      <View style={s.dots}>
        {slides.map((s_item, i) => (
          <TouchableOpacity
            key={s_item.id}
            onPress={() => scrollTo(i)}
            style={[
              s.dot,
              {
                width:           i === idx ? 24 : 8,
                backgroundColor: i === idx ? slides[idx].accentColor : C.border,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

function makeStyles(C: ThemeColors) {
  return StyleSheet.create({
    container:      { width, height: SLIDE_HEIGHT, position: "relative" },
    slide:          { width, height: SLIDE_HEIGHT, overflow: "hidden", justifyContent: "flex-end" },
    glow:           { position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: 100, opacity: 0.12 },
    bgEmoji:        { position: "absolute", right: 16, top: SLIDE_HEIGHT / 2 - 72, fontSize: 128, opacity: 0.1, pointerEvents: "none" as any },
    content:        { paddingHorizontal: 20, paddingBottom: 56, paddingTop: 20 },
    badge:          { alignSelf: "flex-start", borderWidth: 1, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 12 },
    badgeText:      { fontSize: 10, fontWeight: "700" },
    title:          { fontSize: 26, fontWeight: "900", color: C.foreground, letterSpacing: -0.5, lineHeight: 32, marginBottom: 8 },
    desc:           { fontSize: 12, color: C.mutedForeground, lineHeight: 18, marginBottom: 20, maxWidth: width * 0.75 },
    ctaRow:         { flexDirection: "row", gap: 10 },
    ctaPrimary:     { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14 },
    ctaPrimaryText: { fontSize: 13, fontWeight: "700", color: "#fff" },
    ctaSecondary:   { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14, backgroundColor: C.surface2, borderWidth: 1, borderColor: C.border },
    ctaSecondaryText: { fontSize: 13, fontWeight: "600" },
    dots:           { position: "absolute", bottom: 16, alignSelf: "center", flexDirection: "row", gap: 6, alignItems: "center", left: 0, right: 0, justifyContent: "center" },
    dot:            { height: 8, borderRadius: 4 },
  });
}
