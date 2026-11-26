[Polski](2026-11-26-ownership-expenses.md) | [English](2026-11-26-ownership-expenses.en.md) | [Deutsch](2026-11-26-ownership-expenses.de.md)

# Implementacja kosztów posiadania

> superpowers:executing-plans

**Cel:** Rzeczywiste wydatki eksploatacyjne z poprawnymi sumami i bezpieczną migracją. **Specyfikacja:** [Zakres](../specs/2026-11-26-ownership-expenses.md).

**Pliki:** `records.ts` / `domain.ts` / `features.ts` odpowiadają za schema 3, walidację i mutacje; `expenses.ts` / `reports.ts` za sumy i CSV; `EntryForm.tsx` / `RecordActions.tsx` / `screens.tsx` / `HealthSettingsScreens.tsx` za interfejs i eksport. Wykorzystać istniejące komponenty i prywatność AI.

- [x] Testy walidacji, migracji 1/2, kopii, duplikatów i powiązań, sum, edycji/usuwania i eksportu; wykazać brak funkcji.
- [x] Wdrożyć rejestr, migrację i sumy, zachowując zakres AI i szacowanie wyłącznie paliwa.
- [x] Podłączyć formularz, historię miesiąca, edycję/usuwanie, CSV i trzy języki dokumentacji.
- [ ] Testy, typy/lint, eksporty, przegląd i test formularza; commit/push, CI oraz nowe paczki natywne 0.3.0/build 4.
