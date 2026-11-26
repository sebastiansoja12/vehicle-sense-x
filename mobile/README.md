[Polski](README.md) | [English](README.en.md) | [Deutsch](README.de.md)

# VehicleSenseX — aplikacja mobilna

React Native 0.88.1, Expo SDK 58, React 19.3 i TypeScript 6. Wersja źródłowa 0.4.0. Własny garaż startuje pusty; aplikacja nie ma trybu demonstracyjnego, przykładowego samochodu ani generatora pomiarów. W katalogu nadrzędnym zachowano osobny, wcześniejszy prototyp HTML.

## Uruchomienie

Node 24.18.0 (`.nvmrc`), npm. W katalogu `mobile/`:

```sh
nvm use
npm ci
npm run web
```

Podgląd bieżącej sesji: **http://127.0.0.1:8083/**. Bluetooth i surowe TCP do adaptera działają wyłącznie w skompilowanej aplikacji iOS/Android. Expo Go i przeglądarka nie zawierają tych sterowników. Nie należy mylić lokalnego podglądu z instalacyjnym APK/IPA.

## Zaimplementowane moduły

- Garaż wielu samochodów, wybór auta, edycja i usuwanie wraz z przypisanymi rekordami. Formularz ma katalog offline marek i modeli z wyszukiwaniem oraz pełny wpis ręczny brakującego samochodu. VIN można wpisać ręcznie lub odczytać z obsługującego go sterownika CAN; zapis odczytanego numeru wymaga podglądu i potwierdzenia. Są opcjonalne dane mocy, momentu, pojemności, skrzyni, napędu i wyposażenia oraz własne zdjęcia z telefonu.
- Paliwo i koszty: pełne i częściowe tankowania, grosze/mililitry, spalanie pełny–pełny, miesiąc/rok, średnia ważona cena i szacunkowy koszt 100 km.
- Serwis: historia, notatki, koszty, faktury PDF/zdjęcia, edycja, usuwanie, terminy według daty lub przebiegu. Lokalne powiadomienie o dacie włączane osobno za zgodą systemową.
- Trasy: ręczne przejazdy i rejestrator GPS przy otwartej aplikacji. Pauza w tle, szkic zapisywany na urządzeniu, odzyskanie po restarcie, oznaczone przerwy śladu, blokada zmiany auta podczas szkicu. Web Locks chronią jednoczesne rejestrowanie w kilku kartach.
- Analiza: dystans, czas, prędkość i heurystyki przyspieszania/hamowania z poprawnych pomiarów GPS. Brak danych pozostaje brakiem danych; nie generujemy Eco Score.
- OBD2: rzeczywiste transporty ELM327 **Bluetooth BLE**, **Bluetooth Classic/SPP na Androidzie** i **Wi-Fi/TCP**, odczyt wspieranych PID, napięcia i trzech statusów DTC, historia i import/eksport raportu. Kasowanie wymaga bieżącego rzeczywistego odczytu, zachowanej kopii i oddzielnego potwierdzenia; jest blokowane podczas szkicu GPS.
- Kondycja i wartość: datowane źródła diagnostyczne i wpisy właściciela, terminy, przedział/mediana minimum dwóch ofert podanych przez właściciela z ostatnich 90 dni; raport PDF na telefonie lub HTML w przeglądarce.
- Asystent: lokalne podsumowanie faktów oraz rzeczywiste wywołanie skonfigurowanego proxy OpenAI po zgodzie. Nie zawiera gotowych odpowiedzi udających AI. Uruchomienie API opisuje [serwer](../server/README.md).

Eksport CSV obejmuje osobno paliwo, serwis, pozostałe wydatki i trasy. Pełna kopia JSON zachowuje wszystkie dane, także VIN, tablice, notatki, zdjęcia, faktury i współrzędne GPS. Pliki mają limit 1 MB oraz 5 załączników przy samochodzie lub serwisie; zdjęcia auta są zmniejszane do 1200 px. Przywrócenie najpierw waliduje format, pokazuje zawartość i wymaga potwierdzenia zastąpienia garażu. Powiadomienia z kopii trzeba włączyć ponownie. Limit importu kopii wynosi 20 MB.

