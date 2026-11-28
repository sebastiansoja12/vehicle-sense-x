[Polski](2026-11-28-live-session-reports.md) | [English](2026-11-28-live-session-reports.en.md) | [Deutsch](2026-11-28-live-session-reports.de.md)

# Live Data session reports — verification

JSON observations and a PDF/HTML summary were added alongside existing CSV. Every format checks vehicle, adapter and ECU scope, the 300-cycle limit, scaling, values and chronology. JSON preserves pauses; statistics distinguish no response from no recorded sample.

After review fixes, all 384 tests in the local main workspace passed, including 13 new report and interface tests. This count includes preserved uncommitted changes in other modules. Types, lint, PL/EN/DE documentation and web and iOS/Android Hermes exports pass.

Independent review found CSV bypassing validation and observation timestamps moving backward. Both issues were reproduced RED and fixed GREEN. CSV validation runs in the shared serializer before file sharing. A test confirms session JSON is not a full reading backup authorizing DTC clearing.

No OBD commands, native dependencies, session import or garage schema changes were added. Physical adapter/phone behavior and native PDF appearance and sharing were not verified. Existing dd64fcd native packages do not contain this later source change.

```sh
node --test tests.mjs tests/*.test.mjs mobile/tests/*.test.mjs server/*.test.mjs
npm run typecheck --prefix mobile
npm run lint --prefix mobile
python3 scripts/check-docs.py
npm run export:web --prefix mobile
npm run export:native --prefix mobile
```

[Guide](../../mobile/LIVE-DATA-REPORTS.en.md) · [Specification](../superpowers/specs/2026-11-28-live-session-reports.en.md) · [Plan](../superpowers/plans/2026-11-28-live-session-reports.en.md)
