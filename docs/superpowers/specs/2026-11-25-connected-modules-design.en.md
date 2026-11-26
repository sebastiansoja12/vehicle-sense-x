[Polski](2026-11-25-connected-modules-design.md) | [English](2026-11-25-connected-modules-design.en.md) | [Deutsch](2026-11-25-connected-modules-design.de.md)

# VehicleSenseX — remaining modules

The user requested continuous implementation of the remaining modules using Superpowers, without further approval pauses. Keep the approved interface and Expo SDK 58; the previous plan remains complete. The new scope extends the working app without replacing user data with a demonstration.

## Approach and constraints

- Selected: local modules and working integrations with explicit boundaries. GPS trips while the app is visible; stop/pause on backgrounding, a retained draft and manual trips. Background recording requires separate device validation and store configuration.
- OBD2: a real ELM327 client and BLE transport with manually specified UUIDs. No promise of compatibility with every adapter or Bluetooth Classic. Readings have timestamps and sources. Clearing requires a saved report and separate confirmation; never during trip recording.
- AI: a proxy server, with the key only in server environment variables. Explicit consent to send minimal context. No VIN, plates, photos or route coordinates in the default context. A missing key produces a “not configured” state, never a fabricated answer. A local factual summary works without AI.
- Alternatives: immediate native background recording increases risk and requires devices; GPS/OBD/AI imitations do not fulfill the request. Therefore, implement real SDK-supported flows and testable cores, and document the absence of hardware tests.

## Trips and analytics

Manual start/stop and GPS consent only at start. The vehicle is assigned when recording starts, independently of later garage changes. History, trip selection, a route sketch, distance, duration, average and maximum speed, and estimated fuel cost with its source stated. Reject poor accuracy, nonmonotonic timestamps and GPS jumps; long gaps must not join the route with a straight line. If GPS is denied, a trip can be entered manually. Manual entries do not generate driving-style events.

Analytics shows specific acceleration/braking events and explicit thresholds as a GPS heuristic requiring validation. No invented Eco Score. Missing data differs from zero. Demo data always stays separate.

## Maintenance, costs and garage

Reminders by date or mileage; the earlier threshold applies. Editing and deletion with confirmation, CSV export and a full JSON backup with validated restoration and confirmation of replacement. Local attachments if the file lifecycle can be safely verified; no automatic upload. Photos and VIN have no fictitious provider.

## Condition and value

Measurement and DTC history, data scope and age, service history and upcoming due dates. A report exported before sale with dates and sources; no certification of roadworthiness. Value is a range based on entered comparable offers with source URLs and dates, not a random valuation. Costs relative to value only when an estimate exists, labeled as an estimate.

## Data and persistence safety

Migrate existing v1 state to expanded v2 without losing the garage, refueling or maintenance. Older backups must not overwrite a newer schema. Every record has vehicleId and read-time validation. Chronology, location privacy, leaving demo mode and save errors remain protected. Drafts and conversations must not move to another vehicle.

## Verification

Tests before code: migration, vehicle isolation, GPS filters and gaps, driving events, OBD parser and timeouts, AI context minimization, server errors, maintenance due dates, CSV and backup. Types, lint, web/iOS/Android bundles, independent review and phone preview. The absence of a physical adapter, device GPS and API key is reported explicitly; do not mark these tests as completed.
