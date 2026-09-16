import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Alert,
  ActivityIndicator,
  Pressable,
  Linking,
} from "react-native";
import { CameraView, Camera } from "expo-camera";
import {
  getScanErrorMessage,
  scanTravelerQr,
} from "../services/tracker";
import { getDhisEnrollmentEventUrl } from "../config/dhis";

const BRAND = "#065E6A";
const FRAME_SIZE = 260;
const ARRIVAL_WARNING_BG = "#C5221F";

function toLocalIsoDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Arrival today or yesterday is OK; older than 1 day is too old. */
function isArrivalDateTooOld(arrivalDate) {
  if (!arrivalDate) return false;
  const arrival = String(arrivalDate).slice(0, 10);
  const yesterday = new Date();
  yesterday.setHours(0, 0, 0, 0);
  yesterday.setDate(yesterday.getDate() - 1);
  return arrival < toLocalIsoDate(yesterday);
}

const STATUS_CONFIG = {
  RED: {
    backgroundColor: "#D93025",
    title: "High risk",
    subtitle: "Health status flag: RED",
  },
  YELLOW: {
    backgroundColor: "#E37400",
    title: "Moderate risk",
    subtitle: "Health status flag: YELLOW",
  },
  GREEN: {
    backgroundColor: "#34A853",
    title: "Low risk",
    subtitle: "Health status flag: GREEN",
  },
  UNKNOWN: {
    backgroundColor: "#5F6368",
    title: "Unknown status",
    subtitle: "Classification not recognized",
  },
  ERROR: {
    backgroundColor: "#1A1A1A",
    title: "Scan failed",
    subtitle: "Could not complete scan or sync",
  },
};

function QrScanner() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [travelerInfo, setTravelerInfo] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleBarCodeScanned = async (result) => {
    if (scanned || loading) return;

    setScanned(true);
    setLoading(true);
    setTravelerInfo(null);

    try {
      const data = await scanTravelerQr(result.data);
      const classification = data.classification
        ? String(data.classification).toUpperCase()
        : "UNKNOWN";

      setTravelerInfo({
        firstName: data.firstName,
        lastName: data.lastName,
        middleName: data.middleName,
        arrivalDate: data.arrivalDate || null,
        teiId: data.teiId,
        eventId: data.eventId,
      });

      if (["RED", "YELLOW", "GREEN"].includes(classification)) {
        setScanResult(classification);
      } else {
        setScanResult("UNKNOWN");
      }
    } catch (error) {
      Alert.alert("Scan failed", getScanErrorMessage(error));
      setScanResult("ERROR");
      console.error("Scan/sync error:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetScan = () => {
    setScanned(false);
    setScanResult(null);
    setTravelerInfo(null);
    setLoading(false);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.permissionScreen}>
        <ActivityIndicator size="large" color={BRAND} />
        <Text style={styles.permissionTitle}>Preparing camera</Text>
        <Text style={styles.permissionText}>Requesting permission…</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.permissionScreen}>
        <View style={styles.permissionIcon}>
          <Text style={styles.permissionIconText}>!</Text>
        </View>
        <Text style={styles.permissionTitle}>Camera access required</Text>
        <Text style={styles.permissionText}>
          Allow camera access in your device settings to scan traveler QR codes.
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.settingsButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => Linking.openSettings()}
        >
          <Text style={styles.settingsButtonText}>Open Settings</Text>
        </Pressable>
      </View>
    );
  }

  if (scanResult) {
    return (
      <ResultScreen
        scanResult={scanResult}
        travelerInfo={travelerInfo}
        onScanAgain={resetScan}
      />
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScanningSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      <View style={styles.cameraOverlay} pointerEvents="none">
        <View style={styles.topBar}>
          <Text style={styles.topBarTitle}>Scan traveler QR code</Text>
          <Text style={styles.topBarHint}>
            Align the code inside the frame below
          </Text>
        </View>

        <View style={styles.frameContainer}>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
        </View>

        <View style={styles.bottomBar}>
          <Text style={styles.bottomBarText}>
            Status will sync to DHIS2 after a successful scan
          </Text>
        </View>
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={BRAND} />
            <Text style={styles.loadingTitle}>Verifying QR code</Text>
            <Text style={styles.loadingText}>Checking status securely…</Text>
          </View>
        </View>
      )}
    </View>
  );
}

