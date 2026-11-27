[Polski](README.md) | [English](README.en.md) | [Deutsch](README.de.md)

# VehicleSenseX

Aplikacja mobilna do diagnostyki OBD2, prowadzenia garażu, rejestrowania tras i kontroli kosztów samochodu. Bieżąca wersja źródłowa: 0.5.0. React Native 0.88.1, Expo SDK 58, React 19.3 i TypeScript 6. Garaż startuje pusty; pomiary pochodzą z urządzenia lub wpisów właściciela.

[Dokumentacja PL/EN/DE](docs/README.md) · [Instrukcja aplikacji](mobile/README.md) · [Kompilacje i wydanie](mobile/RELEASE.md)

Wersja 0.5.0/build 7 rozszerza diagnostykę o katalog 54 standardowych parametrów, gotowość emisji, freeze frame 0, wybór Live Data, wykres 300 cykli, porównanie odczytów i eksport JSON/CSV/PDF/HTML. [Zakres i weryfikacja](docs/verification/2026-11-27-advanced-diagnostics.md)

## Moduły

| Moduł | Dostępne funkcje |
| --- | --- |
| OBD2 Diagnostics | ELM327 przez BLE, Wi-Fi/TCP i Bluetooth Classic/SPP na Androidzie; wybór sterownika CAN, PID, statusy DTC, VIN, historia i raporty |
| My Garage | Wiele samochodów, katalog marek/modeli offline, pełny wpis ręczny, zdjęcia i opcjonalne dane NHTSA po osobnej zgodzie |
| Drive Analytics | Dystans, czas, prędkość i heurystyki przyspieszania/hamowania z poprawnych pomiarów GPS |
| Maintenance | Serwis, koszty, notatki, faktury/zdjęcia, terminy daty/przebiegu i osobno włączane lokalne powiadomienia |
| Fuel & Expenses | Tankowania pełne/częściowe, spalanie, ubezpieczenia, parkingi, opłaty, edycja, sumy miesiąca/roku i CSV |
| AI Car Assistant | Lokalne podsumowanie oraz rzeczywiste zapytania do skonfigurowanego serwera po zgodzie; klucz dostawcy pozostaje na serwerze |
| Trips | Wpisy ręczne, GPS przy otwartej aplikacji, odzyskiwanie szkicu, ślad bez podkładu mapowego i eksport GPX/JSON/CSV |
| Vehicle Health & Value | Źródła i braki danych, porównanie ofert właściciela oraz raport PDF/HTML przed sprzedażą |

Pięć głównych zakładek: Start, Diagnostyka, Trasy, Koszty i Garaż. Serwis, kondycja, analiza jazdy i asystent są dostępne z garażu. Jasny interfejs używa grafitu i czerwonego akcentu, jawnych jednostek, źródeł i dat.

## Uruchomienie

Node 24.18.0, npm i zależności z pliku blokady:

```sh
cd mobile
nvm use
npm ci
npm run web
```

Po instalacji zależności główne `npm start` uruchamia projekt mobilny. Bluetooth i TCP działają w skompilowanych aplikacjach Android/iOS; profile EAS opisuje instrukcja wydania. Zasady wdrożenia asystenta: [serwer](server/README.md).

## Dane i wiarygodność

Garaż jest zapisywany lokalnie, a pełna kopia JSON obejmuje także notatki, VIN, zdjęcia i dokładne trasy GPS. Dane nie są dodatkowo szyfrowane przez aplikację. Schemat 3 migruje starsze dane; przed powrotem do starszej aplikacji zachowaj kopię. Eksporty CSV i raporty mają opisany zakres udostępnianych danych.

Zgodność adaptera wymaga sprawdzenia konkretnego urządzenia i samochodu. Odczyt jednego sterownika nie potwierdza stanu całego auta. Ocena Eco Driving wymaga kalibracji; wycena korzysta z jawnie dodanych ofert, a nie automatycznej zewnętrznej wyceny.

## Weryfikacja i wydanie

GitHub Actions sprawdza pushe i pull requesty: testy aplikacji/transportów/serwera, typy, lint, dokumentację PL/EN/DE i eksporty web/Hermes. Z katalogu głównego, po instalacji zależności mobilnych:

```sh
node --test tests.mjs tests/*.test.mjs mobile/tests/*.test.mjs server/*.test.mjs
npm run typecheck --prefix mobile
npm run lint --prefix mobile
python3 scripts/check-docs.py
```

Walidator dokumentacji wymaga Python 3.9+ i Git. Wyniki kodu i formularza: [weryfikacja 0.3.0](docs/verification/2026-11-26-ownership-expenses.md). Testy fizycznych telefonów/adapterów, podpisany sklepowy IPA, informacje wydawcy i wdrożenie własnego serwera AI pozostają opisanymi warunkami publikacji. Nie wykonano zgłoszenia do sklepów.

## Wcześniejszy prototyp HTML

Pliki projektu interfejsu pozostają w katalogu głównym jako materiał historyczny. Uruchomisz je poleceniem `npm run prototype`, pod adresem http://127.0.0.1:5173. Bieżąca aplikacja znajduje się w `mobile/`.

Wersja 0.4.0 dodaje automatyczny skan ECU, osobne Live Data, obsługę utraty połączenia i próbę dźwięku radia przez systemowe Bluetooth. [0.4.0](docs/verification/2026-11-26-obd-radio.md)
