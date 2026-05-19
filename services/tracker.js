import axios from "axios";
import {
  DHIS_TOKEN,
  PROGRAM_UID,
  PROGRAM_STAGE_UID,
  ORG_UNIT_UID,
  QR_SCAN_STATUS_DE_UID,
  isDhisConfigured,
  getDhisApiBaseUrl,
} from "../config/dhis";

const api = axios.create({
  baseURL: getDhisApiBaseUrl(),
  headers: {
    Authorization: `ApiToken ${DHIS_TOKEN}`,
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

/**
 * QR token format: {teiId}-{enrollmentId}-{eventId}
 * Example: cTfTf0c48sp-E5OwGq5IJOX-Kyd9YLH1A71
 */
export function parseQrToken(token) {
  if (!token || typeof token !== "string") {
    return { teiId: null, enrollmentId: null, eventId: null };
  }

  const parts = token.split("-");
  if (parts.length >= 3) {
    return {
      teiId: parts[0],
      enrollmentId: parts[1],
      eventId: parts.slice(2).join("-"),
    };
  }

  return {
    teiId: parts[0] || null,
    enrollmentId: null,
    eventId: null,
  };
}

/** @deprecated Use parseQrToken(token).teiId */
export function getTeiIdFromToken(token) {
  return parseQrToken(token).teiId;
}

function pickEvent(events) {
  if (!events?.length) return null;
  if (events.length === 1) return events[0];

  const withoutScanStatus = events.find((event) => {
    const value = event.dataValues?.find(
      (dv) => dv.dataElement === QR_SCAN_STATUS_DE_UID
    )?.value;
    return !value || value === "false";
  });

  return withoutScanStatus ?? events[0];
}

function getEventsFromResponse(data) {
  return data.instances ?? data.events ?? [];
}

function getDhisErrorMessage(error) {
  const status = error.response?.status;
  const url = error.config?.baseURL
    ? `${error.config.baseURL}${error.config.url ?? ""}`
    : null;

  if (status === 404) {
    return url
      ? `DHIS2 endpoint not found (404): ${url}. Check EXPO_PUBLIC_DHIS_BASE (use https://host/api).`
      : "DHIS2 endpoint not found (404). Check EXPO_PUBLIC_DHIS_BASE.";
  }

  const data = error.response?.data;
  if (!data) {
    return status
      ? `Request failed (${status})${url ? `: ${url}` : ""}`
      : error.message || "Request failed";
  }

  if (typeof data.message === "string") return data.message;

  const reports = data.validationReport?.errorReports;
  if (reports?.length) {
    return reports.map((r) => r.message).join("\n");
  }

  if (data.status === "ERROR" && data.message) return data.message;

  return JSON.stringify(data);
}

export async function getScanEvent(teiId) {
  const { data } = await api.get("/tracker/events", {
    params: {
      trackedEntity: teiId,
      program: PROGRAM_UID,
      programStage: PROGRAM_STAGE_UID,
      orgUnit: ORG_UNIT_UID,
      fields:
        "event,trackedEntity,enrollment,orgUnit,status,occurredAt,dataValues",
    },
  });

  const event = pickEvent(getEventsFromResponse(data));
  if (!event?.event) {
    throw new Error(
      "No QR scan event found for this traveler. Ensure the stage event exists in DHIS2."
    );
  }

  return event;
}

function normalizeEventRecord(data, fallbackEventId) {
  if (!data || typeof data !== "object") {
    return null;
  }

  // Nested: { event: { event: "uid", trackedEntity, ... } }
  if (data.event && typeof data.event === "object" && data.event.event) {
    return data.event;
  }

  // Flat: { event: "uid", trackedEntity, enrollment, ... }
  if (typeof data.event === "string" && (data.trackedEntity || data.enrollment)) {
    return data;
  }

  // Some responses use `uid` or only top-level fields
  if (data.trackedEntity || data.enrollment) {
    return {
      ...data,
      event: data.event ?? data.uid ?? fallbackEventId,
    };
  }

  return null;
}

export async function getScanEventById(eventId) {
  try {
    const { data } = await api.get(`/tracker/events/${eventId}`, {
      params: {
        fields:
          "event,trackedEntity,enrollment,orgUnit,status,occurredAt,dataValues",
      },
    });

    const record = normalizeEventRecord(data, eventId);
    if (record) {
      return record;
    }
  } catch (error) {
    if (error.response?.status !== 404) {
      throw error;
    }
  }

  // Fallback for servers where single-event GET is unavailable
  const { data } = await api.get("/events/" + eventId, {
    params: {
      fields:
        "event,trackedEntity,enrollment,orgUnit,status,occurredAt,dataValues",
    },
  });

  const record = normalizeEventRecord(data, eventId);
  if (!record) {
    throw new Error("Scan event not found in DHIS2.");
  }

  return record;
}

function eventFromTokenParts({ teiId, enrollmentId, eventId }) {
  if (!teiId || !enrollmentId || !eventId) {
    return null;
  }

  return {
    event: eventId,
    trackedEntity: teiId,
    enrollment: enrollmentId,
    orgUnit: ORG_UNIT_UID,
  };
}

export async function resolveScanEvent(qrData) {
  const tokenParts = parseQrToken(qrData.token);
  const { teiId, enrollmentId, eventId } = tokenParts;

  if (teiId && enrollmentId && eventId) {
    try {
      const event = await getScanEventById(eventId);

      if (event.trackedEntity && event.trackedEntity !== teiId) {
        throw new Error("QR token does not match traveler record in DHIS2.");
      }

      if (event.enrollment && event.enrollment !== enrollmentId) {
        throw new Error("QR token does not match enrollment in DHIS2.");
      }

      return event;
    } catch (error) {
      const canFallback =
        error.message === "Scan event not found in DHIS2." ||
        error.response?.status === 404;

      if (!canFallback) {
        throw error;
      }

      // Trust QR token parts when DHIS single-event lookup fails
      return eventFromTokenParts(tokenParts);
    }
  }

  if (eventId) {
    return getScanEventById(eventId);
  }

  if (!teiId) {
    throw new Error("QR code is missing a valid token.");
  }

  return getScanEvent(teiId);
}

export async function setQrScanStatusYes(eventRecord) {
  const {
    event: eventUid,
    trackedEntity,
    enrollment,
    orgUnit = ORG_UNIT_UID,
    occurredAt,
  } = eventRecord;

  if (!trackedEntity || !enrollment) {
    throw new Error(
      "Event is missing tracked entity or enrollment. Cannot update scan status."
    );
  }

  const payload = {
    events: [
      {
        event: eventUid,
        trackedEntity,
        enrollment,
        program: PROGRAM_UID,
        programStage: PROGRAM_STAGE_UID,
        orgUnit,
        occurredAt:
          occurredAt?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
        status: "COMPLETED",
        dataValues: [
          {
            dataElement: QR_SCAN_STATUS_DE_UID,
            value: "true",
          },
        ],
      },
    ],
  };

  const { data } = await api.post("/tracker?async=false", payload);

  if (data.status === "ERROR") {
    throw new Error(getDhisErrorMessage({ response: { data } }));
  }

  const errorReports = data.validationReport?.errorReports;
  if (errorReports?.length) {
    throw new Error(errorReports.map((r) => r.message).join("\n"));
  }

  return data;
}

export async function markTravelerScanned(qrData) {
  if (!isDhisConfigured()) {
    throw new Error(
      "DHIS2 is not configured. Set EXPO_PUBLIC_DHIS_* values in .env or app.json extra.dhis."
    );
  }

  if (!qrData.token) {
    throw new Error("QR code is missing token.");
  }

  const eventRecord = await resolveScanEvent(qrData);
  return setQrScanStatusYes(eventRecord);
}

export { getDhisErrorMessage };
