# EAS build setup

`eas.json` is **not** in git. Keep your real file locally with the backend URL and optional DHIS2 Capture URL.

## First time

```bash
cp eas.json.example eas.json
# Edit eas.json with your backend URL
cp .env.example .env
# Edit .env with the same environment-specific values
```

The scanner no longer contains a DHIS2 API token. It sends the complete signed QR payload to the traveller backend, which verifies it and performs the DHIS2 update.

## Build APK

```bash
eas build --platform android --profile preview
```

`eas.json` `env` supplies `EXPO_PUBLIC_BACKEND_URL` and the optional DHIS2 Capture link settings at build time.

## If `eas.json` was already committed

```bash
git rm --cached eas.json
git commit -m "Stop tracking eas.json"
```

Your local `eas.json` stays on disk.
