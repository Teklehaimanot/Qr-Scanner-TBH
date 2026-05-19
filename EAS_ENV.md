# EAS build setup

`eas.json` is **not** in git. Keep your real file locally (with DHIS URLs/UIDs).

## First time

```bash
cp eas.json.example eas.json
# Edit eas.json with your DHIS UIDs and base URL
cp .env.example .env
# Edit .env — include EXPO_PUBLIC_DHIS_TOKEN (never commit .env)
```

Put the **API token only** in `.env`, not in `eas.json`.

## Build APK

```bash
eas build --platform android --profile preview
```

Local `.env` is uploaded for the token (see `.easignore`). `eas.json` `env` supplies the other `EXPO_PUBLIC_DHIS_*` values at build time.

## If `eas.json` was already committed

```bash
git rm --cached eas.json
git commit -m "Stop tracking eas.json"
```

Your local `eas.json` stays on disk.
