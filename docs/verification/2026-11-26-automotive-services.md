[Polski](2026-11-26-automotive-services.md) | [English](2026-11-26-automotive-services.en.md) | [Deutsch](2026-11-26-automotive-services.de.md)

# Warsztaty i ceny części — weryfikacja

Zaimplementowano i podłączono ekrany warsztatów oraz ofert części, klienta z walidacją i anulowaniem, autoryzowane trasy serwera i oficjalne adaptery dostawców. Konfiguracja i token są w pamięci sesji. Bez migracji garażu, bez nowych zależności. Praca odbyła się w istniejącym katalogu i gałęzi zgodnie z poleceniem kontynuowania bez pytań; inne równoległe zmiany pozostawiono.

Wyniki: 231 testów przeszło, zero błędów. Nowe testy obejmują 7 przypadków klienta i 7 przypadków serwera. Typy, lint, dokumentacja i kontrola diff bez błędów. Eksport web oraz pakiety Hermes dla iOS i Androida zakończone powodzeniem. To nie są podpisane instalacyjne APK/IPA.

```sh
node --test tests.mjs tests/*.test.mjs mobile/tests/*.test.mjs server/*.test.mjs
npm run typecheck --prefix mobile
npm run lint --prefix mobile
python3 scripts/check-docs.py
npm run export:web --prefix mobile
npm run export:native --prefix mobile -- --output-dir /tmp/vehiclesensex-native-final
git diff --check
```

Przegląd kodu wykrył brak odblokowania wyszukiwania po powrocie z ustawień i zbyt mały limit pamięci wykonania Overpass. Pierwszy naprawiono przez reset stanu zajętości przy powrocie fokusu; drugi przez usunięcie limitu pamięci zapytania przy zachowaniu ograniczenia odpowiedzi. Zmiana auta/konfiguracji odtwarza ekran z nowym kontekstem i anuluje poprzednie zapytania.

Rzeczywisty interfejs sprawdzono w lokalnej przeglądarce i widoku 390×844 z kontrolowanym transportem dostawców: konfiguracja, zgoda, wyszukanie miejscowości, wybór punktu, wynik warsztatu z telefonem i nawigacją, dwie oferty w różnych walutach, nieznana dostawa, znana suma dostawy, ręczne anulowanie i opuszczenie aktywnego wyszukiwania przez ustawienia. Po powrocie formularz i przycisk wyszukiwania były odblokowane, bez spóźnionego wyniku. Dane testowe istnieją wyłącznie w tymczasowym lokalnym procesie testowym.

Nie uruchomiono dostawców na żywo: automatyczna kontrola uprawnień odrzuciła próbę OSM z powodu przesyłania konkretnych współrzędnych testowych. Ograniczenia nie obchodzono. Nie ma skonfigurowanego prywatnego serwera ani produkcyjnych kluczy eBay w lokalnym środowisku. Produkcyjne ceny wymagają konta i dostępu Browse API. GPS, OBD i radio wymagają weryfikacji na telefonie i sprzęcie. Usługi nie zostały publicznie wdrożone. Instrukcja uruchomienia: [usługi](../../mobile/SERVICES.md).
