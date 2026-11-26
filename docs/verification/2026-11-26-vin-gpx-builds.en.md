[Polski](2026-11-26-vin-gpx-builds.md) | [English](2026-11-26-vin-gpx-builds.en.md) | [Deutsch](2026-11-26-vin-gpx-builds.de.md)

# VIN and GPX0.2.1 implementation verification

Source0.2.1/build2: real NHTSA vehicle details after consent and GPX export of saved trips. Tests:161/161; types, lint, web export and Android/iOS Hermes bundles passed. This is not yet evidence of a new native compilation.

The real client and web form used a public example VIN; verified preview, changed-field blocking, preservation of an unselected year and manual engine text, and consent reset after VIN changes. The form was closed without saving a sample vehicle.

Independent GPX and VIN reviews found no important issues. Decision: a new application retains only selected fields from that result; earlier evidence is not given a new timestamp. This can remove provenance for earlier unselected fields, but not their values.

Native0.2.1 builds: awaiting submission. Earlier0.2.0 artifacts lack these features. Remaining free Expo quota was checked before new jobs:4 of30 builds used, with no overage cost.

Physical phone/adapter and native GPX sharing tests remain unperformed; a store IPA requires an active Apple Developer account. No store submission was performed.
