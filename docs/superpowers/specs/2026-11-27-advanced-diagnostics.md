[Polski](2026-11-27-advanced-diagnostics.md) | [English](2026-11-27-advanced-diagnostics.en.md) | [Deutsch](2026-11-27-advanced-diagnostics.de.md)

# Rozbudowana diagnostyka OBD

Cel: rozszerzony skan rzeczywistych danych, monitory emisji, ramka zamrożona, wybór parametrów, wykres i eksporty.

Rozwijamy obecny sterownik ELM327. Skan podstawowy pozostaje szybki; skan rozszerzony odczytuje wspierane standardowe PID, gotowość PID 01 i ramkę 0 usługi 02. Dane zawsze dotyczą wybranego ECU. Nieobsługiwane odczyty pozostają nieznane.

Opcjonalny obiekt rozszerzenia wersji 1 zachowuje stare raporty i schemat garażu 3. Wszystkie nowe dane podlegają walidacji importu. AI nadal otrzymuje wyłącznie obecny zestaw bazowy. Kasowanie wymaga dokładnej kopii bieżącego raportu i potwierdzenia.

Live Data pozwala wybrać maksymalnie 8 PID, okres 2/5/10 sekund, wykres ostatnich 300 cykli i CSV. Przerwy w danych nie są interpolowane. Zmiana ECU usuwa historię sesji. Pełny raport ma osobny czas i nie zmienia się przy Live Data.

Dodajemy samodzielny raport HTML/PDF i CSV, podgląd rozszerzonej historii oraz porównanie tylko wspólnych statusów kodów w zgodnym zakresie ECU. Brak kodu w nowszym raporcie nie oznacza naprawy.

Nie dodajemy fikcyjnych czujników, punktacji kondycji, uniwersalnego ABS/airbag, kodowania ECU ani aktywacji elementów. Sprzęt pozostaje niezweryfikowany do czasu prób na telefonie i samochodzie.

[ELM327](https://www.elmelectronics.com/wp-content/uploads/2017/01/ELM327DS.pdf) · [PID](https://www.csselectronics.com/pages/obd2-pid-table-on-board-diagnostics-j1979) · [Readiness](https://python-obd.readthedocs.io/en/latest/Responses/)
