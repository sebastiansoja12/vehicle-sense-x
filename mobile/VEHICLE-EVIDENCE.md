[Polski](VEHICLE-EVIDENCE.md) | [English](VEHICLE-EVIDENCE.en.md) | [Deutsch](VEHICLE-EVIDENCE.de.md)

# Audyt danych i gotowość emisji OBD

Nowe funkcje są dostępne z Garażu, Kondycji i Diagnostyki. Analiza działa lokalnie, nie wysyła danych ani VIN do serwera. Nie zmienia zapisów automatycznie i nie dodaje nowych kosztów lub terminów.

## Monitory emisji

Pełny skan ELM327 pyta o PID 01 tylko po zgłoszeniu obsługi przez ECU. Pokazuje MIL, liczbę DTC z tego PID i osobne flagi dostępności oraz zakończenia monitorów dla zapłonu iskrowego i samoczynnego. Wspierane PID 30 i 31 dostarczają liczniki rozgrzań i kilometrów od kasowania. Live Data nie odpytuje ponownie tych danych. Brak odpowiedzi pozostaje nieznany; timeout lub błędna ramka nie tworzą pomyślnego pustego wyniku.

Raport dotyczy wybranego ECU i czasu pełnego skanu. Zakończony monitor nie jest wynikiem badania technicznego. Niskie liczniki i niezakończone testy mogą mieć wiele przyczyn; nie potwierdzają ukrywania usterek. Wartości nie są całkowitym przebiegiem auta. Starsze odczyty mogą nie mieć nowego opcjonalnego pola; kopie JSON, raport sprzedażowy i porównanie zachowują nowe dane bez zmiany schematu garażu. Należy sprawdzić konkretny telefon, adapter i ECU.

## Audyt zapisów

Karty rozróżniają dane zapisane, ograniczone, brak danych i niespójność. Sprawdzamy źródło OBD/import, adres ECU, pokrycie trzech statusów DTC, dostępność readiness, przyszłe daty, podstawę obliczeń spalania oraz chronologię przebiegu z tankowań i serwisów. Danych z przyszłości nie używamy jako bieżącego dowodu. Brak kodów lub sprzeczności nie oznacza sprawności.

Przebieg porównujemy między różnymi dniami. Wpisy z tego samego dnia nie mają ustalonej kolejności. Późniejszy niższy przebieg jest wskazaniem do sprawdzenia pomyłki daty, jednostek albo zapisu, nie dowodem cofnięcia licznika. Audyt nie odczytuje przebiegów z wielu ECU i nie uwierzytelnia historii. Pokazuje do 10 szczegółów niespójności i pełną ich liczbę.

## Powiązanie naprawy i pomiarów

Dla ostatniego nieprzyszłego dnia serwisu szukamy odczytu z wcześniejszego dnia i późniejszego dnia, oznaczonych jako OBD, z takim samym adresem ECU i protokołem. Odczyty z dnia serwisu są niejednoznaczne bez godziny naprawy, a importy nie wypełniają automatycznie tego dowodu. Przycisk otwiera dokładnie znalezione identyfikatory w porównaniu.

Powiązanie jest wskazaniem dostępnych danych, nie potwierdzeniem wykonania lub skuteczności naprawy. Metadane w kopii nie są podpisem cyfrowym. Jeśli po obu stronach nie odczytano tych samych statusów, porównanie kodów pozostaje niepełne. Bez punktowej oceny sprawności i bez sugerowania, że brak danych to pozytywny wynik.
