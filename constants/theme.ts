/**
 * Fimarkt Kurumsal Renk Paleti — Premium Dark Mode
 *
 * Bu dosya hem doğrudan (Colors.bg, Colors.accent) hem de
 * useColorScheme() hook'u üzerinden tüketilir.
 * Fimarkt yalnızca dark mode'da çalışır.
 */

import { Platform } from 'react-native';

// ─── Fimarkt Paleti ─────────────────────────────────────────────────────────
export const FimarktColors = {
  // Arka planlar
  bg:       '#111118',
  surface:  '#1a1a28',
  surface2: '#20203a',

  // Çizgiler / Kenarlıklar
  border:   '#2a2a42',

  // Metinler
  text:     '#e8e8f5',
  text2:    '#8888b0',
  text3:    '#5a5a7a',

  // Vurgu (Fimarkt Turuncusu)
  accent:       '#ff6b2b',
  accentHover:  '#e85a1f',

  // Durum renkleri
  green:   '#22c55e',
  red:     '#ef4444',
  yellow:  '#f59e0b',
} as const;

// ─── Expo useColorScheme() uyumlu yapı ──────────────────────────────────────
// Fimarkt yalnızca dark mode'da çalışır; light tanımı da dark paletini kullanır
// (Açık temaya geçiş planlandığında bu alan güncellenir)
export const Colors = {
  light: {
    text:             FimarktColors.text,
    background:       FimarktColors.bg,
    tint:             FimarktColors.accent,
    icon:             FimarktColors.text2,
    tabIconDefault:   FimarktColors.text3,
    tabIconSelected:  FimarktColors.accent,
    surface:          FimarktColors.surface,
    surface2:         FimarktColors.surface2,
    border:           FimarktColors.border,
  },
  dark: {
    text:             FimarktColors.text,
    background:       FimarktColors.bg,
    tint:             FimarktColors.accent,
    icon:             FimarktColors.text2,
    tabIconDefault:   FimarktColors.text3,
    tabIconSelected:  FimarktColors.accent,
    surface:          FimarktColors.surface,
    surface2:         FimarktColors.surface2,
    border:           FimarktColors.border,
  },
} as const;

// ─── Tipografi ───────────────────────────────────────────────────────────────
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
