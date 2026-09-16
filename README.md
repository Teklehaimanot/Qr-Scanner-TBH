# TBH QR Scanner

Internal Expo app for scanning traveller declaration QR codes. The app sends the complete `TRV1:` payload to the traveller backend. The backend verifies the Ed25519 signature and expiry, updates the DHIS2 scan status, and returns the traveller name, arrival date, and current risk classification.

The app does not contain the DHIS2 API token or either QR signing key.

## Configuration

Copy `.env.example` to `.env` and set:

```env
EXPO_PUBLIC_BACKEND_URL=https://your-traveller-api.example.org
EXPO_PUBLIC_DHIS_WEB_BASE=https://your-dhis2-server.org
EXPO_PUBLIC_DHIS_ORG_UNIT_UID=your-org-unit-id
```

Only `EXPO_PUBLIC_BACKEND_URL` is required. The DHIS2 values enable the optional “Open event in DHIS2” button.

For a physical phone during local development, use the computer's LAN address instead of `localhost`, for example `http://192.168.1.20:3000`.

## Run

```bash
npm install
npm start
```

See `EAS_ENV.md` for APK build configuration.
