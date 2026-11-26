[Polski](VIN.md) | [English](VIN.en.md) | [Deutsch](VIN.de.md)

# Dane samochodu z VIN

Formularz dodawania i edycji samochodu może pobrać rzeczywiste dane NHTSA vPIC. Katalog offline i ręczne wpisanie auta nie wymagają tej usługi. NHTSA nie gwarantuje pokrycia wszystkich marek i rynków, szczególnie europejskich, ani kompletnej specyfikacji fabrycznej. Wynik nie potwierdza historii, wyposażenia, własności ani autentyczności pojazdu.

## Zgoda i użycie

1. Wpisz pełny, 17-znakowy VIN. Puste pole, niedozwolone znaki i numer z samych zer nie uruchomią zapytania.
2. Osobno zaakceptuj wysłanie tego VIN do amerykańskiej usługi NHTSA przez HTTPS. Nie przesyłamy tablic, przebiegu, historii ani danych AI. Zmiana VIN zeruje zgodę i przerywa wcześniejsze zapytanie; zamknięcie formularza również je anuluje.
3. Naciśnij przycisk pobrania. Nie ma automatycznych zapytań ani ponowień. Dostęp do internetu jest potrzebny tylko do tej funkcji.
4. Sprawdź podgląd i zaznacz pola do użycia. Domyślnie zaznaczone są wyłącznie puste pola. Zmiana zaznaczonego pola podczas pobierania blokuje zastosowanie; zmiany innych pól pozostają zachowane. Zmiana marki lub modelu nie może połączyć wartości ze sprzeczną, istniejącą parą.
5. Zastosowanie uzupełnia formularz, a nie zapisany garaż. Zapisz samochód osobnym przyciskiem. Rezygnacja nie tworzy pojazdu.

## Dane i źródło

Przenosimy tylko jawne pola: markę, model, rok modelowy, całkowitą pojemność w cm³, skrzynię i napęd. Rok modelowy może różnić się od daty produkcji. Nie uzupełniamy silnika lub wersji przez zgadywanie, nie zamieniamy SAE HP na KM, nie zaokrąglamy ułamkowej pojemności i nie wymyślamy wyposażenia. Brakujące lub nieobsługiwane pola zostają do wpisania ręcznie.

Do przyjęcia danych potrzebne są pojedyncza odpowiedź, taki sam pełny VIN oraz `ErrorCode=0`. Ostrzeżenia i częściowe dekodowanie nie są traktowane jak pewny wynik. Usługa jest ograniczana ruchem; błąd lub brak danych nie blokuje wpisu ręcznego.

Zapisane źródło `nhtsa-vpic` zawiera VIN, czas pobrania i wybrane wartości. Garaż pokazuje, które pola nadal odpowiadają wynikowi. Ręczna zmiana pola usuwa dowód dla tego pola; zmiana VIN ręcznie albo przez OBD usuwa powiązanie z innym numerem. Kolejne zastosowanie zapisuje tylko wybrane pola z nowego wyniku, aby nie nadawać staremu wynikowi nowej daty. Kopia JSON zachowuje te metadane; import odrzuca niezgodny VIN, nieznany typ źródła i pola niepasujące do auta. Metadane nie są podpisanym certyfikatem producenta.

VIN i jego źródła nie trafiają automatycznie do AI ani raportu sprzedaży. Pełna kopia JSON zawiera je, podobnie jak sam VIN. Pytanie wpisane ręcznie do asystenta jest oddzielnym tekstem — nie umieszczaj w nim danych osobowych. NHTSA odpowiada za własne przetwarzanie zapytań; nie obiecujemy usunięcia VIN z logów dostawcy.

## Integracja i weryfikacja

`vin-client.ts` używa wyłącznie oficjalnego endpointu HTTPS, limitu20 s i128 KiB odpowiedzi, bez poświadczeń i automatycznych ponowień. Stream w przeglądarce jest ograniczany bajtowo; natywne fetch może wcześniej buforować tekst, dlatego granica jest sprawdzana po odczycie. Stara lub spóźniona odpowiedź nie może nadpisać formularza. Surowe błędy dostawcy i VIN nie są logowane przez klienta.

Testy obejmują zgodę, dane błędne i częściowe, rozmiar, anulowanie, deadline mimo ignorowanego sygnału, nieaktualne pola, powiązania źródła, kopie i izolację AI/raportu. Rzeczywisty klient i formularz web sprawdzono na publicznym przykładowym VIN, bez zapisania przykładowego auta w garażu. Przeszły161 testów, typy i lint. Fizyczne urządzenia i systemowe zachowanie sieci wymagają osobnej weryfikacji; wcześniejsze binaria0.2.0 nie zawierają funkcji0.2.1.

Źródła: [NHTSA vPIC API](https://vpic.nhtsa.dot.gov/api/), [FAQ i ograniczenia](https://vpic.nhtsa.dot.gov/api/home/index/faq), [oficjalny przykład danych](https://www.nhtsa.gov/sites/nhtsa.gov/files/frenchik-vin-vpic.pdf).
