[Polski](2026-11-26-ownership-expenses.md) | [English](2026-11-26-ownership-expenses.en.md) | [Deutsch](2026-11-26-ownership-expenses.de.md)

# Implementierung der Besitzkosten

> superpowers:executing-plans

**Ziel:** Echte Besitzkosten mit korrekten Summen und sicherer Migration. **Spezifikation:** [Umfang](../specs/2026-11-26-ownership-expenses.de.md).

**Dateien:** `records.ts` / `domain.ts` / `features.ts` verwalten Schema 3, Validierung und Änderungen; `expenses.ts` / `reports.ts` Summen und CSV; `EntryForm.tsx` / `RecordActions.tsx` / `screens.tsx` / `HealthSettingsScreens.tsx` Oberfläche und Export. Bestehende Komponenten und KI-Datenschutzgrenzen wiederverwenden.

- [x] Tests für Validierung, Schema-1/2-Migration, Sicherungen, doppelte IDs/Beziehungen, Summen, Bearbeiten/Löschen und Export; fehlendes Verhalten nachweisen.
- [x] Register, Migration und Summen implementieren, KI-Umfang und reine Kraftstoffschätzungen erhalten.
- [x] Formular, Monatshistorie, Bearbeiten/Löschen, CSV und alle drei Dokumentationssprachen verbinden.
- [ ] Tests, Typen/Lint, Exporte, Prüfung und Formulartest; Commit/Push, CI und neue native Pakete 0.3.0/Build 4.
