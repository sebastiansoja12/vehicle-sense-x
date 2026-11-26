[Polski](2026-11-25-mobile-foundation.md) | [English](2026-11-25-mobile-foundation.en.md) | [Deutsch](2026-11-25-mobile-foundation.de.md)

# Rejestr SDD — plan: docs/superpowers/plans/2026-11-25-mobile-foundation.md

- Decyzja: implementacja w `mobile/` w bieżącym repozytorium bez pierwszego commita. Nie istnieje wcześniejszy commit do utworzenia odizolowanego worktree; zachowanie działającego, zatwierdzonego prototypu ma pierwszeństwo przed tworzeniem historii wyłącznie dla narzędzi. Koszt: brak zakresu commitów git do przeglądu; recenzent otrzymuje dokładne ścieżki nowych plików.
- Decyzja: użytkownik zatwierdził już projekt wizualny i zlecił implementację. Istniejący README i opis ośmiu modułów definiują autoryzowany zakres; nowa specyfikacja zapisuje decyzje implementacyjne bez ponownego pytania o akceptację. Koszt: stos pozostaje wyborem wykonawcy i może zostać zastąpiony przed wydaniem sklepowym.
- Kontrola wykonawcy: niezależny recenzent nie znalazł sprzeczności ani brakujących decyzji produktowych blokujących implementację.
- Kontrola wstępna: interfejsy modelu są wspólne dla zapisu i ekranów; `vehicleId`, całkowite grosze/ml i spalanie dopuszczające null są spójne.
- Decyzja: wygenerowany Expo AGENTS.md wymaga Expo Router. Użyć udokumentowanych tras plikowych w `mobile/src/app/`, bez własnego nawigatora opartego na stanie. Koszt: dodatkowe zależności routingu zgodne z SDK.
- Zadanie 1: ukończone. RED: 11 testów nie przechodzi przed implementacją; GREEN: 11/11 `node --test mobile/tests/domain.test.mjs`.
- Decyzja: używać jawnej ścieżki Node 24 dla poleceń npm/Expo z podwyższonymi uprawnieniami. W przeciwnym razie powłoka rozwiązuje Node 20, poniżej minimalnej wersji silnika SDK 58. Nie zmieniono systemowej instalacji Node.

- Zadanie 2: ukończone. Testy repozytorium RED przed implementacją, następnie GREEN. Odrzucenie zapisu zachowuje stan zapisany i zatwierdzony; uszkodzony stan nie jest resetowany.
- Przegląd końcowy: niezależny recenzent wskazał trzy istotne problemy integralności danych. Brak ustaleń krytycznych i drobnych.
- Wynik końcowy: naprawiono nadpisywanie ze starej karty i nadpisywanie nowszego schematu — trzy testy regresji repozytorium RED→GREEN; Web Locks szeregują zmiany web, odczytując najnowszy zwalidowany dokument wewnątrz blokady.
- Wynik końcowy: naprawiono chronologię zapisanego paliwa — test regresji przebiegu w kolejności kalendarzowej RED→GREEN.
- Wynik końcowy: naprawiono dziedziczenie przebiegu aktywnego auta przez formularz drugiego auta — przeglądarka odtworzyła 68450 zamiast pustego pola przed poprawką; puste pole potwierdzono po przeładowaniu poprawionego providera.
- Zadanie 3: ukończone. Przeglądarka potwierdziła pierwszy pojazd, tankowanie z polskim separatorem dziesiętnym (262.85 PLN), serwis (250.99 PLN), sumę po przeładowaniu (513.84 PLN), drugi samochód z 5000 km i zerowymi oddzielnymi kosztami. Wyjście z demo przywróciło pusty własny garaż przed dodaniem jednorazowych wpisów kontrolnych.
- Decyzja: jednorazowa kontrola w przeglądarce działała na 127.0.0.1:8081; czysty podgląd jest dostarczany na 127.0.0.1:8083, ponieważ localhost:8081 wskazuje inną istniejącą usługę. Koszt: należy używać dokładnego adresu podglądu. Nie zmieniono innych usług. Własny serwer kontroli zatrzymano po weryfikacji.
- Decyzja: fizyczne testy iOS są niedostępne: xcodebuild zgłasza Command Line Tools bez Xcode. Bundle JS/Hermes są zweryfikowane; podpisane kompilacje i zachowanie klawiatury/przycisku Wstecz na fizycznych urządzeniach pozostają niezweryfikowane.
- Weryfikacja końcowa: 23/23 testy (19 mobile + 4 prototypu), TypeScript, ESLint bez błędów i ostrzeżeń, eksport web i eksporty bundli Hermes iOS/Android. Bez zgłoszenia do sklepów, Git push lub scalania. Implementacja pozostaje bez commita w bieżącej kopii roboczej; oryginalny prototyp zachowano.
- Odroczone drobne uwagi: brak z niezależnego przeglądu. Brak edycji/usuwania, eksportu kopii i integracji sprzętowych opisano jako ograniczenia zakresu.
