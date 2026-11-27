[Polski](2026-11-27-diagnostic-comparison.md) | [English](2026-11-27-diagnostic-comparison.en.md) | [Deutsch](2026-11-27-diagnostic-comparison.de.md)

# Porównanie diagnostyki — plan wykonania

> For agentic workers: use superpowers:executing-plans; user authorized continuous execution.

Cel: lokalne porównanie zapisanych odczytów i raport dla warsztatu. Wykonanie bez pytań zgodnie z wcześniejszym poleceniem użytkownika.

Architektura: czysta funkcja porównania, raport HTML/PDF przez istniejący eksport, jeden ekran Expo Router. Bez zależności, migracji ani nowych poleceń OBD.

Ograniczenia: ten sam samochód; A starsze od B; różnice tylko dla potwierdzonego tego samego adresu ECU i protokołu. Nieznany zakres nie tworzy różnic. Statusy DTC analizowane osobno; nieodczytany status oznacza brak wiedzy. Null nigdy nie jest zerem. Import jest oznaczony. Raport pomija VIN/tablice/GPS, obejmuje jawny opis objawów wpisany przez właściciela.

Task 1: mobile/tests/diagnostic-comparison.test.mjs przed implementacją mobile/src/obd/comparison.ts. Sprawdź zakres ECU, kolejność, różne auta, kody w statusach wspólnych i brakujących, zera i null, wybór pary oraz walidację uszkodzonych danych. Interfejsy: compareDiagnostics(before, after), selectDiagnosticPair(history, vehicleId).

Task 2: testy raportu przed implementacją diagnosticComparisonHtml w mobile/src/reports.ts. Raport zachowuje oba surowe zestawy kodów, zakresy, daty, parametry i niepewność; ucieczka HTML i minimalny zestaw pól. Ekran mobile/src/DiagnosticComparisonScreen.tsx oraz mobile/src/app/diagnostic-comparison.tsx: selektory stronicowane, opis objawów, porównanie, eksport, wejścia z diagnostyki i garażu.

Task 3: dokumentacja PL/EN/DE, testy całego repo, typy, lint, eksport web i Hermes; niezależny przegląd oraz sprawdzenie interfejsu. Review Focus: brak wspólnych statusów, ten sam czas, usunięcie wybranego raportu, zmiana auta, kod w kilku statusach, złośliwy HTML. Zmiany pozostają w bieżącym katalogu, bez dotykania równoległych prac.
