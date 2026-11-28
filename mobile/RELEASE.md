[Polski](RELEASE.md) | [English](RELEASE.en.md) | [Deutsch](RELEASE.de.md)

# Wydanie VehicleSenseX 0.6.0

Źródło 0.6.0/build 8 dodaje osobny pełny skan CAN z CALID, CVN i nazwą sterownika. Zachowano kokpit, gotowość emisji, temperaturę oleju i porównania warsztatowe z main. [Instrukcja i zakres](ECU-IDENTIFICATION.md)

Wersja 0.5.0/build 7 rozszerza diagnostykę o katalog 54 standardowych parametrów, gotowość emisji, freeze frame 0, wybór Live Data, wykres 300 cykli, porównanie odczytów i eksport JSON/CSV/PDF/HTML.

Zweryfikowano podpisane pakiety Android APK/AAB i iOS Release na symulator dla 0.5.0/build 7 ze źródła `35258e9`. Poprzedni APK/AAB 0.4.0/build 6 nie zawiera rozszerzeń 0.5.0. Brak aktywnego konta Apple Developer nadal wyklucza podpisane wydanie IPA do App Store. Nie wysłano aplikacji do sklepów. [Zakres i weryfikacja](../docs/verification/2026-11-27-advanced-diagnostics.md)

Wersja 0.4.0 dodaje automatyczny skan ECU, osobne Live Data, obsługę utraty połączenia i próbę dźwięku radia przez systemowe Bluetooth. [0.4.0](../docs/verification/2026-11-26-obd-radio.md)

## 0.3.0

Kod 0.3.0/build 4 dodaje pozostałe wydatki z kategorią, dokładną kwotą PLN, edycją/usuwaniem, sumami miesiąca/roku i osobnym CSV. Schemat 3 migruje starsze garaże i kopie; starsze wersje aplikacji nie odczytają schematu 3. Import kopii odrzuca przyszłe daty wydatków, natomiast istniejący magazyn pozostaje dostępny po cofnięciu zegara. Szczegóły wydatków pozostają poza kontekstem AI i raportem sprzedażowym. Podpisany AAB Androida 0.3.0 i pakiet iOS Release na symulator zostały zbudowane i sprawdzone wraz z rejestrem.

Bieżące kontrole kodu i wyniki interfejsu: [weryfikacja 0.3.0](../docs/verification/2026-11-26-ownership-expenses.md).

Kod 0.2.2/build 3 poprawia nieaktualne harmonogramy i wyświetlanie powiadomień przy otwartej aplikacji, sprawdza je po powrocie i pobiera wyświetlaną wersję z konfiguracji Expo. Przeszło siedem nowych testów regresji; pełny zestaw ma wynik 171/171, typy i lint także przeszły. Paczki natywne 0.2.2 zostały zbudowane i sprawdzone; dostarczanie powiadomień na sprzęcie pozostaje niesprawdzone.

Niezależny przegląd nie wykazał problemów wymagających poprawy w tym zakresie. Zmiana strefy czasowej przy ciągle otwartej aplikacji jest uwzględniana po następnym powrocie; nie ma stałego obserwatora strefy czasowej. Import kopii już wcześniej wyłączał przywrócone powiadomienia do ich ponownego jawnego włączenia.

Podpisany AAB Androida 0.2.2 i pakiet iOS Release na symulator zostały zweryfikowane. [Bieżąca weryfikacja i pozostałe zadania](../docs/verification/2026-11-26-reminder-builds.md).

Wersja 0.2.1/build 2 z rewizji `63b273d` ma zweryfikowany podpisany produkcyjny AAB Androida i pakiet iOS Release na symulator, z eksportem GPX i uzupełnianiem danych NHTSA. Wyniki: [raport kompilacji 0.2.1](../docs/verification/2026-11-26-vin-gpx-builds.md). Wcześniejszy instalowalny APK walidacyjny pozostaje w wersji 0.2.0 i nie zawiera tych funkcji.

