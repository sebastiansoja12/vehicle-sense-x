[Polski](2026-11-27-diagnostic-cockpit.md) | [English](2026-11-27-diagnostic-cockpit.en.md) | [Deutsch](2026-11-27-diagnostic-cockpit.de.md)

# Kokpit diagnostyczny i widok samochodowy

Animowany kokpit telefonu/tabletu i samodzielnego radia Android: aktywny samochód, własne zdjęcie właściciela, cztery rzeczywiste parametry, źródło/czas, zakres ECU i statusy kodów. Paski animują wyłącznie zmiany odczytów i respektują ograniczenie ruchu. Brak zdjęcia nie jest zastępowany innym autem. Osadzony widok w diagnostyce zachowuje połączenie; osobna trasa pokazuje zapisane odczyty. Brak lub nieaktualne dane nigdy nie stają się zerami ani Live.

Natywny widok CarPlay używa listy systemowej, własnego zdjęcia auta i zapisanej diagnostyki, z czasem/zakresem. Nie udaje animowanego kokpitu i nie odświeża UI częściej niż co 10 sekund. Dane bez VIN/tablic/notatek pozostają tylko w pamięci procesu; po restarcie potrzebna jest synchronizacja z otwartą aplikacją. Konfiguracja sceny/entitlement jest opcjonalna i domyślnie wyłączona do czasu zgody Apple. Brak kategorii diagnostycznej w Android Auto oznacza brak deklarowania aplikacji jako nawigacji, mediów lub IoT. Pełny kokpit pozostaje interfejsem aplikacji, nie projekcją Android Auto.

Testy najpierw: separacja aut/ECU, świeżość i pochodzenie, brak danych, prawdziwe zdjęcie, eksport bez identyfikatorów, włączenie pluginu tylko jawnie. Potem model, kokpit, osadzenie, scena CarPlay i synchronizacja. Sprawdzić pełną suite, typy, lint, dokumentację, konfigurację CNG, eksporty i widok. Brak Xcode/Android SDK oraz zatwierdzenia Apple ogranicza natywne testy i publikację; nie opisywać źródeł jako uruchomionych na radiu.

## Wynik weryfikacji

Pełna suite: 273 testy zaliczone, w tym 10 testów modelu kokpitu, mostka natywnego i konfiguracji CarPlay. Typy, lint, kontrola dokumentacji oraz eksporty JS web/iOS/Android zaliczone. Autolink Apple wykrywa lokalny moduł radia. Konfiguracja została sprawdzona z wyłączonym, włączonym i ponownie wyłączonym pluginem, z zachowaniem scen telefonu i obcych scen CarPlay.

Podgląd web: pusty garaż, dodanie auta testowego, przejście z Garażu do kokpitu, brak pomiaru jako kreski, układy 390 × 844 i 1280 × 800, powrót do Diagnostyki i zachowanie błędu adaptera w osadzonym kokpicie. Dane testowe pozostały w osobnym lokalnym podglądzie. Przegląd kodu wykrył ukrywanie błędów, pozostawianie konfiguracji po wyłączeniu oraz ryzyko starego cache; poprawiono komunikat, usuwanie konfiguracji i zastąpiono cache pamięcią procesu.

Brak kompilacji Swift/Kotlin, testu na urządzeniu, symulatorze CarPlay lub radiu oraz zgody Apple. Eksport JS i autolink nie potwierdzają tych etapów. [Instrukcja kokpitu](../../../mobile/COCKPIT.md)

## Kontynuacja: obsługa sesji w kokpicie

Cel: odczyt, wybór ECU, zapis raportu, połączenie i rozłączenie bez opuszczania kokpitu. Używamy istniejących akcji Diagnostyki i jej blokady operacji, bez drugiego transportu. Konfiguracja profilu nadal otwiera dotychczasowy formularz. Zapis dotyczy pełnego raportu, nie późniejszych próbek Live.

Wykres przechowuje do 60 rzeczywistych próbek w ostatnio zebranym oknie do 5 minut w pamięci. Dane muszą pasować do auta, adaptera, ECU i bieżącego pełnego odczytu; duplikaty, przyszłe i starsze odpowiedzi są pomijane. Brak parametru oraz przerwy ponad 15 sekund przerywają linię. Wybór metryki pokazuje jej zakres zaobserwowanych wartości i czas. Nowy pełny odczyt lub zmiana sterownika zaczyna nowy wykres. Bez nowych sterowników, kategorii Android Auto i zmian entitlement.

Kolejność: testy izolacji i geometrii, model próbek, wykres SVG z istniejącej biblioteki, akcje w kokpicie, dokumentacja i kontrola typów/lint/testów/eksportu oraz podgląd. Sprawdzamy również blokady przy zajętym adapterze i brak pomiaru.

Kontynuacja zweryfikowana: 283 testy pełnej suite zaliczone; 5 nowych testów wykresu obejmuje limity, duplikaty, izolację, brak danych, luki, stałe wartości oraz pełny raport z gotowością emisji. Typy, lint, dokumentacja i eksporty JS web/iOS/Android zaliczone. Podgląd telefonu potwierdził dostępność przycisków połączenia/konfiguracji, widoczny błąd połączenia, blokadę odczytu/Live/zapisu bez sesji, wybór parametru i powrót do formularza. Przegląd poprawił opis zatrzymanego okna; etykieta wyboru parametru dodatkowo wskazuje zaznaczenie. Test działania wykresu z rzeczywistym adapterem oraz natywnej kompilacji pozostaje niewykonany. Na polecenie użytkownika utworzono lokalny branch main i zachowano wszystkie niezapisane zmiany.
