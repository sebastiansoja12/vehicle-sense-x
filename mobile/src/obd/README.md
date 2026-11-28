[Polski](README.md) | [English](README.en.md) | [Deutsch](README.de.md)

# Granice klienta OBD

`index.ts` i `types.ts` to czysty TypeScript, używany przez walidator lokalnego zapisu i testy Node. Importuj `createBleTransport` i `scanDevices` z `./ble` **bez rozszerzenia**, aby Metro wybrało `.native.ts` lub `.web.ts`.

Jawne skanowanie zwraca asynchroniczną funkcję zatrzymania; zatrzymaj je przed połączeniem. Kończy się też po 15 sekundach. Import modułu nie uruchamia menedżera Bluetooth, skanowania, pytania o uprawnienia, połączenia ani komendy OBD. Android API 31+ prosi o SCAN i CONNECT; starszy Android o dokładną lokalizację. Wtyczka konfiguracyjna Expo BLE musi zadeklarować uprawnienia i opis użycia dla iOS. Aplikacja wymaga natywnej kompilacji deweloperskiej; Expo Go nie wystarcza. Wersja web zgłasza brak obsługi BLE. Bluetooth Classic/SPP jest udostępniany osobno na Androidzie przez `classic.android.ts`, z użyciem sparowanych urządzeń i niesegmentowanego strumienia ASCII. Jest wykluczony z autolinkowania iOS; iOS obsługuje BLE i Wi-Fi, bez ogólnej obsługi SPP.

Profil BLE identyfikuje rzeczywiste urządzenie i nazwę adaptera. Przy pustych polach UUID natywne wykrywanie wybiera dokładnie jedną niestandardową usługę szeregową z jedną parą charakterystyk zapisu/powiadomień i wyklucza standardowe usługi GATT w 4-cyfrowej, 8-cyfrowej i kanonicznej 128-bitowej reprezentacji UUID. Niejednoznaczność daje jawny błąd. Profile zaawansowane przyjmują UUID usługi, charakterystyki zapisu i charakterystyki powiadomień od producenta adaptera. Nie zakłada się ogólnego UUID ani uniwersalnej zgodności adapterów. Wykryte możliwości wybierają zapis z potwierdzeniem, jeśli jest dostępny; w przeciwnym razie wymagana jest jawna obsługa zapisu bez odpowiedzi. Odpowiedzi ASCII są przekazywane w powiadomieniach base64. Obsługiwany jest wyłącznie strumień zgodny z ELM327.

Wywołaj `new Elm327Driver(transport, adapterName)`, następnie `initialize()`, a potem `readSnapshot(vehicleId)`. Sterownik odczytuje zadeklarowane strony PID 00–E0 i podstawowe obroty, temperaturę płynu, obciążenie oraz ATRV. Nie odpytuje stron, których nie zapowiedziało ECU. Napięcie ATRV pochodzi z adaptera i jest oddzielone od PID 42 oraz oceny kondycji akumulatora.

Parser z wyłączonymi nagłówkami pozostaje rygorystyczny dla starszych protokołów. Dla ISO 15765-4 CAN (6/7/8/9) pierwsze 0100 uruchamia protokół przed odczytaniem ATDPN. Sterownik włącza ATH1, ATD0 i ATCFC1, wykrywa rzeczywiste identyfikatory odpowiedzi 7E8–7EF lub 18DAF1xx z drugiego zapytania funkcjonalnego, następnie adresuje fizycznie jeden sterownik przez ATSH i filtruje go przez ATCRA. Kilka identyfikatorów wymaga wyboru użytkownika; pojedynczy rzeczywisty identyfikator można wybrać automatycznie. Każdy ładunek odpowiedzi jest programowo sprawdzany względem wybranego identyfikatora. Inne adresowanie, CAN FD, ISO-TP z adresowaniem rozszerzonym i sekwencje negatywnych odpowiedzi oznaczających oczekiwanie pozostają nieobsługiwane. Odpowiedzi wielu sterowników poza CAN nadal kończą się jawnym błędem.

Tryby DTC 03/07/0A zachowują status zapisany/oczekujący/trwały. Pozytywna odpowiedź z zerem różni się od NO DATA. `readStatuses` wymienia dokładnie otrzymane pozytywne odpowiedzi; NO DATA pomija dany status. Brak jakiejkolwiek pozytywnej odpowiedzi DTC kończy odczyt błędem. Przekroczenie czasu, rozłączenie i niepoprawne dane kończą odczyt błędem, nigdy nie tworzą zerowego pomiaru ani pustego raportu. Odczytu częściowego nie wolno przedstawiać jako potwierdzenia braku usterek całego pojazdu. Nawet kompletne odczyty DTC nie certyfikują bezpieczeństwa pojazdu.

