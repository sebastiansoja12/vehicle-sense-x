[Polski](2026-11-25-offline-catalog.md) | [English](2026-11-25-offline-catalog.en.md) | [Deutsch](2026-11-25-offline-catalog.de.md)

# Plan implementacji katalogu samochodów offline

> **Dla agentów wykonawczych:** użyj superpowers:executing-plans do implementacji w bieżącej sesji. Obowiązuje istniejąca autoryzacja ciągłej pracy.

**Cel:** dodać wybór marki/modelu offline i możliwość wpisu ręcznego do istniejącego formularza pojazdu.
**Architektura:** odtwarzalnie generowana migawka nazw, czyste funkcje wyszukiwania/wyboru, jeden komponent formularza, wspólne informacje o źródłach.
**Stos technologiczny:** Expo 58, React Native 0.88.1, TypeScript, skrypty/testy Node 24; bez nowych zależności.
**Specyfikacja:** `docs/superpowers/specs/2026-11-25-offline-catalog-design.md`.

## Ograniczenia ogólne
- Zachować istniejące rekordy pojazdów i schemat; bez przykładowych wpisów garażu.
- Uwzględnić wyłącznie wybrane źródła publiczne, przypiąć SHA-256 zawartości i commit źródłowy.
- Oddzielić zapytanie wyszukiwania od wybranej marki/modelu; zachować wpis ręczny i pozostałe pola.
- Nie wyprowadzać lat produkcji, silników ani wyposażenia.

## Obszary przeglądu
- Modele poprzedniej marki nie mogą pozostać wybrane po wyborze innej marki.
- Dopasowywać znaki diakrytyczne/wielkość liter, ale zachować rozróżnienie znaczącej interpunkcji.
- Nieznane istniejące samochody i wpisy ręczne muszą przetrwać zmiany trybu i zapis.
- Wiersze z wykluczonych źródeł nie mogą przedostać się do dystrybuowanego podzbioru.
- Długie nazwy, niepoprawne krotki i uszkodzone dane wejściowe mają zatrzymywać generowanie, zamiast po cichu tworzyć bezużyteczne wpisy.

## Zadanie 1: Zbiór danych i model (RED → GREEN)
- [x] Testy: `mobile/tests/vehicle-catalog.test.mjs`, `mobile/tests/catalog-build.test.mjs` — siedem testów przeszło RED → GREEN.
- [x] Zaimplementować `mobile/scripts/build-vehicle-catalog.mjs`: wyodrębnić dane ze sprawdzonej przypiętej zawartości i wygenerować typowany plik dołączany do aplikacji; lokalne `--check` odtwarza oba pliki.
- [x] Zaimplementować `mobile/src/vehicle-catalog.ts`: wyszukiwanie, rozpoznawanie i niemutowalny wybór marki; zachować wartości ręczne.
- [x] Wygenerować `mobile/src/vehicle-catalog-data.ts`; informacje o źródłach w `mobile/src/CatalogNotices.tsx` i `mobile/assets/catalog/README.md`.

## Zadanie 2: Formularz i weryfikacja
- [x] Zaimplementować `mobile/src/VehicleIdentityFields.tsx`, zintegrować `mobile/src/EntryForm.tsx`; informacje o źródłach dostępne z formularza/ustawień.
- [x] Kontrola w przeglądarce w rozmiarze telefonu: Škoda/Octavia, wyszukiwanie modeli w obrębie marki, zmiana na Dacia czyści model, wartości ręczne przetrwały obie zmiany trybu, czyste zamknięcie/ponowne otwarcie. Główny garaż pozostaje pusty.
- [x] 114 testów przeszło, TypeScript i lint bez problemów, eksporty JS/Hermes web/iOS/Android udane po końcowej poprawce dostępności, 2026-11-25.
- [x] Niezależny przegląd tylko do odczytu zakończony. Odtworzono P2 dotyczące niedostępnych etykiet wybranej wartości w rzeczywistej przeglądarce (RED), naprawiono przez dodanie wybranej wartości do każdej etykiety, a następnie potwierdzono dla Dacia/Duster (GREEN). Brak innych potwierdzonych regresji; natywne testy VoiceOver/TalkBack/klawiatury pozostają w RELEASE.md.
