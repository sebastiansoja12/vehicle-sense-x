[Polski](2026-11-27-diagnostic-comparison.md) | [English](2026-11-27-diagnostic-comparison.en.md) | [Deutsch](2026-11-27-diagnostic-comparison.de.md)

# Porównanie diagnostyki — weryfikacja

Dodano lokalne porównanie dwóch zapisanych odczytów oraz raport warsztatowy. Bez zmiany schematu danych, bez nowych zależności i poleceń adaptera. Wyliczanie zmian wymaga zgodnego ECU i protokołu; brak statusu DTC pozostaje nieznany, a null nie staje się zerem. Objawy są wyłącznie w pamięci ekranu i wybranym eksporcie.

Osiem nowych testów przeszło. Pełny zestaw repozytorium, typy, lint, walidator dokumentacji i diff sprawdzono poleceniami poniżej. Eksport web i Hermes iOS/Android zakończyły się powodzeniem; nie są to nowe podpisane instalatory. Niezależny przegląd nie zgłosił błędów wymagających zmian.

```sh
node --test tests.mjs tests/*.test.mjs mobile/tests/*.test.mjs server/*.test.mjs
npm run typecheck --prefix mobile
npm run lint --prefix mobile
python3 scripts/check-docs.py
npm run export:web --prefix mobile -- --output-dir /tmp/vehiclesensex-diagnostic-web
npm run export:native --prefix mobile -- --output-dir /tmp/vehiclesensex-diagnostic-native
git diff --check
```

Sprawdzono rzeczywistą stronę bez samochodu. Import pliku testowego przez narzędzie przeglądarki zawiesił wybór pliku; nie zmieniono danych użytkownika. Dalszą weryfikację wykonano na tymczasowej kopii aplikacji w /tmp z identycznym kodem ekranu i podmienioną wyłącznie granicą magazynu web na magazyn w pamięci z syntetycznymi danymi. Zestaw zawierał dwa testowe auta i 26 odczytów.

W podglądzie potwierdzono: domyślną parę pomijającą nowszy odczyt innego ECU; rozdzielenie DTC według statusu; nieodczytany status; rzeczywiste zero i brak różnicy dla null; blokadę zmian dla innego/nieznanego ECU; stronicowanie 24 odczytów po 20; wpisanie objawów i wywołanie eksportu HTML bez błędu; zmianę auta z wyczyszczeniem objawów. Układ sprawdzono w szerokości 390 px. Konsola podglądu bez błędów.

Nie wykonano fizycznych pomiarów, natywnego panelu udostępniania ani testu wydruku PDF na telefonie. Funkcja pokazuje różnice danych, nie potwierdza skuteczności naprawy. Instrukcja: [porównanie](../../mobile/DIAGNOSTIC-COMPARISON.md).
