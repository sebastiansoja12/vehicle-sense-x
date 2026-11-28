[Polski](2026-11-28-live-session-reports.md) | [English](2026-11-28-live-session-reports.en.md) | [Deutsch](2026-11-28-live-session-reports.de.md)

# Raporty sesji Live Data

Cel: eksport rzeczywistych ostatnich 300 cykli do JSON oraz podsumowania PDF/HTML dla warsztatu.

Zakres obejmuje jeden pojazd, adapter i zakres ECU; brak lub zmiana zakresu nie są domyślnie łączone. Zera są pomiarami; null oznacza brak odpowiedzi, brak PID w cyklu oznacza brak zapisanej próbki. Średnia jest arytmetyczna, bez ważenia czasem. Zachowujemy daty odczytów i jawne przerwy. ATRV jest napięciem adaptera, nie testem akumulatora.

JSON projektuje wyłącznie pola pomiarów, skalowania i zakresu. Bez VIN, rejestracji, GPS, DTC ani identyfikacji ECU. PDF/HTML zawiera podsumowanie i statystyki, pełne próbki są w JSON/CSV. Sesja nie zastępuje kopii pełnego skanu przed kasowaniem. Nie dodajemy importu, nowych komend OBD, zależności ani migracji danych.

Rozszerzamy istniejący bufor i udostępnianie plików. Trwałe nagrywanie wymagałoby nowego modelu danych; w tym zakresie eksportujemy istniejące odczyty. Użytkownik zezwolił na ciągłą implementację bez pytań i wyłącznie main.
