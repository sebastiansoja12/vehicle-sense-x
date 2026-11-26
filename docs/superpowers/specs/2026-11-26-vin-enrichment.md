[Polski](2026-11-26-vin-enrichment.md) | [English](2026-11-26-vin-enrichment.en.md) | [Deutsch](2026-11-26-vin-enrichment.de.md)

# Dane pojazdu z VIN

Uzupełnianie formularza samochodu rzeczywistymi danymi NHTSA vPIC po osobnej zgodzie na wysłanie VIN.

Wybrano publiczne API bez klucza; pełna baza SQL jest zbyt duża na telefon, a komercyjny dekoder wymaga dostawcy i uprawnień. To decyzja implementacyjna w zatwierdzonym zakresie; użytkownik polecił pracować bez przerw.

Tylko pełny VIN i odpowiedź ErrorCode=0 dla tego samego VIN. Pola: marka, model, rok modelowy, pojemność, skrzynia i napęd; nie przeliczamy SAE HP na KM ani nie zgadujemy wyposażenia. Brakujące dane pozostają puste; zapisany rok opisujemy jako rocznik, z wyraźną informacją o roku modelowym ze źródła.

Jawna zgoda, podgląd i wybór każdego pola; domyślnie zaznaczone są tylko puste pola. Nieaktualny VIN lub zmienione pola docelowe blokują zastosowanie. Zapis zachowuje źródło wyłącznie przy niezmienionych wartościach. Ręczna zmiana VIN usuwa powiązanie. Metadane nie trafiają do AI ani raportu sprzedaży.

Brak nowej biblioteki natywnej. HTTPS tylko do NHTSA, limit odpowiedzi i czasu, anulowanie przy zamknięciu/zmianie VIN, brak logów VIN i brak automatycznych ponowień. Zwykły wpis ręczny i katalog offline pozostają dostępne.

NHTSA nie gwarantuje pokrycia pojazdów europejskich ani kompletnej specyfikacji i nie potwierdza historii/autentyczności auta. Wersje binarne z poprzedniego zadania nie zawierają tej nowej funkcji.

[NHTSA vPIC API](https://vpic.nhtsa.dot.gov/api/), [vPIC FAQ](https://vpic.nhtsa.dot.gov/api/home/index/faq).
