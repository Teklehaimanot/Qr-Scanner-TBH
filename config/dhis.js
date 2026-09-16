import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra?.dhis ?? {};
const env = (key, fallback = "") =>
  extra[key] ?? process.env[key] ?? fallback;

export const BACKEND_URL = env("EXPO_PUBLIC_BACKEND_URL", "");
export const ORG_UNIT_UID = env("EXPO_PUBLIC_DHIS_ORG_UNIT_UID", "");

/** Backend API root, e.g. https://declaration.example.org/api. */
export function getBackendApiBaseUrl() {
  const base = BACKEND_URL.replace(/\/+$/, "");
  if (!base) {
    throw new Error("Scanner backend is not configured. Set EXPO_PUBLIC_BACKEND_URL.");
  }
  return base.endsWith("/api") ? base : `${base}/api`;
}

/** Optional DHIS2 web origin used only for opening Capture in the browser. */
export function getDhisWebBaseUrl() {
  return env("EXPO_PUBLIC_DHIS_WEB_BASE", "").replace(/\/+$/, "");
}

export function getDhisEnrollmentEventUrl(eventId, orgUnitId = ORG_UNIT_UID) {
  const webBase = getDhisWebBaseUrl();
  if (!eventId || !orgUnitId || !webBase) return null;

  const params = new URLSearchParams({
    eventId,
    orgUnitId,
  });
  return `${webBase}/dhis-web-capture/index.html#/enrollmentEventEdit?${params.toString()}`;
}
