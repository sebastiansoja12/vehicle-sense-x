[Polski](2026-11-26-vin-enrichment.md) | [English](2026-11-26-vin-enrichment.en.md) | [Deutsch](2026-11-26-vin-enrichment.de.md)

# Vehicle details from VIN

Fill the vehicle form with real NHTSA vPIC data after separate consent to send the VIN.

Selected the public keyless API; the full SQL database is too large for a phone, while a commercial decoder needs a provider and credentials. This is an implementation decision within the approved scope; the user requested uninterrupted execution.

Only a complete VIN and an ErrorCode=0 response for that same VIN. Fields: make, model, model year, displacement, transmission and drive; no SAE HP-to-PS conversion or inferred equipment. Missing values remain empty; label the stored year as vehicle year and explicitly identify a source model year.

Explicit consent, preview and individual field selection; only blank fields are selected by default. A stale VIN or changed target fields blocks application. Saved source evidence is retained only for unchanged values; a manual VIN change removes the association. Metadata stays out of AI and sale reports.

No new native library. HTTPS to NHTSA only, bounded response and timeout, cancellation on close/VIN change, no VIN logs and no automatic retries. Manual entry and the offline catalog remain available.

NHTSA does not guarantee European coverage or complete specifications and does not certify vehicle history/authenticity. Binaries from the previous task do not contain this new feature.

[NHTSA vPIC API](https://vpic.nhtsa.dot.gov/api/), [vPIC FAQ](https://vpic.nhtsa.dot.gov/api/home/index/faq).