function ResultScreen({ scanResult, travelerInfo, onScanAgain }) {
  const config = STATUS_CONFIG[scanResult] ?? STATUS_CONFIG.UNKNOWN;
  const travelerName = travelerInfo
    ? [travelerInfo.firstName, travelerInfo.middleName, travelerInfo.lastName]
        .filter(Boolean)
        .join(" ")
    : null;

  const arrivalTooOld =
    scanResult !== "ERROR" && isArrivalDateTooOld(travelerInfo?.arrivalDate);

  const showSynced = scanResult !== "ERROR" && !arrivalTooOld;
  const captureUrl = travelerInfo?.eventId
    ? getDhisEnrollmentEventUrl(travelerInfo.eventId)
    : null;

  const openDhisCapture = async () => {
    if (!captureUrl) {
      Alert.alert(
        "Unable to open",
        "DHIS2 event link is not available for this scan."
      );
      return;
    }

    try {
      await Linking.openURL(captureUrl);
    } catch {
      Alert.alert(
        "Unable to open",
        "Could not open DHIS2 in the browser. Check your connection."
      );
    }
  };

  if (arrivalTooOld) {
    return (
      <View
        style={[styles.resultScreen, { backgroundColor: ARRIVAL_WARNING_BG }]}
      >
        <View style={styles.resultCard}>
          <View style={[styles.statusBadge, styles.statusBadgeMuted]}>
            <Text style={styles.statusBadgeText}>EXPIRED</Text>
          </View>

          <Text style={styles.resultTitle}>Arrival date has passed</Text>
          <Text style={styles.resultSubtitle}>
            This declaration is more than 1 day past the arrival date and is no
            longer valid for screening.
          </Text>

          <View style={styles.travelerCard}>
            <Text style={styles.travelerLabel}>Arrival date</Text>
            <Text style={styles.arrivalDate}>{travelerInfo.arrivalDate}</Text>
            {travelerName ? (
              <>
                <Text style={[styles.travelerLabel, styles.arrivalLabel]}>
                  Traveler
                </Text>
                <Text style={styles.travelerName}>{travelerName}</Text>
              </>
            ) : null}
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.scanAgainButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={onScanAgain}
        >
          <Text style={styles.scanAgainButtonText}>Scan again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View
      style={[styles.resultScreen, { backgroundColor: config.backgroundColor }]}
    >
      <View style={styles.resultCard}>
        <View
          style={[
            styles.statusBadge,
            (scanResult === "ERROR" || scanResult === "UNKNOWN") &&
              styles.statusBadgeMuted,
          ]}
        >
          <Text style={styles.statusBadgeText}>{scanResult}</Text>
        </View>

        <Text style={styles.resultTitle}>{config.title}</Text>
        <Text style={styles.resultSubtitle}>{config.subtitle}</Text>

        {showSynced && (
          <View style={styles.syncedBanner}>
            <Text style={styles.syncedBannerText}>
              QR scan status synced to DHIS2
            </Text>
          </View>
        )}

        {travelerName ? (
          <View style={styles.travelerCard}>
            <Text style={styles.travelerLabel}>Traveler</Text>
            <Text style={styles.travelerName}>{travelerName}</Text>
            {travelerInfo?.arrivalDate ? (
              <>
                <Text style={[styles.travelerLabel, styles.arrivalLabel]}>
                  Arrival date
                </Text>
                <Text style={styles.arrivalDate}>{travelerInfo.arrivalDate}</Text>
              </>
            ) : null}
          </View>
        ) : travelerInfo?.arrivalDate ? (
          <View style={styles.travelerCard}>
            <Text style={styles.travelerLabel}>Arrival date</Text>
            <Text style={styles.arrivalDate}>{travelerInfo.arrivalDate}</Text>
          </View>
        ) : null}
      </View>

      {showSynced && captureUrl ? (
        <Pressable
          style={({ pressed }) => [
            styles.dhisLinkButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={openDhisCapture}
        >
          <Text style={styles.dhisLinkButtonText}>Open event in DHIS2</Text>
          <Text style={styles.dhisLinkButtonHint}>Enrollment event in Capture</Text>
        </Pressable>
      ) : null}

      <Pressable
        style={({ pressed }) => [
          styles.scanAgainButton,
          pressed && styles.buttonPressed,
        ]}
        onPress={onScanAgain}
      >
        <Text style={styles.scanAgainButtonText}>Scan again</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
  },
  topBar: {
    backgroundColor: "rgba(6, 94, 106, 0.92)",
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  topBarTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  topBarHint: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    marginTop: 6,
    textAlign: "center",
  },
  frameContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scanFrame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 36,
    height: 36,
    borderColor: "#fff",
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  bottomBar: {
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  bottomBarText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 36,
    alignItems: "center",
    width: "100%",
    maxWidth: 320,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: BRAND,
    marginTop: 16,
  },
  loadingText: {
    fontSize: 14,
    color: "#666",
    marginTop: 6,
  },
  permissionScreen: {
    flex: 1,
    backgroundColor: "#F4F6F8",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  permissionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: BRAND,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  permissionIconText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "700",
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
    textAlign: "center",
    marginBottom: 10,
  },
  permissionText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  settingsButton: {
    backgroundColor: BRAND,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  settingsButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  resultScreen: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  resultCard: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 20,
    padding: 28,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  statusBadge: {
    minWidth: 88,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: BRAND,
    marginBottom: 16,
  },
  statusBadgeMuted: {
    backgroundColor: "#5F6368",
  },
  statusBadgeText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 1,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#222",
    textAlign: "center",
  },
  resultSubtitle: {
    fontSize: 15,
    color: "#555",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },
  syncedBanner: {
    marginTop: 20,
    backgroundColor: "#E8F4F6",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#D0E8EC",
  },
  syncedBannerText: {
    fontSize: 14,
    color: BRAND,
    fontWeight: "600",
    textAlign: "center",
  },
  travelerCard: {
    marginTop: 20,
    width: "100%",
    backgroundColor: "#F4F6F8",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
  },
  travelerLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  travelerName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#222",
    textAlign: "center",
  },
  arrivalLabel: {
    marginTop: 12,
  },
  arrivalDate: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
    textAlign: "center",
  },
  scanAgainButton: {
    marginTop: 14,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 48,
    minWidth: 200,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  scanAgainButtonText: {
    color: BRAND,
    fontSize: 17,
    fontWeight: "700",
  },
  dhisLinkButton: {
    marginTop: 28,
    backgroundColor: BRAND,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    minWidth: 240,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  dhisLinkButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  dhisLinkButtonHint: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    marginTop: 4,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});

export default QrScanner;
