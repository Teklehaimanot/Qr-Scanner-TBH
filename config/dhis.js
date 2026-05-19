import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra?.dhis ?? {};

const env = (key, fallback = "") =>
  process.env[key] ?? extra[key] ?? fallback;

export const DHIS_BASE = env("EXPO_PUBLIC_DHIS_BASE", "");
export const DHIS_TOKEN = env("EXPO_PUBLIC_DHIS_TOKEN", "");

/** API root, e.g. https://host.org/api — avoids double /api when base already includes it. */
export function getDhisApiBaseUrl() {
  const base = DHIS_BASE.replace(/\/$/, "");
  if (base.endsWith("/api")) {
    return base;
  }
  return `${base}/api`;
}

export const PROGRAM_UID = env("EXPO_PUBLIC_DHIS_PROGRAM_UID", "");
export const PROGRAM_STAGE_UID = env(
  "EXPO_PUBLIC_DHIS_PROGRAM_STAGE_UID",
  ""
);
export const ORG_UNIT_UID = env("EXPO_PUBLIC_DHIS_ORG_UNIT_UID", "");
export const QR_SCAN_STATUS_DE_UID = env(
  "EXPO_PUBLIC_DHIS_QR_SCAN_STATUS_DE_UID",
  ""
);

export function isDhisConfigured() {
  return Boolean(
    DHIS_BASE &&
      DHIS_TOKEN &&
      PROGRAM_UID &&
      PROGRAM_STAGE_UID &&
      ORG_UNIT_UID &&
      QR_SCAN_STATUS_DE_UID
  );
}
