/**
 * Central Application Configuration
 *
 * Single source of truth for all environment-driven config.
 * Reads EXPO_PUBLIC_* variables, validates them
 * *
 */

// ─── Build Config ─────────────────────────────────────

const Config = Object.freeze({
  // ─── App ────────────────────────────────────────────
  app: Object.freeze({
    name: process.env.EXPO_PUBLIC_APP_NAME || "FilmGo",
    env: process.env.EXPO_PUBLIC_APP_ENV || "development",
  }),

  // ─── API ────────────────────────────────────────────
    api: Object.freeze({
        baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
        timeout: process.env.EXPO_PUBLIC_API_TIMEOUT ? parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT, 10) : 15000,
    }),

  // ─── Auth ────────────────────────────────────────────
  auth: Object.freeze({
    // AsyncStorage keys — not env-driven (static per app)
    accessTokenKey: "@filmgo_access_token",
    refreshTokenKey: "@filmgo_refresh_token",
    userKey: "@filmgo_user",
    resendCooldownSeconds:
      parseInt(process.env.EXPO_PUBLIC_RESEND_COOLDOWN_SECONDS) || 60,
  }),

  // ─── UI / Timing ─────────────────────────────────────
  ui: Object.freeze({
    bannerAutoSlideInterval:
      parseInt(process.env.EXPO_PUBLIC_BANNER_AUTO_SLIDE_INTERVAL) || 4000,
    carouselSnapInterval:
      parseInt(process.env.EXPO_PUBLIC_CAROUSEL_SNAP_INTERVAL) || 3000,
  }),
});

export default Config;
