# Bundled vehicle names

Generated from [MeterApp/vehicle-db](https://github.com/MeterApp/vehicle-db), upstream commit `f37e44e01fad7f67d3625c95b792f2caa1524536`, inspected 2026-11-25.

Only passenger-car/MPV make/model names carrying at least one of these source bits are included:

- NHTSA vPIC — U.S. government public data. [Source/terms FAQ](https://vpic.nhtsa.dot.gov/api/home/index/faq).
- UK Department for Transport / Driver and Vehicle Licensing Agency — Contains public sector information licensed under the [Open Government Licence v3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/). [Source](https://www.gov.uk/government/statistical-data-sets/vehicle-licensing-statistics-data-files).
- European Environment Agency — Monitoring of CO2 emissions from passenger cars and vans, Regulation (EU) 2019/631. Licensed under [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/). [Source](https://www.eea.europa.eu/en/datahub/datahubitem-view/fa8b1229-3db6-495d-b18e-9c9b3267c02b).
- RDW (Dienst Wegverkeer) — Open Data RDW, Public Domain/CC0. [Source](https://opendata.rdw.nl/Voertuigen/Open-Data-RDW-Gekentekende_voertuigen/m9d7-ebf2).

Changes by VehicleSenseX: filter the selected sources and vehicle types, omit registration/model years and individual vehicle records, collapse case/diacritic/whitespace duplicates, retain first observed display spelling and keep distinct punctuation. No manufacturer photos, logos, vehicle specifications or upstream application code are included. Data notices apply to the dataset independently of application code. The upstream package declares ISC for its code and separately retains source data terms.

The subset contains **563 make names and 17,966 model/name variants** (~289 KB including metadata). These are source labels, not a guarantee of complete production models, factory trims, years or VIN identity. Older and missing vehicles remain manually enterable. The app includes the above attribution and source/licence links in the form and Settings → Katalog samochodów.

## Reproduce

Use Node 24; no dependency installation needed. From `mobile/`:

```sh
node scripts/build-vehicle-catalog.mjs
```

Downloads only the pinned public JSON, verifies SHA-256 before parsing, validates/filter names and tuples, then regenerates `src/vehicle-catalog-data.ts` and `assets/catalog/provenance.json`. The build never fetches data automatically; the checked-in generated file is bundled offline.

With the exact upstream file already available locally:

```sh
node scripts/build-vehicle-catalog.mjs --input /absolute/path/compact.json --check
```

Expected SHA-256: `405b677d96ee5f33bdc1e314ab74bcf5e7f5d112f176de335f1e9bafb5cff3a5`. `--check` compares both generated artifacts without modifying them. An update requires deliberately reviewing/replacing the pinned commit, hash, data date, attribution and coverage checks. Excluded-source-only rows do not enter the app.
