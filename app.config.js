require("dotenv").config();

const DHIS_ENV_KEYS = [
  "EXPO_PUBLIC_BACKEND_URL",
  "EXPO_PUBLIC_DHIS_WEB_BASE",
  "EXPO_PUBLIC_DHIS_ORG_UNIT_UID",
];

function buildDhisExtra() {
  const dhis = {};
  for (const key of DHIS_ENV_KEYS) {
    dhis[key] = process.env[key] ?? "";
  }
  return dhis;
}

module.exports = {
  name: "TBH QR Scanner",
  slug: "qr-scanner",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  newArchEnabled: true,
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#065E6A",
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.teklehaimanot.qrscanner",
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    edgeToEdgeEnabled: true,
    package: "com.teklehaimanot.qrscanner",
    permissions: ["android.permission.CAMERA"],
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  plugins: [
    [
      "expo-camera",
      {
        cameraPermission: "Allow $(PRODUCT_NAME) to access your camera for QR scanning.",
      },
    ],
  ],
  extra: {
    eas: {
      projectId: "ad8bf673-eb89-4cd1-b71f-04a3c3485ba9",
    },
    dhis: buildDhisExtra(),
  },
  runtimeVersion: {
    policy: "appVersion",
  },
  updates: {
    url: "https://u.expo.dev/ad8bf673-eb89-4cd1-b71f-04a3c3485ba9",
  },
};
