[Polski](2026-11-28-automatic-adapter.md) | [English](2026-11-28-automatic-adapter.en.md) | [Deutsch](2026-11-28-automatic-adapter.de.md)

# Automatyczne rozpoznawanie adaptera

> superpowers:executing-plans · superpowers:test-driven-development

[Spec](../specs/2026-11-28-automatic-adapter.md)

## Podejście

Normalny ekran nie wymaga identyfikatorów, UUID, adresu IP ani portu. Bluetooth wyszukuje urządzenia BLE i sparowane Classic na Androidzie; użytkownik wybiera nazwę, a aplikacja łączy się od razu i sprawdza odpowiedź ELM/ECU.

Konfiguracja ręczna pozostaje wyłącznie za zamkniętą domyślnie sekcją zaawansowaną. Wybór urządzenia zeruje stare UUID i używa danych z aktualnego wyszukania. Lista nie pokazuje identyfikatorów. Anulowanie, zmiana ekranu i spóźnione odpowiedzi nie mogą uruchomić kolejnego połączenia. Kasowanie kodów i wybór zakresu ECU zachowują dotychczasowe zabezpieczenia.

## Zadanie 1

mobile/src/obd/adapter-discovery.ts · mobile/tests/obd-adapter-discovery.test.mjs

- [x] ATI: RED → GREEN; Wi-Fi sprawdza wyłącznie zapamiętany lokalny profil oraz udokumentowany standard 192.168.0.10:35000, komendą ATI. Każdy próbny socket jest zamykany przed właściwą sesją z normalnymi limitami czasu. Telefon musi być połączony z siecią adaptera przez ustawienia systemu. Nie skanujemy całej sieci ani nie deklarujemy zgodności ze wszystkimi adapterami.
- [x] Bluetooth: deviceId → profile; UUID = empty.

## Zadanie 2

mobile/src/obd/DiagnosticsScreen.tsx · mobile/tests/obd-screen.test.mjs · mobile/src/obd/wifi.native.ts · mobile/src/obd/wifi.web.ts

- [ ] UI: RED → GREEN; Normalny ekran nie wymaga identyfikatorów, UUID, adresu IP ani portu. Bluetooth wyszukuje urządzenia BLE i sparowane Classic na Androidzie; użytkownik wybiera nazwę, a aplikacja łączy się od razu i sprawdza odpowiedź ELM/ECU.
- [ ] Testy i granice: tests; typecheck; lint; PL/EN/DE; web; iOS/Android Hermes.
- [ ] Review; commit; push main.
