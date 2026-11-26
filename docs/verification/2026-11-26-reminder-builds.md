[Polski](2026-11-26-reminder-builds.md) | [English](2026-11-26-reminder-builds.en.md) | [Deutsch](2026-11-26-reminder-builds.de.md)

# Weryfikacja 0.2.2 i automatycznych kontroli

## Zapisany i wysłany kod aplikacji

Commit `6c8394d9933181f84b78478f6784b62abf392ca6` został wysłany do GitHub. Wersja 0.2.2/build 3 zastępuje nieaktualne harmonogramy powiadomień, sprawdza je po powrocie do aplikacji, wyświetla je bez dźwięku na pierwszym planie i pobiera wersję w ustawieniach z konfiguracji Expo. Testy 171/171, typy, lint oraz eksporty web i Hermes Android/iOS przeszły. Siedem nowych testów powiadomień obejmuje datę, treść, migrację, idempotencję, anulowanie, odmowę uprawnienia i widoczność przy otwartej aplikacji. Niezależny przegląd nie wykazał wymaganych poprawek w zadeklarowanym zakresie; ciągła obserwacja strefy czasowej nie jest zaimplementowana.

## Wysłane kompilacje natywne

Oba zadania pochodzą z tego samego commitu; sprawdzone archiwum zawierało 110 plików i 1548545 bajtów, z nowym kodem powiadomień, bez sekretów, testów i wygenerowanych katalogów natywnych.

| Profil | Zadanie | Ostatni potwierdzony stan |
| --- | --- | --- |
| Android production AAB, istniejący klucz Expo | [940e4b0d-2f12-4224-b54c-7f2db3e3fb31](https://expo.dev/accounts/rubisco4471/projects/vehiclesensex/builds/940e4b0d-2f12-4224-b54c-7f2db3e3fb31) | Ukończone 14:29:10 UTC |
| iOS Release na symulator | [bdd4df2b-b15c-47ba-8b72-8615bba7e3b2](https://expo.dev/accounts/rubisco4471/projects/vehiclesensex/builds/bdd4df2b-b15c-47ba-8b72-8615bba7e3b2) | Ukończone 14:12:07 UTC |

Obie kompilacje 0.2.2 zakończyły się powodzeniem, a ich końcowe artefakty zostały sprawdzone. [Sprawdzone artefakty 0.2.1](2026-11-26-vin-gpx-builds.md) pozostają osobnymi, wcześniejszymi paczkami.

## Końcowe artefakty

[Metadane Androida](2026-11-26-android-022-artifact.json) zawierają AAB o rozmiarze 75737794 bajtów i jego SHA-256. Oficjalny Bundletool 1.18.3 zatwierdził pakiet, JDK 21 zweryfikował podpis, a certyfikat odpowiada istniejącemu kluczowi produkcyjnemu Expo. Potwierdzono wersję 0.2.2/code 3, uprawnienia, trzy moduły transportowe, cztery ABI i nowe znaczniki JavaScript powiadomień. Wszystkie 54 biblioteki 64-bitowe przeszły kontrolę ELF LOAD/RELRO dla stron 16 KB; pakowanie wymaga `PAGE_ALIGNMENT_16K`. Zachowano ostrzeżenia podpisu o samopodpisanym certyfikacie, braku znacznika czasu i atrybutach ZIP.

[Metadane iOS](2026-11-26-ios-022-artifact.json) zawierają archiwum symulatora o rozmiarze 28741233 bajtów i SHA-256. Potwierdzono wersję 0.2.2/build 3, minimum iOS 16.4, oczekiwane opisy uprawnień, x86_64/arm64, klasy BLE/TCP i podpis ad-hoc bez zespołu Apple. JavaScript zawiera nowe znaczniki powiadomień. Żaden z 15 manifestów prywatności nie deklaruje śledzenia ani domen śledzących. Artefaktów nie uruchamiano na telefonie; pakiet symulatora nie jest sklepowym IPA. Nie wykonano wysyłki do sklepów.

## Lokalne zmiany CI

Przygotowano `.github/workflows/verify.yml`, `scripts/check-docs.py` i testy rzeczywistego CLI w tymczasowych repozytoriach. Sześć nowych testów walidatora oraz wszystkie dziesięć testów głównych przeszło. Walidator wykrywa brakujący język, osierocone tłumaczenie, błędny link/język, zmienione polecenia/identyfikatory i pusty dokument. Składnia YAML została odczytana lokalnie; przypięte rewizje oficjalnych akcji sprawdzono w GitHub przed blokadą. Niezależny przegląd nie wykazał wymaganych poprawek.

Łączny zestaw regresji przeszedł lokalnie z wynikiem 177/177. [Pierwsze rzeczywiste uruchomienie GitHub](https://github.com/sebastiansoja12/vehicle-sense-x/actions/runs/45879258043) przeszło dla rewizji `35285a5`, obejmując testy, typy, lint, dokumentację i eksporty web/Hermes. Walidator obsługuje aktualne konwencje Markdown repozytorium; nie sprawdza fragmentów kotwic, linków referencyjnych ani jakości tłumaczeń. Testy powiadomień używają izolowanej granicy natywnego API; nie zastępują testu dostarczenia na telefonie.