Polecenia kanału są kolejkowane, a odpowiedzi kończą się dopiero znakiem zachęty ELM. Przepełnienie, niepoprawne bajty, przekroczenie czasu, błąd zapisu lub rozłączenie odrzucają oczekujące polecenia. Kanał po przekroczeniu czasu pozostaje zamknięty, aby spóźnione bajty nie zostały uznane za odpowiedź na następne zapytanie. Połącz ponownie przed ponowieniem.

Przed `clearFaults({confirmed, backedUpSnapshot, vehicleId, tripRecording})` wywołujący musi skutecznie **zapisać/wyeksportować** bieżący raport i uzyskać osobne potwierdzenie użytkownika. Sterownik wymaga dokładnie ostatniego rzeczywistego odczytu dla tego samego pojazdu i odrzuca kasowanie podczas rejestracji trasy. Nie potrafi niezależnie dowieść, że interfejs zachował kopię lub zatrzymał rejestrację. Zapytanie mode 04 jest wysyłane dopiero po tych zabezpieczeniach; sukces wymaga rzeczywistej odpowiedzi 44. Przekroczenie czasu oznacza wynik niepewny, ponieważ ECU mogło już przetworzyć polecenie. Przed kolejną próbą trzeba odczytać raport ponownie. Mode 04 może usunąć zamrożone ramki i dane gotowości; tym poleceniem nie można skasować trwałych DTC.

## Źródła i weryfikacja

