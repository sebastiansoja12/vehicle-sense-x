# Public vehicle catalogs for VehicleSenseX

Research date: 2026-11-25. Request: choose a specific model of a specific make, with useful coverage for Poland/Europe. Follow-up implementation: the user subsequently requested integration. A pinned offline subset is now bundled in the garage form, retaining manual entry; see `mobile/assets/catalog/README.md` and the offline-catalog plan for source selection and verification. The full upstream Node package has not been installed.

## Findings

| Source | Use | Limits and terms |
| --- | --- | --- |
| [NHTSA vPIC](https://vpic.nhtsa.dot.gov/api/) | Official free make/model/year API and VIN decoding | [Official FAQ](https://vpic.nhtsa.dot.gov/api/home/index/faq) says no app registration/licensing requirement. Foreign vehicles are covered when registered for the US market; unsuitable as the only European catalog. Do not promise unlimited throughput. |
| [RDW registered vehicles](https://opendata.rdw.nl/Voertuigen/Open-Data-RDW-Gekentekende_voertuigen/m9d7-ebf2) | European make/commercial-name observations from the Dutch register | Official metadata labels the dataset Public Domain / CC0. Registration records are not a complete manufacturer production catalog. Extract only aggregate make/model names, not plates or individual vehicle records. |
| [EEA new passenger cars](https://www.eea.europa.eu/en/datahub/datahubitem-view/fa8b1229-3db6-495d-b18e-9c9b3267c02b) | European makes and commercial names reported for new registrations | Reporting/registration year must not be labelled production year. National naming varies. |
| [MeterApp vehicle-db](https://github.com/MeterApp/vehicle-db) | Offline combined catalog with source filters; a practical candidate for a picker | Code declares ISC; upstream data retain their own terms. Its source metadata identifies EEA as CC BY 4.0, UK DfT as OGL 3.0 and RDW as public domain. Review selected source terms individually; code licensing does not relicense all data. |

The [CC BY 4.0 terms](https://creativecommons.org/licenses/by/4.0/) allow commercial reuse and adaptation with attribution, a licence link and indication of changes. Distribution should preserve the dataset notices separately from the application licence. Dataset reuse does not grant rights to car photos or manufacturer logos.

## Actual data inspection

Downloaded the repository's linked `data/compact.json` into a temporary file, without running its code or installation scripts. Snapshot SHA-256: `405b677d96ee5f33bdc1e314ab74bcf5e7f5d112f176de335f1e9bafb5cff3a5` (7,975,596 bytes). This is a hash of inspected content, not a pinned upstream release or an assurance of accuracy.

Using the tuple schema in the [upstream lookup implementation](https://github.com/MeterApp/vehicle-db/blob/main/src/index.ts), confirmed actual make/model records for SKODA/OCTAVIA, VOLKSWAGEN/GOLF, DACIA/DUSTER, CUPRA/FORMENTOR and TOYOTA/COROLLA. These are catalog observations, not added user vehicles or demo measurements.

Quality limits: the combined data also include separate strings such as OCTAVIA, OCTAVIA COMBI, OCTAVIA ELEGANCE and OCTAVIA ELEGNE. BMW names include both model families and engine/trim labels. A raw dropdown of all names would be noisy and sometimes ambiguous. Year meaning varies between sources; do not infer a production range by filling gaps between observations. Full coverage of generations, engine codes, transmission combinations and factory equipment has not been established.

## Recommended application flow

Use an offline, versioned subset of passenger-car make/model names from explicitly selected open European sources, with preserved attribution and provenance. Normalize accents/case for search while retaining the display spelling. Keep source IDs, stable internal identifiers and original names so reviewed aliases do not silently merge different cars.

Offer make search, then model search scoped to that make. Changing make clears a selected model from the previous make. Keep an explicit manual entry path for missing cars and retain existing manually entered vehicle data. Record the owner-confirmed year of production independently of registration-year observations. Engine and equipment remain manual until an appropriate verified specification source is integrated. The catalog must not imply VIN verification or automatic compatibility with an OBD adapter.

A future integration needs a pinned source/version, reproducible extraction, catalogue notices in the app, cross-brand/reset/search tests and a small reviewed European coverage matrix. No runtime VIN, plate or location transmission is needed for an offline picker.
