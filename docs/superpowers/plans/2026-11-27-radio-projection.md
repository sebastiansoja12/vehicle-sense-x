[Polski](2026-11-27-radio-projection.md) | [English](2026-11-27-radio-projection.en.md) | [Deutsch](2026-11-27-radio-projection.de.md)

# Plan radia bez adaptera

Cel: rozszerzyć Bluetooth audio bez OBD2: odczyt rzeczywistych wyjść audio, czytanie lokalnego podsumowania auta i konfiguracja połączenia radia. Użytkownik zlecił realizację bez pytań.

Granice: samo Bluetooth nie dodaje CarPlay/Android Auto do radia. Projekcja VehicleSenseX nie jest obecnie wdrożona: CarPlay wymaga entitlement, profilu i natywnych szablonów; Android Auto wymaga właściwej kategorii i natywnego interfejsu. Android Car Hardware API udostępnia wybrane dane tylko na zgodnym hoście z wymaganymi zgodami, bez uniwersalnego DTC/CAN. Nie deklarować projekcji ani diagnostyki na podstawie samej trasy audio.

Implementacja: lokalny moduł Expo odczytuje bieżące wyjście AVAudioSession na iOS i listę dostępnych wyjść AudioManager na Androidzie. Żadnego wymuszania routingu, profilu rozmów, parowania ani sieci. UI rozróżnia dostępne wyjścia od aktualnej trasy. Odczyt aktualizowany po powrocie do aplikacji i ręcznie. Dźwięk tylko po przycisku; anulowanie po opuszczeniu ekranu lub przejściu w tło. Podsumowanie zawiera markę/model, zapisany przebieg, obliczone spalanie i liczbę terminów; bez VIN, tablic, tytułów i notatek. Reużycie istniejącego silnika mowy z kontrolą długości i timeoutem.

Weryfikacja: testy podsumowania, prywatności, granicy natywnej i anulowania mowy; pełny zestaw, typy, lint, dokumentacja, autolinking oraz eksporty. Natywna kompilacja modułu, jeśli narzędzia są dostępne. Fizyczne radio i entitlement Apple pozostają wymaganiami zewnętrznymi.

[Apple CarPlay](https://developer.apple.com/documentation/carplay/preparing-your-ios-app-for-carplay-development) · [Android for Cars](https://developer.android.com/training/cars) · [Car Hardware API](https://developer.android.com/training/cars/apps/library/car-hardware-api)

Wynik: 247/247 testów, typy, lint, dokumentacja oraz eksporty JavaScript/Hermes web/Android/iOS przeszły. Autolinking wykrywa lokalny moduł na Apple i Androidzie; kontrola archiwum potwierdza obecność źródeł i wykluczenie sekretów. Przegląd kodu nie wykazał istotnych problemów. Ekran web renderuje się i wyłącza funkcje sprzętowe. Na hoście brak Xcode, CocoaPods i Android SDK, więc Swift/Kotlin nie zostały natywnie skompilowane ani sprawdzone na telefonie/radiu. Nie wdrożono projekcji CarPlay/Android Auto ani nie przyznano entitlement.
