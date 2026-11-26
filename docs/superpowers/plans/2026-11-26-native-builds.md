# Native compatibility and build plan

User authorizes continued implementation, native Android/iOS builds, incremental commits and GitHub pushes; use one-sentence English commit messages without co-author trailers. Retain the current Expo58/RN0.88 app and actual ELM transports.

- [x] Inspect local toolchains and existing service access: no full Xcode or Android SDK locally; existing authenticated personal Expo account has free build quota. GitHub origin is configured and empty.
- [x] Independent read-only native source audits: RN interop APIs remain available; Directory metadata is not compilation proof. The initial TCP namespace concern is handled by RN0.88.1's app-wide namespace fallback; no TCP patch is needed. Classic references BuildConfig without enabling it, confirmed by the first Android compiler run. Other old DSL concerns remain hypotheses until build output.
- [x] Verify baseline (135 tests, types/lint) and commit it on codex/native-build-compat, excluding IDE/local settings and credentials.
- [x] Prepare archive allowlist and credential-free native validation profiles; associate the Expo project on the currently authenticated personal account and inspect archive before upload (101 mobile-only files, approximately 1.5 MB before the Classic config plugin).
- [ ] Run native Android and iOS simulator cloud builds on the available free quota; retain real compiler logs and fix confirmed incompatibilities with reproducible package patches.
- [ ] Build Android store artifact and prepare iOS store signing path; no publication or new billing commitment. Stop only at concrete unavailable credentials/service limits, while finishing independent work.
- [ ] Verify patch reproduction, regression tests, type/lint, archive scope and build results; independently review native changes and commit/push each verified increment.

Compilation, signing and hardware runtime checks are distinct evidence. A simulator build is not an App Store IPA, interop is not a TurboModule rewrite, and a Directory warning is not removed to manufacture a green check.
