[Polski](2026-11-26-ownership-expenses.md) | [English](2026-11-26-ownership-expenses.en.md) | [Deutsch](2026-11-26-ownership-expenses.de.md)

# Koszty posiadania samochodu

Moduł kosztów otrzymuje rzeczywiste wpisy: ubezpieczenie, parking, opłaty drogowe, podatki/opłaty oraz inne wydatki. Każdy wpis ma samochód, datę, kategorię, nazwę, kwotę PLN i opcjonalną notatkę. Formularz pozwala dodawać i edytować; usuwanie wymaga dotychczasowego potwierdzenia. Kwoty są całkowitymi groszami, od 0,01 do 1000000 zł, data nie wykracza poza dzisiaj. Wpis nie zmienia przebiegu.

Wybór implementacyjny: osobny rejestr kosztów, zintegrowany z obecnym formularzem i eksportem, zapewnia poprawne nazwy kategorii. Sumy miesiąca/roku, ekran główny, kondycja i raport sprzedażowy uwzględniają każdy koszt raz. Spalanie i szacunek paliwa na 100 km nadal wynikają z tankowań. Szczegóły wydatków i notatki pozostają lokalne; istniejący zakres kontekstu AI nie jest rozszerzany.

Schema danych 3 zawiera `expenses`. Odczyt schematu 1/2 zachowuje stare wpisy i dodaje pusty rejestr. Schema 3 wymaga poprawnego rejestru i wszystkich powiązań/identyfikatorów. Starsze aplikacje odrzucą nowy format zamiast częściowo go edytować. Pełna kopia zachowuje wpisy; oddzielny CSV zawiera notatki i bezpieczne komórki. Usunięcie samochodu usuwa jego koszty.

Brak nowych zależności natywnych i uprawnień. Nowa wersja aplikacji 0.3.0/build 4 wymaga nowych kompilacji; wcześniejsze paczki 0.2.2 pozostają osobnym stanem. Weryfikacja: testy walidacji pieniędzy, migracji, kopii, sum, izolacji samochodów/AI, edycji i usuwania, eksportów oraz rzeczywistego formularza.
