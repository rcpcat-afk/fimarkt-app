import { useRef, useEffect } from "react";
import { useRouter } from "expo-router";
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../hooks/useTheme";

interface Props {
  visible: boolean;
  onClose: () => void;
}

const ACTIONS = [
  {
    id:      "stl-upload",
    icon:    "cloud-upload-outline" as const,
    label:   "STL Dosyası Yükle",
    sub:     "Hızlı teklif al",
    color:   "#ff6b2b",
    href:    "/(print)/print-upload",
  },
  {
    id:      "custom-design",
    icon:    "construct-outline" as const,
    label:   "Tasarım İste",
    sub:     "Peçete karalamandan 3D modele",
    color:   "#0ea5e9",
    href:    "/(print)/tasarim-iste",
  },
  {
    id:      "sell-model",
    icon:    "storefront-outline" as const,
    label:   "Modelini Satışa Çıkar",
    sub:     "Sanatkat'ta yayınla",
    color:   "#a855f7",
    href:    "/(tabs)/profile",
  },
  {
    id:      "explore",
    icon:    "rocket-outline" as const,
    label:   "Fidrop'u Keşfet",
    sub:     "Teknolojiler, fiyatlar ve güvence",
    color:   "#22c55e",
    href:    "/(tabs)/print",
  },
] as const;

export default function FidropActionSheet({ visible, onClose }: Props) {
  const { colors: C } = useTheme();
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const slideY  = useRef(new Animated.Value(300)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  // ── Open / close animation ────────────────────────────────────────────────
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideY, { toValue: 0, bounciness: 4, speed: 18, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, slideY, opacity]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideY, { toValue: 300, duration: 220, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start(() => onClose());
  };

  const handleAction = (href: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    handleClose();
    setTimeout(() => router.push(href as never), 240);
  };

  return (
    <Modal visible={visible} animationType="none" transparent statusBarTranslucent>
      {/* Backdrop */}
      <Animated.View style={[s.backdrop, { opacity }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={handleClose} activeOpacity={1} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={[
          s.sheet,
          {
            paddingBottom: insets.bottom + 16,
            backgroundColor: C.surface,
            borderColor: C.border,
            transform: [{ translateY: slideY }],
          },
        ]}
      >
        {/* Handle */}
        <View style={[s.handle, { backgroundColor: C.border }]} />

        {/* Title */}
        <View style={s.titleRow}>
          <View style={[s.titleIcon, { backgroundColor: C.accent + "22" }]}>
            <Ionicons name="rocket-outline" size={20} color={C.accent} />
          </View>
          <View>
            <Text style={[s.title, { color: C.foreground }]}>Fidrop</Text>
            <Text style={[s.subtitle, { color: C.subtleForeground }]}>Ne yapmak istersin?</Text>
          </View>
        </View>

        {/* Action buttons */}
        {ACTIONS.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={[s.actionRow, { borderColor: C.border }]}
            onPress={() => handleAction(action.href)}
            activeOpacity={0.75}
          >
            <View style={[s.actionIcon, { backgroundColor: action.color + "22" }]}>
              <Ionicons name={action.icon} size={22} color={action.color} />
            </View>
            <View style={s.actionText}>
              <Text style={[s.actionLabel, { color: C.foreground }]}>{action.label}</Text>
              <Text style={[s.actionSub, { color: C.subtleForeground }]}>{action.sub}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={C.subtleForeground} />
          </TouchableOpacity>
        ))}

        {/* Cancel */}
        <TouchableOpacity
          style={[s.cancelBtn, { backgroundColor: C.surface2, borderColor: C.border }]}
          onPress={handleClose}
          activeOpacity={0.8}
        >
          <Text style={[s.cancelText, { color: C.mutedForeground }]}>İptal</Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  sheet: {
    position:           "absolute",
    bottom:             0,
    left:               0,
    right:              0,
    borderTopLeftRadius:  28,
    borderTopRightRadius: 28,
    borderTopWidth:     1,
    borderLeftWidth:    1,
    borderRightWidth:   1,
    paddingHorizontal:  16,
    paddingTop:         12,
  },
  handle: {
    width: 40, height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: "row",
    alignItems:    "center",
    gap:           12,
    marginBottom:  20,
    paddingHorizontal: 4,
  },
  titleIcon: {
    width: 44, height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  title:    { fontSize: 17, fontWeight: "800", letterSpacing: -0.3 },
  subtitle: { fontSize: 12, marginTop: 1 },

  actionRow: {
    flexDirection:  "row",
    alignItems:     "center",
    gap:            14,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  actionIcon: {
    width: 48, height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: { flex: 1 },
  actionLabel: { fontSize: 14, fontWeight: "700", marginBottom: 2 },
  actionSub:   { fontSize: 12 },

  cancelBtn: {
    marginTop:      16,
    borderRadius:   16,
    borderWidth:    1,
    paddingVertical: 14,
    alignItems:     "center",
  },
  cancelText: { fontSize: 14, fontWeight: "600" },
});
