[Polski](ECU-IDENTIFICATION.md) | [English](ECU-IDENTIFICATION.en.md) | [Deutsch](ECU-IDENTIFICATION.de.md)

# Identyfikacja ECU

Źródło 0.6.0/build 8 dodaje osobny pełny skan CAN z CALID, CVN i nazwą sterownika. Zachowano kokpit, gotowość emisji, temperaturę oleju i porównania warsztatowe z main.

Wybierz samochód, połącz adapter i poczekaj na podstawowy odczyt. Jeśli odpowiedziało kilka sterowników CAN, wybierz jeden. Przycisk „Pełny skan z identyfikacją ECU” odczyta mapę usługi 09, a następnie tylko zadeklarowane CALID, CVN i nazwę ECU. Zwykły skan podstawowy i rozszerzony nie dodają tych zapytań. VIN ma nadal osobny odczyt i potwierdzenie.

Dane pozostają przy konkretnym pojeździe, protokole i adresie ECU. Status rozróżnia brak obsługi, brak odpowiedzi i negatywną odpowiedź NRC. NRC 78, niejednoznaczne dane i błędne ramki przerywają identyfikację; przed kolejnym zapytaniem trzeba ponownie połączyć adapter. Odrzucony skan nie zastępuje ukończonego raportu.

CALID zachowuje do 16 znaków, CVN osiem cyfr szesnastkowych wraz z zerami. Listy zachowują kolejność, do 64 elementów, bez założenia jednego CVN na jeden CALID. Nazwa ECU ma osobny skrót i opis zgłoszony przez producenta. Dane nie potwierdzają oryginalności oprogramowania, tuningu, naprawy ani sprawności samochodu.

Zapis historii i kopia JSON zachowują identyfikację. Diagnostyczny CSV/PDF/HTML obejmuje te dane i uprzedza o tekstach mogących identyfikować pojazd. Raport sprzedaży oraz automatyczny kontekst AI pomijają identyfikację; AI otrzymuje wyłącznie cztery dotychczasowe pomiary podstawowe. Porównanie historii zestawia tylko dostępne po obu stronach pola tego samego ECU.

[Weryfikacja](../docs/verification/2026-11-28-ecu-identification.md)
