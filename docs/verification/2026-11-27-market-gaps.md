[Polski](2026-11-27-market-gaps.md) | [English](2026-11-27-market-gaps.en.md) | [Deutsch](2026-11-27-market-gaps.de.md)

# Rynek i nowe funkcje — weryfikacja

Dodano monitory gotowości emisji OBD i lokalny audyt istniejących danych samochodu. Audyt dobiera porównywalne odczyty sprzed i po dniu serwisu; nie ocenia skuteczności naprawy ani autentyczności historii. Analiza ośmiu produktów i ograniczeń integracji: [badanie rynku](../research/2026-11-27-market-and-feasibility.md). Obsługa: [instrukcja](../../mobile/VEHICLE-EVIDENCE.md).

Siedem testów gotowości i dziewięć testów audytu obejmuje monitory benzynowe/dieslowskie, liczniki równe zero, brak danych, nieprawidłowe ramki, timeout, zakres CAN, kopie i raporty, ochronę kasowania, różne auta i ECU, daty przyszłe, kolejność wpisów i parowanie po serwisie. Niezależny przegląd wykrył przyszłą datę odczytu traktowaną jako dostępny dowód gotowości; dodano test regresji i poprawiono klasyfikację. Testy kontrolowanego transportu nie zastępują sprzętu.

Cały zestaw zakończył się wynikiem 273/273. Kontrola typów i lint przeszły. Eksporty web i Hermes Android/iOS zakończyły się powodzeniem. To paczki eksportowe, nie podpisane instalatory. Kontrole uruchomiono poleceniami poniżej.

```sh
node --test tests.mjs tests/*.test.mjs mobile/tests/*.test.mjs server/*.test.mjs
npm run typecheck --prefix mobile
npm run lint --prefix mobile
python3 scripts/check-docs.py
npm run export:web --prefix mobile -- --output-dir /tmp/vehiclesensex-market-web
npm run export:native --prefix mobile -- --output-dir /tmp/vehiclesensex-market-native
git diff --check
```

Interfejs sprawdzono na tymczasowej kopii aplikacji z identycznymi ekranami i syntetycznym magazynem web w pamięci. Dane użytkownika pozostały nietknięte. W szerokości 390 px potwierdzono: oznaczenie ograniczonego zakresu diagnostyki, spadek wpisanego przebiegu 9000 → 8500 km, parę sprzed i po serwisie, przejście do dokładnych identyfikatorów obu odczytów oraz monitory zakończone, niezakończone i nieobsługiwane. Widoczne były MIL, zero rozgrzań i dystans od kasowania. Konsola bez błędów.

Nie wykonano fizycznego pomiaru auta ani testu adaptera/telefonu. Ceny części na żywo wymagają konfiguracji produkcyjnego API; dobór części i rezerwacje nie są potwierdzone samym wyszukiwaniem. Nie potwierdzono światowej unikalności proponowanego wyróżnika.
