[Polski](README.md) | [English](README.en.md) | [Deutsch](README.de.md)

# VehicleSenseX documentation

The complete Polish, English and German versions cover the same content and commands. The file without a language suffix is Polish; adjacent `.en.md` and `.de.md` files contain translations. Dated plans and logs describe their implementation stage; use the release guide and build report for the current release result.

When changing documentation, update all three versions and language links. Do not translate commands, API identifiers, filenames, addresses or data syntax. `AGENTS.md` instructions, original licenses and JSON reports retain their source syntax; the result descriptions are available in all three languages.

## Setup and operation

- [Project overview](../README.en.md)
- [Mobile application](../mobile/README.en.md)
- [Vehicle details from VIN](../mobile/VIN.en.md)
- [Builds, signing and release](../mobile/RELEASE.en.md)
- [AI assistant backend](../server/README.en.md)
- [OBD client boundaries and protocols](../mobile/src/obd/README.en.md)
- [Offline catalog and licenses](../mobile/assets/catalog/README.en.md)
- [Asset provenance](../assets/README.en.md)

## Sources and verification

- [Research into public vehicle catalogs](research/2026-11-25-vehicle-catalogs.en.md)
- [Native builds](verification/2026-11-26-native-builds.en.md)
- [VIN and GPX0.2.1 implementation verification](verification/2026-11-26-vin-gpx-builds.en.md)
- [iOS artifact metadata (JSON)](verification/2026-11-26-ios-artifact.json)
- [Android APK artifact metadata (JSON)](verification/2026-11-26-android-artifact.json)
- [Production Android AAB metadata (JSON)](verification/2026-11-26-android-production-artifact.json)
- [Generated native configuration (JSON)](verification/2026-11-25-native-config.json)

## Implementation plans

- [Mobile foundation](superpowers/plans/2026-11-25-mobile-foundation.en.md)
- [Connected modules](superpowers/plans/2026-11-25-connected-modules.en.md)
- [CAN and ECU selection](superpowers/plans/2026-11-25-can-ecu.en.md)
- [OBD VIN reading](superpowers/plans/2026-11-25-obd-vin.en.md)
- [Offline vehicle catalog](superpowers/plans/2026-11-25-offline-catalog.en.md)
- [Native builds](superpowers/plans/2026-11-26-native-builds.en.md)
- [GPX trip export](superpowers/plans/2026-11-26-trip-gpx.en.md)
- [Vehicle details from VIN](superpowers/plans/2026-11-26-vin-enrichment.en.md)

## Design specifications

- [Mobile foundation](superpowers/specs/2026-11-25-mobile-foundation-design.en.md)
- [Connected modules](superpowers/specs/2026-11-25-connected-modules-design.en.md)
- [CAN and ECU selection](superpowers/specs/2026-11-25-can-ecu-design.en.md)
- [Offline vehicle catalog](superpowers/specs/2026-11-25-offline-catalog-design.en.md)
- [GPX trip export](superpowers/specs/2026-11-26-trip-gpx-design.en.md)
- [Vehicle details from VIN](superpowers/specs/2026-11-26-vin-enrichment.en.md)

## Progress logs

- [Mobile foundation](superpowers/progress/2026-11-25-mobile-foundation.en.md)
- [Connected modules](superpowers/progress/2026-11-25-connected-modules.en.md)
- [CAN and ECU selection](superpowers/progress/2026-11-25-can-ecu.en.md)
- [OBD VIN reading](superpowers/progress/2026-11-25-obd-vin.en.md)
- [Offline vehicle catalog](superpowers/progress/2026-11-25-offline-catalog.en.md)
- [Release preflight](superpowers/progress/2026-11-25-release-preflight.en.md)
- [GPX trip export](superpowers/progress/2026-11-26-trip-gpx.en.md)
