[Polski](2026-11-27-market-gaps.md) | [English](2026-11-27-market-gaps.en.md) | [Deutsch](2026-11-27-market-gaps.de.md)

# Market and new features — verification

Added OBD emission readiness and a local audit of existing vehicle data. The audit selects comparable readings before/after the service day; it does not establish repair success or history authenticity. Eight-product analysis and integration limits: [market research](../research/2026-11-27-market-and-feasibility.en.md). Usage: [guide](../../mobile/VEHICLE-EVIDENCE.en.md).

Seven readiness and nine audit tests cover spark/compression monitors, zero counters, missing data, malformed frames, timeout, CAN scope, backups/reports, clear protection, different vehicles/ECUs, future dates, entry chronology and service pairing. Independent review found future-dated readings treated as available readiness evidence; a regression test and classification fix were added. Controlled-transport tests do not replace hardware.

The full suite passed 273/273. Type checking and lint passed. Web and Android/iOS Hermes exports succeeded. These are exported bundles, not signed installers. Checks used the commands below.

```sh
node --test tests.mjs tests/*.test.mjs mobile/tests/*.test.mjs server/*.test.mjs
npm run typecheck --prefix mobile
npm run lint --prefix mobile
python3 scripts/check-docs.py
npm run export:web --prefix mobile -- --output-dir /tmp/vehiclesensex-market-web
npm run export:native --prefix mobile -- --output-dir /tmp/vehiclesensex-market-native
git diff --check
```

UI verification used a temporary app copy with identical screens and synthetic in-memory web storage. User data was untouched. At 390 px, verified limited diagnostic scope, entered mileage dropping 9000 → 8500 km, a pre/post-service pair, navigation to the exact reading IDs and completed/incomplete/unsupported monitors. MIL, zero warm-ups and distance since clearing were visible. No console errors.

No physical vehicle measurement or adapter/phone test was performed. Live part prices require production API configuration; search alone does not establish fitment or bookings. Worldwide uniqueness of the proposed differentiator was not established.
