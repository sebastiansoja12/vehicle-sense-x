[Polski](2026-11-26-continuous-checks.md) | [English](2026-11-26-continuous-checks.en.md) | [Deutsch](2026-11-26-continuous-checks.de.md)

# Automatyczne kontrole projektu

> superpowers:executing-plans

**Cel:** Każdy push i pull request sprawdza rzeczywiste testy, typy, lint, eksporty i dokumentację PL/EN/DE.

**Architektura:** Jeden workflow GitHub Actions na Ubuntu, przypięte rewizje oficjalnych akcji i Node z `mobile/.nvmrc`. Skrypt Python ze standardową biblioteką sprawdza lokalne pliki Markdown; testy uruchamiają go w tymczasowych repozytoriach Git.

**Specyfikacja:** [Wymagania wydania](../../../mobile/RELEASE.md). Wybór implementacyjny: kontrole źródła zamiast automatycznego EAS, publikacji lub wdrażania serwera. Brak sekretów i płatnych wywołań; token workflow ma tylko odczyt zawartości.

## Kroki

- [x] Testy brakującego języka, osieroconego tłumaczenia, błędnej nawigacji, lokalnych linków i zmienionych identyfikatorów; uruchomić i zobaczyć niepowodzenie.
- [x] `scripts/check-docs.py`: kompletne trójki, nawigacja, linki i języki, zgodne polecenia i struktura; wdrożyć i potwierdzić testy oraz rzeczywistą dokumentację.
- [x] `.github/workflows/verify.yml`: `npm ci` w `mobile`, pełne testy Node, typy/lint, walidacja dokumentacji i eksporty web/Hermes; uprawnienia tylko do odczytu, limit czasu i anulowanie starszych uruchomień.
- [ ] Aktualizować trzy wersje instrukcji; niezależny przegląd, sprawdzić lokalnie, commit i push, następnie sprawdzić rzeczywiste uruchomienie GitHub.

## Kontrola przeglądu

Brakujące pliki i linki muszą kończyć proces kodem niezerowym. Wykluczyć instrukcje `AGENTS.md`, oryginalne licencje i JSON. Workflow nie ma kluczy Expo/OpenAI, nie podpisuje aplikacji i nie uznaje eksportu JavaScript za kompilację natywną. Systemowe udostępnianie, powiadomienia i radia wymagają osobnych testów sprzętowych.
