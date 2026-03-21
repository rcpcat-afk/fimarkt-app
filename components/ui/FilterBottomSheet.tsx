// ─── Fimarkt Custom Filter Bottom Sheet ──────────────────────────────────────
// react-native-reanimated tabanlı, dışarıdan paket bağımlılığı yok.
// Kullanım: <FilterBottomSheet visible={open} onClose={() => setOpen(false)} .../>

import { useEffect } from "react";
import {
  View, Text, Pressable, ScrollView, StyleSheet,
  Modal, TouchableWithoutFeedback, Platform,
} from "react-native";
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withTiming, runOnJS,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, FontSizes, LineHeights } from "@/constants/theme";
import type { FilterGroup, ActiveFilters } from "@/lib/types";

const C = Colors.dark;

const SPRING_CONFIG = {
  damping:   20,
  stiffness: 200,
  mass:      0.8,
};

// ── Renk haritası ─────────────────────────────────────────────────────────────
const COLOR_MAP: Record<string, string> = {
  beyaz:   "#f5f5f5",
  siyah:   "#1a1a1a",
  kirmizi: "#ef4444",
  mavi:    "#3b82f6",
  yesil:   "#22c55e",
  sari:    "#eab308",
  seffaf:  "#e5e7eb",
};

// ── Props ─────────────────────────────────────────────────────────────────────
interface FilterBottomSheetProps {
  visible:        boolean;
  filters:        FilterGroup[];
  active:         ActiveFilters;
  priceRange:     [number, number];
  totalActive:    number;
  onFilterChange: (groupId: string, value: string, checked: boolean) => void;
  onPriceChange:  (range: [number, number]) => void;
  onClear:        () => void;
  onClose:        () => void;
}

// ── Checkbox Seçenek ──────────────────────────────────────────────────────────
function CheckboxOption({
  label, count, checked, onToggle,
}: { label: string; count?: number; checked: boolean; onToggle: () => void }) {
  return (
    <Pressable onPress={onToggle} style={styles.option}>
      <View style={[styles.checkbox, checked && styles.checkboxActive]}>
        {checked && <Ionicons name="checkmark" size={10} color="#fff" />}
      </View>
      <Text style={[styles.optionLabel, checked && styles.optionLabelActive]}>
        {label}
      </Text>
      {count !== undefined && (
        <Text style={styles.optionCount}>{count}</Text>
      )}
    </Pressable>
  );
}

// ── Renk Seçeneği ─────────────────────────────────────────────────────────────
function ColorOption({
  label, value, checked, onToggle,
}: { label: string; value: string; checked: boolean; onToggle: () => void }) {
  return (
    <Pressable onPress={onToggle} style={styles.colorOption} accessibilityLabel={label}>
      <View style={[
        styles.colorSwatch,
        { backgroundColor: COLOR_MAP[value] ?? value },
        checked && styles.colorSwatchActive,
      ]}>
        {checked && <Ionicons name="checkmark" size={10} color={value === "beyaz" ? "#111" : "#fff"} />}
      </View>
      <Text style={[styles.colorLabel, checked && { color: C.foreground }]}>{label}</Text>
    </Pressable>
  );
}

// ── Filtre Grubu ──────────────────────────────────────────────────────────────
function FilterGroupSection({
  group, active, onFilterChange,
}: {
  group:          FilterGroup;
  active:         ActiveFilters;
  onFilterChange: FilterBottomSheetProps["onFilterChange"];
}) {
  const selected = active[group.id] ?? [];

  return (
    <View style={styles.groupSection}>
      <View style={styles.groupHeader}>
        <Text style={styles.groupLabel}>{group.label}</Text>
        {selected.length > 0 && (
          <View style={styles.groupBadge}>
            <Text style={styles.groupBadgeText}>{selected.length}</Text>
          </View>
        )}
      </View>

      {group.type === "color" ? (
        <View style={styles.colorRow}>
          {group.options?.map((opt) => (
            <ColorOption
              key={opt.value}
              label={opt.label}
              value={opt.value}
              checked={selected.includes(opt.value)}
              onToggle={() =>
                onFilterChange(group.id, opt.value, !selected.includes(opt.value))
              }
            />
          ))}
        </View>
      ) : (
        group.options?.map((opt) => (
          <CheckboxOption
            key={opt.value}
            label={opt.label}
            count={opt.count}
            checked={selected.includes(opt.value)}
            onToggle={() =>
              onFilterChange(group.id, opt.value, !selected.includes(opt.value))
            }
          />
        ))
      )}
    </View>
  );
}

