[Polski](2026-11-27-consumption-maintenance.md) | [English](2026-11-27-consumption-maintenance.en.md) | [Deutsch](2026-11-27-consumption-maintenance.de.md)

# Spalanie i obsługa — plan wdrożenia

> For agentic workers: use superpowers:executing-plans and test-driven-development.

Cel: ekran wykresów i obliczeń spalania, planowanie obsługi części oraz dane oleju na istniejącej platformie Expo 58, React Native 0.88 i react-native-svg 15.16. Bez nowych zależności i bez wymyślonych interwałów producenta. Użytkownik powierzył dobór i wykonanie bez dalszych pytań.

## Architektura i granice

Obliczenia pełny–pełny w fuel-analytics.ts: ilości częściowych tankowań do kolejnego pełnego, średnia ważona dystansem; pierwszy pełny zbiornik jest bazą, otwarty cykl nie jest spalaniem, miesięczne zakupy nie są zużyciem. Tylko wybrane auto i daty do dnia analizy. Duplikaty przebiegu i jego spadki przerywają pomiar z widocznym ostrzeżeniem. Zakres 6/12 miesięcy przypisuje cały cykl do daty zamknięcia i pokazuje jego rzeczywiste daty.

Opcjonalne schedule w istniejącym Reminder, walidowane przez maintenance-model.ts. Bazowy dzień/przebieg, interwał km/miesięcy, część, kontrola/wymiana i jawne źródło; termin osiągnięty po pierwszej granicy. Pozostałe dni/km i postęp to harmonogram, nie zużycie części. Obsługa wykonania atomowo zapisuje rzeczywisty serwis i następny termin; stare ręczne przypomnienia i powiadomienia działają dalej. Bez zmiany schematu garażu. Opcjonalne oilObservation i maintenanceComponent w ServiceEntry zachowane przy edycji i w kopiach. Kontrole oleju są ręczne, bez domyślnej diagnozy lub ilości dolewki.

Full scan OBD odczytuje reklamowaną stronę 40 i PID 5C. Nowe opcjonalne oilTemperatureC w DiagnosticSnapshot; NO DATA to null, błędy transportu i inny ECU przerywają odczyt. Live Data bez nowego polecenia. To temperatura, nie poziom lub trwałość oleju. Pokazać dane w diagnostyce, analizie i raportach z datą/źródłem/ECU. Żadnych zapisów do ECU.

## Zadania i sprawdzenie

- [ ] Testy fuel-analytics.test.mjs: pełne/częściowe tankowania, ważenie dystansem, otwarty cykl, daty przyszłe, inne auto, duplikat/spadek przebiegu i miesięczne zakupy. Uruchomić czerwone, wdrożyć fuelAnalytics(state, vehicleId, today), uruchomić zielone.
- [ ] Testy maintenance.test.mjs: sumowanie miesięcy na końcu miesiąca, km lub czas, walidacja źródła i granic, istniejące kopie, nowe pola, atomowe wykonanie i ponowienie. Wdrożyć maintenance-model.ts, maintenance.ts oraz minimalne rozszerzenia records.ts/domain.ts/features.ts.
- [ ] Testy oil-obd.test.mjs: reklamowanie PID, wartość zero, brak danych, błędna ramka/timeout, scope CAN i zachowanie ochrony kasowania. Rozszerzyć protocol.ts, types.ts i driver.ts; historia i raporty zachowują dane.
- [ ] Ekran insights.tsx, FuelCharts.tsx, MaintenancePlanner.tsx i OilLog.tsx, wejścia z garażu, kosztów i serwisu. SVG plus tekstowe wartości; edycja planu i wykonanie serwisu z walidacją, przełączanie auta resetuje formularze. Nie dodawać przykładowych wpisów do danych użytkownika.
- [ ] Dokumentacja PL/EN/DE, testy repo, typecheck/lint, eksporty web/Hermes, UI 390 px na danych syntetycznych i niezależny przegląd. Nie deklarować testu sprzętu, poziomu/trwałości OBD ani zgodności OEM.
