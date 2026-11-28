[Polski](DIAGNOSTIC-COMPARISON.md) | [English](DIAGNOSTIC-COMPARISON.en.md) | [Deutsch](DIAGNOSTIC-COMPARISON.de.md)

# Diagnostic comparison and workshop report

Open the screen from Diagnostics or Garage. It works offline on two saved readings assigned to the selected car, without new OBD commands, AI requests or provider keys.

## Selecting readings

B defaults to the latest reading; A is the closest earlier reading with matching ECU address and protocol. If none matches, the closest earlier reading is selected but differences are disabled for unknown or different scope. Equal timestamps do not establish an order. Select other A/B readings from a list paginated in groups of 20. A must be distinct and earlier. A deleted selection requires reselection; changing cars resets selection and symptoms.

## Comparison meaning

Codes are compared separately for stored, pending and permanent statuses. A status unread in either report remains unknown. A code occurring in two statuses remains two entries, without merging them into one fault. Absence in B means only not observed in that reading, not proven repair. Unknown or different ECU scope shows both raw code sets without changes. Imports are marked as unverified.

RPM, coolant temperature, load and adapter voltage show A, B and B-minus-A only for matching ECU and two actual values. Zero remains zero; missing readings have no delta. These are two instantaneous measurements, not a trend or improvement score. Driving conditions, temperatures or prior code clearing can change results. Adapter voltage is not a battery health test.

## Report and privacy

Optionally enter up to 2000 characters of symptoms and conditions. The text is not saved in the garage or backup; leaving the screen may discard it. Browser HTML or phone PDF includes vehicle description, UTC dates, sources/scope, both code sets, parameters and limitations. VIN, plates, photos, GPS and service notes are excluded. Adapter names and symptom text are included as entered: review before sharing.

Export is local; the system share sheet can send the report to your chosen application. User HTML is escaped and the report loads no network resources. It is not a diagnosis, proof of repair or technical inspection. Only the two selected readings are included, not the full history.

## Verification

Tests cover chronology, ECU/protocol scope, different cars, no common statuses, null/zero, default selection, imports, validation and report privacy/HTML escaping. Uses existing data schema and export; garage backups remain compatible.
