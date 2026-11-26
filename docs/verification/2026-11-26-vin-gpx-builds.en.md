[Polski](2026-11-26-vin-gpx-builds.md) | [English](2026-11-26-vin-gpx-builds.en.md) | [Deutsch](2026-11-26-vin-gpx-builds.de.md)

# VIN and GPX0.2.1 implementation verification

Source0.2.1/build2: real NHTSA vehicle details after consent and GPX export of saved trips. Tests:161/161; types, lint, web export and Android/iOS Hermes bundles passed. This is not yet evidence of a new native compilation.

The real client and web form used a public example VIN; verified preview, changed-field blocking, preservation of an unselected year and manual engine text, and consent reset after VIN changes. The form was closed without saving a sample vehicle.

Independent GPX and VIN reviews found no important issues. Decision: a new application retains only selected fields from that result; earlier evidence is not given a new timestamp. This can remove provenance for earlier unselected fields, but not their values.

Native0.2.1 builds were submitted from revision `63b273d`: [Android AAB](https://expo.dev/accounts/rubisco4471/projects/vehiclesensex/builds/0edfb971-f29a-4dfa-9db6-cd7f30aaa139) and [iOS simulator](https://expo.dev/accounts/rubisco4471/projects/vehiclesensex/builds/9b9e4d14-af3c-42b9-8cf7-247d29f75ef5). Inspected archive:110 files,1547848 bytes, new modules included, no keys or local settings. Earlier0.2.0 artifacts lack these features. Before submission4 of30 free builds were used, with no overage cost. Android was resubmitted separately after concurrent archiving collided on Git configuration; that failure created no build job.

## Backend

Added bounded SIGTERM/SIGINT shutdown and a nonroot Node24.18.0 container. All13 backend and164 total tests passed, along with code review. The built image ran with a read-only filesystem and localhost-only port; its healthcheck passed without paid API configuration, and the container exited0 and was removed. The image code hash matches the source. No private credentials in the image, public deployment or paid calls. [Container metadata](2026-11-26-assistant-container.json).

Physical phone/adapter and native GPX sharing tests remain unperformed; a store IPA requires an active Apple Developer account. No store submission was performed.
