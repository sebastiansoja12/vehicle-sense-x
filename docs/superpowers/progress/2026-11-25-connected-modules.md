[Polski](2026-11-25-connected-modules.md) | [English](2026-11-25-connected-modules.en.md) | [Deutsch](2026-11-25-connected-modules.de.md)

# Rejestr SDD — plan: docs/superpowers/plans/2026-11-25-connected-modules.md

- Decyzja: użytkownik jawnie zlecił ciągłą implementację bez przerw na akceptację. Zachować zatwierdzony interfejs/stos i kontynuować z udokumentowanymi ustawieniami domyślnymi.
- Decyzja: repozytorium nadal nie ma pierwszego commita i zawiera istniejącą nieśledzoną pracę; zachować bieżącą kopię roboczą i izolować zmiany agentów przez jawny podział plików. Nie zlecono scalania ani wysyłania do repozytorium zdalnego.
- Kontrola wstępna: trasy i diagnostyka udostępniają niezależne typy rekordów; agent główny odpowiada za wspólny model/schemat/Provider, instalację pakietów i wszystkie ekrany. Agent serwera odpowiada za niezależne pliki serwera/klienta. Agenci nie edytują wspólnych plików.
- Decyzja: śledzenie w tle i walidacja sprzętowa wymagają urządzeń; wdrożyć rejestrator przy otwartej aplikacji i rzeczywiste konfigurowalne transporty, raportując brak walidacji fizycznej. Użytkownik później całkowicie odrzucił demo; z aplikacji mobilnej usunięto kod demo, wygenerowany obraz samochodu i przykładowe rekordy.

## Zaimplementowane i zintegrowane

- Model GPS, rejestrator przy otwartej aplikacji, szeregowo zapisywany szkic możliwy do odzyskania, blokada właściciela, dzierżawa rejestracji web, historia tras i rzetelne heurystyki GPS. Pauzy i luki dzielą ślad; brakujące pomiary nigdy nie stają się oceną punktową.
- Parser/sterownik ELM327 i kolejka poleceń, wykrywanie BLE/profil ręczny, rzeczywiste Wi-Fi TCP i Android Classic/SPP. Statusy odczytu rozróżniają brak wiedzy od udanej odpowiedzi z zerem. Kasowanie wymaga bieżącego odczytu, zapisanej/udostępnionej kopii i osobnego potwierdzenia. Brak deklaracji zgodności sprzętowej z każdym adapterem: odpowiedzi wielu ECU/segmentowane nadal kończą się jawnym błędem.
- Serwer HTTP AI z prywatnym uwierzytelnieniem, limitami i minimalnym kontekstem z białej listy; klient oparty na zgodzie. Bez przesyłania VIN, tablic, mediów lub GPS. Nie wykonano płatnego żądania do OpenAI; publiczne uwierzytelnienie wielu użytkowników/wdrożenie pozostają poza zakresem obecnego serwera z prywatnym tokenem.
- Schemat v2, obsługa błędów zapisu, walidowana migracja do SQLite na platformach natywnych, przypomnienia/powiadomienia serwisowe, raporty, CSV i walidowane przywracanie JSON. Eksport i import kopii mają wspólny limit 20 MB UTF-8.
- Dane techniczne pojazdu, rzeczywiste zdjęcia samochodów wybrane przez użytkownika, PDF/obrazy serwisowe, ograniczone osadzone zasoby lokalne i zachowanie archiwum. Przygotowanie obrazu można anulować, a nieaktualne wyniki selektora są odrzucane.
- Skonfigurowano profile wydań, ikonę, informacje o prywatności, uprawnienia i identyfikatory pakietów. Nie wykonano połączenia konta, podpisywania, kompilacji natywnych plików binarnych ani zgłoszenia do sklepów.

## Najnowsza weryfikacja — 2026-11-25

- Uruchomienie testów przez agenta głównego: 107 przeszło, kod 0 (94 mobile, 9 serwera HTTP, 4 wcześniejszego prototypu).
- TypeScript i Expo lint aplikacji mobilnej: kod 0.
- Eksporty Expo: web i JS/Hermes iOS/Android, kod 0 po zmianach anulowania kopii/mediów.
- JSON autolinkowania natywnego: BLE i TCP wykryte na iOS/Android; Classic tylko na Androidzie, zgodnie z założeniem.
- Audyt zależności po ukierunkowanym nadpisaniu minimatch: zero zgłoszonych podatności przy instalacji. Pomocnicze funkcje glob Expo fingerprint sprawdzono ze zaktualizowaną zależnością pośrednią.
- Kontrola w przeglądarce: pusty główny garaż/prywatność oraz odizolowany zapis formularza z danymi technicznymi w kompilacji produkcyjnej. Automatyzacja selektora plików wygasła; wyboru/przesyłania mediów NIE zweryfikowano. Nie używać starego zrzutu demo jako obrazu bieżącej aplikacji.
- Niezależny końcowy przegląd agenta niedostępny, ponieważ kolejne uruchomienia zgłosiły limit kredytów obszaru roboczego. Wykonano lokalny przegląd integracji; zewnętrzny sprzęt/dialogi systemowe i podpisane kompilacje natywne pozostają niezweryfikowane. Patrz mobile/RELEASE.md.

## Analiza katalogu pojazdów

Najnowsze wskazanie użytkownika dotyczy publicznej bazy marek/modeli. Analizę zapisano w `docs/research/2026-11-25-vehicle-catalogs.md`. Dane kandydujące sprawdzono wyłącznie w /private/tmp; nie dołączono nowej zależności katalogowej ani zbioru danych. Pochodzenie źródeł, znaczenie lat oraz mieszane nazwy modeli/wersji muszą pozostać widoczne w projekcie integracji.

## Późniejsza implementacja w tej sesji

Powyższy stan samej analizy został zastąpiony jawnym zleceniem integracji przez użytkownika. Patrz `2026-11-25-offline-catalog.md`: dołączony wybór offline, wpis ręczny, źródła i niezależny przegląd. Dalsza praca dodała wybór rzeczywistych CAN ECU/ISO-TP i lokalny potwierdzany odczyt VIN; patrz `2026-11-25-can-ecu.md` i `2026-11-25-obd-vin.md`, każdy z niezależnym przeglądem. Powyższe ograniczenie wielu ECU w CAN dotyczy teraz ścieżki starszej/poza CAN; wybrane standardowe sterowniki CAN są obsługiwane w kodzie.

Najnowsza końcowa weryfikacja znajduje się w `2026-11-25-release-preflight.md`: 135 testów przeszło, typy/lint/eksporty JS na trzy platformy zakończone powodzeniem; CNG wygenerowało obie konfiguracje natywne w kopii tymczasowej. Doctor pozostaje przy 19/20, ponieważ Classic/TCP oznaczono jako nieprzetestowane na New Architecture. Nie powstały natywne skompilowane pliki binarne, nie wykonano fizycznych testów adapterów, rzeczywistego wywołania AI ani publikacji w sklepach.
