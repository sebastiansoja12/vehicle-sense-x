[Polski](CONSUMPTION-MAINTENANCE.md) | [English](CONSUMPTION-MAINTENANCE.en.md) | [Deutsch](CONSUMPTION-MAINTENANCE.de.md)

# Spalanie, harmonogram części i olej

Ekran „Spalanie i obsługa” otworzysz z garażu, kosztów oraz serwisu. Działa lokalnie dla wybranego samochodu, bez dodatkowego konta i nowych zależności. Przełączenie auta resetuje formularze. Nie wpisujemy przykładowych danych do garażu.

## Wykresy i obliczenia paliwa

Zakres to 6 lub 12 miesięcy do dnia analizy. Wykres spalania pokazuje zamknięte cykle pełny–pełny; tankowania częściowe między nimi są sumowane. Pierwszy pełny zbiornik ustala bazę, a jego ilość nie jest spalaniem. Otwarty cykl pozostaje poza średnią. Średnia jest ważona dystansem: suma litrów w pomiarach podzielona przez sumę kilometrów, razy 100. Nie jest średnią arytmetyczną wartości punktów.

Cały cykl przypisujemy do daty zamknięcia, pokazując jego początek, koniec, przebiegi, litry i dystans. Wykres pokazuje do 24 ostatnich cykli w zakresie; średnia obejmuje wszystkie. Oś pozioma oznacza kolejne cykle, bez proporcjonalnego czasu. Przyciski wybierają punkt, a lista udostępnia wartości tekstowo. Drugi wykres przełącza miesięczne zakupione litry i koszty. Zakup w miesiącu nie jest pomiarem paliwa spalonego w tym miesiącu. Brak wpisów nie potwierdza braku jazdy.

Przyszłe tankowania są wykluczone, a duplikaty lub spadki przebiegu przerywają pomiar z ostrzeżeniem. Po takiej przerwie potrzeba nowej poprawnej bazy i kolejnego pełnego tankowania. Wykres, podsumowanie garażu i raport korzystają z tego samego algorytmu. Dokładność zależy od kompletności wpisów i powtarzalnego sposobu tankowania.

## Terminy części i płynów

Ustaw część, kontrolę lub wymianę, ostatnią datę i przebieg, interwał kilometrów lub miesięcy oraz źródło zaleceń. Bazę można wybrać z ostatnich 10 wpisów serwisowych albo wpisać ręcznie. Nie dopasowujemy nazwy serwisu automatycznie. Nie ma gotowych uniwersalnych liczb; sprawdź instrukcję konkretnego silnika i warunki użytkowania. Lista części może obejmować pozycje nieobecne w danym aucie.

Jeśli ustawisz oba interwały, obowiązuje pierwsza osiągnięta granica. Koniec miesiąca jest ograniczany do ostatniego istniejącego dnia. Widoczne są pozostałe dni/km i postęp interwału, który nie jest pomiarem zużycia części. Harmonogram przebiegowy opiera się na ręcznym przebiegu garażu, bez śledzenia w tle i bez prognozy daty z tempa jazdy.

„Zapisz obsługę” atomowo tworzy rzeczywisty serwis i koszt, zamyka poprzedni termin i wyznacza następny od faktycznej obsługi. Już zapisanej naprawy nie dodawaj ponownie: edytuj bazę według istniejącego wpisu. Samo przestawienie planu nie potwierdza naprawy. Powiadomienie o dacie włączysz osobno w serwisie; jeśli było włączone dla planu, przechodzi na następny cykl z nowym identyfikatorem. Pozostaje zależne od zgody systemu. Ręczne przypomnienia działają bez zmian.

## Olej i możliwości OBD

Pełny skan pyta o stronę obsługiwanych PID 40 tylko po jej reklamowaniu, a o PID 5C tylko po potwierdzeniu obsługi. To temperatura oleju, nie poziom, ciśnienie ani pozostała trwałość. Dane mają czas, źródło i zakres ECU; import jest oznaczony. Zero pozostaje zerem, brak odpowiedzi pozostaje nieznany, błędna ramka lub timeout nie stają się udanym odczytem. Live Data nie dodaje tego polecenia. Starsze raporty mogą nie zawierać wartości.

Dziennik pozwala zapisać i poprawić ręczną kontrolę poziomu, rzeczywiście dolane litry i opcjonalne wskazanie trwałości przepisane z komputera auta. To nie odczyt OBD. Wpis trafia do serwisu i kosztów, nie resetuje wymiany ani wskaźnika w aucie. Nie zastępuje też naprawy jako bazy porównania diagnostyki. Nie obliczamy ilości do dolania ani terminu wymiany z temperatury lub procentu. Przy poziomie poza zakresem sprawdź aktualny stan według instrukcji pojazdu.

## Dane, eksport i ograniczenia

Nowe pola są opcjonalne w istniejących wpisach i przypomnieniach, bez zmiany schematu garażu. Kopie JSON zachowują harmonogram, obserwacje i temperaturę; raport zawiera źródło interwałów, a eksport serwisu CSV dodatkowe kolumny oleju. Tytuły, źródła i notatki są eksportowane — sprawdź je przed udostępnieniem. Kontrole, testy transportu i eksporty nie zastępują pomiaru z fizycznym adapterem.

Dokumentacja techniczna: [SVG dla Expo 58](https://docs.expo.dev/versions/v58.0.0/sdk/svg/), [PID temperatury oleju w python-OBD](https://github.com/brendan-w/python-OBD/blob/master/obd/commands.py). Kod biblioteki nie był kopiowany ani dodawany jako zależność. Przykład rozdzielenia kontroli oleju i wskaźnika wymiany: [instrukcja Ford — kontrola poziomu](https://www.fordservicecontent.com/Ford_Content/vdirsnet/OwnerManual/Home/Content?ProcUid=G1612710&Uid=G1724246&buildtype=web%2F1000&countryCode=USA&div=f&languageCode=en&moidRef=G539653&userMarket=USA&vFilteringEnabled=False&variantid=4163), [reset po wymianie](https://www.fordservicecontent.com/Ford_Content/vdirsnet/OwnerManual/Home/Content?ProcUid=G2254282&Uid=G2245241&buildtype=web&countryCode=USA&div=f&languageCode=en&userMarket=ZAF&vFilteringEnabled=False&variantid=8921). Instrukcje te nie są uniwersalnym interwałem dla innych aut.
