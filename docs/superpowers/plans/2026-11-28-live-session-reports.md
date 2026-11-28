[Polski](2026-11-28-live-session-reports.md) | [English](2026-11-28-live-session-reports.en.md) | [Deutsch](2026-11-28-live-session-reports.de.md)

# Raporty sesji Live Data

> superpowers:executing-plans · superpowers:test-driven-development

Cel: eksport rzeczywistych ostatnich 300 cykli do JSON oraz podsumowania PDF/HTML dla warsztatu.

Spec: [spec](../specs/2026-11-28-live-session-reports.md)

## Ograniczenia

main; schema 3; LIVE_HISTORY_LIMIT = 300; maksymalnie 8 PID w cyklu; brak zmian zależności natywnych.

## Punkty przeglądu

- Mieszane zakresy pojazdu/adaptera/ECU i nieprawidłowe daty przerywają eksport.
- Brakujące, niezapisane i zerowe pomiary pozostają rozróżnione.
- Zmiana wyboru PID zachowuje luki w cyklach i nieważone statystyki.
- Nieznane pola i złośliwe etykiety nie ujawniają danych ani nie wykonują HTML.
- Eksport utrwala wybrany bufor i nie może odblokować kasowania DTC.

## Task 1: Model i formaty

Pliki: mobile/src/obd/live-report.ts; mobile/tests/obd-live-report.test.mjs.

Interfejsy: buildLiveSessionReport(history), liveSessionJson(history), liveSessionReportHtml(history).

- [x] RED: statystyki, przerwy, daty, samo napięcie, walidacja zakresu/rozmiaru/wartości, projekcja i escapowanie.
- [x] GREEN: zaimplementować ograniczoną projekcję i generatory raportów; uruchomić node --test mobile/tests/obd-live-report.test.mjs.
- [x] Zatwierdzić zweryfikowane generatory raportów.

## Task 2: Interfejs i weryfikacja

Pliki: mobile/src/obd/LiveDataPanel.tsx; mobile/src/obd/DiagnosticsScreen.tsx; mobile/src/reports.ts; mobile/tests/obd-live-panel.test.mjs; mobile/src/obd/README.md.

Interfejsy: onExport(format: LiveSessionExport), formaty csv/json/report przez istniejące shareTextFile/shareReport.

- [x] RED: renderowanie eksportu, wybór formatu, blokada podczas pracy; podłączyć generatory i wstrzymanie przed eksportem.
- [x] GREEN: pełne testy, typecheck, lint, dokumentacja PL/EN/DE i eksporty Hermes web/iOS/Android.
- [x] Przegląd, commit i push wyłącznie main; istniejące pakiety natywne pozostają związane z dd64fcd.
