[Polski](2026-11-26-ownership-expenses.md) | [English](2026-11-26-ownership-expenses.en.md) | [Deutsch](2026-11-26-ownership-expenses.de.md)

# Weryfikacja kosztów posiadania 0.3.0

Źródło 0.3.0/build 4: pięć kategorii rzeczywistych kosztów, edycja/usuwanie, sumy, CSV i schema 3. Przeszło 188/188 testów, w tym 11 nowych testów kosztów, typy, lint i eksporty web/Hermes Android/iOS. Testy pokrywają grosze, limity, daty, powiązania, unikalność ID, migrację 1/2, kopie, usuwanie kaskadowe, izolację samochodów/AI i sumy bez podwójnego naliczania.

Przegląd wykrył brak blokady przyszłej daty przy imporcie kopii. Dodano test wykazujący błąd i poprawkę; test oraz pełny zestaw przeszły. Odczyt istniejącego magazynu pozostaje tolerancyjny na cofnięcie zegara. Rzeczywisty formularz w oddzielnym lokalnym środowisku potwierdził dodanie, zmianę kwoty, kategorię, odrzucenie zera, sumę na ekranie głównym i trwałość po przeładowaniu. Poprawiono stan dostępności kategorii przy użyciu `aria-checked`; po zmianie jedna opcja jest zaznaczona, poprzednia odznaczona. Nie wprowadzono danych przykładowych do paczek aplikacji.

Eksport web domyślnie czyści cache Metro, ponieważ buforowany manifest Expo pokazywał poprzednią wersję w ustawieniach. Po czystym eksporcie i przeładowaniu potwierdzono 0.3.0. Generator CSV przeszedł testy, a przycisk eksportu jest dostępny; pobrania pliku przez przeglądarkę nie potwierdzono. Natywne udostępnianie, powiadomienia i połączenia z adapterami wymagają testów na telefonach.

[Workflow weryfikacji GitHub](https://github.com/sebastiansoja12/vehicle-sense-x/actions/runs/45883215536) przeszedł dla rewizji `9ee8c6b`. Główne polecenie uruchomienia wskazuje teraz aplikację mobilną, a historyczny HTML ma osobne polecenie; przekazywanie CLI sprawdzono bez uruchamiania kolejnego serwera.

Wysłano zadania natywne 0.3.0/build 4 z tej samej rewizji: [Android production AAB](https://expo.dev/accounts/rubisco4471/projects/vehiclesensex/builds/0aa4a780-b4e7-4743-9827-abae8bc564fc) i [iOS Release na symulator](https://expo.dev/accounts/rubisco4471/projects/vehiclesensex/builds/55fc7088-12a2-4f33-8d8a-dee247b060ff). Sprawdzone archiwum zawiera 110 plików i 1554550 bajtów; kod wydatków i schemat 3 są obecne, bez fixture testowych, plików środowiska, kluczy i wygenerowanych katalogów natywnych. Artefakt Androida wymaga jeszcze weryfikacji. Poprzednie zweryfikowane paczki 0.2.2 nie zawierają kosztów posiadania. Brak aktywnego Apple Developer nadal blokuje sklepowy IPA; niczego nie wysłano do sklepów.

## Artefakt iOS

Kompilację symulatora ukończono o 19:34:39 UTC. [Metadane artefaktu](2026-11-26-ios-030-artifact.json) zawierają archiwum o rozmiarze 28746451 bajtów i SHA-256. Kontrola potwierdziła wersję 0.3.0/build 4, minimum iOS 16.4, x86_64/arm64, klasy BLE/TCP, nowe znaczniki JavaScript wydatków i podpis ad-hoc bez zespołu Apple. Opisy uprawnień nie zmieniły się; brak trybów tła, deklaracji kamery, mikrofonu i lokalizacji Always. Żaden z 15 manifestów prywatności nie deklaruje śledzenia ani domen śledzących. To paczka symulatora, bez testu uruchomienia na telefonie.
