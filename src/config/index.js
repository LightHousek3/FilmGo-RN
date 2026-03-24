/**
 * Central Application Configuration
 *
 * Single source of truth for all environment-driven config.
 * Reads EXPO_PUBLIC_* variables, validates them
 * *
 */

import Constants from "expo-constants";
import { Platform } from "react-native";

// ─── Build Config ─────────────────────────────────────

const DEFAULT_API_BASE_URL = "http://localhost:3000/api/v1";

const extractHost = (hostValue) => {
  if (!hostValue || typeof hostValue !== "string") return null;
  const [host] = hostValue.split(":");
  return host || null;
};

const resolveDevHost = () => {
  const hostCandidates = [
    Constants.expoConfig?.hostUri,
    Constants.manifest?.debuggerHost,
    Constants.manifest2?.extra?.expoGo?.debuggerHost,
    Constants.expoGoConfig?.debuggerHost,
  ];

  for (const candidate of hostCandidates) {
    const host = extractHost(candidate);
    if (host) return host;
  }

  return null;
};

const resolveApiBaseUrl = () => {
  const envBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (envBaseUrl) return envBaseUrl;

  const devHost = resolveDevHost();
  if (devHost) {
    return `http://${devHost}:3000/api/v1`;
  }

  if (__DEV__ && Platform.OS === "android") {
    return "http://10.0.2.2:3000/api/v1";
  }

  return DEFAULT_API_BASE_URL;
};

const Config = Object.freeze({
  // ─── App ────────────────────────────────────────────
  app: Object.freeze({
    name: process.env.EXPO_PUBLIC_APP_NAME || "FilmGo",
    env: process.env.EXPO_PUBLIC_APP_ENV || "development",
  }),

  // ─── API ────────────────────────────────────────────
  api: Object.freeze({
    baseUrl: resolveApiBaseUrl(),
    timeout: process.env.EXPO_PUBLIC_API_TIMEOUT
      ? parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT, 10)
      : 15000,
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
