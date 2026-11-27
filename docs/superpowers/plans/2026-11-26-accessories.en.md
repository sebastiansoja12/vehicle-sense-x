[Polski](2026-11-26-accessories.md) | [English](2026-11-26-accessories.en.md) | [Deutsch](2026-11-26-accessories.de.md)

# Accessories module plan

Goal: recommended accessory types for the active vehicle’s make, accessible from Garage and Home. Implementer decisions following the request to proceed without questions: an offline editorial catalogue for all 563 garage makes and manual entries, four categories, Allegro offer searches and additional official catalogues for 19 manufacturers checked on November 26–27, 2026. Selecting a make does not confirm part compatibility.

## Scope and constraints

Existing Expo SDK 58 and shared UI components. No dependencies, prices, migrations, automatic fetching or transmission of VIN/plates. Links open only on click, with error handling. Manufacturer sources support catalogues and product types; ranking and reasons are editorial choices by the app. An external offer aggregator was considered; a static catalogue meets this feature’s needs without keys, a server or profiling consent. Existing server changes are outside scope.

## Implementation

- [x] First test make recognition, unknown makes, filters, search and sources; confirm missing implementation.
- [x] Data and selection in `mobile/src/accessories.ts`, tests in `mobile/tests/accessories.test.mjs`.
- [x] Screen in `mobile/src/AccessoriesScreen.tsx`, route `mobile/src/app/accessories.tsx`, registration in `mobile/src/app/_layout.tsx` and entry points in `mobile/src/screens.tsx`.
- [x] Empty garage, no results, active vehicle changes and source opening errors must have clear UI.
- [x] Update PL/EN/DE instructions, run the complete test suite, types, lint, documentation validation, web export and view inspection.

## Review

Key cases: VW alias and Škoda spelling, manual names, separation of BMW recommendations from other makes, combined filters and offline operation. No generation-specific compatibility or current price guarantee. Physical phones are outside local verification.

## Verification of the first version on November 26, 2026

231/231 application tests, types, lint, documentation validation and web plus Android/iOS JavaScript/Hermes exports passed. The first network-test run was limited by the sandbox; the rerun with local port access passed completely. Code review found no important defects.

Browser checks at 390 px covered an empty garage, adding a test BMW, Garage and Home entry points, the Comfort category, accent-insensitive search, no results, resetting filters, card layout and navigation to the real BMW catalogue. The simple static preview server has no route fallback to the main page; production web hosting must support application routes. No signed packages or phone/screen-reader tests were performed.

## Extension on November 27, 2026

At the user’s request, the module covers every garage catalogue make (563) and manual entries. Profiles derive from the existing catalogue without maintaining a second make list. Shared suggestions provide four categories for each make; verified BMW/Dacia systems remain attached to their respective makes. Every card offers Allegro searches using make, model, model year and product type. This is search, not confirmation of availability or fitment. Additional manufacturer catalogues cover 19 makes. Sites receive data only after a click; search addresses exclude VIN, plates, history and notes. A test walks every catalogue make, checking four categories, manual entries, punctuation handling and no private-data disclosure.

Extension verification: 7/7 module tests (including every make and category), the complete 242/242 suite, types, lint, documentation and web/Android/iOS JavaScript/Hermes exports passed. Code review found no important defects. Browser checks covered a 2008 Saab 9-3, six suggestions, offer search buttons, the correct query address and return to the app. Allegro required CAPTCHA in the test environment; result contents were not verified. Physical phones were not tested.
