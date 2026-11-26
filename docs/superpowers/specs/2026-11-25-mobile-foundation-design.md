# VehicleSenseX — fundament aplikacji mobilnej

## Zatwierdzony kierunek

Użytkownik zatwierdził wygląd w podglądzie telefonu i polecił rozpocząć implementację. Specyfikację produktu stanowią osiem modułów opisanych w rozmowie oraz README. Zachowujemy jasny, płaski interfejs, grafit, oszczędną czerwień, pięć zakładek i konkretne dane zamiast dekoracyjnych wskaźników.

## Cel etapu

Dostarczyć uruchamialną aplikację na iOS, Android i do weryfikacji w przeglądarce. Pierwszy etap: garaż z wieloma samochodami, wybór aktywnego auta, tankowania, historia serwisowa i obliczenia oparte na rzeczywistych wpisach. Bez logowania i usług zewnętrznych. Domyślnie brak fikcyjnych samochodów i liczb. Dane przykładowe tylko po świadomym otwarciu trybu demonstracyjnego.

## Podejście

- Wybrane przez implementera: React Native + Expo + TypeScript. Jeden klient dla obu sklepów; natywne komponenty, możliwość kolejnych integracji Bluetooth/GPS.
- Dwie osobne aplikacje Swift/Kotlin wymagałyby podwójnego wdrażania zatwierdzonego interfejsu.
- Kontener istniejącej strony nie daje na tym etapie przewagi przy docelowych funkcjach sprzętowych. Prototyp pozostaje oddzielnym wzorcem w katalogu głównym; implementacja powstaje w `mobile/`.
- Zapis lokalny: AsyncStorage, wersjonowany i walidowany dokument JSON. To wybór na mały zbiór rekordów w pierwszym etapie; nie używamy go do sekretów, śladów GPS i faktur. Przy rozwoju historii przejście na bazę SQL.

## Zasady danych

- Rekordy paliwa i serwisu zawsze zawierają identyfikator pojazdu. Zmiana samochodu zmienia wszystkie zestawienia.
- Ceny i koszty przechowujemy w groszach, ilość paliwa w mililitrach, przebieg w całkowitych kilometrach.
- Walidacja polskiego przecinka i kropki dziesiętnej, granic ilości i ceny, rzeczywistej daty kalendarzowej bez przyszłych wpisów, przebiegu i VIN.
- Tankowania dodawane chronologicznie względem ostatniego tankowania; przebieg nie może się cofać. Wpis serwisowy może być historyczny. Przebieg pojazdu rośnie do maksimum zapisanych wpisów.
- Spalanie pełny–pełny sumuje tankowania częściowe pomiędzy pełnymi. Brak wystarczających danych daje `null`, nigdy zmyślony wynik lub zero.
- Błąd odczytu lub nieznany schemat nie zeruje danych. Błąd zapisu nie zamyka formularza i nie pokazuje sukcesu. Kolejne zapisy są blokowane do zakończenia poprzedniego.
- Tryb demo jest odseparowany od własnych danych i można go zamknąć bez zmiany garażu użytkownika.

## Ekrany

Start, Diagnostyka, Trasy, Koszty i Garaż. Garaż prowadzi także do Serwisu, Kondycji, Stylu jazdy i Asystenta. Garaż, paliwo i serwis są funkcjonalne. Start i Kondycja pokazują wyłącznie dostępne dane; brak OBD2/GPS/AI jest jawny. Nie tworzymy atrap prawdziwych skanów ani udawanych odpowiedzi modelu.

Formularze w natywnym Modal, obsługa klawiatury, etykiety czytnika ekranu, Android Back, bezpieczne obszary ekranu i cele dotyku co najmniej 44 px. Układ odpowiada zatwierdzonemu projektowi. Render Tiguan służy wyłącznie trybowi demo; własnym autom nie przypisujemy tej ilustracji.

## Poza etapem

OBD2 wymaga wskazania adaptera i testów sprzętowych. GPS, praca w tle, powiadomienia, załączniki, VIN API, wycena, AI, konta i synchronizacja pozostają osobnymi etapami. Nie publikujemy aplikacji w sklepach ani nie dodajemy płatnych usług.

## Weryfikacja

Testy logiki: walidacja, izolacja aut, niepełne tankowania, sumy kosztów i uszkodzony zapis. TypeScript bez błędów; eksport bundli platformowych. Podgląd web na telefonie i ręczna ścieżka dodania samochodu → tankowania → serwisu → odświeżenie → drugi samochód. Testy fizycznych urządzeń i podpisane buildy raportujemy osobno.
