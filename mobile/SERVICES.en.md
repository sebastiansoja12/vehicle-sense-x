[Polski](SERVICES.md) | [English](SERVICES.en.md) | [Deutsch](SERVICES.de.md)

# Workshops and part prices

The new screens are available from Home, Garage and Maintenance, even without a vehicle. Results appear inside the app. Checkout, directions and calls open the selected website or system app.

## Private server setup

The server works independently of AI. If no configuration exists, create a local environment file from the example; do not replace an existing file. Generate a private token using the example comment. Workshops need only the app token. Real prices require a production eBay Developer account, client credentials and approved Browse API access; populated fields alone do not guarantee access. Never put provider keys in the app or public variables.

```dotenv
APP_API_TOKEN=<private-generated-token>
EBAY_CLIENT_ID=<production-client-id>
EBAY_CLIENT_SECRET=<production-client-secret>
ALLOWED_ORIGINS=http://127.0.0.1:8083
OVERPASS_URL=https://overpass-api.de/api/interpreter
NOMINATIM_URL=https://nominatim.openstreetmap.org/search
```

After configuration, start the server from the project root:

```sh
npm start --prefix server
```

In app settings or the first workshop/parts screen enter the server origin and app token, then apply the connection. Browsers require an exact allowed origin. HTTP is accepted only on loopback for local testing. On a phone loopback means the phone itself: use private HTTPS hosting with a valid certificate. The public variable may contain only the server address. The token stays in session memory and can be removed in settings. It is excluded from garage backups.

## Workshops

Enter a Polish town or address, consent, search and select the correct location. Alternatively request a single GPS fix; this requires OS permission, a fix no older than two minutes and reported accuracy within 5 km. Select a category and 5, 10 or 25 km radius. Changing a filter clears the old result and requires another search. The list shows up to 50 places sorted by straight-line distance and known addresses, phone numbers, hours and websites. Hours are source text, without an “open now” claim. Missing listings do not prove there are no workshops. Confirm details and service quality independently.

OpenStreetMap data is ODbL licensed. Nominatim resolves addresses and Overpass finds places. The server limits geocoding to one request per 1.1 seconds and workshops to one per 2 seconds, caches up to 100 results (towns 24 hours, workshops 5 minutes), and shares a 20/minute limit with two active operations across authenticated attempts. Limits are per process. Default public instances are for moderate private use. Before public release use dedicated providers, a shared gateway limit and user authentication. Provider URLs can be changed on the server without an app update. There is no polling or autocomplete.

## Parts

Enter a part name or OEM number. Optional vehicle text adds only make, model, year and engine; the preview shows the exact query. VIN, plate, mileage and history are excluded. Text search does not establish compatibility. The server retrieves up to 20 fixed-price offers for the Polish marketplace and delivery to Poland, preserving eBay ordering. We display price, original currency, known shipping, seller, condition, source and retrieval time. Labor is excluded; final shipping depends on the address and seller options.

Unknown shipping remains unknown. Prices in PLN/EUR/USD/GBP/CHF/CZK/SEK/DKK/NOK use 1/100 units; other currencies and invalid listings are skipped with a counter. No currency conversion or invented prices. Refresh makes a new request; the server retains only the OAuth token until expiry. Missing keys, access or responses produce explicit errors. No automatic purchase, booking, payment or OEM verification.

## Privacy and verification

Requests require consent and a manual action. Cancellation, leaving a screen, changing configuration or the selected car cannot publish late results into a new context. Results and token remain in memory; server cache does not link workshops to users or garages. Providers and server see connection IP addresses. Do not enter personal information in queries. Disable body and authorization-header logging on your reverse proxy.

Local tests use controlled provider transport, without real keys or charges. Verification covers validation, authorization independent of AI, CORS, failures, limits, prices and missing shipping, cancellation and application compilation. OBD and radio compatibility still require a phone and specific hardware. The updated GPS permission description requires rebuilding the native app.

## Sources

- [eBay Browse API](https://developer.ebay.com/develop/api/buy/browse_api)
- [eBay OAuth](https://developer.ebay.com/develop/guides/sell/authorization)
- [eBay marketplace support](https://developer.ebay.com/api-docs/buy/static/ref-marketplace-supported.html)
- [Nominatim usage policy](https://operations.osmfoundation.org/policies/nominatim/)
- [Overpass public instances](https://dev.overpass-api.de/overpass-doc/en/preface/commons.html)
- [OpenStreetMap ODbL](https://www.openstreetmap.org/copyright)
- [Expo SDK 58 Location](https://docs.expo.dev/versions/v58.0.0/sdk/location/)
