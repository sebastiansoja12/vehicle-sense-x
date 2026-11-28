[Polski](2026-11-28-expanded-cockpit.md) | [English](2026-11-28-expanded-cockpit.en.md) | [Deutsch](2026-11-28-expanded-cockpit.de.md)

# Expanded diagnostic cockpit

Goal: animated car diagram, measurement gauges, VIN identification and selectable illustrative model photographs.

Architecture: existing Expo SDK 58, React Native Animated and react-native-svg. No new dependencies. Readings and vehicle identity have separate sources.

Measurement motion only for fresh Live; missing data, history and imports remain static. Respect reduced motion, focus loss and background state.

Owner photograph takes precedence. Commons search starts explicitly and sends only make/model/year; no VIN or registration. Users select photographs with author/license attribution.

Route /cockpit uses the existing OBD connection lifecycle; VIN reading preserves confirmation before saving.

Tests for data scope and the photo client first; then implementation, TypeScript/lint, full tests, exports and 320/390/1440 px browser review.

OBD hardware, physical devices and photograph generation matching require separate verification.

`mobile/src/DiagnosticCockpit.tsx`, `mobile/src/CockpitVehicle.tsx`, `mobile/src/CockpitIdentity.tsx`, `mobile/src/vehicle-images.ts`, `mobile/src/cockpit.ts`, `mobile/src/obd/DiagnosticsScreen.tsx`, `mobile/src/app/cockpit.tsx`.

Verification: tests cover VIN confirmation in the direct cockpit, photo replacement after failure, report scope and the Commons client (abort, limits, sources and current CDN). Commons selections preview this session; persistent owner photographs are added in Garage.

`mobile/src/CockpitDetails.tsx`, `mobile/tests/cockpit.test.mjs`, `mobile/tests/cockpit-ui.test.mjs`, `mobile/tests/vehicle-images.test.mjs`, `mobile/tests/obd-screen.test.mjs`.

Final result: 383 tests passed; TypeScript, lint and documentation checks passed. JavaScript exports for web/iOS/Android were rebuilt with the bundler cache cleared. Browser checks covered 320/390/1440 px layouts, animation preview start/stop, system selection and restricting OBD connections to the native app. The real Commons client returned model photographs with authors and licenses.
