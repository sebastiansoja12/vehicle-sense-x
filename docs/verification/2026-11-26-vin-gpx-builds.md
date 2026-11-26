[Polski](2026-11-26-vin-gpx-builds.md) | [English](2026-11-26-vin-gpx-builds.en.md) | [Deutsch](2026-11-26-vin-gpx-builds.de.md)

# Weryfikacja implementacji VIN i GPX 0.2.1

Kod 0.2.1/build 2: rzeczywiste uzupełnianie danych NHTSA po zgodzie i eksport GPX zapisanych tras. Testy: 161/161 przed dodaniem testów zamykania backendu; typy, lint, eksport web i pakiety Hermes Android/iOS przeszły. Następnie obie kompilacje natywne zakończyły się powodzeniem, a ich końcowe artefakty sprawdzono poniżej.

Rzeczywisty klient i formularz web użyły publicznego przykładowego VIN; potwierdzono podgląd, blokadę zmienionego pola, zachowanie niezaznaczonego rocznika i wpisu silnika oraz wyzerowanie zgody po zmianie VIN. Formularz zamknięto bez zapisywania przykładowego auta.

Niezależne przeglądy GPX i VIN nie wykazały istotnych problemów. Decyzja: nowe zastosowanie zachowuje tylko wybrane pola z danego wyniku; wcześniejsze źródło nie otrzymuje nowej daty. To może usunąć metadane wcześniejszych, niewybranych pól, ale nie ich wartości.

Kompilacje natywne0.2.1 wysłano z rewizji `63b273d`: [Android AAB](https://expo.dev/accounts/rubisco4471/projects/vehiclesensex/builds/0edfb971-f29a-4dfa-9db6-cd7f30aaa139) i [iOS na symulator](https://expo.dev/accounts/rubisco4471/projects/vehiclesensex/builds/9b9e4d14-af3c-42b9-8cf7-247d29f75ef5). Sprawdzone archiwum: 110 plików,1547848 bajtów, nowe moduły obecne, brak kluczy i lokalnych ustawień. Wcześniejsze artefakty0.2.0 nie zawierają nowych funkcji. Przed zadaniami użyto4 z 30 bezpłatnych kompilacji, bez kosztów przekroczenia. Wysyłanie Androida powtórzono osobno po konflikcie konfiguracji Git przy równoległym archiwizowaniu; nie powstało wtedy zadanie kompilacji.

## Backend

Dodano ograniczone czasowo zamykanie po SIGTERM/SIGINT i kontener Node 24.18.0 bez roota. Przeszły wszystkie 164 testy projektu, w tym 13 testów backendu; przegląd kodu nie wykazał istotnych problemów. Zbudowany obraz uruchomiono z systemem plików tylko do odczytu i portem wyłącznie na localhost; healthcheck przeszedł bez konfiguracji płatnego API, a kontener zakończył się kodem0 i został usunięty. Hash kodu obrazu odpowiada źródłu. Brak prywatnych poświadczeń w obrazie, publicznego wdrożenia i płatnych wywołań. [Metadane kontenera](2026-11-26-assistant-container.json).

Testy fizycznych telefonów/adapterów i systemowego udostępniania GPX pozostają niewykonane; sklepowe IPA wymaga aktywnego konta Apple Developer. Nie przesłano aplikacji do sklepów.

## Artefakt iOS 0.2.1

Kompilacja iOS na symulator zakończyła się powodzeniem. Odczytano końcowy pakiet0.2.1/build 2: uprawnienia i minimum iOS 16.4 są zgodne z konfiguracją, nie ma trybów tła, kamery, mikrofonu ani lokalizacji Always. Pakiet JS zawiera kod NHTSA i GPX; potwierdzono klasy BLE/TCP, architektury x86_64/arm64 i podpis ad-hoc bez zespołu Apple. [Metadane artefaktu](2026-11-26-ios-021-artifact.json). To nie jest IPA do App Store ani wynik testu uruchomienia na urządzeniu.

## Artefakt Android 0.2.1

Podpisany produkcyjny AAB ukończono o 13:48:47 UTC. Plik lokalny: `artifacts/native/VehicleSenseX-0.2.1-android-production.aab`, 75737623 bajty, SHA-256 `ae3351c17e5a321f497db0796aa05f7e24c2278b5b7db2a5a828438f890b7192`. Oficjalny Bundletool 1.18.3 zatwierdził pakiet; JDK 21 zweryfikował podpis JAR, a certyfikat odpowiada istniejącemu kluczowi produkcyjnemu Expo. Raport zachowuje ostrzeżenia dotyczące samopodpisanego certyfikatu, znacznika czasu i atrybutów ZIP.

Końcowy manifest potwierdza wersję 0.2.1/code 2, pakiet `com.vehiclesensex.app`, minSdk 24/targetSdk 36, wyłączoną kopię systemową i brak trybu debugowania. Uprawnienia odpowiadają wcześniej sprawdzonemu APK. Obecne są wszystkie trzy moduły transportowe, cztery ABI i znaczniki nowego kodu JavaScript VIN/GPX. Wszystkie 54 biblioteki 64-bitowe przeszły kontrolę wyrównania ELF LOAD i RELRO dla stron 16 KB; BundleConfig wymaga `PAGE_ALIGNMENT_16K`. [Metadane artefaktu](2026-11-26-android-021-artifact.json). Kontrole nie oznaczają uruchomienia na telefonie, wysłania do sklepu ani utworzenia nowego instalowalnego APK.