Eksport GPX 1.1 jest dostępny przy zapisanej trasie GPS, obok JSON. Zawiera rzeczywiste poprawne punkty i czasy UTC; przerwy są osobnymi segmentami, bez dopisywania wysokości ani prędkości. Wpis ręczny lub mniej niż dwa poprawne punkty nie tworzą GPX. Plik ujawnia dokładną lokalizację i czas.

Wersja 0.2.2 poprawia nieaktualne daty i treści powiadomień serwisowych, jednorazowo zastępuje stare harmonogramy i sprawdza je po powrocie do aplikacji, także po zmianie strefy czasowej. Powiadomienia przy otwartej aplikacji są wyświetlane bez dźwięku. Ustawienia odczytują wersję z konfiguracji Expo. Te zmiany zawiera zweryfikowany podpisany AAB Androida 0.2.2 i pakiet iOS na symulator.

## Pozostałe wydatki

W module paliwa i kosztów dodasz ubezpieczenie, parking, opłaty drogowe, podatki/opłaty i inne koszty samochodu. Wpis zawiera datę, kategorię, nazwę, kwotę PLN i opcjonalną notatkę; możesz go edytować lub usunąć po potwierdzeniu. Przebieg pozostaje bez zmian. Sumy miesiąca/roku, ekran główny i raport kondycji uwzględniają każdy wpis raz. Koszt 100 km oznacza szacunek samego paliwa.

CSV wydatków zawiera nazwy i notatki — sprawdź je przed udostępnieniem. Pełna kopia zachowuje wpisy, a usunięcie samochodu usuwa jego koszty. Szczegóły tych wydatków pozostają poza kontekstem AI i raportem sprzedażowym; raport uwzględnia tylko sumę. Wpis ręczny i import kopii odrzucają przyszłe daty wydatków; odczyt istniejącego magazynu toleruje cofnięcie zegara. Wersja 0.3.0/build 4 ma zweryfikowany podpisany AAB Androida i pakiet iOS na symulator, zawierające tę funkcję.

## Katalog offline

Formularz dodawania/edycji auta pozwala wybrać markę, a następnie jej model. Zmiana marki czyści poprzedni model; wpis ręczny i przełączanie trybów zachowują pozostałe pola. Wpisane wcześniej, nieznane katalogowi samochody otwierają się jako wpis ręczny. Zapisywany jest dotychczasowy format pojazdu — nie ma migracji ani automatycznej podmiany nazw.

Do aplikacji dołączono odtwarzalny podzbiór MeterApp vehicle-db: 563 marki i 17 966 nazw modeli/wariantów z NHTSA, UK DfT, EEA i RDW (~289 KB). Nie są pobierane żadne dane przy wyszukiwaniu. Katalog nie potwierdza produkcyjnego rocznika, generacji, silnika ani wyposażenia; te dane uzupełnia właściciel. Warianty i niejednolite nazwy źródłowe pozostają wyszukiwalne, a brakujące auta można wpisać samodzielnie.

Źródła/licencje są dostępne przy polach formularza i w ustawieniach. Przypięty commit, hash, warunki źródeł i instrukcja aktualizacji: [katalog](assets/catalog/README.md). Do wygenerowania danych służy `node scripts/build-vehicle-catalog.mjs`; zwykły start/budowa nie wymagają pobierania katalogu.

## Adapter

**Bluetooth BLE:** wyszukaj urządzenia, wybierz swój adapter i połącz. Natywny sterownik wykrywa jednoznaczną, niestandardową usługę szeregową na podstawie rzeczywistych właściwości charakterystyk. Jeśli kilka usług pasuje, nie zgaduje: UUID można podać w ustawieniach zaawansowanych. Sam napis „ELM327 Bluetooth” nie oznacza BLE; Bluetooth Classic/SPP jest osobną opcją na Androidzie: sparuj adapter w ustawieniach systemowych i wybierz go z listy sparowanych urządzeń. Na iOS używaj BLE lub Wi-Fi; obsługa akcesoriów Classic/MFi wymaga indywidualnego protokołu producenta.

