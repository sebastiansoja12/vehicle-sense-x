[Polski](2026-11-27-diagnostic-comparison.md) | [English](2026-11-27-diagnostic-comparison.en.md) | [Deutsch](2026-11-27-diagnostic-comparison.de.md)

# Diagnostic comparison — verification

Added local comparison of two saved readings and a workshop report. No schema changes, dependencies or adapter commands. Deltas require matching ECU/protocol; missing DTC status remains unknown and null never becomes zero. Symptoms exist only in screen memory and the chosen export.

Eight new tests passed. Full repository tests, types, lint, documentation and diff checks were run using the commands below. Web and iOS/Android Hermes exports succeeded; these are not new signed installers. Independent review found no actionable bugs.

```sh
node --test tests.mjs tests/*.test.mjs mobile/tests/*.test.mjs server/*.test.mjs
npm run typecheck --prefix mobile
npm run lint --prefix mobile
python3 scripts/check-docs.py
npm run export:web --prefix mobile -- --output-dir /tmp/vehiclesensex-diagnostic-web
npm run export:native --prefix mobile -- --output-dir /tmp/vehiclesensex-diagnostic-native
git diff --check
```

Verified the actual no-car page. Browser tooling stalled in the test-file chooser; user data was not changed. Further verification used a temporary /tmp app copy with identical screen code and only the web storage boundary replaced by synthetic in-memory data. Fixture: two test cars and 26 readings.

Confirmed: default pair skipping a newer other-ECU reading; per-status DTC entries; unread status; actual zero and no delta for null; no changes for different/unknown ECU; 24-reading pagination in groups of 20; symptom entry and HTML export invocation without errors; car change clearing symptoms. Checked 390 px layout. No preview console errors.

No physical measurements, native share-sheet or phone PDF print testing. Differences do not prove repair effectiveness. Guide: [comparison](../../mobile/DIAGNOSTIC-COMPARISON.en.md).
