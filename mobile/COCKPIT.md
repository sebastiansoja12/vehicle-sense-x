[Polski](COCKPIT.md) | [English](COCKPIT.en.md) | [Deutsch](COCKPIT.de.md)

# Kokpit diagnostyczny

W Diagnostyce wybierz „Otwórz animowany kokpit”. Widok zachowuje aktualne połączenie OBD2, pozwala ponowić odczyt i włączyć Live co 5 sekund. W Garażu dostępny jest także osobny kokpit zapisanych odczytów. Układ dostosowuje się do telefonu, tabletu i poziomego ekranu samodzielnego radia Android, na którym można zainstalować aplikację.

Wyświetlane auto to aktywny profil garażu i jego własne zdjęcie. Dodaj zdjęcie w Garażu; bez niego pozostaje symbol i podpowiedź. Nie pobieramy przypadkowego zdjęcia ani modelu 3D. Profil nie potwierdza tożsamości podłączonego samochodu: porównaj odczytany VIN z dokumentami.

Cztery paski pokazują obroty, temperaturę płynu, obciążenie silnika i napięcie adaptera. Animują zmiany rzeczywistych pomiarów i respektują systemowe ograniczenie ruchu. Brak danych to kreska. Etykieta Live wymaga aktywnego odświeżania, zgodności auta, adaptera i ECU oraz pomiaru nie starszego niż 15 sekund. Czas parametrów i czas kodów są oddzielne. Częściowy odczyt nie oznacza braku wszystkich usterek. Skale pasków nie są progami sprawności.

## CarPlay i Android Auto

Pełny animowany kokpit działa wewnątrz aplikacji. Samo Bluetooth nie tworzy projekcji na radiu i nie zastępuje źródła diagnostyki OBD2. Android Auto nie udostępnia kategorii ogólnej diagnostyki; aplikacja nie deklaruje fałszywej kategorii nawigacji, mediów ani IoT.

Przygotowany kod natywny CarPlay korzysta z listy systemowej: miniatury własnego zdjęcia, opisu auta i ostatniej zapisanej diagnostyki z czasem i zakresem ECU. Nie przesyła Live ani animacji silnika. Zmiany danych tego samego auta odświeżają listę najwyżej co 10 sekund; zmiana/usunięcie auta od razu usuwa poprzednią tożsamość. Dane pozostają w pamięci procesu, bez osobnego pliku, serwera, VIN, tablic, notatek i nazw adapterów. Po restarcie procesu trzeba otworzyć aplikację i zsynchronizować garaż, inaczej lista pokazuje brak danych.

Integracja jest domyślnie wyłączona. Apple musi zatwierdzić odpowiedni zakres aplikacji i entitlement Driving Task; zgoda dla tej funkcji nie jest zagwarantowana. Dopiero po uzyskaniu entitlement i zgodnego profilu podpisującego ustaw `enabled` na `true` dla `./plugins/withCarPlay.cjs` w `mobile/app.json` i wykonaj nową kompilację natywną. Plugin rejestruje scenę i entitlement; ponowne wyłączenie usuwa jego konfigurację i zachowuje inne sceny. Expo Go i aktualizacja samego JS nie dodają obsługi CarPlay. Nie uruchomiono natywnej kompilacji ani testu na radiu: w środowisku brak Xcode i Android SDK.

[Zasady szablonów Apple](https://developer.apple.com/download/files/CarPlay-Developer-Guide.pdf) · [Kategorie Android dla samochodów](https://developer.android.com/training/cars)

## Sterowanie sesją i wykres

W kokpicie otwartym z Diagnostyki można połączyć adapter według obecnej konfiguracji BLE, Bluetooth Classic lub Wi-Fi, rozłączyć go, przejść do konfiguracji, wybrać odpowiadający sterownik CAN i zapisać pełny odczyt do historii. Zajęty adapter blokuje równoległe operacje. Komunikaty powodzenia i błędy są widoczne w kokpicie. Przycisk zapisu oznacza, gdy ten konkretny raport jest już w historii. Późniejsze pomiary Live nie zmieniają zapisanego raportu ani jego czasu.

Wybierz jeden z czterech parametrów na wykresie sesji. Pokazuje do 60 rzeczywistych próbek w oknie zbierania do 5 minut, z czasem początku/końca i zakresem zaobserwowanych wartości. Zatrzymanie Live pozostawia ostatnie zebrane okno; nie oznacza ono pomiarów z bieżącej chwili. Brak odczytu parametru lub luka ponad 15 sekund przerywają linię. Nowy pełny odczyt, zmiana ECU albo ponowne połączenie rozpoczynają nowy wykres. Próbki pozostają tylko w pamięci sesji i nie trafiają do historii, kopii, AI ani CarPlay. Bez próbek nie rysujemy przykładowych danych.
