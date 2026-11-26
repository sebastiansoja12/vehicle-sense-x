[Polski](2026-11-26-native-builds.md) | [English](2026-11-26-native-builds.en.md) | [Deutsch](2026-11-26-native-builds.de.md)

# Native compatibility and build plan

The user authorized continued implementation, Android/iOS builds, further commits and pushing them to GitHub; commit messages must be one English sentence without co-authorship information. Preserve the Expo 58/RN 0.88 app and real ELM transports. README and documentation must be available in Polish, English and German.

- [x] Local tool and access check: no full Xcode or Android SDK; an existing personal Expo account has a free build allowance. The configured GitHub origin was empty.
- [x] Independent native-code reviews: RN interop remains available; Directory is not compilation evidence. RN0.88.1 supplies the TCP namespace, so no TCP patch is needed. The Android compiler confirmed the missing BuildConfig in Classic.
- [x] Baseline verification (135 tests, types/lint), commit on codex/native-build-compat, without IDE settings or credentials.
- [x] Allowlisted archive, credential-free validation profiles and linked Expo project; content inspection before upload (101 files before the Classic plugin, 102 afterward).
- [x] Actual cloud Android Release APK and iOS Release simulator builds, diagnosis of the Classic error, a reproducible CNG plugin fix and subsequent compiler success. No manual changes to generated projects.
- [x] The production Android AAB was built after explicit consent to a new key in Expo; signature, manifest, Bundletool and library alignment were verified.
- [ ] A store IPA is blocked by the absence of an active Apple Developer account; do not publish or commit to new charges.
- [x] Repeated prebuild, tests, types/lint, archive and downloaded artifact checks; independent review of the fix, further commits/push. The resulting AAB was also checked.
- [x] All Markdown documents in three languages, language switches and a documentation index, command parity and link checks; AGENTS.md instructions and machine-structured reports retain source syntax.

Compilation, signing and hardware tests provide separate evidence. A simulator build is not a store IPA, interop is not a TurboModules rewrite, and the Directory warning is not suppressed to obtain a green result. Details: [build report](../../verification/2026-11-26-native-builds.en.md).
