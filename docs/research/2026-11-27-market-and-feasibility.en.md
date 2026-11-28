[Polski](2026-11-27-market-and-feasibility.md) | [English](2026-11-27-market-and-feasibility.en.md) | [Deutsch](2026-11-27-market-and-feasibility.de.md)

# Vehicle app market and VehicleSenseX feasibility

Research dated 27 November 2026 compares public official descriptions of eight products/platforms with the current app. No hardware purchases, private-account tests, complete plan-price comparison or proof of worldwide uniqueness. Absence from reviewed documentation is missing evidence, not proof a competitor lacks a feature.

## What the market offers

| Product | Documented scope and conditions | Implication |
| --- | --- | --- |
| [Car Scanner](https://apps.apple.com/us/app/car-scanner-elm-obd2/id1259933623) | ELM327 diagnostics, recording, emission readiness, freeze frame and selected platform-specific coding/service functions. | Basic readings/history alone are not a differentiator; data quality and compatibility matter. |
| [OBDeleven](https://support.obdeleven.com/en/articles/5603309-does-obdeleven-support-my-vehicle) | OBD, live data/history; model/year/region-specific support, advanced features and manual VAG coding. | Generic ELM327 does not imply all ECU/SFD/configuration support. |
| [Carista](https://carista.com/en-us/pages/carista-obd2-app) | Diagnostics, customization and selected supported maintenance tasks including battery registration and DPF. | Each write operation needs platform-specific implementation and verification. |
| [Carly](https://support.mycarly.com/hc/en-us/articles/360011226299-What-features-does-Carly-support-for-my-car) | Diagnostics, Smart Mechanic, garage, selected service tools; supported Used Car Check reads mileage from multiple ECUs. | Auditing manual entries is not equivalent to multi-ECU mileage verification. |
| [Fuelio](https://fuel.io/) | Fill-ups, consumption, GPS, costs and reminders, varying by platform/plan. | Cost tracking or local garage are not unique. |
| [Drivvo](https://www.drivvo.com/en/) | Fuel/costs/service, cost per km, cheaper stations, web and fleet features. | TCO, synchronization and fleet management remain real backlog gaps. |
| [FIXD](https://www.fixdapp.com/features/) | Warning-light explanations, maintenance schedules/notifications and multiple cars using its sensor. | Model-specific schedules require reliable sources. |
| [Smartcar](https://smartcar.com/docs/api-reference/evs/get-battery-capacity) | API platform, not a direct consumer app substitute; permissions, compatibility and regions apply. Example capacity page is Canada-only. | OEM accounts and EV data require separate authorized integrations, not adapter voltage. |

## What is feasible and conditional

| Area | Feasibility | Claim boundary |
| --- | --- | --- |
| Standard OBD: DTC, live data, readiness | Compatible ELM327 and ECU-supported PID. | Selected ECU and supported scope; missing is not zero. |
| Freeze frame, more PID, session charts/recording | Technically feasible; parsers, storage/session format and hardware tests still needed. | Protocol support is not an implemented feature. |
| ABS, airbags, TPMS, battery registration, DPF, coding/SFD | Brand/protocol/security/OEM access and hardware dependent. | No universal enable-everything operation; ECU writes are outside this change. |
| Workshops, prices, booking and OEM fitment | Workshop/offer code exists; live setup needed. Booking and verified fitment need suitable APIs/agreements. | Vehicle-text search is not compatibility proof; unknown shipping is not free. |
| Bluetooth audio / CarPlay / Android Auto | OS audio works; [CarPlay](https://developer.apple.com/carplay/) requires appropriate entitlement/approval and [Android Auto](https://developer.android.com/training/cars/apps/library) a supported category/template UI. | Radio pairing does not provide ECU access or automatic projection. |
| Remote commands, EV SoH, failure prediction | Appropriate real data, authorization and validated methods required. | Four basic PID values do not establish SoH, actual mileage or a certain diagnosis. |

## Implemented in this iteration

OBD readiness: full scans request advertised PID 01 and, when available, 30/31. Display MIL, PID-01 DTC count, spark/compression monitors and available warm-up/distance-since-clear counters. Availability and completion are independent. Preserved in history, JSON and reports. Not an inspection result or proof of concealed faults. Semantics checked against [python-OBD documentation](https://python-obd.readthedocs.io/en/latest/Responses/) and protocol implementation; no library code copied or dependency added.

Evidence audit: locally checks diagnostic source/ECU/statuses, readiness availability, future dates and mileage decreases across different days of fuel/service entries. Finds real pre/post-service-day readings with matching ECU/protocol and opens that exact pair. Imports and same-service-day readings do not establish automatic confirmation. No new database/server or health score.

## Proposed differentiator and evidence

The differentiator combines explicit missing/conflicting-data audit, linking a recorded service to comparable ECU readings, and preserving uncertainty in results/reports. Competitor public materials describe history, diagnostics or Used Car Check but do not establish this identical evidence-limited workflow. This is our product inference, not a claim that no solution worldwide offers it.

## Next priorities

1. Freeze frame and longer real-parameter sessions with gaps and ECU scope.
2. Persistent repair cases: symptoms, workshop quotes, parts, labor, actual invoice and repeat readings; needs schema/migration and no actual-cost entry before work.
3. Full TCO/budget with explicit period/distance and missing costs; never divide complete costs by partially recorded trips.
4. Licensed fitment and manufacturer intervals, booking providers and authorized EV/OEM APIs.
5. Separate supported CarPlay/Android Auto UI and vehicle/adapter validation.

## Verification limits

Based on public documentation on the stated date. Not every car, adapter or competitor plan was tested. New commands are verified with controlled transport, including CAN/errors, not physical measurements. Source/time/scope/missing data remain explicit; entry auditing cannot authenticate vehicle history.
