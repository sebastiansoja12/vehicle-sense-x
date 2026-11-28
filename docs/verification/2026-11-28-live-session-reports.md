[Polski](2026-11-28-live-session-reports.md) | [English](2026-11-28-live-session-reports.en.md) | [Deutsch](2026-11-28-live-session-reports.de.md)

# Raporty sesji Live Data — weryfikacja

Dodano JSON z próbkami oraz podsumowanie PDF/HTML obok istniejącego CSV. Każdy format sprawdza zakres pojazdu, adaptera i ECU, limit 300 cykli, skalowanie, wartości i chronologię. JSON zachowuje przerwy; statystyki rozróżniają brak odpowiedzi i brak zapisanej próbki.

Po poprawkach przeglądu przeszły wszystkie 384 testy lokalnego obszaru main, w tym 13 nowych testów raportów i interfejsu. Wynik obejmuje zachowane, niezatwierdzone zmiany innych modułów. Typy, lint, dokumentacja PL/EN/DE oraz eksporty web i Hermes dla iOS/Android przechodzą.

Niezależny przegląd wykazał obejście walidacji przez CSV oraz cofające się daty obserwacji. Oba problemy odtworzono testami RED i poprawiono do GREEN. Walidacja CSV jest we wspólnym serializerze, przed udostępnieniem pliku. Test potwierdza, że JSON sesji nie jest kopią odczytu uprawniającą do kasowania DTC.

Nie dodano komend OBD, zależności natywnych, importu sesji ani zmiany schematu garażu. Nie sprawdzono fizycznego adaptera, telefonu ani wyglądu i udostępniania natywnego PDF. Dotychczasowe natywne pakiety dd64fcd nie zawierają tej późniejszej zmiany źródła.

```sh
node --test tests.mjs tests/*.test.mjs mobile/tests/*.test.mjs server/*.test.mjs
npm run typecheck --prefix mobile
npm run lint --prefix mobile
python3 scripts/check-docs.py
npm run export:web --prefix mobile
npm run export:native --prefix mobile
```

[Instrukcja](../../mobile/LIVE-DATA-REPORTS.md) · [Specyfikacja](../superpowers/specs/2026-11-28-live-session-reports.md) · [Plan](../superpowers/plans/2026-11-28-live-session-reports.md)