Status: implementacja z rzeczywistymi transportami BLE/TCP/Android Classic, bez demonstracyjnych pomiarów. Natywna kompilacja iOS Release na symulator zakończyła się powodzeniem 2026-11-26; sprawdzono końcowy plik aplikacji, uprawnienia i obecność klas BLE/TCP. Android Release APK również zbudowano poprawnie po usunięciu błędu BuildConfig w Classic przez plugin CNG; sprawdzono manifest, moduły, podpis testowy i wyrównanie bibliotek. Produkcyjny AAB Androida został podpisany nowym kluczem w Expo po jawnej zgodzie użytkownika i przeszedł weryfikację artefaktu. Nie ma sklepowego IPA ani potwierdzonej macierzy sprzętowej; nie wykonano zgłoszenia do sklepów. Bieżące wyniki: [raport kompilacji](../docs/verification/2026-11-26-native-builds.md).

Kontrola konfiguracji 2026-11-25: `expo prebuild --no-install --platform all` zakończył się poprawnie w oddzielnej kopii tymczasowej. Nie utworzono `ios/` ani `android/` w repozytorium. Sprawdzono wygenerowane Info.plist, AndroidManifest i jasny motyw. Kamera/mikrofon/szeroki dostęp do zdjęć/nakładki są usuwane, brak lokalizacji Always i rejestracji w tle. Wynik: [raport konfiguracji](../docs/verification/2026-11-25-native-config.json). To konfiguracja projektu przed scaleniem manifestów bibliotek i kompilacją, nie wynik kontroli finalnego APK/IPA.

Expo Doctor: 19/20 kontroli. Brakujący bezpośredni peer `expo-font` uzupełniono przez Expo CLI; `expo-system-ui` zapewnia zadeklarowany jasny styl Androida. Pozostała kontrola Directory: `react-native-bluetooth-classic` i `react-native-tcp-socket` mają status „Untested on New Architecture”. Nie wyciszono ostrzeżenia. TCP skompilował się i został dołączony do iOS Release przez interop RN 0.88; Classic jest tylko na Androidzie. Sam kompilator nie potwierdza połączenia z adapterem ani obsługi zgód i zdarzeń na telefonie.

## Wytworzenie paczek

Projekt jest przypisany do istniejącego konta Expo `@rubisco4471/vehiclesensex`; `extra.eas.projectId` i `owner` są zapisane w `app.json`. Przy zmianie wydawcy należy przeprowadzić transfer projektu w Expo. Nadal wymagane są uprawnienia do identyfikatora aplikacji i podpisów w Apple/Google. Identyfikator `com.vehiclesensex.app` nie został zarejestrowany ani sprawdzony pod kątem dostępności w sklepach. Nie dodawaj kluczy i plików podpisujących do repozytorium.

```sh
cd mobile
nvm use
npm ci
npm run verify
npx eas-cli@latest login
npm run build:native-check
npx eas-cli@latest build --platform android --profile preview
npx eas-cli@latest build --platform android --profile production
npx eas-cli@latest build --platform ios --profile production
```

Zachowaj istniejące profile w `eas.json`. `native-check` kompiluje Android Release APK bez przekazania klucza produkcyjnego oraz iOS Release na symulator, bez konta Apple. To nie są paczki do publikacji. Preview Android tworzy APK do instalacji; production Android tworzy AAB. Profil iOS store wymaga poświadczeń Apple. Przed kolejnym wydaniem zwiększ `android.versionCode` i `ios.buildNumber` w `app.json`. Samo `expo export` nie kompiluje natywnych sterowników BLE/TCP/SQLite.

