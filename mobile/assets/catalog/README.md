[Polski](README.md) | [English](README.en.md) | [Deutsch](README.de.md)

# Nazwy samochodów dołączone do aplikacji

Wygenerowano na podstawie [MeterApp/vehicle-db](https://github.com/MeterApp/vehicle-db), commit źródłowy `f37e44e01fad7f67d3625c95b792f2caa1524536`, sprawdzony 2026-11-25.

Uwzględniono wyłącznie nazwy marek i modeli samochodów osobowych/MPV z co najmniej jednym z poniższych oznaczeń źródła:

- NHTSA vPIC — publiczne dane administracji USA. [FAQ dotyczące źródła i warunków](https://vpic.nhtsa.dot.gov/api/home/index/faq).
- UK Department for Transport / Driver and Vehicle Licensing Agency — zawiera informacje sektora publicznego udostępnione na licencji [Open Government Licence v3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/). [Źródło](https://www.gov.uk/government/statistical-data-sets/vehicle-licensing-statistics-data-files).
- European Environment Agency — monitorowanie emisji CO2 samochodów osobowych i dostawczych, rozporządzenie (UE) 2019/631. Licencja [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/). [Źródło](https://www.eea.europa.eu/en/datahub/datahubitem-view/fa8b1229-3db6-495d-b18e-9c9b3267c02b).
- RDW (Dienst Wegverkeer) — Open Data RDW, domena publiczna/CC0. [Źródło](https://opendata.rdw.nl/Voertuigen/Open-Data-RDW-Gekentekende_voertuigen/m9d7-ebf2).

Zmiany wprowadzone przez VehicleSenseX: filtrowanie wybranych źródeł i typów pojazdów, pominięcie lat rejestracji/modelowych oraz rekordów pojedynczych pojazdów, scalenie duplikatów różniących się wielkością liter, znakami diakrytycznymi lub białymi znakami, zachowanie pierwszej napotkanej pisowni do wyświetlania i rozróżnień interpunkcyjnych. Nie dołączono zdjęć producentów, logotypów, specyfikacji pojazdów ani kodu aplikacji źródłowej. Informacje o warunkach danych obowiązują niezależnie od licencji kodu aplikacji. Pakiet źródłowy deklaruje ISC dla kodu i osobno zachowuje warunki źródeł danych.

Podzbiór zawiera **563 nazwy marek i 17 966 wariantów nazw modeli** (~289 KB z metadanymi). Są to etykiety źródłowe, bez gwarancji kompletności modeli produkcyjnych, wersji fabrycznych, roczników lub zgodności z VIN. Starsze i brakujące samochody nadal można wpisać ręcznie. Aplikacja udostępnia powyższe informacje o autorstwie oraz odnośniki do źródeł i licencji w formularzu i w Ustawienia → Katalog samochodów.

## Odtworzenie danych

Użyj Node 24; instalowanie zależności nie jest potrzebne. Z katalogu `mobile/`:

```sh
node scripts/build-vehicle-catalog.mjs
```

Skrypt pobiera wyłącznie przypięty publiczny JSON, sprawdza SHA-256 przed parsowaniem, waliduje i filtruje nazwy oraz krotki, a następnie odtwarza `src/vehicle-catalog-data.ts` i `assets/catalog/provenance.json`. Budowanie aplikacji nigdy nie pobiera danych automatycznie; wygenerowany plik zapisany w repozytorium jest dołączany do aplikacji i działa offline.

Jeżeli dokładny plik źródłowy jest już dostępny lokalnie:

```sh
node scripts/build-vehicle-catalog.mjs --input /absolute/path/compact.json --check
```

Oczekiwany SHA-256: `405b677d96ee5f33bdc1e314ab74bcf5e7f5d112f176de335f1e9bafb5cff3a5`. `--check` porównuje oba wygenerowane artefakty bez ich zmieniania. Aktualizacja wymaga świadomego przeglądu i zmiany przypiętego commita, sumy kontrolnej, daty danych, informacji o autorstwie oraz sprawdzeń pokrycia. Wiersze pochodzące wyłącznie z wykluczonych źródeł nie trafiają do aplikacji.
