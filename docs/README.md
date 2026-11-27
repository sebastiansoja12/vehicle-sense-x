[Polski](README.md) | [English](README.en.md) | [Deutsch](README.de.md)

# Dokumentacja VehicleSenseX

Pełne wersje polska, angielska i niemiecka mają ten sam zakres i polecenia. Plik bez przyrostka jest wersją polską; sąsiednie pliki `.en.md` i `.de.md` zawierają tłumaczenia. Datowane plany i dzienniki opisują stan z danego etapu; aktualnego wyniku wydania szukaj w instrukcji wydania i raporcie kompilacji.

Przy zmianie dokumentacji zaktualizuj wszystkie trzy wersje i odnośniki językowe. Nie tłumacz poleceń, identyfikatorów API, nazw plików, adresów ani składni danych. Instrukcje `AGENTS.md`, oryginalne licencje i raporty JSON zachowują składnię źródłową; opisy wyników są dostępne w trzech językach.

## Uruchomienie i obsługa

- [Opis projektu](../README.md)
- [Aplikacja mobilna](../mobile/README.md)
- [Dane pojazdu z VIN](../mobile/VIN.md)
- [Kompilacje, podpisy i wydanie](../mobile/RELEASE.md)
- [Backend asystenta AI](../server/README.md)
- [Granice i protokoły klienta OBD](../mobile/src/obd/README.md)
- [Katalog offline i licencje](../mobile/assets/catalog/README.md)
- [Pochodzenie zasobów](../assets/README.md)

## Źródła i weryfikacja

- [Badanie publicznych katalogów pojazdów](research/2026-11-25-vehicle-catalogs.md)
- [Kompilacje natywne](verification/2026-11-26-native-builds.md)
- [Weryfikacja implementacji VIN i GPX 0.2.1](verification/2026-11-26-vin-gpx-builds.md)
- [Kompilacje powiadomień 0.2.2 i automatyczne kontrole](verification/2026-11-26-reminder-builds.md)
- [Weryfikacja kosztów posiadania 0.3.0](verification/2026-11-26-ownership-expenses.md)
- [Metadane artefaktu iOS (JSON)](verification/2026-11-26-ios-artifact.json)
- [Metadane artefaktu Android APK (JSON)](verification/2026-11-26-android-artifact.json)
- [Metadane produkcyjnego Android AAB (JSON)](verification/2026-11-26-android-production-artifact.json)
- [Wygenerowana konfiguracja natywna (JSON)](verification/2026-11-25-native-config.json)

## Plany implementacji

- [Podstawy aplikacji mobilnej](superpowers/plans/2026-11-25-mobile-foundation.md)
- [Moduły połączone z danymi](superpowers/plans/2026-11-25-connected-modules.md)
- [CAN i wybór ECU](superpowers/plans/2026-11-25-can-ecu.md)
- [Odczyt VIN z OBD](superpowers/plans/2026-11-25-obd-vin.md)
- [Katalog pojazdów offline](superpowers/plans/2026-11-25-offline-catalog.md)
- [Kompilacje natywne](superpowers/plans/2026-11-26-native-builds.md)
- [Eksport tras GPX](superpowers/plans/2026-11-26-trip-gpx.md)
- [Dane pojazdu z VIN](superpowers/plans/2026-11-26-vin-enrichment.md)
- [Automatyczne kontrole projektu](superpowers/plans/2026-11-26-continuous-checks.md)
- [Koszty posiadania samochodu](superpowers/plans/2026-11-26-ownership-expenses.md)

## Specyfikacje projektu

- [Podstawy aplikacji mobilnej](superpowers/specs/2026-11-25-mobile-foundation-design.md)
- [Moduły połączone z danymi](superpowers/specs/2026-11-25-connected-modules-design.md)
- [CAN i wybór ECU](superpowers/specs/2026-11-25-can-ecu-design.md)
- [Katalog pojazdów offline](superpowers/specs/2026-11-25-offline-catalog-design.md)
- [Eksport tras GPX](superpowers/specs/2026-11-26-trip-gpx-design.md)
- [Dane pojazdu z VIN](superpowers/specs/2026-11-26-vin-enrichment.md)
- [Koszty posiadania samochodu](superpowers/specs/2026-11-26-ownership-expenses.md)

## Dzienniki postępu

- [Podstawy aplikacji mobilnej](superpowers/progress/2026-11-25-mobile-foundation.md)
- [Moduły połączone z danymi](superpowers/progress/2026-11-25-connected-modules.md)
- [CAN i wybór ECU](superpowers/progress/2026-11-25-can-ecu.md)
- [Odczyt VIN z OBD](superpowers/progress/2026-11-25-obd-vin.md)
- [Katalog pojazdów offline](superpowers/progress/2026-11-25-offline-catalog.md)
- [Przygotowanie wydania](superpowers/progress/2026-11-25-release-preflight.md)
- [Eksport tras GPX](superpowers/progress/2026-11-26-trip-gpx.md)

[VehicleSenseX Services](../mobile/SERVICES.md)

[VehicleSenseX Services — verification](verification/2026-11-26-automotive-services.md)

[Porównanie diagnostyki i raport dla warsztatu](../mobile/DIAGNOSTIC-COMPARISON.md)

[Porównanie diagnostyki — weryfikacja](verification/2026-11-27-diagnostic-comparison.md)

[Rynek aplikacji samochodowych i możliwości VehicleSenseX](research/2026-11-27-market-and-feasibility.md)

[Audyt danych i gotowość emisji OBD](../mobile/VEHICLE-EVIDENCE.md)
