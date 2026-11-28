[Polski](2026-11-26-automotive-services.md) | [English](2026-11-26-automotive-services.en.md) | [Deutsch](2026-11-26-automotive-services.de.md)

# Workshops and part prices

Builder decision after user authorization: extend the existing Expo app without dependencies. Display workshops and offers inside the app.

Workshops: Polish town or GPS, location selection, 5/10/25 km radius, repair/tyres/inspection/parts shop, straight-line distance, address, phone, hours and directions. OpenStreetMap via server, Nominatim and Overpass. Coverage may be incomplete.

Parts: eBay Poland Browse API with server OAuth. Search/OEM and optional make/model/year/engine, without VIN or plate. Price and currency, known shipping, seller, condition, source and retrieval time. No compatibility guarantee.

Private server and app token; independent of the AI key. Missing eBay keys explicitly disable offers. Consent before sending location or search. Cancellation, limits, cache and response validation. No garage schema change; results and token stay in memory. Existing diagnostics and radio remain the base.

Considered external map/shop links (user declined) and official APIs (selected). Full proprietary catalog, bookings and payments require separate agreements. Public OSM is for moderate private use; production needs dedicated services. Hardware tests and production eBay access remain required.
