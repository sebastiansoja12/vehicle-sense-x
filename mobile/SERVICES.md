[Polski](SERVICES.md) | [English](SERVICES.en.md) | [Deutsch](SERVICES.de.md)

# Warsztaty i ceny części

Nowe ekrany są dostępne ze Startu, Garażu i Serwisu, także bez dodanego auta. Wyniki są wyświetlane w aplikacji. Zakup u sprzedawcy, nawigacja i telefon otwierają wybraną stronę lub aplikację systemową.

## Uruchomienie prywatnego serwera

Serwer działa niezależnie od AI. Jeśli nie masz jeszcze konfiguracji, utwórz lokalny plik środowiska z przykładu; nie zastępuj istniejącego pliku. Wygeneruj prywatny token według komentarza w przykładzie. Do warsztatów wystarczy token aplikacji. Do rzeczywistych cen potrzebujesz produkcyjnego konta eBay Developer, kluczy klienta oraz przyznanego dostępu Browse API; samo wypełnienie pól nie gwarantuje dostępu. Nie umieszczaj kluczy dostawcy w aplikacji ani publicznych zmiennych.

```dotenv
APP_API_TOKEN=<private-generated-token>
EBAY_CLIENT_ID=<production-client-id>
EBAY_CLIENT_SECRET=<production-client-secret>
ALLOWED_ORIGINS=http://127.0.0.1:8083
OVERPASS_URL=https://overpass-api.de/api/interpreter
NOMINATIM_URL=https://nominatim.openstreetmap.org/search
```

Po ustawieniu konfiguracji uruchom serwer z katalogu głównego projektu:

```sh
npm start --prefix server
```

W ustawieniach aplikacji lub na pierwszym ekranie warsztatów/części wpisz adres bazowy serwera i token aplikacji, następnie wybierz „Użyj połączenia”. Przeglądarka wymaga dokładnego dozwolonego originu. HTTP jest dozwolone wyłącznie na pętli zwrotnej do testów lokalnych. Na telefonie pętla zwrotna wskazuje telefon: użyj prywatnego wdrożenia HTTPS z prawidłowym certyfikatem. Publiczna zmienna może zawierać wyłącznie adres serwera. Token pozostaje w pamięci sesji, można go usunąć w ustawieniach. Nie dodajemy go do kopii garażu.

## Warsztaty

Wpisz miejscowość lub adres w Polsce, zaznacz zgodę, wyszukaj i wybierz właściwą lokalizację z listy. Alternatywnie wybierz jednorazowy GPS; wymaga zgody systemowej, lokalizacji nie starszej niż dwie minuty i deklarowanej dokładności do 5 km. Następnie wybierz kategorię i promień 5, 10 lub 25 km. Zmiana filtra czyści poprzedni wynik i wymaga ponownego wyszukania. Lista pokazuje do 50 miejsc, posortowanych po odległości w linii prostej, oraz znane adresy, telefony, godziny i strony. Godziny są zapisem ze źródła, bez obietnicy „otwarte teraz”. Brak wpisów nie potwierdza braku warsztatów. Dane i jakość usług wymagają potwierdzenia.

Dane pochodzą z OpenStreetMap na ODbL. Nominatim wyszukuje adres, Overpass wyszukuje obiekty. Serwer ogranicza geokodowanie do jednego zapytania na 1,1 s, warsztaty do jednego na 2 s, przechowuje do 100 wyników w cache (miejscowość 24 h, warsztaty 5 min), a wszystkie autoryzowane próby mają wspólny limit 20/min i dwie aktywne operacje. Limity są lokalne dla procesu. Domyślne publiczne instancje są przeznaczone do umiarkowanego użytku prywatnego. Przed publicznym wydaniem użyj własnego lub zakontraktowanego dostawcy, wspólnego limitu i uwierzytelnienia użytkowników. Adresy dostawców zmienisz na serwerze bez aktualizacji aplikacji. Nie ma automatycznego odpytywania ani autouzupełniania.

## Części

Wpisz nazwę części lub numer OEM. Opcjonalny opis auta dodaje wyłącznie markę, model, rok i silnik; podgląd pokazuje dokładne zapytanie. Zgoda nie obejmuje VIN, tablic, przebiegu ani historii, których nie wysyłamy. Wyszukiwanie tekstowe nie potwierdza dopasowania. Serwer pobiera maksymalnie 20 ofert o stałej cenie dla polskiego rynku i dostawy do Polski, zachowując kolejność eBay. Pokazujemy cenę, oryginalną walutę, znany koszt dostawy, sprzedawcę, stan, źródło i czas pobrania. Cena nie obejmuje robocizny; ostateczna dostawa zależy od adresu i opcji sprzedawcy.

Nieznany koszt dostawy pozostaje nieznany. Ceny w PLN/EUR/USD/GBP/CHF/CZK/SEK/DKK/NOK zachowujemy w jednostkach 1/100; inne waluty i niepoprawne oferty są pomijane z licznikiem. Nie przeliczamy kursów ani nie dodajemy fikcyjnych cen. Odświeżenie wykonuje nowe żądanie; serwer przechowuje tylko token OAuth do wygaśnięcia. Brak kluczy, dostępu lub odpowiedzi kończy się jawnym błędem. Nie ma automatycznego zakupu, rezerwacji, płatności ani weryfikacji OEM.

## Prywatność i weryfikacja

Zapytania są wysyłane dopiero po zgodzie i ręcznej akcji. Anulowanie, wyjście z ekranu, zmiana konfiguracji lub wybranego auta nie mogą podstawić spóźnionego wyniku do nowego kontekstu. Wyniki i token pozostają w pamięci; cache serwera nie przypisuje warsztatów do użytkownika lub garażu. Dostawcy i serwer widzą adres IP połączenia. Nie wpisuj danych osobowych w zapytaniu. Własne reverse proxy skonfiguruj bez logowania treści i nagłówków uwierzytelnienia.

Testy lokalne używają kontrolowanego transportu dostawców, bez rzeczywistych kluczy i bez opłat. Weryfikacja obejmuje walidację, autoryzację bez AI, CORS, błędy, limity, kwoty i brak dostawy, anulowanie oraz kompilację aplikacji. Zgodność OBD i radia nadal wymaga telefonu oraz konkretnego sprzętu. Włączenie nowego opisu zgody GPS wymaga przebudowy natywnej aplikacji.

## Źródła

- [eBay Browse API](https://developer.ebay.com/develop/api/buy/browse_api)
- [eBay OAuth](https://developer.ebay.com/develop/guides/sell/authorization)
- [eBay marketplace support](https://developer.ebay.com/api-docs/buy/static/ref-marketplace-supported.html)
- [Nominatim usage policy](https://operations.osmfoundation.org/policies/nominatim/)
- [Overpass public instances](https://dev.overpass-api.de/overpass-doc/en/preface/commons.html)
- [OpenStreetMap ODbL](https://www.openstreetmap.org/copyright)
- [Expo SDK 58 Location](https://docs.expo.dev/versions/v58.0.0/sdk/location/)
