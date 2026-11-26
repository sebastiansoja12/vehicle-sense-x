# Offline Vehicle Catalog Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans for inline implementation. Existing continuous-execution authorization applies.

**Goal:** add offline make/model selection plus manual fallback to the existing vehicle form.
**Architecture:** reproducibly generated name snapshot, pure lookup/selection helpers, one form component, shared source notices.
**Tech Stack:** Expo 58, React Native 0.88.1, TypeScript, Node 24 scripts/tests; no new dependency.
**Spec:** `docs/superpowers/specs/2026-11-25-offline-catalog-design.md`.

## Global Constraints
- Preserve existing vehicle records and schema; no sample garage entries.
- Include only selected public sources, pin content SHA-256 and upstream commit.
- Separate search query from chosen make/model; keep manual entry and all other fields.
- No inferred production years, engines or equipment.

## Review Focus
- Models of the previous make cannot remain selected after a different make is chosen.
- Diacritics/case match, but meaningful punctuation remains distinct.
- Unknown existing cars and manual entries survive mode changes and saving.
- Excluded-source rows must not leak into the distributable subset.
- Long names, invalid tuples or corrupt input fail generation rather than silently producing unusable entries.

## Task 1: Dataset and domain (RED → GREEN)
- [x] Tests: `mobile/tests/vehicle-catalog.test.mjs`, `mobile/tests/catalog-build.test.mjs` — seven tests observed RED → GREEN.
- [x] Implement `mobile/scripts/build-vehicle-catalog.mjs`: extract and generate a typed bundled file from verified pinned content; local `--check` reproduces both files.
- [x] Implement `mobile/src/vehicle-catalog.ts`: search, resolve and immutable make selection; retain manual values.
- [x] Generate `mobile/src/vehicle-catalog-data.ts`; source notices in `mobile/src/CatalogNotices.tsx` and `mobile/assets/catalog/README.md`.

## Task 2: Form and verification
- [x] Implement `mobile/src/VehicleIdentityFields.tsx`, integrate `mobile/src/EntryForm.tsx`; source notices accessible from form/settings.
- [x] Phone-size browser QA: Škoda/Octavia, make-scoped model search, changing to Dacia clears the model, manual values survive both mode switches, clean close/reopen. Main garage remains empty.
- [x] 114 passing tests, TypeScript and lint clean, web/iOS/Android JS/Hermes exports successful after the final accessibility fix, 2026-11-25.
- [x] Independent read-only review completed. P2 inaccessible selected-value labels reproduced in real browser (RED), fixed by including the chosen value in each label, then confirmed for Dacia/Duster (GREEN). No other confirmed regression; native VoiceOver/TalkBack/keyboard testing remains in RELEASE.md.