Archiwum dla Expo jest ograniczone przez główny `.easignore` do źródeł `mobile/`, zasobów i konfiguracji; katalogów zanegowanych w allowliście nie kończ ukośnikiem, ponieważ etap kopiowania sprawdza ścieżki bez niego. `plugins/withClassicBuildConfig.cjs` jest wymaganym wejściem CNG i musi trafić do archiwum. Przed wysłaniem zmienionej allowlisty sprawdź `eas build:inspect --platform android --profile native-check --stage archive --output /private/tmp/vehiclesensex-archive-check`; nie wysyłaj `.env`, kluczy ani lokalnych ustawień narzędzi.

Próba produkcyjnego iOS zatrzymała się przed budowaniem z powodu braku certyfikatu/profilu dystrybucyjnego. Wydawca musi skonfigurować podpis interaktywnie i potwierdzić deklarację eksportu szyfrowania dla App Store Connect. Użytkownik zatwierdził utworzenie nowego klucza podpisującego Androida w Expo; klucz został utworzony, a podpisany AAB zbudowano i sprawdzono. Nieaktywne konto Apple Developer blokuje sklepowe IPA. Starszy APK walidacyjny 0.2.0 ma podpis Android Debug; przed odinstalowaniem go w celu instalacji wersji z innym podpisem wyeksportuj własne dane. Wyniki i pliki lokalne w `artifacts/` nie zawierają prywatnych kluczy podpisujących.

SDK 58 ma jawnie ustawione Android compileSdk 37 / targetSdk 36 oraz iOS 16.4. Przy przyszłym podniesieniu targetSdk do 37 trzeba dodać i sprawdzić nową zgodę `ACCESS_LOCAL_NETWORK`; dla targetSdk 36 dokumentacja Androida wskazuje dostęp przez INTERNET. iOS ma opis użycia sieci lokalnej; nie ma globalnego wyłączenia ATS ani zbędnych deklaracji lokalizacji „Always”.

## Sprawdzenia na urządzeniach

Należy zapisać wynik dla konkretnego modelu telefonu, systemu, adaptera i samochodu:

- BLE: odmowa zgody, radio wyłączone, skan, wykrywanie usługi, inicjalizacja, PID/DTC, utrata zasięgu, ponowne połączenie.
- Classic/SPP na Androidzie: lista sparowanych urządzeń, odmowa Bluetooth Connect, połączenie RFCOMM, surowe fragmenty, timeout i rozłączenie. Moduł Classic jest wykluczony z autolinkingu iOS.
- Wi-Fi: odmowa dostępu do sieci lokalnej iOS, prawidłowa sieć/IP/port, sieć bez internetu, równoległe dane komórkowe Androida, brak adaptera, zerwanie i timeout.
- OBD: protokoły CAN 6/7/8/9, wykrycie jednego/wielu ECU, wybór rzeczywistego adresu, fizyczne nagłówki/filtr, odpowiedzi ISO-TP i zachowany zakres w historii/raporcie/AI. Sprawdzić odmowę zmiany filtra, nieobsługiwany PID/status, brak kodów w odczytanych statusach, kopię przed kasowaniem, rzeczywiste potwierdzenie 44 wybranego ECU i ponowny odczyt. Nie testować kasowania podczas jazdy.
- VIN: rzeczywisty odczyt 0902 wybranego ECU CAN, brak obsługi, niepełny/niewłaściwy numer, porównanie z dokumentami, potwierdzenie zastąpienia, stary profil zmieniony przed zapisem, restart i kopia z zachowanym źródłem. Nie utożsamiać odczytu z potwierdzeniem autentyczności.
- GPS: odmowa zgody, gorsza dokładność, pauza/wznowienie, blokada zmiany auta, przejście w tło, restart i odzyskanie szkicu, utrata miejsca na dysku. Heurystyki zdarzeń wymagają kalibracji.
- SQLite: aktualizacja ze starego zapisu, historia większa niż 2 MB, zapis/odczyt po restarcie, brak miejsca, eksport i przywrócenie własnej kopii.
- Media: wybór rzeczywistego zdjęcia, kompresja, zapis faktury PDF, ponowne otwarcie, usuwanie i odtworzenie załączników z kopii.
- Katalog offline: wyszukiwanie marki/modelu w trybie samolotowym, wybór z klawiaturą ekranową i VoiceOver/TalkBack, zmiana marki, ręczny brakujący samochód i edycja istniejących nazw. Źródła i licencje muszą być dostępne w wydanej wersji. Podgląd web nie zastępuje kontroli klawiatury i czytnika ekranu na telefonie.
- Powiadomienia i PDF: rzeczywiste wyświetlenie o terminie, cofnięcie zgody, anulowanie po wykonaniu/usunięciu terminu, otwarcie pliku PDF poza aplikacją.

