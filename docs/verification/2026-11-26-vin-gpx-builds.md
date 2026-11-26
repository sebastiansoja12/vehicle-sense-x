[Polski](2026-11-26-vin-gpx-builds.md) | [English](2026-11-26-vin-gpx-builds.en.md) | [Deutsch](2026-11-26-vin-gpx-builds.de.md)

# Weryfikacja implementacji VIN i GPX0.2.1

Kod0.2.1/build2: rzeczywiste uzupełnianie danych NHTSA po zgodzie i eksport GPX zapisanych tras. Testy:161/161; typy, lint, eksport web i pakiety Hermes Android/iOS przeszły. To nie jest jeszcze dowód nowej kompilacji natywnej.

Rzeczywisty klient i formularz web użyły publicznego przykładowego VIN; potwierdzono podgląd, blokadę zmienionego pola, zachowanie niezaznaczonego rocznika i wpisu silnika oraz wyzerowanie zgody po zmianie VIN. Formularz zamknięto bez zapisywania przykładowego auta.

Niezależne przeglądy GPX i VIN nie wykazały istotnych problemów. Decyzja: nowe zastosowanie zachowuje tylko wybrane pola z danego wyniku; wcześniejsze źródło nie otrzymuje nowej daty. To może usunąć metadane wcześniejszych, niewybranych pól, ale nie ich wartości.

Kompilacje natywne0.2.1: oczekują na uruchomienie. Wcześniejsze artefakty0.2.0 nie zawierają nowych funkcji. Dostępny bezpłatny limit Expo potwierdzono przed nowymi zadaniami:4 z30 kompilacji, bez kosztów przekroczenia.

Testy fizycznych telefonów/adapterów i systemowego udostępniania GPX pozostają niewykonane; sklepowe IPA wymaga aktywnego konta Apple Developer. Nie przesłano aplikacji do sklepów.
