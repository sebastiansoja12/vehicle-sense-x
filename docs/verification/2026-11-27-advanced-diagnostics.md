[Polski](2026-11-27-advanced-diagnostics.md) | [English](2026-11-27-advanced-diagnostics.en.md) | [Deutsch](2026-11-27-advanced-diagnostics.de.md)

# Rozszerzona diagnostyka OBD · 0.5.0 / 7

Wersja 0.5.0/build 7 rozszerza diagnostykę o katalog 54 standardowych parametrów, gotowość emisji, freeze frame 0, wybór Live Data, wykres 300 cykli, porównanie odczytów i eksport JSON/CSV/PDF/HTML.

Skan podstawowy odczytuje obroty, płyn chłodzący, obciążenie, napięcie adaptera i dostępne statusy kodów. Osobny skan rozszerzony odpytuje wspierane pozycje katalogu, monitory gotowości PID 01 i ramkę zamrożoną 0. Nie oznacza obsługi wszystkich sterowników ani diagnostyki producenta. Brak danych pozostaje nieznany.

Live Data pozwala wybrać do 8 obsługiwanych PID. Przerwa 2/5/10 s rozpoczyna się po zakończeniu poprzedniego cyklu, więc rzeczywiste tempo zależy od adaptera. Wykres obejmuje ostatnie 300 cykli w pamięci sesji. Przerwy w odczycie i wznowienia tworzą osobne odcinki. Wyeksportuj CSV przed zamknięciem ekranu lub zmianą samochodu; sesja nie zapisuje się automatycznie w garażu.

Pełny raport zachowuje swój czas i kody podczas Live Data. Możesz zapisać go w historii, pobrać JSON/CSV albo PDF w aplikacji natywnej i HTML w przeglądarce. Historia ma wyszukiwanie i strony po 20 odczytów. Porównanie wymaga zgodnego samochodu oraz jawnego adresu i protokołu CAN ECU; starsze raporty bez zakresu pozostają czytelne i eksportowalne. Porównywane są tylko wspólne statusy DTC. Niezgłoszony ponownie kod nie potwierdza naprawy.

Do kasowania potrzebny jest dokładnie bieżący raport, jego zapisana kopia, potwierdzenie zachowania kopii i osobne potwierdzenie polecenia. PDF/CSV nie zastępuje pełnej kopii JSON lub historii. Po Live Data wykonaj nowy pełny odczyt. Przerwanie połączenia nie cofa wysłanego polecenia kasowania. Anulowany skan nie zastępuje poprzedniego ukończonego raportu.

## Weryfikacja

248/248 testów przeszło po poprawkach przeglądu; typy, lint i eksporty web/Android/iOS Hermes zakończyły się powodzeniem. Testy używają kontrolowanych odpowiedzi wyłącznie na granicy sprzętu; aplikacja nie zawiera generatora pomiarów. Podgląd przy szerokości 390 px otworzył pusty garaż, formularz i diagnostykę. Natywny wybór pliku w przeglądarce nie dał się zautomatyzować; nie zaliczono importu/eksportu przez przeglądarkę ani testu sprzętowego.

```sh
node --test tests.mjs tests/*.test.mjs mobile/tests/*.test.mjs server/*.test.mjs
npm run typecheck --prefix mobile
npm run lint --prefix mobile
python3 scripts/check-docs.py
npm run export:web --prefix mobile
npm run export:native --prefix mobile
```

## Przegląd i poprawki

Niezależny przegląd wykrył siedem problemów, które poprawiono z testami regresji: identyczny identyfikator różnych kopii, porównanie bez potwierdzonego ECU, łączenie wykresu przez pauzę, utrata ostatniego raportu przy anulowaniu, sprzeczne dane importu, wznowienie łączenia po anulowaniu oczekującego sprzątania oraz niepotrzebne zapytania skalowania podczas podstawowego skanu. Wstępne podejrzenie wysyłania dodatkowych pól AI wycofano po sprawdzeniu projekcji czterech pól w kliencie.

## Pakiety i ograniczenia

Kompilacje 0.5.0/build 7 są weryfikowane osobno. Dotychczasowy APK/AAB 0.4.0/build 6 nie zawiera rozszerzeń 0.5.0. Brak aktywnego konta Apple Developer nadal wyklucza podpisane wydanie IPA do App Store. Nie wysłano aplikacji do sklepów.

Nie wykonano połączenia z fizycznym telefonem, adapterem ani samochodem. Przed publikacją sprawdź każdy transport i wybrany ECU, odmowę uprawnień, utratę zasięgu, skalowanie, monitory, zmianę ramki podczas skanu, przerwanie długiego odczytu, eksport natywny i odczyt po kasowaniu. Zwykłe radio Bluetooth przesyła dźwięk przez system, a nie dane OBD. Nie dodano kodowania ECU, testów elementów wykonawczych ani ogólnej obsługi ABS/airbag.

Expo Doctor: 19/20 kontroli. React Native Directory nadal oznacza `react-native-bluetooth-classic` i `react-native-tcp-socket` jako nieprzetestowane z New Architecture. Ostrzeżenia nie wyłączono. Kompilacja nie zastępuje testów transportów na fizycznym telefonie.

[GitHub Actions](https://github.com/sebastiansoja12/vehicle-sense-x/actions/runs/46007837184) · `35258e9`
