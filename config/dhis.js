import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra?.dhis ?? {};

// extra.dhis is set in app.config.js at build time (EAS / local)
const env = (key, fallback = "") =>
  extra[key] ?? process.env[key] ?? fallback;

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

/** Web app origin, e.g. https://host.org (derived from API base unless overridden). */
export function getDhisWebBaseUrl() {
  const override = env("EXPO_PUBLIC_DHIS_WEB_BASE", "");
  if (override) {
    return override.replace(/\/$/, "");
  }

  const base = DHIS_BASE.replace(/\/$/, "");
  if (base.endsWith("/api")) {
    return base.slice(0, -4);
  }
  return base;
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

/**
 * DHIS2 Capture enrollment event edit page.
 * Example: .../dhis-web-capture/index.html#/enrollmentEventEdit?eventId=...&orgUnitId=...
 */
export function getDhisEnrollmentEventUrl(eventId, orgUnitId = ORG_UNIT_UID) {
  if (!eventId || !orgUnitId || !getDhisWebBaseUrl()) {
    return null;
  }

  const webBase = getDhisWebBaseUrl();
  const params = new URLSearchParams({
    eventId,
    orgUnitId,
  });

  return `${webBase}/dhis-web-capture/index.html#/enrollmentEventEdit?${params.toString()}`;
}

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
