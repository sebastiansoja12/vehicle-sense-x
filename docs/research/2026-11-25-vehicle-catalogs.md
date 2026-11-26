[Polski](2026-11-25-vehicle-catalogs.md) | [English](2026-11-25-vehicle-catalogs.en.md) | [Deutsch](2026-11-25-vehicle-catalogs.de.md)

# Publiczne katalogi samochodów dla VehicleSenseX

Data analizy: 2026-11-25. Zlecenie: umożliwić wybór konkretnego modelu danej marki z użytecznym pokryciem Polski i Europy. Późniejsza implementacja: użytkownik następnie zlecił integrację. Przypięty podzbiór offline jest już dołączony do formularza garażu, z zachowaniem wpisu ręcznego; wybór źródeł i weryfikację opisują `mobile/assets/catalog/README.md` oraz plan katalogu offline. Pełny pakiet Node projektu źródłowego nie został zainstalowany.

## Ustalenia

| Źródło | Zastosowanie | Ograniczenia i warunki |
| --- | --- | --- |
| [NHTSA vPIC](https://vpic.nhtsa.dot.gov/api/) | Oficjalne, bezpłatne API marek/modeli/roczników i dekodowania VIN | [Oficjalne FAQ](https://vpic.nhtsa.dot.gov/api/home/index/faq) nie wymaga rejestracji ani licencjonowania aplikacji. Zagraniczne pojazdy są objęte danymi, gdy zarejestrowano je na rynku USA; nie nadaje się na jedyny katalog europejski. Nie obiecywać nieograniczonej przepustowości. |
| [Pojazdy zarejestrowane w RDW](https://opendata.rdw.nl/Voertuigen/Open-Data-RDW-Gekentekende_voertuigen/m9d7-ebf2) | Obserwacje europejskich marek i nazw handlowych z rejestru holenderskiego | Oficjalne metadane oznaczają zbiór jako domenę publiczną / CC0. Rekordy rejestracyjne nie są kompletnym katalogiem produkcyjnym producentów. Wyodrębniać wyłącznie zbiorcze nazwy marek/modeli, bez tablic i rekordów pojedynczych pojazdów. |
| [Nowe samochody osobowe EEA](https://www.eea.europa.eu/en/datahub/datahubitem-view/fa8b1229-3db6-495d-b18e-9c9b3267c02b) | Europejskie marki i nazwy handlowe zgłaszane przy nowych rejestracjach | Roku raportowania/rejestracji nie wolno opisywać jako roku produkcji. Nazewnictwo różni się między krajami. |
| [MeterApp vehicle-db](https://github.com/MeterApp/vehicle-db) | Połączony katalog offline z filtrami źródeł; praktyczny kandydat do selektora | Kod deklaruje ISC; dane źródłowe zachowują własne warunki. Metadane wskazują EEA jako CC BY 4.0, UK DfT jako OGL 3.0 i RDW jako domenę publiczną. Warunki wybranych źródeł trzeba sprawdzić osobno; licencja kodu nie zmienia licencji wszystkich danych. |

[Warunki CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) dopuszczają komercyjne wykorzystanie i adaptację z podaniem autorstwa, odnośnika do licencji oraz informacji o zmianach. Przy dystrybucji należy zachować informacje o zbiorze niezależnie od licencji aplikacji. Ponowne użycie danych nie przyznaje praw do zdjęć samochodów ani logotypów producentów.

## Sprawdzenie rzeczywistych danych

Pobrano wskazany w repozytorium plik `data/compact.json` do pliku tymczasowego, bez uruchamiania kodu ani skryptów instalacyjnych. SHA-256 sprawdzonego pliku: `405b677d96ee5f33bdc1e314ab74bcf5e7f5d112f176de335f1e9bafb5cff3a5` (7 975 596 bajtów). To suma kontrolna sprawdzonej zawartości, nie przypięte wydanie źródłowe ani zapewnienie poprawności danych.

Na podstawie schematu krotek w [źródłowej implementacji wyszukiwania](https://github.com/MeterApp/vehicle-db/blob/main/src/index.ts) potwierdzono rzeczywiste rekordy marek/modeli SKODA/OCTAVIA, VOLKSWAGEN/GOLF, DACIA/DUSTER, CUPRA/FORMENTOR i TOYOTA/COROLLA. Są to obserwacje z katalogu, nie dodane pojazdy użytkownika ani pomiary demonstracyjne.

Ograniczenia jakości: połączone dane zawierają też osobne ciągi OCTAVIA, OCTAVIA COMBI, OCTAVIA ELEGANCE i OCTAVIA ELEGNE. Nazwy BMW obejmują zarówno rodziny modeli, jak i oznaczenia silników/wersji. Surowa lista wszystkich nazw byłaby nieuporządkowana i czasem niejednoznaczna. Znaczenie roku różni się między źródłami; nie należy wyprowadzać zakresu produkcji przez wypełnianie luk między obserwacjami. Nie potwierdzono pełnego pokrycia generacji, kodów silników, kombinacji skrzyń biegów i wyposażenia fabrycznego.

## Zalecany przepływ w aplikacji

Użyć wersjonowanego podzbioru offline nazw marek/modeli samochodów osobowych z jawnie wybranych otwartych źródeł europejskich, zachowując informacje o autorstwie i pochodzeniu. Normalizować akcenty i wielkość liter do wyszukiwania, zachowując oryginalną pisownię do wyświetlania. Zachować identyfikatory źródeł, stabilne identyfikatory wewnętrzne i oryginalne nazwy, aby zatwierdzone aliasy nie scalały po cichu różnych samochodów.

Zapewnić wyszukiwanie marki, a następnie modelu w obrębie tej marki. Zmiana marki czyści model poprzedniej marki. Zachować wyraźną ścieżkę wpisu ręcznego dla brakujących samochodów i istniejące dane wpisane ręcznie. Rok produkcji potwierdzony przez właściciela zapisywać niezależnie od obserwacji roku rejestracji. Silnik i wyposażenie pozostają ręczne do czasu integracji odpowiedniego, zweryfikowanego źródła specyfikacji. Katalog nie może sugerować weryfikacji VIN ani automatycznej zgodności z adapterem OBD.

Przyszła integracja wymaga przypiętego źródła/wersji, odtwarzalnej ekstrakcji, informacji o katalogu w aplikacji, testów zmiany marki/resetowania/wyszukiwania i niewielkiej, sprawdzonej macierzy pokrycia europejskiego. Selektor offline nie wymaga przesyłania VIN, tablic ani lokalizacji podczas działania aplikacji.
