[Polski](2026-11-26-vin-enrichment.md) | [English](2026-11-26-vin-enrichment.en.md) | [Deutsch](2026-11-26-vin-enrichment.de.md)

# Vehicle details from VIN — Steps

> superpowers:executing-plans

**Goal:** Fill the vehicle form with real NHTSA vPIC data after separate consent to send the VIN.

**Architecture:** `vin-decoder.ts` + `vin-client.ts` → `VinLookup.tsx` / `EntryForm.tsx`; `domain.ts` / `features.ts` validate optional source evidence.

**Spec:** [Spec](../specs/2026-11-26-vin-enrichment.en.md).

## Constraints

Only a complete VIN and an ErrorCode=0 response for that same VIN. Fields: make, model, model year, displacement, transmission and drive; no SAE HP-to-PS conversion or inferred equipment. Missing values remain empty; label the stored year as vehicle year and explicitly identify a source model year. Explicit consent, preview and individual field selection; only blank fields are selected by default. A stale VIN or changed target fields blocks application. Saved source evidence is retained only for unchanged values; a manual VIN change removes the association. Metadata stays out of AI and sale reports. No new native library. HTTPS to NHTSA only, bounded response and timeout, cancellation on close/VIN change, no VIN logs and no automatic retries. Manual entry and the offline catalog remain available.

## Review focus

ErrorCode, wrong VIN, stale fields, late responses, forged backup evidence.

## Steps

- [x] Parser and field selection: tests for invalid VIN, warnings, gaps and stale forms, then implementation.
- [x] HTTP: consent, timeout, cancellation, size and service error tests, then the real HTTPS client.
- [x] Source persistence and backups: edit, VIN change and AI isolation tests, then validation.
- [x] Form, garage sources, privacy and PL/EN/DE documentation; regression tests, types/lint and exports, independent review, commits/push.
