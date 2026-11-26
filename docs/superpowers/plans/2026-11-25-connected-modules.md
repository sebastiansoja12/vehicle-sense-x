# Connected Vehicle Modules Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans for integration and superpowers:dispatching-parallel-agents for independent bounded cores. Steps use checkbox (`- [ ]`) syntax.

**Goal:** zastąpić niedziałające ekrany właściwymi modułami tras, analizy, diagnostyki, kondycji i asystenta oraz rozwinąć serwis/eksport.
**Architecture:** niezależne testowane rdzenie GPS/OBD/AI, integracja z wersjonowanym lokalnym stanem i istniejącym UI. API AI jest odrębnym serwerem Node z kluczem poza klientem.
**Tech Stack:** Expo 58, React Native, TypeScript, Expo Location/FileSystem/Sharing, BLE, Node HTTP.
**Spec:** `docs/superpowers/specs/2026-11-25-connected-modules-design.md`

## Global Constraints

- Bez zmiany zaakceptowanego stylu i bez podmiany danych użytkownika demem.
- Użytkownik zlecił ciągłą pracę bez ponownej akceptacji; samodzielnie rozstrzygamy rutynowe decyzje.
- UUID adaptera i klucz API są konfigurowalne; nie udajemy dostępu do sprzętu/usług.
- Zgody w kontekście funkcji, minimalny kontekst AI, sekrety tylko na serwerze.
- Wszystkie zapisy przez walidację i repozytorium, izolacja pojazdów. Po doprecyzowaniu użytkownika usunięto cały tryb demo i przykładowe dane z aplikacji mobilnej.

## Review Focus

- Zmiana auta, przejście w tło i restart podczas nagrywania nie mogą przypisać trasy innemu autu ani zgubić szkicu.
- GPS nie liczy dystansu przez luki i skoki, a brak pomiaru nie jest zerem zdarzeń.
- Timeout/odłączenie/niepełna ramka OBD nie daje fałszywego „0 błędów”.
- AI nie otrzymuje VIN, tablic, lokalizacji ani klucza w kliencie; proxy nie jest otwartym płatnym API.
- Import backupu i usunięcie wpisów nie kasują danych bez potwierdzenia; wersje schematu są walidowane.

### Task 1: Rdzeń tras i analizy
Files: `mobile/src/trips.ts`, `mobile/tests/trips.test.mjs`.
Interfaces: `TripPoint`, `TripRecord`, `analyzeTrip`, `validateTripRecord`; pole vehicleId, id i source.
- [x] Testy GPS, luk, prędkości, heurystyki zdarzeń i ręcznego przejazdu RED→GREEN.

### Task 2: OBD2 i klient adaptera
Files: `mobile/src/obd/*`, `mobile/tests/obd*.test.mjs`.
Interfaces: snapshot z id/vehicleId/time/source, asynchroniczny transport komend, parser PID i DTC, BLE platform adapter.
- [x] Oficjalna dokumentacja ELM327 i BLE, testy parsera, buforowania, timeoutu i odmowy kasowania RED→GREEN. Dodano rzeczywiste Wi-Fi/TCP oraz Android Classic/SPP z testami strumienia.

### Task 3: Asystent API
Files: `server/*`, `mobile/src/assistant-client.ts`, `mobile/tests/assistant*.test.mjs`.
Interfaces: POST `/assistant` `{question,context}` → `{answer}`, minimalny jawny kontekst; bez danych identyfikacyjnych.
- [x] Oficjalne docs API, testy walidacji/uwierzytelnienia/limitów i błędów odpowiedzi RED→GREEN. Nie wykonano płatnego wywołania OpenAI.

### Task 4: Schemat i moduły lokalne
Files: `mobile/src/domain.ts`, feature domain, reports, export/import, reminder forms, media i testy.
- [x] Migracja v1→v2, nowe kolekcje, przypomnienia, porównania wartości, raport i backup z testami RED→GREEN. Dodano migrację magazynu natywnego do SQLite, dane techniczne i lokalne załączniki.

### Task 5: Integracja UI i sprzętu
Files: nowe ekrany modułów, AppProvider, recorder, formy, trasy Expo, config SDK.
- [x] GPS foreground + szkic, historia/schemat śladu/analiza, OBD BLE/Wi-Fi/Classic, AI zgoda i endpoint, raporty, serwis i załączniki. Podkład mapowy nie został zaimplementowany.

### Task 6: Weryfikacja i przegląd
- [x] 107 testów (94 mobile, 9 serwer, 4 prototyp), TypeScript i lint — ostatnie uruchomienie 2026-11-25, status 0.
- [x] Eksporty JS/Hermes web/iOS/Android po ostatnich zmianach; autolinking sprawdzony: Classic wyłącznie Android, BLE/TCP obie platformy. README i RELEASE opisują rzeczywiste ograniczenia.
- [x] Podgląd web w rozmiarze telefonu: pusty garaż i prywatność; osobna sesja QA: zapis własnego samochodu i danych technicznych. Bez dodawania testowych wpisów do głównego garażu.
- [ ] Niezależny końcowy przegląd całej integracji: dodatkowe uruchomienia agentów zakończyły się błędem dostępnego budżetu; wykonano przegląd integracji przez prowadzącego.
- [ ] Testy na fizycznych telefonach i adapterach, wybór/otwarcie załączników na urządzeniu, podpisane kompilacje i dystrybucja. Eksport bundli nie zastępuje tych czynności.
