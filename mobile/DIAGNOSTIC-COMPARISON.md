[Polski](DIAGNOSTIC-COMPARISON.md) | [English](DIAGNOSTIC-COMPARISON.en.md) | [Deutsch](DIAGNOSTIC-COMPARISON.de.md)

# Porównanie diagnostyki i raport dla warsztatu

Ekran otworzysz z Diagnostyki lub Garażu. Działa offline na dwóch zapisanych odczytach przypisanych do wybranego samochodu. Nie wykonuje nowych poleceń OBD ani zapytań do AI. Nie wymaga kluczy dostawców.

## Wybór odczytów

Domyślnie B to najnowszy zapis, a A to najbliższy wcześniejszy zapis z takim samym adresem ECU i protokołem. Gdy takiego nie ma, wybieramy najbliższy wcześniejszy zapis, ale blokujemy różnice przy niezgodnym lub nieznanym zakresie. Przy identycznym czasie nie zakładamy kolejności. Możesz wybrać inne A i B z listy, stronicowanej po 20 wpisów. A musi być innym i wcześniejszym odczytem. Usunięty wybrany raport wymaga ponownego wyboru; zmiana auta resetuje wybór i opis objawów.

## Znaczenie porównania

Kody są porównywane osobno dla statusów zapisanych, oczekujących i trwałych. Jeśli statusu nie odczytano w którymś raporcie, jego wynik pozostaje nieznany. Ten sam kod w dwóch statusach jest pokazany osobno; nie łączymy ich w jedną usterkę. Brak kodu w B oznacza wyłącznie brak obserwacji w danym odczycie, bez potwierdzenia naprawy. Przy różnym lub niepotwierdzonym ECU pokazujemy oba surowe zestawy kodów, bez oznaczania zmian. Importy są oznaczone jako nieweryfikowane.

Obroty, temperatura płynu, obciążenie i napięcie adaptera pokazują A, B i różnicę B minus A tylko przy zgodnym ECU i dwóch rzeczywistych wartościach. Zero pozostaje zerem, brak odczytu nie ma różnicy. Są to dwa pomiary chwilowe, nie trend ani ocena poprawy. Różne warunki jazdy, temperatury lub wcześniejsze kasowanie kodów mogą zmieniać wyniki. Napięcie adaptera nie jest testem kondycji akumulatora.

## Raport i prywatność

Opcjonalnie wpisz do 2000 znaków objawów i warunków ich występowania. Opis nie jest zapisywany w garażu ani w kopii; opuszczenie ekranu może go usunąć. Raport HTML w przeglądarce lub PDF na telefonie zawiera opis auta, daty UTC, źródła i zakres obu odczytów, ich kody, parametry oraz ograniczenia. Pomija VIN, tablice, zdjęcia, GPS i notatki serwisowe. Nazwy adapterów i opis objawów trafiają do raportu w podanej treści — sprawdź je przed udostępnieniem.

Eksport jest lokalny; systemowy panel udostępniania może przekazać raport do wybranej aplikacji. Treść jest zabezpieczona przed interpretacją wpisanego HTML; raport nie pobiera zasobów sieciowych. Nie jest diagnozą, potwierdzeniem wykonanej naprawy ani badaniem technicznym. Plik zawiera wyłącznie wybrane dwa odczyty, bez całej historii.

## Weryfikacja

Testy obejmują chronologię, zakres ECU/protokół, różne samochody, brak wspólnych statusów, null i zero, domyślną parę, importy, walidację i prywatność/ucieczkę HTML. Nowy ekran korzysta z istniejącego schematu danych i eksportu; kopie garażu pozostają zgodne.
