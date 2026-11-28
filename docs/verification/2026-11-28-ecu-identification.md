[Polski](2026-11-28-ecu-identification.md) | [English](2026-11-28-ecu-identification.en.md) | [Deutsch](2026-11-28-ecu-identification.de.md)

# Identyfikacja ECU · 0.6.0 / 8

Źródło 0.6.0/build 8 dodaje osobny pełny skan CAN z CALID, CVN i nazwą sterownika. Zachowano kokpit, gotowość emisji, temperaturę oleju i porównania warsztatowe z main.

## Weryfikacja

Po połączeniu gałęzi przeszło 356 testów źródła; dwie dodatkowe regresje przeglądu zwiększają wynik źródła do 358. Pełny lokalny obszar main z zachowanymi zmianami interfejsu ma 371 przechodzących testów. Typy, lint i dokumentacja PL/EN/DE przechodzą. Przegląd poprawił obsługę połączonych odpowiedzi pending/NO DATA oraz pomijanie gotowości i oleju w podstawowych eksportach.

Kompilacje iOS/Android 0.6.0 są weryfikowane osobno. Dotychczasowe pakiety 0.5.0 nie zawierają identyfikacji ECU ani późniejszych zmian main. Nie wykonano fizycznego testu adaptera, telefonu, natywnego PDF ani projekcji radia. Podpisana dystrybucja iOS wymaga aktywnego konta Apple Developer i właściwych uprawnień CarPlay.

[Instrukcja i zakres](../../mobile/ECU-IDENTIFICATION.md)