// ── Ana Bileşen ───────────────────────────────────────────────────────────────
export default function FilterBottomSheet({
  visible, filters, active, priceRange,
  totalActive, onFilterChange, onClear, onClose,
}: FilterBottomSheetProps) {
  const insets     = useSafeAreaInsets();
  const translateY = useSharedValue(600);
  const opacity    = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value    = withTiming(1, { duration: 200 });
      translateY.value = withSpring(0, SPRING_CONFIG);
    } else {
      opacity.value    = withTiming(0, { duration: 200 });
      translateY.value = withSpring(600, SPRING_CONFIG);
    }
  }, [visible]);

  const sheetStyle    = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));
  const backdropStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  const handleClose = () => {
    opacity.value    = withTiming(0, { duration: 180 });
    translateY.value = withSpring(600, SPRING_CONFIG, () => runOnJS(onClose)());
  };

  // Görünür olmayınca Modal'ı DOM'dan kaldırma (animasyon bitince)
  if (!visible) return null;

  const nonRangeFilters = filters.filter((g) => g.type !== "range");

  return (
    <Modal transparent visible={visible} statusBarTranslucent animationType="none">
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]} />
      </TouchableWithoutFeedback>

      {/* Sheet Panel */}
      <Animated.View
        style={[
          styles.sheet,
          { paddingBottom: Math.max(insets.bottom, 16) },
          sheetStyle,
        ]}
      >
        {/* Tutamaç */}
        <View style={styles.handle} />

        {/* Başlık */}
        <View style={styles.sheetHeader}>
          <View style={styles.sheetHeaderLeft}>
            <Text style={styles.sheetTitle}>Filtreler</Text>
            {totalActive > 0 && (
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>{totalActive}</Text>
              </View>
            )}
          </View>
          <View style={styles.sheetHeaderRight}>
            {totalActive > 0 && (
              <Pressable onPress={onClear} style={styles.clearBtn}>
                <Text style={styles.clearBtnText}>Temizle</Text>
              </Pressable>
            )}
            <Pressable onPress={handleClose} style={styles.closeBtn}>
              <Ionicons name="close" size={14} color={C.mutedForeground} />
            </Pressable>
          </View>
        </View>

        {/* Filtre Listesi */}
        <ScrollView
          style={styles.scrollArea}
          showsVerticalScrollIndicator={false}
          bounces={Platform.OS === "ios"}
        >
          {nonRangeFilters.map((group) => (
            <FilterGroupSection
              key={group.id}
              group={group}
              active={active}
              onFilterChange={onFilterChange}
            />
          ))}
        </ScrollView>

        {/* Uygula Butonu */}
        <Pressable
          onPress={handleClose}
          style={({ pressed }) => [styles.applyBtn, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.applyBtnText}>
            {totalActive > 0 ? `${totalActive} Filtre Uygula` : "Filtreleri Uygula"}
          </Text>
        </Pressable>
      </Animated.View>
    </Modal>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  backdrop: { backgroundColor: "rgba(0,0,0,0.6)" },

  sheet: {
    position:        "absolute",
    bottom:          0, left: 0, right: 0,
    height:          "85%",
    backgroundColor: C.surface,
    borderTopLeftRadius:  24,
    borderTopRightRadius: 24,
    borderWidth:     1,
    borderBottomWidth: 0,
    borderColor:     C.border,
    overflow:        "hidden",
  },

  handle: {
    width: 40, height: 4,
    backgroundColor: C.border,
    borderRadius:    2,
    alignSelf:       "center",
    marginTop:       12, marginBottom: 4,
  },

  sheetHeader: {
    flexDirection:   "row",
    alignItems:      "center",
    justifyContent:  "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: C.surface2,
  },
  sheetHeaderLeft:  { flexDirection: "row", alignItems: "center", gap: 8 },
  sheetHeaderRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  sheetTitle:       { fontSize: FontSizes.md, fontWeight: "700", color: C.foreground },
  activeBadge: {
    backgroundColor: C.accent,
    borderRadius: 20, paddingHorizontal: 6, paddingVertical: 2,
  },
  activeBadgeText: { fontSize: 9, fontWeight: "800", color: "#fff" },
  clearBtn:     { paddingVertical: 4, paddingHorizontal: 8 },
  clearBtnText: { fontSize: FontSizes.sm, color: C.accent, fontWeight: "600" },
  closeBtn: {
    width: 26, height: 26, borderRadius: 8,
    backgroundColor: C.surface,
    borderWidth: 1, borderColor: C.border,
    alignItems: "center", justifyContent: "center",
  },

  scrollArea: { flex: 1, paddingHorizontal: 16 },

  // Grup
  groupSection:  { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: C.border },
  groupHeader:   { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  groupLabel:    { fontSize: FontSizes.sm, fontWeight: "700", color: C.foreground },
  groupBadge: {
    backgroundColor: C.accent, borderRadius: 20,
    paddingHorizontal: 5, paddingVertical: 1,
  },
  groupBadgeText: { fontSize: 9, fontWeight: "800", color: "#fff" },

  // Checkbox
  option: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6 },
  checkbox: {
    width: 18, height: 18, borderRadius: 5,
    borderWidth: 1.5, borderColor: C.border,
    backgroundColor: C.surface2,
    alignItems: "center", justifyContent: "center",
  },
  checkboxActive: { backgroundColor: C.accent, borderColor: C.accent },
  optionLabel:      { flex: 1, fontSize: FontSizes.sm, color: C.mutedForeground, lineHeight: LineHeights.sm },
  optionLabelActive: { color: C.foreground, fontWeight: "600" },
  optionCount:      { fontSize: FontSizes.xs, color: C.subtleForeground },

  // Renk
  colorRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  colorOption:  { alignItems: "center", gap: 4, minWidth: 44 },
  colorSwatch: {
    width: 30, height: 30, borderRadius: 15,
    borderWidth: 2, borderColor: C.border,
    alignItems: "center", justifyContent: "center",
  },
  colorSwatchActive: { borderColor: C.accent, transform: [{ scale: 1.15 }] },
  colorLabel: { fontSize: 9, color: C.mutedForeground, textAlign: "center" },

  // Uygula
  applyBtn: {
    marginHorizontal: 16, marginTop: 12,
    backgroundColor: C.accent,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  applyBtnText: { fontSize: FontSizes.md, fontWeight: "800", color: "#fff" },
});
