[Polski](2026-11-26-vin-gpx-builds.md) | [English](2026-11-26-vin-gpx-builds.en.md) | [Deutsch](2026-11-26-vin-gpx-builds.de.md)

# Weryfikacja implementacji VIN i GPX0.2.1

Kod0.2.1/build2: rzeczywiste uzupełnianie danych NHTSA po zgodzie i eksport GPX zapisanych tras. Testy:161/161; typy, lint, eksport web i pakiety Hermes Android/iOS przeszły. To nie jest jeszcze dowód nowej kompilacji natywnej.

Rzeczywisty klient i formularz web użyły publicznego przykładowego VIN; potwierdzono podgląd, blokadę zmienionego pola, zachowanie niezaznaczonego rocznika i wpisu silnika oraz wyzerowanie zgody po zmianie VIN. Formularz zamknięto bez zapisywania przykładowego auta.

Niezależne przeglądy GPX i VIN nie wykazały istotnych problemów. Decyzja: nowe zastosowanie zachowuje tylko wybrane pola z danego wyniku; wcześniejsze źródło nie otrzymuje nowej daty. To może usunąć metadane wcześniejszych, niewybranych pól, ale nie ich wartości.

Kompilacje natywne0.2.1 wysłano z rewizji `63b273d`: [Android AAB](https://expo.dev/accounts/rubisco4471/projects/vehiclesensex/builds/0edfb971-f29a-4dfa-9db6-cd7f30aaa139) i [iOS na symulator](https://expo.dev/accounts/rubisco4471/projects/vehiclesensex/builds/9b9e4d14-af3c-42b9-8cf7-247d29f75ef5). Sprawdzone archiwum:110 plików,1547848 bajtów, nowe moduły obecne, brak kluczy i lokalnych ustawień. Wcześniejsze artefakty0.2.0 nie zawierają nowych funkcji. Przed zadaniami użyto4 z30 bezpłatnych kompilacji, bez kosztów przekroczenia. Wysyłanie Androida powtórzono osobno po konflikcie konfiguracji Git przy równoległym archiwizowaniu; nie powstało wtedy zadanie kompilacji.

## Backend

Dodano ograniczone czasowo zamykanie po SIGTERM/SIGINT i kontener Node24.18.0 bez roota. Przeszły13 testów backendu i164 testy łącznie oraz przegląd kodu. Zbudowany obraz uruchomiono z systemem plików tylko do odczytu i portem wyłącznie na localhost; healthcheck przeszedł bez konfiguracji płatnego API, a kontener zakończył się kodem0 i został usunięty. Hash kodu obrazu odpowiada źródłu. Brak prywatnych poświadczeń w obrazie, publicznego wdrożenia i płatnych wywołań. [Metadane kontenera](2026-11-26-assistant-container.json).

Testy fizycznych telefonów/adapterów i systemowego udostępniania GPX pozostają niewykonane; sklepowe IPA wymaga aktywnego konta Apple Developer. Nie przesłano aplikacji do sklepów.
