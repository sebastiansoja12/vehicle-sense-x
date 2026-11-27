[Polski](2026-11-27-advanced-diagnostics.md) | [English](2026-11-27-advanced-diagnostics.en.md) | [Deutsch](2026-11-27-advanced-diagnostics.de.md)

# Rozbudowana diagnostyka OBD — Plan wykonania

> superpowers:executing-plans

Cel: rozszerzony skan rzeczywistych danych, monitory emisji, ramka zamrożona, wybór parametrów, wykres i eksporty.

Rozwijamy obecny sterownik ELM327. Skan podstawowy pozostaje szybki; skan rozszerzony odczytuje wspierane standardowe PID, gotowość PID 01 i ramkę 0 usługi 02. Dane zawsze dotyczą wybranego ECU. Nieobsługiwane odczyty pozostają nieznane.

[Spec](../specs/2026-11-27-advanced-diagnostics.md)

## Przypadki kontrolne

Opcjonalny obiekt rozszerzenia wersji 1 zachowuje stare raporty i schemat garażu 3. Wszystkie nowe dane podlegają walidacji importu. AI nadal otrzymuje wyłącznie obecny zestaw bazowy. Kasowanie wymaga dokładnej kopii bieżącego raportu i potwierdzenia. Nie dodajemy fikcyjnych czujników, punktacji kondycji, uniwersalnego ABS/airbag, kodowania ECU ani aktywacji elementów. Sprzęt pozostaje niezweryfikowany do czasu prób na telefonie i samochodzie.

## Zadania

- [x] Napisać testy dekoderów, bitów gotowości i ramek 02; obejrzeć czerwony wynik, wdrożyć parsery i walidację rozszerzeń.
- [ ] Przetestować i wdrożyć stronicowanie PID, rozszerzony skan, wybrane pomiary Live Data, ramkę 0 i ochronę kasowania.
- [ ] Przetestować raporty, CSV, historię 300 cykli i porównanie zakresów; podłączyć ekrany i eksporty.
- [ ] Uruchomić pełne testy, typy, lint, dokumentację i eksporty; zlecić przegląd, poprawić uwagi, commitować i wypchnąć zmiany.

`mobile/src/obd/parameters.ts` · `mobile/src/obd/readiness.ts` · `mobile/src/obd/types.ts` · `mobile/src/obd/driver.ts` · `mobile/src/obd/DiagnosticDetails.tsx` · `mobile/src/obd/live-history.ts` · `mobile/src/reports.ts` · `mobile/tests/obd-advanced.test.mjs`
