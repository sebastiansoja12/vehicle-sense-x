[Polski](2026-11-26-automotive-services.md) | [English](2026-11-26-automotive-services.en.md) | [Deutsch](2026-11-26-automotive-services.de.md)

# Workshops and part prices — verification

Implemented and wired workshop and part-offer screens, validated cancellable client, authenticated server routes and official provider adapters. Configuration and token remain in session memory. No garage migration or dependencies. Worked in the existing checkout and branch as instructed without more questions; preserved unrelated concurrent changes.

Results: 231 tests passed, zero failures. New tests cover 7 client and 7 server cases. Types, lint, documentation and diff checks passed. Web export and iOS/Android Hermes bundles succeeded. These are not signed installable APK/IPA artifacts.

```sh
node --test tests.mjs tests/*.test.mjs mobile/tests/*.test.mjs server/*.test.mjs
npm run typecheck --prefix mobile
npm run lint --prefix mobile
python3 scripts/check-docs.py
npm run export:web --prefix mobile
npm run export:native --prefix mobile -- --output-dir /tmp/vehiclesensex-native-final
git diff --check
```

Code review found search remaining busy after returning from settings and an overly small Overpass execution-memory limit. Fixed busy state on refocus and removed the query memory limit while retaining response-byte bounds. Car/configuration changes recreate the screen context and cancel old requests.

Verified the actual local browser UI and 390×844 viewport using controlled provider transport: setup, consent, town search, location selection, workshop phone/directions, two offers in different currencies, unknown shipping, known shipping total, manual cancellation and leaving an active request via settings. Returning restored enabled inputs and search, without late results. Fixture data existed only in a temporary local test process.

No live-provider verification: automatic approval review rejected the OSM probe because it would transmit specific test coordinates. The restriction was not bypassed. No private server configuration or production eBay credentials are present locally. Live prices require an account and Browse API access. GPS, OBD and radio need physical device testing. No public deployment. Setup: [services](../../mobile/SERVICES.en.md).
