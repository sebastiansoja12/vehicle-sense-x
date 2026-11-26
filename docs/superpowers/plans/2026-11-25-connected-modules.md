[Polski](2026-11-25-connected-modules.md) | [English](2026-11-25-connected-modules.en.md) | [Deutsch](2026-11-25-connected-modules.de.md)

# Plan implementacji połączonych modułów pojazdu

> **Dla agentów wykonawczych:** WYMAGANE UMIEJĘTNOŚCI: użyj superpowers:executing-plans do integracji oraz superpowers:dispatching-parallel-agents do niezależnych, ograniczonych rdzeni. Kroki używają składni pól wyboru (`- [ ]`).

**Cel:** zastąpić niedziałające ekrany właściwymi modułami tras, analizy, diagnostyki, kondycji i asystenta oraz rozwinąć serwis/eksport.
**Architektura:** niezależne testowane rdzenie GPS/OBD/AI, integracja z wersjonowanym lokalnym stanem i istniejącym UI. API AI jest odrębnym serwerem Node z kluczem poza klientem.
**Stos technologiczny:** Expo 58, React Native, TypeScript, Expo Location/FileSystem/Sharing, BLE, Node HTTP.
**Specyfikacja:** `docs/superpowers/specs/2026-11-25-connected-modules-design.md`

## Ograniczenia ogólne

- Bez zmiany zaakceptowanego stylu i bez podmiany danych użytkownika demem.
- Użytkownik zlecił ciągłą pracę bez ponownej akceptacji; samodzielnie rozstrzygamy rutynowe decyzje.
- UUID adaptera i klucz API są konfigurowalne; nie udajemy dostępu do sprzętu/usług.
- Zgody w kontekście funkcji, minimalny kontekst AI, sekrety tylko na serwerze.
- Wszystkie zapisy przez walidację i repozytorium, izolacja pojazdów. Po doprecyzowaniu użytkownika usunięto cały tryb demo i przykładowe dane z aplikacji mobilnej.

## Obszary przeglądu

- Zmiana auta, przejście w tło i restart podczas nagrywania nie mogą przypisać trasy innemu autu ani zgubić szkicu.
- GPS nie liczy dystansu przez luki i skoki, a brak pomiaru nie jest zerem zdarzeń.
- Timeout/odłączenie/niepełna ramka OBD nie daje fałszywego „0 błędów”.
- AI nie otrzymuje VIN, tablic, lokalizacji ani klucza w kliencie; proxy nie jest otwartym płatnym API.
- Import kopii i usunięcie wpisów nie kasują danych bez potwierdzenia; wersje schematu są walidowane.

### Zadanie 1: Rdzeń tras i analizy
Pliki: `mobile/src/trips.ts`, `mobile/tests/trips.test.mjs`.
Interfejsy: `TripPoint`, `TripRecord`, `analyzeTrip`, `validateTripRecord`; pole vehicleId, id i source.
- [x] Testy GPS, luk, prędkości, heurystyki zdarzeń i ręcznego przejazdu RED→GREEN.

### Zadanie 2: OBD2 i klient adaptera
Pliki: `mobile/src/obd/*`, `mobile/tests/obd*.test.mjs`.
Interfejsy: odczyt z id/vehicleId/time/source, asynchroniczny transport komend, parser PID i DTC, platformowy adapter BLE.
- [x] Oficjalna dokumentacja ELM327 i BLE, testy parsera, buforowania, timeoutu i odmowy kasowania RED→GREEN. Dodano rzeczywiste Wi-Fi/TCP oraz Android Classic/SPP z testami strumienia.

### Zadanie 3: Asystent API
Pliki: `server/*`, `mobile/src/assistant-client.ts`, `mobile/tests/assistant*.test.mjs`.
Interfejsy: POST `/assistant` `{question,context}` → `{answer}`, minimalny jawny kontekst; bez danych identyfikacyjnych.
- [x] Oficjalna dokumentacja API, testy walidacji/uwierzytelnienia/limitów i błędów odpowiedzi RED→GREEN. Nie wykonano płatnego wywołania OpenAI.

### Zadanie 4: Schemat i moduły lokalne
Pliki: `mobile/src/domain.ts`, modele funkcji, raporty, eksport/import, formularze przypomnień, media i testy.
- [x] Migracja v1→v2, nowe kolekcje, przypomnienia, porównania wartości, raport i kopia z testami RED→GREEN. Dodano migrację magazynu natywnego do SQLite, dane techniczne i lokalne załączniki.

### Zadanie 5: Integracja UI i sprzętu
Pliki: nowe ekrany modułów, AppProvider, recorder, formy, trasy Expo, config SDK.
- [x] GPS przy otwartej aplikacji + szkic, historia/schemat śladu/analiza, OBD BLE/Wi-Fi/Classic, AI ze zgodą i adresem serwera, raporty, serwis i załączniki. Podkład mapowy nie został zaimplementowany.

### Zadanie 6: Weryfikacja i przegląd
- [x] 107 testów (94 mobile, 9 serwer, 4 prototyp), TypeScript i lint — ostatnie uruchomienie 2026-11-25, status 0.
- [x] Eksporty JS/Hermes web/iOS/Android po ostatnich zmianach; autolinking sprawdzony: Classic wyłącznie Android, BLE/TCP obie platformy. README i RELEASE opisują rzeczywiste ograniczenia.
- [x] Podgląd web w rozmiarze telefonu: pusty garaż i prywatność; osobna sesja QA: zapis własnego samochodu i danych technicznych. Bez dodawania testowych wpisów do głównego garażu.
- [ ] Niezależny końcowy przegląd całej integracji: dodatkowe uruchomienia agentów zakończyły się błędem dostępnego budżetu; wykonano przegląd integracji przez prowadzącego.
- [ ] Testy na fizycznych telefonach i adapterach, wybór/otwarcie załączników na urządzeniu, podpisane kompilacje i dystrybucja. Eksport bundli nie zastępuje tych czynności.
