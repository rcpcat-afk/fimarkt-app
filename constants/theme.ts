/**
 * Fimarkt Design Token Sistemi — Expo (React Native)
 *
 * Kural: StyleSheet içinde asla HEX kodu kullanma.
 * Kullanım: theme.colors.background, theme.colors.accent vb.
 *
 * Tema seçimi: useColorScheme() hook'u ile Colors[scheme] kullan.
 * Fimarkt şu an yalnızca Dark Mode'da çalışır; Light altyapı hazır.
 */

import { Platform } from 'react-native';

// ─── Fimarkt Marka Paleti (Ham Değerler) ─────────────────────────────────────
// Bu objeyi doğrudan component'lerde kullanma — tema tokenlarını kullan.
export const FimarktColors = {
  // Arka Planlar
  bg:       '#111118',
  surface:  '#1a1a28',
  surface2: '#20203a',

  // Kenarlık
  border: '#2a2a42',

  // Metinler
  text:  '#e8e8f5',
  text2: '#8888b0',
  text3: '#5a5a7a',

  // Vurgu (Sabit Marka Rengi — tema değişse de değişmez)
  accent:      '#ff6b2b',
  accentHover: '#e85a1f',

  // Durum
  success: '#22c55e',
  error:   '#ef4444',
  warning: '#f59e0b',
} as const;

// ─── Light Moda Özel Değerler ────────────────────────────────────────────────
const LightValues = {
  background:       '#FFFCFA',
  surface:          '#F7F3F0',
  surface2:         '#EDE8E3',
  border:           '#DDD5CC',
  foreground:       '#111827',
  mutedForeground:  '#4B5563',
  subtleForeground: '#9CA3AF',
} as const;

// ─── Tema Objeleri ───────────────────────────────────────────────────────────
export const Colors = {
  dark: {
    // Arka Planlar
    background:  FimarktColors.bg,
    surface:     FimarktColors.surface,
    surface2:    FimarktColors.surface2,

    // Kenarlık
    border: FimarktColors.border,

    // Metinler
    foreground:       FimarktColors.text,
    mutedForeground:  FimarktColors.text2,
    subtleForeground: FimarktColors.text3,

    // Vurgu
    accent:      FimarktColors.accent,
    accentHover: FimarktColors.accentHover,

    // Durum
    success: FimarktColors.success,
    error:   FimarktColors.error,
    warning: FimarktColors.warning,

    // Expo Tab Navigator Aliasları
    tint:           FimarktColors.accent,
    icon:           FimarktColors.text2,
    tabIconDefault: FimarktColors.text3,
    tabIconSelected: FimarktColors.accent,
  },

  light: {
    // Arka Planlar
    background:  LightValues.background,
    surface:     LightValues.surface,
    surface2:    LightValues.surface2,

    // Kenarlık
    border: LightValues.border,

    // Metinler
    foreground:       LightValues.foreground,
    mutedForeground:  LightValues.mutedForeground,
    subtleForeground: LightValues.subtleForeground,

    // Vurgu (Sabit Marka Rengi)
    accent:      FimarktColors.accent,
    accentHover: FimarktColors.accentHover,

    // Durum
    success: FimarktColors.success,
    error:   FimarktColors.error,
    warning: FimarktColors.warning,

    // Expo Tab Navigator Aliasları
    tint:            FimarktColors.accent,
    icon:            LightValues.mutedForeground,
    tabIconDefault:  LightValues.subtleForeground,
    tabIconSelected: FimarktColors.accent,
  },
} as const;

// Tip çıkarımı için yardımcı
export type ColorScheme = keyof typeof Colors;
export type ThemeColors = typeof Colors.dark;

// ─── Tipografi Boyut Skalası ─────────────────────────────────────────────────
// Tüm yazı boyutlarını buradan yönet.
// Kullanım: style={{ fontSize: FontSizes.base }}
// Sistemi büyütmek/küçültmek için sadece bu değerleri değiştir.
export const FontSizes = {
  xs:   12,   // etiket, badge, yardımcı metin
  sm:   13,   // ikincil metin, input label
  base: 15,   // gövde metni (temel birim)
  md:   16,   // vurgulu gövde, kart başlığı
  lg:   18,   // section başlığı
  xl:   20,   // sayfa alt başlığı
  '2xl': 24,  // sayfa başlığı
  '3xl': 30,  // ekran başlığı
  '4xl': 36,  // hero başlığı
} as const;

// Satır yükseklikleri — FontSizes ile orantılı (1.4–1.6x)
export const LineHeights = {
  xs:   16,
  sm:   18,
  base: 22,
  md:   24,
  lg:   26,
  xl:   28,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
} as const;

export type FontSizeKey = keyof typeof FontSizes;

// ─── Tipografi Font Ailesi ────────────────────────────────────────────────────
export const Fonts = Platform.select({
  ios: {
    sans:    'system-ui',
    serif:   'ui-serif',
    rounded: 'ui-rounded',
    mono:    'ui-monospace',
  },
  default: {
    sans:    'normal',
    serif:   'serif',
    rounded: 'normal',
    mono:    'monospace',
  },
  web: {
    sans:    "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif:   "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', sans-serif",
    mono:    "SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace",
  },
});
