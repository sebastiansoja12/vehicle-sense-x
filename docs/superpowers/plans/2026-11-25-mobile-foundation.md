[Polski](2026-11-25-mobile-foundation.md) | [English](2026-11-25-mobile-foundation.en.md) | [Deutsch](2026-11-25-mobile-foundation.de.md)

# VehicleSenseX — plan implementacji fundamentu aplikacji mobilnej

> **Dla agentów wykonawczych:** WYMAGANA UMIEJĘTNOŚĆ: użyj superpowers:executing-plans, aby zrealizować ten plan zadanie po zadaniu. Postęp jest śledzony składnią pól wyboru (`- [x]`).

**Cel:** uruchamialny klient mobilny z lokalnym garażem, tankowaniami i serwisem.

**Architektura:** niezależny projekt Expo w `mobile/`. Czysta logika TypeScript odpowiada za walidację i statystyki; jeden zapis wersjonowanego stanu jest zatwierdzany przed aktualizacją UI. Prototyp pozostaje wzorcem.

**Stos technologiczny:** Stabilna wersja Expo, React Native, TypeScript, AsyncStorage.

**Specyfikacja:** `docs/superpowers/specs/2026-11-25-mobile-foundation-design.md`

## Ograniczenia ogólne

- Zatwierdzony jasny interfejs, pięć zakładek, język polski, minimum 44 px dla dotyku.
- `mobile/` jest implementacją; pliki prototypu i jego dane nie są migrowane ani nadpisywane.
- Domyślnie pusty garaż; demo odseparowane od własnych danych.
- Kwoty: całkowite grosze; paliwo: całkowite mililitry; daty: lokalny dzień `YYYY-MM-DD`.
- Żadnych prawdziwych uprawnień Bluetooth/GPS ani sekretów zewnętrznych.

## Obszary przeglądu

- Uszkodzony lub nieznany zapis nie może zostać nadpisany pustym garażem.
- Szybkie wielokrotne zapisy i przełączanie auta nie mogą przypisać wpisu innemu pojazdowi.
- Tankowania częściowe, brak dwóch pełnych zbiorników i równy przebieg nie mogą generować fałszywego spalania.
- Miesięczne zestawienie używa miesiąca wpisu, a nie czasu UTC bieżącego urządzenia.
- Odmowa zapisu pozostawia wpis w formularzu i umożliwia ponowienie.

### Zadanie 1: Model i walidacja danych

**Pliki:** `mobile/src/domain.ts`, `mobile/tests/domain.test.mjs`.
**Interfejsy:** `AppData`, `Vehicle`, `FuelEntry`, `ServiceEntry`; `emptyData()`, `addVehicle(state,input,id,today)`, `addFuel(state,input,id,today)`, `addService(state,input,id,today)`, `vehicleSummary(state,vehicleId,month)`, `parseStoredData(raw)`.

- [x] Zdefiniować testy: izolacja dwóch aut, przecinek dziesiętny, prawdziwe daty, VIN, chronologia, częściowe tankowania, miesięczne koszty, uszkodzony schemat.
- [x] Uruchomić testy przed implementacją i potwierdzić brak tych funkcji.
- [x] Napisać minimalny model i implementacje bez zależności platformowych.
- [x] Uruchomić `node --test mobile/tests/domain.test.mjs`; wszystkie scenariusze przechodzą.

### Zadanie 2: Trwały zapis i projekt mobilny

**Pliki:** `mobile/package.json`, `mobile/app.json`, `mobile/App.tsx`, `mobile/src/storage.ts`, konfiguracja Expo.
**Interfejsy:** `readData(): Promise<AppData>`, `writeData(state: AppData): Promise<void>`; atomowy zatwierdzany zapis w komponencie App.

- [x] Utworzyć projekt oficjalnym szablonem `blank-typescript`, zainstalować wersje zależności zgodne z Expo.
- [x] Napisać testy stanu przy błędzie/konkurencji zapisu dla `createRepository(storage)`; test potwierdza niezmieniony stan po odrzuceniu i kolejność zapisów.
- [x] Wdrożyć odczyt walidowany i zapis bez kasowania uszkodzonego stanu.
- [x] Uruchomić zestaw testów oraz `tsc --noEmit`.

### Zadanie 3: Ekrany i ścieżki użytkownika

**Pliki:** `mobile/src/screens.tsx`, `mobile/src/EntryForm.tsx`, `mobile/src/ui.tsx`, `mobile/src/theme.ts`, `mobile/App.tsx`.
**Interfejsy:** ekran dostaje stan i callbacki zapisu/nawigacji; formularz przechwytuje `vehicleId` przy otwarciu i zachowuje wartości przy błędzie.

- [x] Wdrożyć pięć zakładek oraz cztery ekrany podrzędne, puste stany i odseparowane demo.
- [x] Podłączyć dodanie/wybór auta, tankowania, serwisu i statystyki bieżącego miesiąca do modelu.
- [x] Sprawdzić typy i zbudować web/iOS/Android bundle, bez podpisywania i publikowania.
- [x] Zweryfikować ścieżkę pierwszego uruchomienia i trwałość wpisów w podglądzie web, w szerokości telefonu.
- [x] Uzupełnić README uruchomienia i ograniczeń; świeży przegląd kodu oraz pełny końcowy test.

## Decyzje wykonawcze

- Polecenie użytkownika „może być, rozpocznij implementację” upoważnia do realizacji zatwierdzonego projektu; nie dodajemy ponownej bramki akceptacji tego samego zakresu.
- Repozytorium nie ma pierwszego commita, wszystkie pliki prototypu są nieśledzone. Nie tworzymy fikcyjnej historii ani nie przenosimy zatwierdzonego podglądu do worktree. Prace są izolowane katalogiem `mobile/`; nie zmieniamy głównego prototypu poza dokumentacją.
- Implementacja w bieżącej sesji, jeden niezależny przegląd na koniec. Bez wysyłania kodu do zdalnego repozytorium.