Podstawowe źródło protokołu: [dokumentacja ELM Electronics ELM327DSK](https://www.elmelectronics.com/wp-content/uploads/2017/01/ELM327DS.pdf), szczególnie obsługa znaku zachęty/echa, napięcie, przykłady PID/DTC, kasowanie błędów i odpowiedzi wielowierszowe. PID obciążenia 04 używa skalowania SAE J1979 A×100/255. PID i opisy producentów nie są zgadywane.

API BLE: [oficjalna dokumentacja react-native-ble-plx](https://dotintent.github.io/react-native-ble-plx/) i zainstalowane źródła/definicje typów wersji **3.5.1** (`Device`, `BleManager`, wtyczka konfiguracyjna Expo); [oficjalna dokumentacja React Native PermissionsAndroid](https://reactnative.dev/docs/permissionsandroid); [dokumentacja Expo SDK 58](https://docs.expo.dev/versions/v58.0.0/). Wygenerowana internetowa dokumentacja BLE przedstawia się jako wersja 3.3.0; sygnatury zainstalowanej wersji 3.5.1 sprawdzono przed implementacją.

Testy Node sprawdzają rzeczywiste parsowanie, decyzje sterownika, buforowanie/kolejkowanie poleceń, przekroczenia czasu i rozłączenia, zabezpieczenia potwierdzenia kopii, transport powiadomień base64 oraz zachowanie wersji web. Metody urządzenia BLE są kontrolowane na zewnętrznej granicy sprzętowej. Nie sprawdzono sprzętowo fizycznych adapterów, systemowych dialogów uprawnień, czasów subskrypcji charakterystyk, zachowania radia iOS/Android ani zgodności natywnych plików binarnych SDK 58.

## Transport Wi-Fi / Classic

`wifi.native.ts` łączy się przez react-native-tcp-socket 6.4.3 i wspólny kanał ELM. Lokalny adres IPv4 i port TCP pochodzą z instrukcji adaptera. Nie ma domyślnego adresu docelowego, proxy, mostu HTTP ani generatora pomiarów. `wifi-core.ts` jest testowany na rzeczywistych lokalnych gniazdach TCP pod kątem fragmentowanych odpowiedzi, rozłączeń i terminów. Natywny routing Wi-Fi z adapterem bez internetu i równoczesną transmisją komórkową nadal wymaga walidacji na urządzeniu. Implementacja celowo nie przekazuje `interface: wifi`: zainstalowany kod biblioteki na Androidzie wiąże wtedy cały proces z tą siecią bez odpowiadającego temu resetowania.

`classic.android.ts` korzysta z react-native-bluetooth-classic 1.73.0-rc.17, BLUETOOTH_CONNECT na API 31+, sparowanych urządzeń, RFCOMM, ASCII i pustego separatora. Wspólny kanał otrzymuje dzięki temu rzeczywiste bajty znaku zachęty w dowolnie dzielonych fragmentach odczytu; JavaScript nie dopisuje znaku zachęty. Otwarcie ma limit 15 sekund, a spóźnione połączenia są rozłączane. Fizyczne rozłączenie SPP odrzuca oczekujące odczyty. Źródła i zainstalowane typy sprawdzono względem [dokumentacji opiekuna biblioteki](https://kenjdavidson.com/react-native-bluetooth-classic/react-native/rn-bluetooth-device/).

Szeroka zgodność z ELM327 jest celem, bez deklarowania uniwersalnej obsługi sprzętu. Protokoły producentów, zablokowane adaptery, protokoły MFi i protokoły wielu ECU poza CAN wymagają dodatkowych implementacji i stanowisk sprzętowych. [Apple External Accessory](https://developer.apple.com/documentation/externalaccessory/) opisuje odrębny model akcesoriów MFi.

## Ramkowanie CAN i zapisany zakres

`can.ts` waliduje standardowe adresy odpowiedzi OBD i składa ramki ISO-TP pojedyncze/pierwsze/kolejne niezależnie dla każdego CAN ID. Obsługuje przeplatanie; brakujące, zduplikowane, niepełne i niezgodne z sekwencją ramki kończą się błędem. Deklarowana długość ładunku usuwa wypełnienie; parsowanie DTC wymaga jawnego licznika CAN i odrzuca puste kody objęte licznikiem. Automatyczne sterowanie przepływem pozostaje po stronie adaptera; nie są wstrzykiwane ręcznie przygotowane pakiety magistrali.

Odczyty opcjonalnie zachowują `ecu: { protocol: 6|7|8|9, responseId }`. Istniejące odczyty pozostają poprawne. Interfejs, kopia JSON, raport sprzedażowy i kontekst AI z białej listy zachowują ten zakres; skan pojedynczego ECU nigdy nie jest opisywany jako skan wszystkich sterowników. Nieznane pola są usuwane na obu granicach AI. Zmiana ECU unieważnia ostatnią zgodę na kasowanie przed jakimkolwiek poleceniem konfiguracji. Nieudana konfiguracja fizyczna unieważnia inicjalizację; przed dalszą pracą połącz ponownie. Kasowanie CAN jest adresowane fizycznie i wymaga poprawnej odpowiedzi 44 dokładnie z wybranego ECU; niepewnego wyniku nie wolno po prostu ponowić ze starym odczytem.

Źródło protokołu: ELM327DSK s. 17 (ATDPN/D0), 41–45 (nagłówki/ISO-TP), 47 (ATCRA). [Implementacja CAN python-OBD](https://github.com/brendan-w/python-OBD/blob/master/obd/protocols/protocol_can.py) również dokumentuje położenie licznika CAN DTC. Nie skopiowano kodu aplikacji źródłowej. Testy obejmują adresowanie 11/29-bitowe, przeplatanie i błędy sekwencji/długości, wybór sterownika, nieudaną konfigurację, odpowiedzi innego sterownika, przekazywanie zakresu i zabezpieczenia kasowania. Zachowanie fizycznych adapterów CAN i ECU pozostaje niezweryfikowane.

## Lokalny odczyt VIN

`readVin(vehicleId)` jest dostępne dopiero po wybraniu sterownika CAN. Wysyła 0902 fizycznie do tego sterownika i stosuje te same kontrole ramek/tożsamości. Dekoder wymaga 49 02 01 i dokładnie 17 poprawnych wielkich znaków ASCII VIN; wartości zastępcze złożone wyłącznie z zer są odrzucane. Wynik jest prezentowany do podglądu i potwierdzany przed atomową aktualizacją garażu. Zmiana istniejącego VIN w międzyczasie uniemożliwia zastąpienie. Opcjonalne lokalne dowody źródła są walidowane względem zapisanego VIN i usuwane przy jego ręcznej zmianie. Nie dołączono internetowego dekodera, specyfikacji producenta, gwarancji sumy kontrolnej ani twierdzenia o autentyczności pojazdu. VIN pozostaje wykluczony z AI i raportów sprzedażowych. Nie wykonano sprzętowych odczytów VIN.

## Sesja i pomiary na żywo

Uruchomienie sesji przez `startDiagnostics()` obejmuje inicjalizację i pełny odczyt ECU. Samo potwierdzenie adaptera nie wystarcza; brak odpowiedzi samochodu zamyka połączenie. Wiele adresów CAN wymaga wyboru sterownika.

Metoda `readLiveParameters()` odświeża tylko obsługiwane parametry i napięcie. Korzysta z listy PID ostatniego pełnego odczytu, związanej z samochodem i wybranym ECU. Nie odpytuje ponownie kodów usterek i nie zmienia raportu. Pomiar na żywo, zmiana ECU, ponowna inicjalizacja i próba kasowania unieważniają uprawnienie do kasowania oparte na poprzednim raporcie.

Transporty udostępniają `onDisconnected()` także pomiędzy poleceniami. Przed pierwszym poleceniem BLE toleruje startowe dane ASCII do 8192 znaków; nadmiar lub nieprawidłowe bajty zamykają połączenie. Po pierwszym poleceniu nadal obowiązuje ścisłe przypisanie odpowiedzi do żądania.


## Rozszerzona diagnostyka OBD

Opcja `readSnapshot(vehicleId, {extended: true})` dodaje walidowane rozszerzenie wersji 1 bez zmiany schematu garażu 3. Katalog zawiera 54 skalarne PID; inne zadeklarowane PID pozostają widoczne jako możliwości ECU, bez wymyślonego dekodera. Tryb 02 używa własnych map obsługi i numeru ramki 0. Kod wyzwalający jest sprawdzany ponownie po zebraniu ramki; zmiana przerywa skan. ECU może nadpisać ramkę tym samym kodem, dlatego odczyt nie gwarantuje atomowości. Czas pobrania nie jest czasem wystąpienia usterki.

Konfiguracje PID 4F/50 zmieniają skalowanie MAP, MAF i zadanej lambdy. Są pobierane podczas skanu rozszerzonego lub przy pierwszym potrzebującym ich pomiarze Live Data i buforowane dla zakresu ECU. Skan podstawowy ich nie wymaga. Brak odpowiedzi na zadeklarowaną konfigurację pozostawia zależne wartości nieznane. Opcjonalny drugi bajt korekty paliwowej jest akceptowany; wyświetlana jest tylko nazwana pierwsza grupa. Czujniki O2 mają neutralne numery, ponieważ bez interpretacji lokalizacji nie można zakładać układu banków.

Import sprawdza granice fizyczne, unikalne wspierane PID, gotowość zgodną z PID 01, ramkę 0 i zgodność z powtórzonymi polami podstawowymi. JSON eksportowany przed kasowaniem jest porównywany jako cała zawartość, a nie sam identyfikator raportu. CSV zachowuje ujemne liczby i neutralizuje formuły w tekstach. HTML koduje dane tekstowe i nie dołącza VIN, tablic ani tras. Automatyczny kontekst AI pozostaje przy czterech dotychczasowych polach.

Skan podstawowy odczytuje obroty, płyn chłodzący, obciążenie, napięcie adaptera i dostępne statusy kodów. Osobny skan rozszerzony odpytuje wspierane pozycje katalogu, monitory gotowości PID 01 i ramkę zamrożoną 0. Nie oznacza obsługi wszystkich sterowników ani diagnostyki producenta. Brak danych pozostaje nieznany.

Live Data pozwala wybrać do 8 obsługiwanych PID. Przerwa 2/5/10 s rozpoczyna się po zakończeniu poprzedniego cyklu, więc rzeczywiste tempo zależy od adaptera. Wykres obejmuje ostatnie 300 cykli w pamięci sesji. Przerwy w odczycie i wznowienia tworzą osobne odcinki. Wyeksportuj CSV przed zamknięciem ekranu lub zmianą samochodu; sesja nie zapisuje się automatycznie w garażu.

Pełny raport zachowuje swój czas i kody podczas Live Data. Możesz zapisać go w historii, pobrać JSON/CSV albo PDF w aplikacji natywnej i HTML w przeglądarce. Historia ma wyszukiwanie i strony po 20 odczytów. Porównanie wymaga zgodnego samochodu oraz jawnego adresu i protokołu CAN ECU; starsze raporty bez zakresu pozostają czytelne i eksportowalne. Porównywane są tylko wspólne statusy DTC. Niezgłoszony ponownie kod nie potwierdza naprawy.

Do kasowania potrzebny jest dokładnie bieżący raport, jego zapisana kopia, potwierdzenie zachowania kopii i osobne potwierdzenie polecenia. PDF/CSV nie zastępuje pełnej kopii JSON lub historii. Po Live Data wykonaj nowy pełny odczyt. Przerwanie połączenia nie cofa wysłanego polecenia kasowania. Anulowany skan nie zastępuje poprzedniego ukończonego raportu.

[Zakres i weryfikacja](../../../docs/verification/2026-11-27-advanced-diagnostics.md)


[Instrukcja raportów sesji](../../LIVE-DATA-REPORTS.md)
