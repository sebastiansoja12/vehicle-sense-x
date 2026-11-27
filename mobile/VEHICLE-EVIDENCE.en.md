[Polski](VEHICLE-EVIDENCE.md) | [English](VEHICLE-EVIDENCE.en.md) | [Deutsch](VEHICLE-EVIDENCE.de.md)

# Vehicle evidence audit and OBD readiness

Available from Garage, Health and Diagnostics. Local analysis sends no data/VIN to a server, changes no records automatically and creates no costs or reminders.

## Emission monitors

Full ELM327 scans request PID 01 only when advertised by the ECU. Show MIL, that PID’s DTC count and independent availability/completion flags for spark/compression monitors. Supported PID 30/31 provide warm-up and distance-since-clear counters. Live Data does not requery them. No data remains unknown; timeout or malformed frames cannot create an empty successful reading.

Scope is the selected ECU and full-scan timestamp. Completed monitors do not establish inspection success. Low counters/incomplete monitors have multiple possible causes, not proof of concealed faults. Counters are not total vehicle mileage. Older records may lack the new optional field; JSON backups, sales reports and comparisons retain it without a garage schema change. Physical phone/adapter/ECU validation remains necessary.

## Stored evidence audit

Cards distinguish recorded, limited, missing and conflicting evidence. Check OBD/import source, ECU address, three DTC statuses, readiness, future dates, consumption basis and mileage chronology across fuel/service entries. Future data cannot establish current evidence. Missing codes/contradictions do not mean a healthy vehicle.

Compare mileage across different days; same-day entries have no established order. A later lower mileage prompts checking dates, units or input mistakes, not an odometer fraud conclusion. Does not read mileage from multiple ECUs or authenticate history. Displays up to 10 contradiction details and the full count.

## Linking service and readings

For the latest nonfuture service day find OBD-labeled readings from strictly earlier/later days with identical ECU address/protocol. Same-day readings are ambiguous without a repair time; imports do not automatically establish this evidence. The button opens the exact reading IDs in comparison.

This links available data, not proof that repair occurred or worked. Backup metadata is not a digital signature. Without shared read statuses the code comparison remains incomplete. No health score or missing-data-as-success claim.
