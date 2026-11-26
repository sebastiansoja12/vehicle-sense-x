# VehicleSenseX — pozostałe moduły

Użytkownik zlecił ciągłą implementację pozostałych modułów z użyciem Superpowers, bez kolejnych przerw na akceptację. Zachowujemy zatwierdzony interfejs i Expo SDK 58; poprzedni plan pozostaje ukończony. Nowy zakres rozwija działającą aplikację, nie zastępuje danych użytkownika demonstracją.

## Podejście i ograniczenia

- Wybrane: moduły lokalne i działające integracje z jawnymi granicami. Trasy GPS w widocznej aplikacji; zatrzymanie/pauza przy przejściu w tło, zachowany szkic i ręczne przejazdy. Rejestracja w tle wymaga osobnej walidacji urządzeń i konfiguracji sklepowej.
- OBD2: prawdziwy klient ELM327 i transport BLE z ręcznie wskazanymi UUID. Brak obietnicy zgodności z każdym adapterem lub Bluetooth Classic. Odczyty mają czas i źródło. Kasowanie wymaga zapisu raportu i oddzielnego potwierdzenia; nie podczas nagrywania trasy.
- AI: serwer proxy, klucz wyłącznie w zmiennych środowiskowych serwera. Jawna zgoda na przesłanie minimalnego kontekstu. Bez VIN, tablic, zdjęć i współrzędnych tras w domyślnym kontekście. Brak klucza daje stan „nie skonfigurowano”, nigdy fikcyjną odpowiedź. Lokalne podsumowanie faktów działa bez AI.
- Alternatywy: natywna rejestracja w tle od razu zwiększa ryzyko i wymaga urządzeń; imitacje GPS/OBD/AI nie realizują zlecenia. Dlatego wdrażamy prawdziwe ścieżki obsługiwane przez SDK i testowalne rdzenie oraz dokumentujemy brak testów sprzętowych.

## Trasy i analiza

Ręczny start/stop i zgoda GPS dopiero przy starcie. Pojazd przypisany w momencie startu, niezależnie od późniejszych zmian garażu. Historia, wybór przejazdu, szkic trasy, dystans, czas, średnia i maksymalna prędkość, koszt paliwa jako estymacja z podanym źródłem. Odrzucanie słabej dokładności, niemonotonicznych czasów i skoków GPS; długie luki nie łączą trasy prostą linią. Przy odmowie GPS można dodać przejazd ręcznie. Ręczne wpisy nie generują zdarzeń stylu jazdy.

Analiza pokazuje konkretne zdarzenia przyspieszenia/hamowania i jawne progi, jako heurystykę GPS wymagającą walidacji. Bez wymyślonego Eco Score. Brak danych różny od zera. Dane demonstracyjne zawsze osobno.

## Serwis, koszty i garaż

Przypomnienia według dnia lub przebiegu; obowiązuje wcześniejszy termin. Edycja i usuwanie wpisów z potwierdzeniem, eksport CSV oraz pełny backup JSON z walidowanym przywracaniem i potwierdzeniem zastąpienia. Załączniki lokalne, jeżeli pozwoli bezpiecznie zweryfikować cykl plików; brak automatycznego uploadu. Zdjęcia i VIN nie mają wymyślonego dostawcy.

## Kondycja i wartość

Historia pomiarów i DTC, zakres oraz wiek danych, historia serwisu i nadchodzące terminy. Raport eksportowany przed sprzedażą z datą i źródłami; bez certyfikowania sprawności. Wartość to przedział oparty na wpisanych ofertach porównawczych z adresem źródła i datą, nie losowa wycena. Koszty względem wartości tylko przy dostępnej estymacji, oznaczone jako szacunek.

## Dane i bezpieczeństwo zapisu

Migracja istniejącego stanu v1 do rozszerzonego v2 bez utraty garażu, tankowań i serwisu. Kopie wstecz nie nadpisują nowego schematu. Każdy rekord ma vehicleId i walidację na odczycie. Chronologia, prywatność lokalizacji, wyjście z demo i błędy zapisu pozostają chronione. Szkice i rozmowy nie mogą przeskoczyć do innego samochodu.

## Weryfikacja

Testy przed kodem: migracja, izolacja aut, filtry GPS i luki, zdarzenia jazdy, parser OBD i timeouty, minimalizacja kontekstu AI, błędy serwera, terminy serwisu, CSV i backup. Typy, lint, bundle web/iOS/Android, niezależny przegląd oraz podgląd telefonu. Brak fizycznego adaptera, GPS urządzenia i klucza API jest jawnie raportowany; nie oznaczamy tych testów jako wykonanych.
