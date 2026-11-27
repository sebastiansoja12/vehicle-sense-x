[Polski](2026-11-27-diagnostic-cockpit.md) | [English](2026-11-27-diagnostic-cockpit.en.md) | [Deutsch](2026-11-27-diagnostic-cockpit.de.md)

# Diagnostic cockpit and car display

Animated cockpit for phones/tablets and standalone Android radios: active vehicle, owner-provided photo, four real parameters, source/time, ECU scope and code statuses. Bars animate measurement changes only and respect reduced motion. Missing photos never become another car. An embedded diagnostic view keeps the connection; a separate route displays saved readings. Missing or stale data never becomes zero or Live.

The native CarPlay view uses a system list, the actual vehicle photo and saved diagnostics with time/scope. It does not mimic the animated cockpit and refreshes UI no more often than every 10 seconds. Data excluding VIN/plates/notes stays only in process memory; a restart requires synchronization with the open app. Scene/entitlement configuration is opt-in and disabled until Apple approval. No diagnostic category in Android Auto means not declaring the app as navigation, media or IoT. The full cockpit remains app UI, not Android Auto projection.

Test first: vehicle/ECU isolation, freshness/provenance, missing data, real photo, identifier-free payload and explicit plugin opt-in. Then model, cockpit, embedding, CarPlay scene and sync. Verify complete suite, types, lint, documentation, CNG configuration, exports and UI. Missing Xcode/Android SDK and Apple approval limit native tests and publishing; do not describe source code as running on a radio.

## Verification results

Complete suite: 273 tests passed, including 10 tests for the cockpit model, native bridge and CarPlay configuration. Types, lint, documentation checks and web/iOS/Android JS exports passed. Apple autolinking detects the local radio module. Configuration was checked with the plugin disabled, enabled and disabled again, preserving phone scenes and other CarPlay scenes.

Web preview: empty garage, test vehicle creation, Garage-to-cockpit navigation, missing measurements as dashes, 390 × 844 and 1280 × 800 layouts, return to Diagnostics and preserved adapter error inside the embedded cockpit. Test data stayed in a separate local preview. Code review found hidden errors, leftover configuration after disabling and stale-cache risk; fixed the alert and configuration removal, and replaced the cache with process memory.

No Swift/Kotlin compilation, device test, CarPlay simulator or radio test, or Apple approval. JS exports and autolinking do not verify these steps. [Cockpit instructions](../../../mobile/COCKPIT.en.md)

## Continuation: session controls in the cockpit

Goal: read, select ECU, save a report, connect and disconnect without leaving the cockpit. Reuse existing Diagnostics actions and its operation lock, with no second transport. Profile configuration still opens the existing form. Saving uses the full report, not later Live samples.

The chart keeps up to 60 actual samples in the last captured window of at most 5 minutes in memory. Data must match vehicle, adapter, ECU and current full reading; duplicate, future and older responses are ignored. Missing parameters and gaps over 15 seconds break the line. Metric selection shows the observed value range and time. A new full reading or ECU selection starts a new chart. No new drivers, Android Auto categories or entitlement changes.

Order: isolation and geometry tests, sample model, SVG chart with the existing library, cockpit actions, documentation and types/lint/tests/exports plus preview. Also check busy-adapter controls and missing data.

Continuation verified: 283 complete-suite tests passed; 5 new chart tests cover limits, duplicates, isolation, missing data, gaps, constant values and a full report with emissions readiness. Types, lint, documentation and web/iOS/Android JS exports passed. Phone preview confirmed connect/configure controls, a visible connection error, disabled reading/Live/save without a session, metric selection and return to configuration. Review clarified the paused captured-window wording; the metric label also identifies selection. Chart operation with a real adapter and native compilation remain untested. At the user’s request a local main branch was created with all uncommitted changes preserved.
