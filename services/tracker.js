import { getBackendApiBaseUrl } from "../config/dhis";

const REQUEST_TIMEOUT_MS = 30_000;

export async function scanTravelerQr(payload) {
  if (typeof payload !== "string" || !payload.startsWith("TRV1:")) {
    throw new Error("This is not a valid traveller QR code.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${getBackendApiBaseUrl()}/scans`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ payload }),
      signal: controller.signal,
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) {
      const error = new Error(
        body?.error?.message || `Scanner service request failed (${response.status}).`,
      );
      error.code = body?.error?.code;
      error.status = response.status;
      throw error;
    }
    return body;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("The scanner service took too long to respond.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export function getScanErrorMessage(error) {
  if (error?.code === "INVALID_QR") {
    return "This QR code is invalid, altered, or expired.";
  }
  if (error?.code === "DECLARATION_NOT_FOUND") {
    return "The declaration in this QR code was not found.";
  }
  if (error?.status === 429) {
    return "The scanner is temporarily busy. Please wait and scan again.";
  }
  return error?.message || "Could not verify or synchronize this QR code.";
}
