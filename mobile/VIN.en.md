[Polski](VIN.md) | [English](VIN.en.md) | [Deutsch](VIN.de.md)

# Vehicle data from VIN

The add/edit vehicle form can retrieve real NHTSA vPIC data. The offline catalog and manual vehicle entry do not require this service. NHTSA does not guarantee coverage of all makes and markets, especially European ones, or complete factory specifications. The result does not verify vehicle history, equipment, ownership or authenticity.

## Consent and use

1. Enter a complete 17-character VIN. An empty field, invalid characters or an all-zero number will not trigger a request.
2. Separately consent to sending this VIN to the US NHTSA service over HTTPS. We do not send plates, mileage, history or AI data. Changing the VIN resets consent and aborts the previous request; closing the form also cancels it.
3. Press the retrieval button. There are no automatic requests or retries. Internet access is needed only for this feature.
4. Check the preview and select the fields to use. Only empty fields are selected by default. Changing a selected field during retrieval blocks application of the result; changes to other fields are preserved. Changing make or model must not combine values with a conflicting existing pair.
5. Applying the result fills the form, not the saved garage. Save the vehicle with the separate button. Canceling does not create a vehicle.

## Data and source

Only explicit fields are transferred: make, model, model year, whole-number displacement in cm³, transmission and drivetrain. Model year may differ from production date. We do not guess engine or trim, convert SAE HP to metric horsepower (KM), round fractional displacement or invent equipment. Missing or unsupported fields remain available for manual entry.

Accepting data requires a single response, the same complete VIN and `ErrorCode=0`. Warnings and partial decoding are not treated as a reliable result. The service applies traffic limits; an error or missing data does not block manual entry.

The saved `nhtsa-vpic` source contains the VIN, retrieval time and selected values. The garage shows which fields still match the result. Manually changing a field removes evidence for that field; changing VIN manually or through OBD removes the association with a different number. Each subsequent application stores only the selected fields from the new result, so an old result does not receive a new date. JSON backups retain this metadata; import rejects a mismatched VIN, an unknown source type and fields that do not match the vehicle. The metadata is not a signed manufacturer certificate.

VIN and its sources are not automatically included in AI or the sales report. A full JSON backup includes them, along with the VIN itself. A manually entered assistant question is separate text — do not put personal data in it. NHTSA is responsible for its own request processing; we do not promise removal of VIN from provider logs.

## Integration and verification

`vin-client.ts` uses only the official HTTPS endpoint, a 20 s timeout and a 128 KiB response limit, with no credentials or automatic retries. The browser stream is byte-bounded; native fetch may buffer text first, so the limit is checked after reading. A stale or late response cannot overwrite the form. The client does not log raw provider errors or VIN.

Tests cover consent, invalid and partial data, size, cancellation, deadlines despite an ignored signal, stale fields, source associations, backups and AI/report isolation. The real client and web form were checked with a public sample VIN, without saving a sample vehicle in the garage. All 161 tests, types and lint passed. Physical devices and system network behavior require separate verification; earlier 0.2.0 binaries do not include the 0.2.1 features.

Sources: [NHTSA vPIC API](https://vpic.nhtsa.dot.gov/api/), [FAQ and limitations](https://vpic.nhtsa.dot.gov/api/home/index/faq), [official data example](https://www.nhtsa.gov/sites/nhtsa.gov/files/frenchik-vin-vpic.pdf).
