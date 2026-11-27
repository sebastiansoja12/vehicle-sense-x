[Polski](2026-11-27-market-gaps.md) | [English](2026-11-27-market-gaps.en.md) | [Deutsch](2026-11-27-market-gaps.de.md)

# Badanie rynku i brakujące funkcje

> For agentic workers: use superpowers:executing-plans and test-driven-development.

Cel: porównać oficjalnie opisane możliwości Car Scanner, OBDeleven, Carista, Carly, Fuelio, Drivvo, FIXD i platformy Smartcar ze stanem VehicleSenseX na 27 listopada 2026; dodać możliwe do zweryfikowania braki i wyróżnik bez sztucznych danych.

Podejście: dokumentacja producentów, bez zakupu sprzętu lub dostępu do prywatnych kont. Ceny i marketing nie są dowodem zgodności konkretnego auta. Brak funkcji w dokumentacji konkurencji nie dowodzi, że nigdzie nie istnieje.

Task 1: readiness OBD. Testy parsera, benzyna/diesel, nieobsługiwany monitor, MIL, liczniki, brak danych, uszkodzone ramki, CAN i bezpieczne kasowanie przed implementacją. Nowy mobile/src/obd/readiness.ts; wspólny parser bajtów w protocol.ts; opcjonalne readiness w DiagnosticSnapshot i jego walidacji; driver.ts odczytuje tylko reklamowane PID 01/30/31 podczas pełnego skanu. Nie dodawać zapytań do Live Data, nie połykać błędów transportu. Zachować zapis i kopie, pokazać wynik i zakres w interfejsie oraz raportach.

Task 2: audyt dowodów. Testy różnych aut, przebiegu w kolejności dat (bez zakładania kolejności jednego dnia), importu/ECU/statusów i brakujących pomiarów po serwisie. Nowy mobile/src/vehicle-evidence.ts oraz VehicleEvidenceScreen.tsx i trasa vehicle-evidence.tsx. Dane istniejące, bez nowej bazy. Nie używać punktowej oceny sprawności lub oskarżeń o cofanie licznika. Identyfikatory odczytów powiązać z porównaniem przed/po i opisać ograniczenia dat dziennych.

Task 3: raport rynku PL/EN/DE, dokumentacja modułów, testy całego repo, typy, lint, eksport web/Hermes, niezależny przegląd. Bez sprzętowych deklaracji zgodności. Użytkownik zlecił dobór i wykonanie bez dalszych pytań; nie zmieniać ani nie commitować równoległych prac.
