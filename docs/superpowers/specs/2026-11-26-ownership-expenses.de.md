[Polski](2026-11-26-ownership-expenses.md) | [English](2026-11-26-ownership-expenses.en.md) | [Deutsch](2026-11-26-ownership-expenses.de.md)

# Kosten des Fahrzeugbesitzes

Das Kostenmodul erhält echte Einträge für Versicherung, Parken, Maut, Steuern/Gebühren und sonstige Ausgaben. Jeder Eintrag hat Fahrzeug, Datum, Kategorie, Bezeichnung, PLN-Betrag und optionale Notiz. Das Formular erlaubt Hinzufügen und Bearbeiten; Löschen verwendet die bestehende Bestätigung. Beträge sind ganzzahlige Grosz von 0,01 bis 1000000 PLN, mit Datum spätestens heute. Ein Eintrag verändert den Kilometerstand nicht.

Implementierungsentscheidung: Ein separates Ausgabenregister mit bestehendem Formular und Export erhält korrekte Kategorienamen. Monats-/Jahressummen, Startseite, Zustand und Verkaufsbericht zählen jede Ausgabe einmal. Verbrauch und geschätzte Kraftstoffkosten pro 100 km verwenden weiterhin Tankvorgänge. Ausgabendetails und Notizen bleiben lokal; der bestehende KI-Kontext wird nicht erweitert.

Datenschema 3 enthält `expenses`. Lesen von Schema 1/2 erhält alte Einträge und ergänzt ein leeres Register. Schema 3 verlangt ein gültiges Register und alle Beziehungen/Bezeichner. Ältere Apps lehnen das neue Format ab, statt es teilweise zu bearbeiten. Vollständige Sicherungen erhalten Einträge; ein separates CSV enthält Notizen und sichere Zellen. Fahrzeuglöschung entfernt zugehörige Ausgaben.

Keine neuen nativen Abhängigkeiten oder Berechtigungen. App-Version 0.3.0/Build 4 benötigt neue Builds; frühere 0.2.2-Pakete bleiben ein separater Stand. Prüfungen betreffen Geldvalidierung, Migration, Sicherungen, Summen, Fahrzeug-/KI-Isolation, Bearbeiten/Löschen, Exporte und das tatsächliche Formular.