**Wi-Fi:** połącz telefon z siecią adaptera w ustawieniach systemowych i podaj jego lokalny adres IPv4 oraz port TCP z instrukcji. Aplikacja otwiera rzeczywiste gniazdo TCP, bez pośrednika internetowego, WebSocketów ani symulacji. Używa routingu systemowego; nie wymusza globalnie sieci dla wszystkich połączeń aplikacji. Na Androidzie zachowanie sieci adaptera bez internetu i równoległych danych komórkowych wymaga testu konkretnego telefonu.

Obsługiwany jest strumień ASCII ELM327. Dla ISO 15765-4 CAN wykrywa rzeczywiste adresy ECU, pozwala wybrać sterownik i składa jego odpowiedzi ISO-TP. Pomiary, kody i kasowanie dotyczą wybranego ECU; jego adres i protokół zachowujemy w historii i raportach. Starsze protokoły nadal wymagają pojedynczych odpowiedzi bez segmentacji. Nie gwarantuje zgodności każdego adaptera ani dostępu do wszystkich sterowników samochodu. Szczegóły: [OBD](src/obd/README.md).

## Odczyt VIN

Po wybraniu sterownika CAN w diagnostyce można wykonać lokalne zapytanie mode 09 PID 02. Nie każdy sterownik je obsługuje. Numer jest sprawdzany pod kątem formatu i kompletności; brak danych, niepełna odpowiedź i pusty numer złożony z zer są odrzucane. Zapis w profilu wymaga potwierdzenia, nie zmienia marki/modelu/silnika i chroni VIN zmieniony w międzyczasie. Źródło (czas, adapter, ECU) zostaje przy VIN i w kopii JSON. Ręczna zmiana numeru usuwa stare źródło. To odczyt ECU, bez potwierdzenia autentyczności czy specyfikacji pojazdu. VIN i jego źródło nie są wysyłane do AI ani zamieszczane w raporcie sprzedażowym.

Opcjonalne uzupełnienie formularza korzysta z rzeczywistego NHTSA vPIC po osobnej zgodzie na wysłanie wyłącznie VIN. Wynik pokazuje podgląd i osobny wybór pól; domyślnie zaznaczone są tylko puste pola. Marka, model, rok modelowy, całkowita pojemność cm³, skrzynia i napęd mają zapisane źródło oraz czas pobrania. Zmiany pól i VIN unieważniają nieaktualne powiązania. NHTSA nie gwarantuje kompletności ani pokrycia aut europejskich. Szczegóły, ograniczenia i prywatność: [dane z VIN](VIN.md).

## Zapis i prywatność

Na telefonie używamy `expo-sqlite/kv-store`, aby większe historie GPS nie trafiały na limit pojedynczego rekordu AsyncStorage na Androidzie. Starszy zapis jest walidowany i kopiowany przed usunięciem kopii ze starego magazynu. Web używa AsyncStorage/localStorage oraz Web Locks. Repozytorium zatwierdza stan dopiero po trwałym zapisie; nie zastępuje uszkodzonych danych pustym garażem. Schematy 1 i 2 są migrowane do 3. Nowy format zachowuje pozostałe wydatki; starsze aplikacje go nie otworzą. Przed powrotem do starszej wersji zachowaj kopię danych.

Baza nie jest dodatkowo szyfrowana przez aplikację. Android ma wyłączoną automatyczną kopię aplikacji; zachowanie kopii systemowych iOS zależy również od platformy. W aplikacji jest ekran opisujący dane i dobrowolne wysyłanie kontekstu AI. Publiczną politykę operatora trzeba przygotować dla rzeczywistego wydawcy przed publikacją.

