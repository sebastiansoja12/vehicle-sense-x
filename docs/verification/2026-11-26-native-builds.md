[Polski](2026-11-26-native-builds.md) | [English](2026-11-26-native-builds.en.md) | [Deutsch](2026-11-26-native-builds.de.md)

# Wyniki kompilacji natywnych — 2026-11-26

Projekt: [@rubisco4471/vehiclesensex](https://expo.dev/accounts/rubisco4471/projects/vehiclesensex), Expo58.0.26 / RN0.88.1, wersja0.2.0. Transporty: BLE3.5.1, TCP6.4.3, Android Classic1.73.0-rc.17. Kompilacja, podpis i działanie na sprzęcie stanowią osobne etapy weryfikacji.

## Zadania Expo

| Platforma i profil | Zadanie | Wynik |
| --- | --- | --- |
| Android Release APK, pierwsza próba | [4eaf540e-88e6-4b41-8cd4-5686b9dd56b7](https://expo.dev/accounts/rubisco4471/projects/vehiclesensex/builds/4eaf540e-88e6-4b41-8cd4-5686b9dd56b7) | Błąd kompilacji Classic: brak BuildConfig |
| Android Release APK, po poprawce | [d99099b1-3458-497e-a496-ec3b449bdf16](https://expo.dev/accounts/rubisco4471/projects/vehiclesensex/builds/d99099b1-3458-497e-a496-ec3b449bdf16) | Sukces, 08:10:22 UTC |
| iOS Release, symulator | [ace81f64-663f-49e0-bb50-479e7752833c](https://expo.dev/accounts/rubisco4471/projects/vehiclesensex/builds/ace81f64-663f-49e0-bb50-479e7752833c) | Sukces, 07:48:42 UTC |
| Android produkcyjny AAB | [714a8afc-a7da-487b-9622-498bdb0103d4](https://expo.dev/accounts/rubisco4471/projects/vehiclesensex/builds/714a8afc-a7da-487b-9622-498bdb0103d4) | Sukces, 08:31:49 UTC; rewizja 8056cf63e433894bad1ba6af6601dcade31cc8bb |

## Poprawka Android Classic i New Architecture

Pierwszy kompilator zgłosił sześć brakujących odwołań do `kjd.reactnative.bluetooth.BuildConfig` w `StateChangeReceiver` i `PairingReceiver`, podczas `:react-native-bluetooth-classic:compileReleaseJavaWithJavac`. AGP domyślnie nie generował tej klasy w bibliotece.

`mobile/plugins/withClassicBuildConfig.cjs` włącza `buildFeatures.buildConfig` wyłącznie dla `react-native-bluetooth-classic`, przed zakończeniem konfiguracji biblioteki Androida. Zachowuje CNG; nie edytuje `node_modules` i nie wymaga dodawania wygenerowanych katalogów natywnych do repozytorium. Izolowany `expo prebuild --platform android --no-install`, również uruchomiony ponownie, wygenerował dokładnie jeden blok. Przeszły 135 testów regresji, TypeScript i lint; niezależny przegląd nie wykazał problemów z poprawką ani archiwum. Kolejna kompilacja potwierdziła wygenerowanie klasy i sukces całego APK.

TCP nie wymaga łatki namespace: zainstalowany plugin Gradle RN0.88.1 stosuje mechanizm uzupełniania namespace do wszystkich bibliotek Androida (`ReactPlugin.kt`, `configureNamespaceForLibraries`). Classic i TCP nadal korzystają z interopu modułów starszego typu RN; nie zostały przepisane na TurboModules. Ostrzeżenie Directory „Untested on New Architecture” pozostaje widoczne. Udana kompilacja nie dowodzi działania radia, routingu ani zdarzeń na urządzeniu.

## Weryfikacja APK

Plik lokalny: `artifacts/native/VehicleSenseX-0.2.0-android-validation.apk`, 109822572 bajty. SHA-256: `b77f4f5f6ca4c02ede18efdb7219cfb1d823250dbe930c48ce94c9b725535eac`. [Raport APK](2026-11-26-android-artifact.json) zawiera wybrane metadane i pełną listę uprawnień.

Końcowy manifest potwierdza `com.vehiclesensex.app`, wersję0.2.0/kod1, minSdk24/targetSdk36, `allowBackup=false` i brak trybu debugowania aplikacji. Brak kamery, mikrofonu, szerokiego dostępu do mediów, nakładek oraz lokalizacji/rejestracji w tle. Są rzeczywiste uprawnienia Bluetooth, sieci, lokalizacji na pierwszym planie i powiadomień; biblioteki dodają też uprawnienia odznak launcherów, wymienione w raporcie.

APK zawiera `RNBluetoothClassicModule`, `TcpSocketModule`, `BlePlxModule`, samodzielny pakiet JS (3201928 bajtów) oraz biblioteki arm64-v8a/armeabi-v7a/x86/x86_64. Dla wszystkich 54 bibliotek 64-bitowych sprawdzono wyrównanie segmentów ELF LOAD do co najmniej16384 bajtów, brak zapisywalnych danych w zaokrąglonym końcu RELRO oraz nieskompresowane wpisy ZIP wyrównane do16384 bajtów. Kontrola uwzględnia dopełnienie RELRO; nie zastępuje uruchomienia na systemie z rozmiarem strony16 KB. Porównano też nagłówki ELF z wynikiem `llvm-objdump`.

Oficjalny Google apksig9.5.3 zweryfikował podpis APK v2 bez błędów i ostrzeżeń. To certyfikat `CN=Android Debug`, a nie klucz produkcyjny; odcisk certyfikatu jest w raporcie. APK służy do testów. Instalacja późniejszej wersji z innym podpisem może wymagać odinstalowania wersji testowej; przedtem wyeksportuj własne dane.

## Weryfikacja produkcyjnego AAB

Plik lokalny: `artifacts/native/VehicleSenseX-0.2.0-android-production.aab`, 75726460 bajtów. SHA-256: `c1be8e336ef4cb210388518c156cf3922f08428e917756a30faf30c0fbcaa554`. [Raport produkcyjnego AAB](2026-11-26-android-production-artifact.json) zachowuje wybrane metadane bez materiału prywatnego klucza.

Oficjalny Bundletool1.18.3 zaakceptował `bundletool validate`; manifest, zestaw uprawnień, moduły transportów, pakiet JS i cztery ABI odpowiadają sprawdzonemu APK. Konfiguracja pakowania wskazuje `PAGE_ALIGNMENT_16K`, a wszystkie 54 biblioteki 64-bitowe przeszły kontrolę ELF LOAD/RELRO. JDK21 potwierdził podpis poleceniem `jarsigner -verify`; odcisk certyfikatu produkcyjnego to `d07968eb9f05359209b5874ebf8137818e7db45b836a5564bf957320bba621a0`, inny niż Android Debug. Raport zachowuje ostrzeżenia JDK dotyczące samopodpisanego certyfikatu bez zaufanego łańcucha CA, braku znacznika czasu i atrybutów POSIX/odnośników ZIP nieobjętych podpisem JAR. Certyfikat jest ważny do 2054-04-13.

AAB nie został przesłany do Google Play. Przed dystrybucją nadal potrzebne są konto i metadane wydawcy oraz testy sprzętowe. Przechowuj bezpieczną kopię klucza zgodnie z procedurą poświadczeń Expo; nie dodawaj go do repozytorium.

## Weryfikacja artefaktu iOS

Plik lokalny: `artifacts/native/VehicleSenseX-0.2.0-ios-simulator.tar.gz`, 28727631 bajtów. SHA-256: `ac33a19140b0e0a73ac7f5b78c2c7ad0ce29064f289a23ee52213d6f0efa8ffb`. [Raport iOS](2026-11-26-ios-artifact.json) zawiera wybrane metadane.

Końcowy `VehicleSenseX.app/Info.plist` potwierdza identyfikator `com.vehiclesensex.app`, wersję0.2.0/build1, minimum iOS16.4 i SDK symulatora27.1. Opisy zgód obejmują Bluetooth, sieć lokalną, lokalizację podczas używania i bibliotekę zdjęć; brak kamery, mikrofonu, lokalizacji Always i trybów tła. `file` potwierdził Mach-O x86_64/arm64, `nm -gU` obecność klas `TcpSockets`, `TcpSocketClient` i `BlePlx`, a archiwum zawiera samodzielny `main.jsbundle` (3824069 bajtów). `codesign -dv` wskazuje podpis ad-hoc bez zespołu Apple, właściwy dla symulatora.

Odczytano 15 plików `PrivacyInfo.xcprivacy`, w tym zbiorczy manifest aplikacji i manifesty frameworka systemu plików. Żaden nie włącza śledzenia ani nie deklaruje domen śledzących; rzeczywiste wpisy powodów używania API zachowano w raporcie. Nie jest to deklaracja przyszłego backendu ani wynik oceny App Store.

## Podpisy, źródła i dalsze wymagania

Archiwum Expo ogranicza główny `.easignore`: po poprawce Classic zawierało 102 dozwolone pliki (1497183 bajty), w tym plugin CNG. Sprawdzono je przed wysłaniem; brak plików środowiska, ustawień lokalnych, katalogów natywnych, `node_modules` i kluczy. Surowe metadane z podpisanymi adresami logów są poza repozytorium, podobnie jak binaria. Użyto istniejącego konta i bezpłatnego limitu Expo, bez zgłoszenia do sklepów.

Automatyczna kontrola uprawnień początkowo odrzuciła utworzenie trwałego klucza Androida bez wyraźnej zgody; tamten proces anulowano. Użytkownik następnie jawnie zatwierdził wygenerowanie i przechowywanie nowego keystore w Expo. Klucz został utworzony, a podpisany AAB zbudowano i sprawdzono w zadaniu podanym powyżej. Materiał prywatnego klucza nie został odczytany ani dodany do repozytorium.

Próba produkcyjnego iOS zatrzymała się przed budowaniem: `Credentials are not set up. Run this command again in interactive mode.` Użytkownik potwierdził brak aktywnego konta Apple Developer. Publikowalne IPA wymaga członkostwa, certyfikatu/profilu dystrybucyjnego i konfiguracji deklaracji eksportu szyfrowania przez wydawcę; nie zgadywano deklaracji w celu usunięcia ostrzeżenia CLI. Wersja na symulator nie jest IPA do App Store.

Nadal wymagane są testy transportów na fizycznych telefonach i adapterach, podpisana dystrybucja iOS, rzeczywiste wdrożenie backendu AI oraz dane wydawcy/polityka prywatności opisane w `mobile/RELEASE.md`. Nie wykonano testów sprzętowych ani testu uruchomienia na systemie ze stronami16 KB.

Źródło kryteriów wyrównania: [dokumentacja Androida dotycząca stron16 KB](https://developer.android.com/guide/practices/page-sizes). Identyfikatory techniczne i raporty JSON zachowują oryginalną składnię we wszystkich wersjach językowych.
