[Polski](2026-11-27-radio-projection.md) | [English](2026-11-27-radio-projection.en.md) | [Deutsch](2026-11-27-radio-projection.de.md)

# Adapter-free radio plan

Goal: extend Bluetooth audio without OBD2: inspect real audio outputs, read a local vehicle summary and configure radio connectivity. The user requested execution without questions.

Limits: Bluetooth alone does not add CarPlay/Android Auto to a radio. VehicleSenseX projection is not currently implemented: CarPlay requires an entitlement, provisioning and native templates; Android Auto requires a matching category and native UI. Android Car Hardware API exposes selected data only on a compatible host with permissions, without universal DTC/CAN access. Never infer projection or diagnostics from an audio route.

Implementation: a local Expo module reads the current AVAudioSession output on iOS and available AudioManager outputs on Android. No forced routing, call profile, pairing or networking. UI distinguishes available outputs from the current route. Refresh on app return and manually. Speech only on button press; cancel on screen exit or backgrounding. Summary contains make/model, recorded mileage, calculated consumption and reminder counts, without VIN, plates, titles or notes. Reuse the speech engine with length checks and timeout.

Verification: summary, privacy, native boundary and speech cancellation tests; full suite, types, lint, documentation, autolinking and exports. Compile native module if tooling is available. A physical radio and Apple entitlement remain external requirements.

[Apple CarPlay](https://developer.apple.com/documentation/carplay/preparing-your-ios-app-for-carplay-development) · [Android for Cars](https://developer.android.com/training/cars) · [Car Hardware API](https://developer.android.com/training/cars/apps/library/car-hardware-api)

Result: 247/247 tests, types, lint, documentation and web/Android/iOS JavaScript/Hermes exports passed. Autolinking detects the local module on Apple and Android; archive checks confirm source inclusion and secret exclusion. Code review found no important issues. The web screen renders and disables hardware functions. The host lacks Xcode, CocoaPods and Android SDK, so Swift/Kotlin were not natively compiled or tested on phones/radios. CarPlay/Android Auto projection was not implemented and no entitlement was granted.