`EXPO_PUBLIC_ASSISTANT_URL` może zawierać wyłącznie publiczny adres serwera. Klucz OpenAI jest wyłącznie w środowisku serwera, a token dostępu użytkownik podaje na ekranie asystenta; token nie jest zapisywany i znika po opuszczeniu ekranu. Nie konfiguruj sekretów w publicznych zmiennych Expo.

## Sprawdzenie i kompilacje

```sh
npm run verify
npm run export:web
npm run export:native
```

Testy modelu, repozytorium, parserów, migracji i klienta API działają w Node 24. Testy HTTP/TCP otwierają wyłącznie lokalne porty testowe i nie wykonują płatnych połączeń z AI. Eksport natywny tworzy pakiet JavaScript/Hermes, **nie podpisane IPA/APK/AAB**.

`eas.json` zawiera profile `development`, `preview` (instalacyjny APK), `production` (AAB / iOS store) i `native-check` (Android Release APK oraz iOS Release na symulator). Projekt jest przypisany do `@rubisco4471/vehiclesensex`. Walidacyjny APK Android Release zbudowano po ukierunkowanej poprawce CNG dla BuildConfig biblioteki Classic; iOS Release na symulator również zbudowano poprawnie. Sprawdzono oba artefakty. Podpisany produkcyjny AAB Androida zbudowano i sprawdzono z nowym kluczem Expo jawnie zatwierdzonym przez użytkownika. Brak aktywnego konta Apple Developer blokuje sklepowe IPA. Testów na fizycznych telefonach i adapterach nie wykonano. Lokalnie są tylko Command Line Tools zamiast pełnego Xcode, bez Android SDK i skonfigurowanego emulatora; kompilacje wykonuje Expo w chmurze. Szczegóły: [instrukcja wydania](RELEASE.md) i [raport kompilacji](../docs/verification/2026-11-26-native-builds.md).

## Pozostały zakres produktu

Nie ma jeszcze kompletnego dekodowania fabrycznej specyfikacji dla wszystkich marek, zewnętrznej wyceny, podkładu mapowego, rejestracji w tle, kont ani synchronizacji. Dostępny jest ograniczony, jawny odczyt danych NHTSA po VIN. Nie prezentujemy tych funkcji jako działających. Przed publikacją konieczne są również realne testy adaptera/telefonów, podpisy, metadane i polityka operatora oraz wdrożenie i konfiguracja własnego serwera, jeśli AI ma być aktywne.

Wersja 0.2.1/build 2 zawiera GPX i uzupełnianie danych NHTSA w zweryfikowanym podpisanym AAB Androida oraz pakiecie iOS na symulator; zobacz [raport kompilacji 0.2.1](../docs/verification/2026-11-26-vin-gpx-builds.md). Instalowalny APK walidacyjny nadal ma wersję 0.2.0. Pozostają testy fizycznych urządzeń i podpisany sklepowy IPA.

## Źródła API

- [Expo SDK 58](https://docs.expo.dev/versions/v58.0.0/), [SQLite](https://docs.expo.dev/versions/v58.0.0/sdk/sqlite/), [Location](https://docs.expo.dev/versions/v58.0.0/sdk/location/)
- [Notifications](https://docs.expo.dev/versions/v58.0.0/sdk/notifications/), [FileSystem](https://docs.expo.dev/versions/v58.0.0/sdk/filesystem/)
- [TCP Socket — oficjalne API](https://github.com/Rapsssito/react-native-tcp-socket), [BLE](https://dotintent.github.io/react-native-ble-plx/)
- [Profile kompilacji Expo](https://docs.expo.dev/build/eas-json/), [BuildProperties](https://docs.expo.dev/versions/v58.0.0/sdk/build-properties/)

Wersja 0.4.0 dodaje automatyczny skan ECU, osobne Live Data, obsługę utraty połączenia i próbę dźwięku radia przez systemowe Bluetooth. [0.4.0](../docs/verification/2026-11-26-obd-radio.md)
