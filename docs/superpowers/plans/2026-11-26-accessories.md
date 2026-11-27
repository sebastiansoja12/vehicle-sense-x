[Polski](2026-11-26-accessories.md) | [English](2026-11-26-accessories.en.md) | [Deutsch](2026-11-26-accessories.de.md)

# Plan modułu akcesoriów

Cel: polecane typy akcesoriów dla marki aktywnego auta, dostępne z garażu i startu. Decyzje wykonawcy zgodnie z prośbą o realizację bez pytań: katalog redakcyjny offline dla wszystkich 563 marek garażu i wpisów ręcznych, cztery kategorie, wyszukiwanie ofert na Allegro oraz dodatkowe oficjalne katalogi 19 producentów sprawdzone 26–27 listopada 2026. Sam wybór marki nie potwierdza zgodności części.

## Zakres i ograniczenia

Istniejący Expo SDK 58 i wspólne komponenty interfejsu. Bez zależności, cen, migracji, automatycznego pobierania danych i wysyłania VIN/tablic. Link otwierany dopiero po kliknięciu, z obsługą błędu. Źródła producentów potwierdzają katalogi i rodzaje produktów; kolejność i uzasadnienia są wyborem redakcyjnym aplikacji. Rozważono zewnętrzny agregator ofert; statyczny katalog jest wystarczający do tej funkcji i nie wymaga kluczy, serwera ani zgód na profilowanie. Istniejące zmiany serwera pozostają poza zakresem.

## Realizacja

- [x] Najpierw testy rozpoznawania marki, nieznanej marki, filtrów, wyszukiwania i źródeł; potwierdzenie braku implementacji.
- [x] Dane i dobór w `mobile/src/accessories.ts`, testy w `mobile/tests/accessories.test.mjs`.
- [x] Ekran w `mobile/src/AccessoriesScreen.tsx`, trasa `mobile/src/app/accessories.tsx`, rejestracja w `mobile/src/app/_layout.tsx` oraz wejścia w `mobile/src/screens.tsx`.
- [x] Pusty garaż, brak wyników, zmiana aktywnego auta i błędy otwierania źródła muszą mieć czytelny interfejs.
- [x] Uzupełnienie instrukcji PL/EN/DE, pełny zestaw testów, typy, lint, walidacja dokumentacji, eksport web i kontrola widoku.

## Kontrola

Najważniejsze przypadki: alias VW i znaki Škoda, nazwy ręczne, rozłączność rekomendacji BMW i innych marek, łączenie filtrów oraz brak internetu. Bez gwarancji dopasowania do konkretnej generacji ani aktualnych cen. Fizyczne telefony nie są częścią lokalnej weryfikacji.

## Weryfikacja pierwszej wersji z 26 listopada 2026

231/231 testów całej aplikacji, typy, lint, walidacja dokumentacji oraz eksporty web i JavaScript/Hermes dla Androida/iOS przeszły. Pierwszy przebieg testów sieciowych był ograniczony przez sandbox; powtórzony z dostępem do lokalnych portów przeszedł w całości. Przegląd kodu nie wykazał istotnych usterek.

W przeglądarce przy szerokości 390 px sprawdzono pusty garaż, dodanie testowego BMW, wejścia z Garażu i Startu, kategorię Komfort, wyszukiwanie bez znaków diakrytycznych, brak wyników, reset filtrów, układ kart i przejście do rzeczywistego katalogu BMW. Prosty serwer statyczny użyty w podglądzie nie ma reguły powrotu do strony głównej dla tras; docelowy hosting web musi obsługiwać trasy aplikacji. Nie wykonano podpisanych pakietów ani testów telefonów/czytników ekranu.

## Rozszerzenie 27 listopada 2026

Na żądanie użytkownika moduł obejmuje wszystkie marki katalogu garażu (563) i wpisy ręczne. Profile powstają z istniejącego katalogu, bez utrzymywania drugiej listy marek. Wspólne propozycje zapewniają cztery kategorie każdej marce; zweryfikowane systemy BMW/Dacia pozostają przypisane do swoich marek. Wszystkie karty oferują wyszukiwanie ofert na Allegro według marki, modelu, rocznika i rodzaju produktu. To wyszukiwanie, a nie potwierdzenie dostępności ani dopasowania. Dodatkowe katalogi producentów obejmują 19 marek. Strony otrzymują dane wyłącznie po kliknięciu; adres wyszukiwania nie zawiera VIN, tablic, historii ani notatek. Test przechodzi przez wszystkie marki katalogu, sprawdza cztery kategorie, wpisy ręczne, zachowanie znaków specjalnych i brak ujawnienia danych prywatnych.

Weryfikacja rozszerzenia: 7/7 testów modułu (w tym każda marka i kategoria), pełny zestaw 242/242, typy, lint, dokumentacja i eksporty web/Android/iOS JavaScript/Hermes przeszły. Przegląd kodu bez istotnych usterek. W przeglądarce sprawdzono Saaba 9-3 z 2008 roku, sześć propozycji, przyciski wyszukiwania, poprawny adres zapytania i powrót do aplikacji. Allegro wymagało CAPTCHA w środowisku testowym; nie potwierdzono zawartości wyników. Nie testowano fizycznych telefonów.
