[Polski](2026-11-27-ecu-identification.md) | [English](2026-11-27-ecu-identification.en.md) | [Deutsch](2026-11-27-ecu-identification.de.md)

# Identyfikacja ECU

Cel: opcjonalny, pełny skan CAN z identyfikacją oprogramowania zgłoszoną przez wybrany sterownik. Odczyty 09 04, 09 06 i 09 0A następują tylko po sprawdzeniu mapy 09 00. Podstawowy i dotychczasowy rozszerzony skan pozostają bez nowych zapytań. VIN nadal ma osobny odczyt i potwierdzenie.

Wybrano rozszerzenie istniejącego raportu zamiast osobnego magazynu danych lub automatycznych zapytań przy każdym połączeniu: zapis, import, kopie i porównania zachowają wspólny zakres ECU. To decyzja implementacyjna w ramach zgody na ciągłą rozbudowę. Nie dodajemy zależności natywnych ani programowania sterownika.

Opcjonalna identyfikacja wersji 1 w rozszerzeniu raportu zachowuje schemat garażu 3 i starsze raporty. Identyfikacja wymaga potwierdzonego adresu/protokołu CAN. Rozróżnia brak odpowiedzi, brak obsługi i negatywną odpowiedź ECU z kodem NRC. Oczekiwanie NRC 78 kończy skan błędem i wymaga ponownego połączenia; nie wysyłamy kolejnego zapytania w trakcie oczekiwania.

CALID ma 16 bajtów na element; CVN 4 bajty i osiem cyfr szesnastkowych; liczba elementów musi zgadzać się z długością odpowiedzi, do 64 na listę. Nazwa ECU ma osobne pola 4 i 15 znaków, rozdzielone myślnikiem. Wypełnienie zerami może wystąpić wyłącznie na końcu każdego pola. Zachowujemy kolejność list; nie zakładamy parowania jednego CVN z jednym CALID. Zgłoszone identyfikatory nie potwierdzają oryginalności oprogramowania ani sprawności auta.

UI pokaże źródło i czasy, eksport JSON/CSV/PDF/HTML zachowa pełne dane diagnostyczne, a raport sprzedaży i automatyczny kontekst AI pominą te identyfikatory. Teksty producenta mogą zawierać dane identyfikujące pojazd; przed eksportem diagnostycznym pojawi się informacja o zakresie. Porównanie wymaga tego samego ECU i obu dostępnych wartości, bez twierdzenia o naprawie lub tuningu. Testy obejmą ISO-TP, błędne liczniki/padding, inne ECU, import, utratę danych, kasowanie po zmodyfikowanym raporcie i ochronę eksportów. Fizyczny adapter pozostaje nieprzetestowany.

[SAE J1979-DA G4/G6/G10](https://zpost.com/forums/attachment.php?attachmentid=1460101&d=1468796937&s=792c484ee079d2d205539aa7012025a7)
