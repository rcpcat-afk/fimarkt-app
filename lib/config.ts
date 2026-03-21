// ─── Fimarkt App Konfigürasyonu ───────────────────────────────────────────────
// Web (fimarkt-web/lib/config.ts) ile senkron tutulmalıdır.

export const SITE_CONFIG = {
  isMaintenance:  false,
  maintenanceEnd: "2026-03-25T10:00:00",
  whatsappLink:   "https://wa.me/905320000000",
  siteName:       "Fimarkt",
  siteTagline:    "Türkiye'nin 3D Ekosistemi",
} as const;
