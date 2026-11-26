[Polski](2026-11-26-ownership-expenses.md) | [English](2026-11-26-ownership-expenses.en.md) | [Deutsch](2026-11-26-ownership-expenses.de.md)

# Vehicle ownership expenses

The costs module gains real entries for insurance, parking, tolls, taxes/fees and other expenses. Each entry has a vehicle, date, category, title, PLN amount and optional note. The form supports adding and editing; deletion uses the existing confirmation. Amounts are integer grosz, from PLN 0.01 to 1000000, with dates no later than today. An entry does not change mileage.

Implementation choice: a separate expense ledger integrated with the existing form and export preserves correct category names. Month/year totals, home, condition and sales report count each expense once. Consumption and estimated fuel cost per 100 km continue to use refueling. Expense details and notes remain local; the existing AI context scope is not expanded.

Data schema 3 contains `expenses`. Reading schema 1/2 preserves old records and adds an empty ledger. Schema 3 requires a valid ledger and all relationships/identifiers. Older apps reject the new format rather than partially editing it. Full backups retain entries; a separate CSV includes notes and safe cells. Vehicle deletion cascades to its expenses.

No new native dependencies or permissions. App version 0.3.0/build 4 needs new builds; earlier 0.2.2 packages remain a separate state. Verification covers money validation, migration, backups, totals, vehicle/AI isolation, editing/deletion, exports and the actual form.
