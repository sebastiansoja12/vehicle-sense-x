[Polski](README.md) | [English](README.en.md) | [Deutsch](README.de.md)

# VehicleSenseX

**Implementacja mobilna:** projekt React Native / Expo znajduje się w [`mobile/`](mobile/README.md). Garaż, serwis, trasy GPS i odczyty diagnostyczne mają lokalny zapis. Dodano rzeczywiste transporty OBD Bluetooth BLE/Wi-Fi, raporty, kopie oraz serwer asystenta. Aktualny stan i warunki wydania opisuje `mobile/RELEASE.md`. Poniższy opis dotyczy zachowanego prototypu HTML. [Spis całej dokumentacji](docs/README.md).

Interaktywny projekt produktu na iOS i Android. Polski interfejs, osiem modułów i responsywny układ do przeglądu na komputerze oraz telefonie. To działający prototyp przeglądarkowy, nie gotowa aplikacja do publikacji w sklepach.

## Uruchomienie

Wymagania: Python 3 oraz Node.js 20+ do testów. Bez instalowania zależności.

```sh
npm start
```

Otwórz http://127.0.0.1:5173. Testy logiki: `npm test`.

## Kierunek produktu i interfejsu

Obietnica: **Twój samochód. Pełny obraz.** Start odpowiada na trzy pytania: co wymaga uwagi, ile kosztuje jazda i co wydarzyło się ostatnio. Jasny, płaski interfejs: złamana biel, grafit, oszczędny akcent czerwieni. Profil samochodu ma duży napis modelu i kadrowaną ilustrację. Dane i działania są ułożone w sekcje oddzielone liniami, bez ozdobnych zegarów, gradientów, bocznego panelu i siatki zaokrąglonych kafelków. Jednostki, źródła i daty pozostają jawne. Kolor zawsze towarzyszy etykiecie. Bez arbitralnego procentu zdrowia samochodu.

Na telefonie pięć głównych zakładek: **Start, Diagnostyka, Trasy, Koszty, Garaż**. Garaż prowadzi do Serwisu, Kondycji, Stylu jazdy i Asystenta. Start prowadzi do diagnostyki, najbliższego serwisu i ostatniej trasy. Na komputerze te same pięć zakładek znajduje się w poziomej nawigacji. Pozostałe moduły są dostępne przez Garaż.

| Moduł | Projektowany przepływ | Status prototypu |
| --- | --- | --- |
| Diagnostyka OBD2 | Połączenie → odczyt → kody i parametry → raport | Jawna symulacja połączenia i skanu; parametry statyczne |
| Mój garaż | Profil → specyfikacja → źródło danych → kolejne pojazdy | Profil demo i lokalny zapis dodatkowych szkiców; bez przełączania danych między pojazdami |
| Analiza jazdy | Okres → mierzalne zdarzenia → kontekst GPS/OBD2 | Dwa przykładowe okresy; bez niezweryfikowanego Eco Score |
| Serwis | Termin → wpis → historia | Działający zapis serwisu; przypomnienia statyczne; bez załączników i powiadomień systemowych |
| Paliwo i koszty | Tankowanie → zestawienie → spalanie → eksport | Formularz, zapis lokalny, obliczenia pełny–pełny, CSV; trend miesięczny osobnym zestawem demo |
| Asystent samochodowy AI | Pytanie → dane źródłowe → interpretacja i niepewność | Gotowe odpowiedzi, bez modelu lub zewnętrznego API |
| Trasy | Wybór przejazdu → schemat → dystans/czas/koszt → eksport | Trzy przykładowe przejazdy i CSV; mapa schematyczna, bez GPS |
| Kondycja i wartość pojazdu | Dostępne dowody → braki danych → historia → raport | Jawne źródła i braki; eksport TXT; bez zmyślonej wyceny |

Wpisy użytkownika są kodowane przed wyświetleniem. Tankowanie musi mieć dodatnią ilość i cenę oraz niecofający się przebieg. Przykłady dotyczą 25 listopada 2026; formularze nowych wpisów używają bieżącej daty urządzenia. Dane demonstracyjne i własne można wyzerować w ustawieniach po potwierdzeniu.

## Zakres pierwszego wydania mobilnego

