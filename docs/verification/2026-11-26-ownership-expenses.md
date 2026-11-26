[Polski](2026-11-26-ownership-expenses.md) | [English](2026-11-26-ownership-expenses.en.md) | [Deutsch](2026-11-26-ownership-expenses.de.md)

# Weryfikacja kosztów posiadania 0.3.0

Źródło 0.3.0/build 4: pięć kategorii rzeczywistych kosztów, edycja/usuwanie, sumy, CSV i schema 3. Przeszło 188/188 testów, w tym 11 nowych testów kosztów, typy, lint i eksporty web/Hermes Android/iOS. Testy pokrywają grosze, limity, daty, powiązania, unikalność ID, migrację 1/2, kopie, usuwanie kaskadowe, izolację samochodów/AI i sumy bez podwójnego naliczania.

Przegląd wykrył brak blokady przyszłej daty przy imporcie kopii. Dodano test wykazujący błąd i poprawkę; test oraz pełny zestaw przeszły. Odczyt istniejącego magazynu pozostaje tolerancyjny na cofnięcie zegara. Rzeczywisty formularz w oddzielnym lokalnym środowisku potwierdził dodanie, zmianę kwoty, kategorię, odrzucenie zera, sumę na ekranie głównym i trwałość po przeładowaniu. Poprawiono stan dostępności kategorii przy użyciu `aria-checked`; po zmianie jedna opcja jest zaznaczona, poprzednia odznaczona. Nie wprowadzono danych przykładowych do paczek aplikacji.

Eksport web domyślnie czyści cache Metro, ponieważ buforowany manifest Expo pokazywał poprzednią wersję w ustawieniach. Po czystym eksporcie i przeładowaniu potwierdzono 0.3.0. Generator CSV przeszedł testy, a przycisk eksportu jest dostępny; pobrania pliku przez przeglądarkę nie potwierdzono. Natywne udostępnianie, powiadomienia i połączenia z adapterami wymagają testów na telefonach.

Nowe kompilacje natywne i CI dla tej rewizji wymagają oddzielnego potwierdzenia. Poprzednie zweryfikowane paczki 0.2.2 nie zawierają kosztów posiadania. Brak aktywnego Apple Developer nadal blokuje sklepowy IPA; niczego nie wysłano do sklepów.
