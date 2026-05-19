require("dotenv").config();

const appJson = require("./app.json");

const DHIS_ENV_KEYS = [
  "EXPO_PUBLIC_DHIS_BASE",
  "EXPO_PUBLIC_DHIS_TOKEN",
  "EXPO_PUBLIC_DHIS_PROGRAM_UID",
  "EXPO_PUBLIC_DHIS_PROGRAM_STAGE_UID",
  "EXPO_PUBLIC_DHIS_ORG_UNIT_UID",
  "EXPO_PUBLIC_DHIS_QR_SCAN_STATUS_DE_UID",
];

function buildDhisExtra() {
  const dhis = {};
  for (const key of DHIS_ENV_KEYS) {
    dhis[key] = process.env[key] ?? "";
  }
  return dhis;
}

module.exports = () => ({
  ...appJson.expo,
  extra: {
    ...appJson.expo.extra,
    dhis: buildDhisExtra(),
  },
});