1. **Najpierw test sprzętowy:** macierz konkretnych adapterów i pojazdów na iPhone i Androidzie. Sprawdzić protokół, transport Bluetooth, zestaw PID, przerwania połączenia i ograniczenia pracy w tle. Sama etykieta ELM327 nie określa zgodności adaptera z oboma systemami. Nie wybierać stosu produkcyjnego przed tą próbą.
2. **Fundament:** lokalny garaż, wiele pojazdów z osobnymi rekordami, tankowania, serwis i eksport. Konto opcjonalne; synchronizacja osobną funkcją. Dane offline i jawne konflikty synchronizacji.
3. **Diagnostyka:** odczyt wspieranych PID, jednostki, czas pomiaru, status DTC, historia i raport. Brak danych różny od zera. Kasowanie kodów dopiero po zachowaniu odczytu i osobnym potwierdzeniu; nie podczas jazdy.
4. **Przejazdy:** ręczny start/stop, widoczna rejestracja i łatwe usuwanie tras. Rejestrację automatyczną w tle dodać po testach dokładności, baterii i akceptacji uprawnień.
5. **Asystent:** wyłącznie udostępniony kontekst, identyfikowalne źródła opisów DTC, oddzielenie faktów od hipotez, zgoda na przekazanie danych. Nigdy nie traktować odpowiedzi modelu jako dowodu sprawności.
6. **Kolejne wydanie:** dostawca VIN, aktualne dane porównawcze do wyceny, zweryfikowana metoda Eco Driving, PDF, faktury i zdjęcia. Nie obiecywać tych integracji przed wyborem dostawców i ustaleniem praw do danych.

Docelowo osobny klient mobilny korzysta z natywnych możliwości Bluetooth/GPS, lokalnego magazynu i opcjonalnego API do synchronizacji, AI oraz zewnętrznych danych. Sekrety dostawców pozostają na serwerze. Dane OBD2, GPS i wpisy ręczne muszą zachować swoje źródło, jednostkę i datę; brak dostępu do jednego źródła nie blokuje pozostałych modułów.

## Przygotowanie do App Store i Google Play

Stan źródeł sprawdzony 25 listopada 2026. Poniższe wymagania wpływają na projekt; prototyp nie realizuje procesu publikacji i nie gwarantuje akceptacji.

- **Uprawnienia w kontekście:** Bluetooth przy parowaniu, GPS przy uruchomieniu trasy, powiadomienia przy przypomnieniu, zdjęcia przy dodawaniu załącznika. Działać także po odmowie. Android rozróżnia uprawnienia Bluetooth zależnie od wersji systemu: [Uprawnienia Bluetooth](https://developer.android.com/develop/connectivity/bluetooth/bt-permissions).
- **Prywatność:** dostępna w aplikacji i metadanych polityka prywatności; zgodne z rzeczywistym zachowaniem SDK deklaracje sklepu. Trasy, VIN, zdjęcia, analityka i przekazanie danych do AI wymagają świadomych decyzji projektowych. [Wytyczne oceny aplikacji Apple](https://developer.apple.com/app-store/review/guidelines/), [Dane użytkownika w Google Play](https://support.google.com/googleplay/android-developer/answer/10144311).
- **Usuwanie konta:** jeżeli aplikacja umożliwia tworzenie kont, projekt musi obejmować usuwanie konta i danych. Google Play wymaga również działającej ścieżki internetowej. [Apple](https://developer.apple.com/help/app-review/guideline-reference/5-1-1-account-deletion), [Google Play](https://support.google.com/googleplay/android-developer/answer/13327111).
- **Ocena aplikacji:** zapewnić recenzentom dostęp do funkcji i danych demonstracyjnych oraz potrzebne zasoby dla funkcji sprzętowych; jasno wyjaśnić zależność od adaptera. [Apple — przed zgłoszeniem](https://developer.apple.com/app-store/review/guidelines/).
- **Przed wysyłką:** natywne kompilacje i podpisy, ikony i zrzuty ekranów, dostępność, testy na urządzeniach, obsługa braku sieci i uprawnień, awarii adaptera, ograniczeń baterii oraz pełne sprawdzenie aktualnych wymagań sklepów dla wybranej dystrybucji i modelu płatności.

## Ograniczenia i weryfikacja

Testy jednostkowe obejmują obliczanie spalania, walidację tankowania i bezpieczne komórki CSV. Prototyp nie zawiera serwera zaplecza, kont, płatności, rzeczywistej diagnostyki, systemowych powiadomień ani paczek sklepowych. Czcionki z Google Fonts wymagają połączenia; czcionka systemowa jest używana zastępczo. W wydaniu mobilnym czcionki należy dostarczyć w pakiecie. Zapis przeglądarkowy nie jest bezpiecznym magazynem dla danych produkcyjnych.
