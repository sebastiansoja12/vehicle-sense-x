[Polski](2026-11-26-vin-enrichment.md) | [English](2026-11-26-vin-enrichment.en.md) | [Deutsch](2026-11-26-vin-enrichment.de.md)

# Dane pojazdu z VIN — Kroki

> superpowers:executing-plans

**Cel:** Uzupełnianie formularza samochodu rzeczywistymi danymi NHTSA vPIC po osobnej zgodzie na wysłanie VIN.

**Architektura:** `vin-decoder.ts` + `vin-client.ts` → `VinLookup.tsx` / `EntryForm.tsx`; `domain.ts` / `features.ts` walidują opcjonalne dane źródła.

**Spec:** [Spec](../specs/2026-11-26-vin-enrichment.md).

## Ograniczenia

Tylko pełny VIN i odpowiedź ErrorCode=0 dla tego samego VIN. Pola: marka, model, rok modelowy, pojemność, skrzynia i napęd; nie przeliczamy SAE HP na KM ani nie zgadujemy wyposażenia. Brakujące dane pozostają puste; zapisany rok opisujemy jako rocznik, z wyraźną informacją o roku modelowym ze źródła. Jawna zgoda, podgląd i wybór każdego pola; domyślnie zaznaczone są tylko puste pola. Nieaktualny VIN lub zmienione pola docelowe blokują zastosowanie. Zapis zachowuje źródło wyłącznie przy niezmienionych wartościach. Ręczna zmiana VIN usuwa powiązanie. Metadane nie trafiają do AI ani raportu sprzedaży. Brak nowej biblioteki natywnej. HTTPS tylko do NHTSA, limit odpowiedzi i czasu, anulowanie przy zamknięciu/zmianie VIN, brak logów VIN i brak automatycznych ponowień. Zwykły wpis ręczny i katalog offline pozostają dostępne.

## Przegląd ryzyk

ErrorCode, błędny VIN, zmienione pola, spóźnione odpowiedzi, niezgodne dane źródła w kopii.

## Kroki

- [x] Parser i wybór pól: testy błędnego VIN, ostrzeżeń, braków i nieaktualnego formularza, następnie implementacja.
- [x] HTTP: testy zgody, czasu, anulowania, rozmiaru i błędów usługi, następnie rzeczywisty klient HTTPS.
- [x] Powiązanie źródła z zapisem i kopiami: testy edycji, zmiany VIN i izolacji AI, następnie walidacja.
- [x] Formularz, źródła w garażu, prywatność i dokumentacja PL/EN/DE; testy regresji, typy/lint i eksporty, niezależny przegląd, commity/push.
