[Polski](2026-11-25-can-ecu-design.md) | [English](2026-11-25-can-ecu-design.en.md) | [Deutsch](2026-11-25-can-ecu-design.de.md)

# Wybór sterownika CAN ECU i odpowiedzi ramkowane

Kontynuacja zlecenia użytkownika dotyczącego rzeczywistej integracji OBD przez Bluetooth/Wi-Fi. Obecny parser z wyłączonymi nagłówkami celowo odrzuca odpowiedzi wielu ECU. Rozszerzyć obsługę protokołów ISO 15765-4 6/7/8/9 na podstawie oficjalnych rozdziałów ELM327DSK o nagłówkach, odpowiedziach wielowierszowych i filtrach odbioru. Bez poleceń zastrzeżonych i domyślania się nazw ECU.

Przy pierwszym odczycie 0100 rozpoczyna wykrywanie protokołu; ATDPN go identyfikuje. Starsze protokoły zachowują istniejący parser. CAN włącza nagłówki, wyłącza wyświetlanie DLC i włącza standardowe automatyczne sterowanie przepływem. Funkcjonalne zapytanie 0100 wykrywa rzeczywiste standardowe adresy odpowiedzi OBD. Pojedynczy adres można wybrać automatycznie; kilka adresów wymaga jawnego wyboru użytkownika. Skonfigurować odpowiedni nagłówek zapytania fizycznego i dokładny filtr odbioru. Każda kolejna odpowiedź musi pochodzić z wybranego adresu; nigdy nie łączyć odczytów różnych ECU.

Składać ramki ISO-TP pojedyncze/pierwsze/kolejne osobno dla każdego CAN ID, egzekwując długości i numery sekwencji. Przeplatanie jest dozwolone; niepełne, zduplikowane i niepoprawne komunikaty kończą się błędem. Dopuszczalne są wyłącznie standardowe adresy odpowiedzi 11-bitowe 7E8–7EF i 29-bitowe 18DAF1xx; inne adresowanie pozostaje jawnie nieobsługiwane.

Opcjonalny, walidowany zakres ECU (protokół i adres odpowiedzi) jest zachowywany z zapisanymi/importowanymi odczytami i raportami, bez migracji ani zastępowania starych rekordów. Raporty i interfejs jasno wskazują skan pojedynczego sterownika. Kasowanie nadal wymaga dokładnie tego zapisanego odczytu, a dla CAN korzysta teraz z adresowania fizycznego; wymagane jest pozytywne potwierdzenie wybranego ECU. Zmiana ECU unieważnia poprzednią zgodę na kasowanie. AI nie może otrzymać odczytu danego sterownika bez zachowania informacji o jego zakresie. Rozszerzyć białą listę klienta/serwera o walidowane pola protokołu/adresu i ujawnić je na ekranie zgody.

Walidacja na fizycznych urządzeniach pozostaje wymagana. Ramkowanie wielu sterowników poza CAN, adresowanie rozszerzone, CAN FD, oczekujące odpowiedzi negatywne i diagnostyka zastrzeżona pozostają nieobsługiwane, zamiast być zgadywane.
