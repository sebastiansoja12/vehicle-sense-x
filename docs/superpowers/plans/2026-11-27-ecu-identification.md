[Polski](2026-11-27-ecu-identification.md) | [English](2026-11-27-ecu-identification.en.md) | [Deutsch](2026-11-27-ecu-identification.de.md)

# Identyfikacja ECU

> superpowers:executing-plans

[Spec](../specs/2026-11-27-ecu-identification.md)

## Task 1: Dekodery i walidacja identyfikacji

- [x] Napisz testy dla mapy 09 00, CALID, CVN, nazwy ECU, negatywnych odpowiedzi i importu; zobacz błąd, następnie dodaj dekodery i walidację rozszerzenia.

```sh
node --test mobile/tests/obd-identification.test.mjs
```

Oczekiwane: nowe testy najpierw nie przechodzą, potem wszystkie przechodzą; nie ma generatora pomiarów ani zapisu do ECU.

## Task 2: Opcjonalny skan CAN i statusy odpowiedzi

- [ ] Napisz testy granicy transportu CAN: zapytania tylko zadeklarowanych typów, osobny opt-in, brak VIN, wieloramkowe odpowiedzi, inny ECU i NRC 78. Dodaj opcję skanu, postęp i zapis identyfikacji w dokładnym raporcie.

```sh
node --test mobile/tests/obd-identification-driver.test.mjs
```

Oczekiwane: nowe testy najpierw nie przechodzą, potem wszystkie przechodzą; nie ma generatora pomiarów ani zapisu do ECU.

## Task 3: Interfejs, porównania i bezpieczne eksporty

- [ ] Przetestuj eksporty, kopie, pominięcie identyfikacji w raporcie sprzedaży/AI i porównania. Dodaj przycisk pełnego skanu CAN, szczegóły, ostrzeżenie eksportowe i porównania danych.

```sh
node --test mobile/tests/obd-identification-reports.test.mjs mobile/tests/obd-screen.test.mjs
```

Oczekiwane: nowe testy najpierw nie przechodzą, potem wszystkie przechodzą; nie ma generatora pomiarów ani zapisu do ECU.

## Task 4: Pełna weryfikacja, przegląd, dokumentacja i publikacja commitów

- [ ] Uruchom pełne testy, typy, lint, walidację PL/EN/DE i eksporty web/Hermes. Zleć świeży przegląd, popraw potwierdzone błędy z testami i wypchnij commity bez Co-authored.

```sh
node --test tests.mjs tests/*.test.mjs mobile/tests/*.test.mjs server/*.test.mjs
```

Oczekiwane: nowe testy najpierw nie przechodzą, potem wszystkie przechodzą; nie ma generatora pomiarów ani zapisu do ECU.

