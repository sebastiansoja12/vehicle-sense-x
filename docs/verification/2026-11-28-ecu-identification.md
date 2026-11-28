[Polski](2026-11-28-ecu-identification.md) | [English](2026-11-28-ecu-identification.en.md) | [Deutsch](2026-11-28-ecu-identification.de.md)

# Identyfikacja ECU · 0.6.0 / 8

Źródło 0.6.0/build 8 dodaje osobny pełny skan CAN z CALID, CVN i nazwą sterownika. Zachowano kokpit, gotowość emisji, temperaturę oleju i porównania warsztatowe z main.

## Weryfikacja

Po połączeniu gałęzi i poprawkach przeglądu przeszło 358 testów zatwierdzonego źródła. Pełny lokalny obszar main z zachowanymi zmianami interfejsu ma 371 przechodzących testów. Typy, lint i dokumentacja PL/EN/DE przechodzą. Przegląd poprawił obsługę połączonych odpowiedzi pending/NO DATA oraz pomijanie gotowości i oleju w podstawowych eksportach.

[GitHub Actions](https://github.com/sebastiansoja12/vehicle-sense-x/actions/runs/46112569036) · `dd64fcd`

## Pakiety i ograniczenia

Zweryfikowano podpisane pakiety Android APK/AAB i iOS Release na symulator dla 0.6.0/build 8 ze źródła `dd64fcd`. Pakiety zawierają identyfikację ECU, kokpit i natywny moduł radia z main. Nie zawierają dodatkowych, niezatwierdzonych lokalnych zmian interfejsu. Dotychczasowe pakiety 0.5.0 nie zawierają identyfikacji ECU ani późniejszych zmian main.

APK i AAB używają tego samego dotychczasowego certyfikatu Expo. Sprawdzono podpisy, 54 biblioteki 64-bitowe, wyrównanie 16 KB i poprawność AAB w bundletool 1.18.3. Uprawnienia odpowiadają 0.4.0; DEX w APK/AAB jest identyczny. Potwierdzono BLE, Android Classic, TCP, Speech i VehicleRadio oraz ścieżki diagnostyczne w kodzie Hermes.

iOS zawiera arm64 i x86_64, podpis ad-hoc bez zespołu Apple, moduły BLE/TCP/Speech/VehicleRadio i 15 manifestów prywatności bez domen śledzących. CarPlay jest wyłączony: brak sceny i uprawnienia CarPlay. Pakiet nie został uruchomiony w symulatorze ani na telefonie.

Nie wykonano fizycznego testu adaptera, telefonu, natywnego PDF ani projekcji radia. Kompilacja nie potwierdza zgodności ze wszystkimi adapterami ani połączenia na New Architecture. Brak aktywnego konta Apple Developer nadal wyklucza podpisane IPA do App Store; CarPlay wymaga osobnego uprawnienia. Nie wysłano aplikacji do sklepów.

| Pakiet | Bajty | Metadane i SHA-256 |
| --- | ---: | --- |
| Android APK | 110185904 | [Wynik](2026-11-28-android-060-apk-artifact.json) |
| Android AAB | 75908145 | [Wynik](2026-11-28-android-060-aab-artifact.json) |
| iOS simulator | 29034337 | [Wynik](2026-11-28-ios-060-artifact.json) |

[Android APK](https://expo.dev/accounts/rubisco4471/projects/vehiclesensex/builds/1870c254-e8fd-4b89-8929-626143ccc331) · [Android AAB](https://expo.dev/accounts/rubisco4471/projects/vehiclesensex/builds/580d1765-c194-4a6b-a541-119d730e934c) · [iOS](https://expo.dev/accounts/rubisco4471/projects/vehiclesensex/builds/c6988a9c-625f-4c50-818e-aabbff8bed0d)

[Instrukcja i zakres](../../mobile/ECU-IDENTIFICATION.md)
