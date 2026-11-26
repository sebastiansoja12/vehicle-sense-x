[Polski](2026-11-25-offline-catalog-design.md) | [English](2026-11-25-offline-catalog-design.en.md) | [Deutsch](2026-11-25-offline-catalog-design.de.md)

# Wybór marki i modelu offline

Użytkownik jednoznacznie zlecił podłączenie przeanalizowanego katalogu offline i zachowanie wpisu ręcznego. Wcześniejsze instrukcje upoważniają do ciągłej implementacji bez ponownej akceptacji projektu. Praca pozostaje w bieżącej kopii roboczej z istniejącą, niezatwierdzoną aplikacją; ten zakres nie obejmuje commitów, scalania ani publikacji.

Użyć przypiętej, sprawdzanej sumą kontrolną migawki MeterApp vehicle-db, wyodrębniając nazwy samochodów osobowych/MPV wyłącznie z NHTSA, UK DfT, EEA i RDW. Zachować informacje o źródłach i daty. Inne źródła wykluczyć zamiast domniemywać prawa do ponownego użycia. Wygenerować mniejszą listę nazw dołączoną do aplikacji; bez zapytań w czasie działania, przesyłania VIN, zależności od pakietu ani wyprowadzania roczników/specyfikacji. Duplikaty różniące się wielkością liter lub znakami diakrytycznymi scalać, ale zachować rozróżnienia interpunkcyjne modeli (np. Golf+). Nazwy muszą mieścić się w istniejących limitach 60/80 znaków dla marki/modelu.

Formularz pojazdu korzysta z selektorów marki i modelu ograniczonego do marki, z polem wyszukiwania i ograniczoną liczbą wyników. Zapytanie wyszukiwania jest oddzielone od zatwierdzonych wartości. Wybór innej marki czyści stary model. Wpis ręczny jest zawsze dostępny; przełączanie trybów zachowuje wpisane wartości. Edycja istniejących pojazdów spoza katalogu otwiera tryb ręczny, zachowując cały dotychczasowy tekst. Pozostałe pola i schemat zapisu pozostają bez zmian.

Rozważone podejścia: dołączenie całego pakietu Node dodaje zbędne dane/API i zwiększa rozmiar; API internetowe przeczy wyborowi offline. Wybrany generowany podzbiór realizuje wskazany przez użytkownika kierunek offline i pozwala na odtwarzalny przegląd każdego źródła.

Weryfikacja: ekstrakcja z mieszanymi dozwolonymi/niedozwolonymi źródłami; rzeczywiste europejskie pary z dołączonego zbioru; wyszukiwanie z różną wielkością liter, znakami diakrytycznymi i interpunkcją; zmiana marki; edycja i przełączanie trybu ręcznego; zapis istniejącej kopii. Sprawdzenie typów/lint, pełne testy, eksport bundli na trzy platformy i przegląd w przeglądarce w rozmiarze telefonu. Selektor nie certyfikuje specyfikacji fabrycznej ani kompletności katalogu pojazdów.