Te testy nie zostały zastąpione testami TCP na komputerze ani podglądem web.

## Serwer AI

Instrukcja: `server/README.md`. Serwer wymaga klucza OpenAI i prywatnego tokenu. Produkcyjny adres musi używać HTTPS. Nie ma skonfigurowanej domeny, hostingu ani klucza; nie wykonano płatnego testu z rzeczywistym kontem OpenAI.

Aktualny serwer jest przeznaczony dla kontrolowanego wdrożenia z prywatnymi tokenami. Przed masową usługą publiczną należy wdrożyć uwierzytelnianie i limity dla poszczególnych użytkowników oraz wspólny limit na bramie wielu instancji. Nie wolno umieszczać wspólnego płatnego tokenu w binarce ani w `EXPO_PUBLIC_*`.

## Informacje wydawcy i dystrybucja

Przed zgłoszeniem uzupełnij prawdziwe dane wydawcy, kontakt, publiczny adres polityki prywatności, deklaracje przetwarzania odpowiadające uruchomionym usługom oraz zrzuty z podpisanej wersji na urządzeniach. Ekran „Twoje dane” opisuje zachowanie aplikacji, lecz nie zastępuje publicznej polityki konkretnego operatora.

Ikona aplikacji jest w `assets/brand/icon.png`; źródło wektorowe w `icon.svg`. Nie są to zrzuty sklepowe ani potwierdzenie rejestracji znaku/nazwy. Nie uruchomiono publikacji, płatności za usługi ani automatycznego zgłoszenia do sklepów.

Źródła: [Expo EAS](https://docs.expo.dev/build/eas-json/), [Android Local Network](https://developer.android.com/privacy-and-security/local-network-permission), [Apple Local Network](https://developer.apple.com/documentation/technotes/tn3179-understanding-local-network-privacy).

## Zmiany0.2.1

Eksport GPX zachowuje rzeczywiste segmenty GPS i czasy UTC, bez łączenia przerw. Opcjonalne zapytanie NHTSA wysyła VIN do usługi w USA dopiero po zgodzie powiązanej z tym VIN; przed zapisaniem wymaga wyboru pól. Źródło i czas pobrania są zachowane przy nadal zgodnych wartościach, także w kopii JSON. Nie trafiają do AI ani raportu sprzedaży. Zasady i ograniczenia: [dane z VIN](VIN.md). Deklaracje prywatności wydania muszą uwzględniać ten dobrowolny przepływ oraz eksport dokładnych tras GPX.

Moduł radia jest lokalnym modułem Expo w `mobile/modules/vehicle-radio`; archiwum EAS musi zawierać jego źródła Swift/Kotlin i konfigurację. Odczyt wyjść wymaga nowej kompilacji natywnej; aktualizacja samego JS nie doda modułu do istniejącej aplikacji. Opcjonalny plugin CarPlay jest domyślnie wyłączony: standardowa konfiguracja nie dodaje entitlement ani sceny CarPlay. Android Auto nie jest zadeklarowane. Przed wydaniem sprawdź radio A2DP/USB, zmianę wyjścia i odłączenie, iOS Car Audio, głos offline, przerwanie czytania w tle i brak uprawnienia Bluetooth na konkretnych telefonach.

[Kokpit, własne zdjęcie auta i ograniczenia CarPlay/Android Auto](COCKPIT.md)
