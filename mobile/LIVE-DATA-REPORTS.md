[Polski](LIVE-DATA-REPORTS.md) | [English](LIVE-DATA-REPORTS.en.md) | [Deutsch](LIVE-DATA-REPORTS.de.md)

# Raporty sesji Live Data

Po rzeczywistych odczytach w sekcji Live Data wybierz CSV, JSON lub PDF / HTML. Eksport wstrzymuje odświeżanie. PDF powstaje w aplikacji natywnej, HTML w przeglądarce; plik można zapisać lub udostępnić. Po rozłączeniu nadal można wyeksportować pozostały bufor.

JSON zachowuje format vehiclesensex-live-session w wersji 1: zakres pojazdu/adaptera/ECU, maksymalnie 300 cykli, rzeczywiste czasy, jednostki, skalowanie i przerwy. Nie jest kopią garażu ani raportem pełnego skanu; nie uprawnia do kasowania kodów. Nie dodano importu tego formatu ani automatycznego zapisu sesji.

Podsumowanie PDF/HTML zawiera minimum, maksimum, średnią arytmetyczną i wartość z ostatniego cyklu. Brak odpowiedzi i brak zapisanej próbki to osobne liczniki. Ostatnia wartość nie jest przenoszona przez lukę. Średnia nie jest ważona czasem; parametry są pobierane kolejno. Czas całkowity obejmuje przerwy. Pełne próbki są w JSON/CSV.

ATRV jest napięciem adaptera. Napięcie ECU z PID 42 jest osobnym parametrem, jeśli zostało wybrane i odczytane. Żadna z tych wartości nie jest automatyczną diagnozą akumulatora. Pełny bufor wskazuje, że wcześniejsze cykle mogą być niedostępne, bez twierdzenia, że na pewno je utracono.

Eksport odrzuca mieszane pojazdy, adaptery, zakresy ECU, nieprawidłowe pomiary i daty. Pola VIN, tablic, GPS, kodów, identyfikacji ECU i prywatnych notatek są pomijane. Tekst nazwy adaptera lub pojazdu może nadal identyfikować użytkownika; sprawdź plik przed udostępnieniem. Dane nie są wysyłane automatycznie.

Nowe raporty są zmianą źródeł na main po dd64fcd. Wcześniej zweryfikowane pakiety natywne 0.6.0 ze źródła dd64fcd nie zawierają tej funkcji; wymagają kolejnej kompilacji. Nie wykonano fizycznego testu adaptera ani natywnego udostępniania PDF.

[Wyniki weryfikacji](../docs/verification/2026-11-28-live-session-reports.md)
