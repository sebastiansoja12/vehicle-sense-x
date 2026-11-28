[Polski](2026-11-27-market-and-feasibility.md) | [English](2026-11-27-market-and-feasibility.en.md) | [Deutsch](2026-11-27-market-and-feasibility.de.md)

# Rynek aplikacji samochodowych i możliwości VehicleSenseX

Analiza z 27 listopada 2026 obejmuje oficjalne publiczne opisy ośmiu produktów/platform oraz aktualny kod aplikacji. To badanie funkcji i ograniczeń, bez zakupu adapterów, testowania prywatnych kont, porównania wszystkich planów cenowych ani dowodu światowej unikalności. „Brak w przejrzanej dokumentacji” oznacza lukę w dowodach, nie pewność, że konkurent czegoś nie posiada.

## Co oferuje rynek

| Rozwiązanie | Udokumentowany zakres i warunki | Wniosek dla nas |
| --- | --- | --- |
| [Car Scanner](https://apps.apple.com/us/app/car-scanner-elm-obd2/id1259933623) | Diagnostyka ELM327, rejestracja danych, gotowość emisji, freeze frame i wybrane funkcje kodowania/serwisu opisane dla platform samochodów. | Podstawowe odczyty i historia nie wyróżniają produktu; liczą się jakość danych i zgodność konkretnej konfiguracji. |
| [OBDeleven](https://support.obdeleven.com/en/articles/5603309-does-obdeleven-support-my-vehicle) | OBD, live data, historia; zakres zależy od modelu/roku/regionu. Rozszerzone funkcje i kodowanie dotyczą wspieranych marek, w tym manualne kodowanie VAG. | Nie możemy utożsamiać standardowego ELM327 z pełną obsługą wszystkich ECU, SFD czy konfiguracji auta. |
| [Carista](https://carista.com/en-us/pages/carista-obd2-app) | Diagnostyka, personalizacja, wybrane czynności serwisowe; m.in. rejestracja akumulatora i DPF dla wspieranych pojazdów. | Każdą czynność zapisującą konfigurację trzeba wdrażać i weryfikować osobno dla konkretnej platformy. |
| [Carly](https://support.mycarly.com/hc/en-us/articles/360011226299-What-features-does-Carly-support-for-my-car) | Diagnostyka, Smart Mechanic, garaż, wybrane funkcje serwisowe; Used Car Check odczytuje przebiegi z różnych ECU tam, gdzie jest obsługiwany. | Nasza kontrola ręcznych wpisów nie jest odpowiednikiem wielosterownikowego sprawdzenia licznika i nie będzie tak opisywana. |
| [Fuelio](https://fuel.io/) | Tankowania, spalanie, GPS, koszty i terminy; funkcje i plany zależą od platformy. | Nie traktujemy prowadzenia kosztów lub lokalnego garażu jako unikalności. |
| [Drivvo](https://www.drivvo.com/en/) | Paliwo, koszty, serwis, koszt na km, tańsze stacje, także praca w przeglądarce i funkcje flotowe. | Braki w TCO, synchronizacji i zarządzaniu flotą są realnym dalszym backlogiem, nie funkcjami już gotowymi u nas. |
| [FIXD](https://www.fixdapp.com/features/) | Odczyt i objaśnienia kontrolek, harmonogramy serwisowe, powiadomienia i wiele aut, z adapterem FIXD. | Modelowe harmonogramy wymagają wiarygodnego źródła, a nie wymyślonych interwałów. |
| [Smartcar](https://smartcar.com/docs/api-reference/evs/get-battery-capacity) | Platforma API, nie bezpośredni zamiennik aplikacji; dane/komendy zależą od zgód, kompatybilności i regionu. Przykładowa strona pojemności baterii jest oznaczona jako Kanada. | Integracja kont producentów i dane EV to osobna praca z dostępem i zgodnością, nie wynik z napięcia adaptera. |

## Co można zrobić, a co wymaga warunków

| Obszar | Ocena możliwości | Granica deklaracji |
| --- | --- | --- |
| Standardowe OBD: DTC, live data, gotowość emisji | Możliwe przez zgodny ELM327, gdy ECU obsługuje dany PID. | Jeden ECU i obsługiwany zakres; brak pomiaru nie jest zerem. |
| Freeze frame, więcej PID, wykresy/zapis sesji | Technicznie możliwe; pozostaje rozbudowa parserów, formatu sesji i testy sprzętu. | Nie deklarujemy wdrożenia tylko dlatego, że protokół przewiduje funkcję. |
| ABS, poduszki, TPMS, rejestracja akumulatora, DPF, kodowanie i SFD | Zależne od marki, protokołów, zabezpieczeń, dostępu producenta i konkretnego sprzętu. | Brak uniwersalnego „włącz wszystko” dla każdego auta; zapisy do ECU nie są częścią tej zmiany. |
| Warsztaty, ceny części, rezerwacje, dopasowanie OEM | Warsztaty i oferty są już w kodzie; działanie na żywo wymaga konfiguracji. Rezerwacje i pewne dopasowanie wymagają odpowiednich API/umów. | Nazwa auta w wyszukiwaniu nie dowodzi zgodności części; brak kosztu dostawy nie oznacza darmowej wysyłki. |
| Bluetooth audio / CarPlay / Android Auto | Audio działa przez system. [CarPlay](https://developer.apple.com/carplay/) wymaga właściwego entitlement i akceptacji; [Android Auto](https://developer.android.com/training/cars/apps/library) wymaga obsługiwanej kategorii i interfejsu według szablonów. | Parowanie radia nie daje dostępu do ECU ani nie dodaje automatycznie projekcji aplikacji. |
| Zdalne komendy, EV SoH, predykcja awarii | Wyłącznie z odpowiednimi rzeczywistymi danymi, uprawnieniami i zweryfikowaną metodą. | Nie wyliczamy SoH, rzeczywistego przebiegu ani pewnej diagnozy z czterech podstawowych PID. |

## Co wdrożono w tej iteracji

Gotowość emisji OBD: pełny skan odpytuje reklamowane PID 01 oraz, gdy dostępne, 30 i 31. Pokazuje MIL, liczbę DTC zgłoszoną w PID 01, monitory dla zapłonu iskrowego i samoczynnego oraz dostępne liczniki rozgrzań i dystansu od kasowania. Każdy monitor rozróżnia obsługę od zakończenia testu. Dane są w historii, JSON i raportach. Nie jest to wynik badania technicznego ani dowód ukrywania usterki. Format i semantykę sprawdzono w [dokumentacji python-OBD](https://python-obd.readthedocs.io/en/latest/Responses/) oraz implementacji protokołu; nie kopiowano kodu biblioteki ani nie dodawano jej jako zależności.

Audyt danych: lokalnie sprawdza źródło/ECU/statusy diagnostyki, obecność readiness, przyszłe daty i spadki przebiegu między różnymi dniami wpisów paliwa oraz serwisu. Dla ostatniego dnia serwisu znajduje parę rzeczywistych odczytów sprzed i po nim, z tym samym ECU/protokołem, i otwiera dokładnie te dwa raporty w porównaniu. Importy i odczyty z samego dnia naprawy nie tworzą automatycznego potwierdzenia. Bez nowej bazy, serwera lub punktowej oceny sprawności.

## Proponowany wyróżnik i jego dowody

Wyróżnikiem jest połączenie trzech elementów: jawnego audytu braków i sprzeczności danych; powiązania zapisanej naprawy z porównywalnym zakresem ECU; oraz zachowania niepewności w wyniku i raporcie. Publiczne materiały konkurencji opisują historię, diagnostykę lub Used Car Check, ale nie wykazują identycznego przepływu z takim ograniczeniem dowodów. To nasza interpretacja potencjału produktu, nie twierdzenie, że żadne rozwiązanie na świecie go nie ma.

## Kolejne priorytety

1. Freeze frame i dłuższy zapis rzeczywistych parametrów z przerwami i zakresem ECU.
2. Trwałe sprawy napraw: objawy, oferty warsztatów, części, robocizna, rzeczywisty rachunek i ponowny pomiar. Wymaga rozszerzenia modelu danych i migracji, nie będzie dopisywane do kosztów przed wykonaniem.
3. Pełny TCO i budżet: z jawnym okresem, dystansem i brakującymi kosztami; bez dzielenia pełnych kosztów przez częściowo zapisane trasy.
4. Licencjonowane dopasowanie części i interwały producenta, dostawcy rezerwacji, autoryzowane API EV/OEM.
5. Osobne wdrożenie zgodnego interfejsu CarPlay/Android Auto oraz walidacja samochodów i adapterów.

## Ograniczenia weryfikacji

Badanie opiera się na dokumentacji dostępnej publicznie w podanej dacie. Nie wykonano testów wszystkich samochodów, adapterów i planów konkurencji. Nowe komendy sprawdzają testy kontrolowanego transportu, w tym CAN i błędy, a nie rzeczywisty pomiar auta. Użytkownik powinien widzieć źródło, czas, zakres i brak danych; żaden audyt wpisów nie uwierzytelnia historii pojazdu.
