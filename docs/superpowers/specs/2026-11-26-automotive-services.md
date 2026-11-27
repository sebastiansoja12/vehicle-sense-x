[Polski](2026-11-26-automotive-services.md) | [English](2026-11-26-automotive-services.en.md) | [Deutsch](2026-11-26-automotive-services.de.md)

# Warsztaty i ceny części

Wybór wykonawcy po zgodzie użytkownika „Wybierz i działaj”: rozbudowa obecnej aplikacji Expo, bez nowych zależności. Warsztaty i oferty wyświetlane w aplikacji.

Warsztaty: miejscowość w Polsce lub GPS, wybór lokalizacji, promień 5/10/25 km, warsztat/opony/przeglądy/sklep części, odległość w linii prostej, adres, telefon, godziny i nawigacja. Źródło OpenStreetMap przez serwer, Nominatim i Overpass. Dane mogą być niepełne.

Części: eBay Polska przez Browse API i OAuth na serwerze. Własne zapytanie/OEM, opcjonalne dołączenie marki, modelu, roku i silnika; bez VIN i tablic. Cena z walutą, koszt dostawy jeśli znany, sprzedawca, stan, źródło i czas. Brak gwarancji dopasowania.

Wspólny prywatny serwer i token aplikacji; funkcje niezależne od klucza AI. Brak kluczy eBay blokuje oferty jawnym błędem. Zgoda przed wysłaniem lokalizacji lub zapytania. Anulowanie, limity, cache i walidacja odpowiedzi. Bez zmian schematu garażu; wyniki i token tylko w pamięci. Istniejąca diagnostyka i radio pozostają bazą.

Rozważono linki do map/sklepów (odrzucone przez użytkownika) i oficjalne API (wybrane). Własny pełny katalog, rezerwacje i płatności wymagają odrębnych umów. Publiczne OSM tylko umiarkowany ruch prywatny; do produkcji własna instancja/usługa. Fizyczne testy OBD/radia i produkcyjne konto eBay pozostają wymagane.
