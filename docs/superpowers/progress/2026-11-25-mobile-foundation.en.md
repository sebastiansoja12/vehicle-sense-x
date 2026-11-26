[Polski](2026-11-25-mobile-foundation.md) | [English](2026-11-25-mobile-foundation.en.md) | [Deutsch](2026-11-25-mobile-foundation.de.md)

# SDD ledger — plan: docs/superpowers/plans/2026-11-25-mobile-foundation.md

- Ruling: Implement in `mobile/` inside the current unborn repository. No prior commit exists to create an isolated worktree; preserving the running approved prototype takes priority over creating history solely for tooling. Cost: no git commit range for review; reviewer receives exact new file paths.
- Ruling: User already approved the visual design and requested implementation. Existing README and the eight-module brief define the authorized scope; the new spec records implementation decisions without requesting approval again. Cost: stack remains implementer's choice and can be replaced before any store release.
- Builder check: fresh reviewer found no implementation-blocking contradictions or missing product decisions.
- Pre-flight: model interfaces are shared by persistence and screens; `vehicleId`, integer cents/ml and nullable consumption are consistent.
- Ruling: Generated Expo AGENTS.md requires Expo Router. Use documented file routes under `mobile/src/app/`, not a custom state-based navigator. Cost: additional SDK-compatible routing dependencies.
- Task 1: complete. RED: 11 tests fail before implementation; GREEN: 11/11 `node --test mobile/tests/domain.test.mjs`.
- Ruling: Use explicit Node 24 path for elevated npm/Expo commands. Elevated shell otherwise resolves Node 20, below SDK 58 engine minimum. No system Node installation changed.

- Task 2: complete. Repository tests RED before implementation, then GREEN. Persistence rejection preserves stored and committed state; corrupted state is not reset.
- Final review: fresh reviewer identified three Important data-integrity issues. No Critical or Minor findings.
- Final: fixed stale-tab overwrite and newer-schema overwrite — three repository regression tests RED→GREEN; Web Locks serialize web mutations, which read the latest validated document inside the lock.
- Final: fixed stored fuel chronology — calendar-order mileage regression test RED→GREEN.
- Final: fixed second-car form inheriting the active-car odometer — browser reproduced 68450 instead of blank before the fix; blank mileage verified after reloading the corrected provider.
- Task 3: complete. Browser verified first vehicle, Polish-decimal tanking (262.85 PLN), service (250.99 PLN), reload total (513.84 PLN), second car at 5000 km and zero independent costs. Demo exit returned the empty own garage before disposable QA entries were added.
- Ruling: Disposable browser QA ran on 127.0.0.1:8081; clean preview is delivered on 127.0.0.1:8083 because localhost:8081 points to another existing service. Cost: use the exact preview URL. No other service was changed. Owned QA server stopped after verification.
- Ruling: Physical iOS testing is unavailable: xcodebuild reports Command Line Tools without Xcode. JS/Hermes bundles are verified; signed builds and physical-device keyboard/back behavior remain unverified.
- Final verification: 23/23 tests (19 mobile + 4 prototype), TypeScript, ESLint without errors or warnings, web export, and iOS/Android Hermes bundle exports. No store submission, Git push or merge. Implementation remains uncommitted in the current checkout; original prototype retained.
- Deferred minors: none from independent review. Missing editing/deletion, backup export and hardware integrations are documented scope limits.
