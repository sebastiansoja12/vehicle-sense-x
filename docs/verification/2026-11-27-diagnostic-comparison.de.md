[Polski](2026-11-27-diagnostic-comparison.md) | [English](2026-11-27-diagnostic-comparison.en.md) | [Deutsch](2026-11-27-diagnostic-comparison.de.md)

# Diagnosevergleich — Prüfung

Lokalen Vergleich zweier gespeicherter Messungen und Werkstattbericht ergänzt. Keine Schemaänderung, Abhängigkeiten oder Adapterbefehle. Differenzen erfordern passende ECU/Protokoll; fehlender DTC-Status bleibt unbekannt und null wird nicht Null. Symptome nur im Seitenspeicher und gewählten Export.

Acht neue Tests bestanden. Alle Repositorytests, Typen, Lint, Dokumentation und Diff mit folgenden Befehlen geprüft. Web- und iOS/Android-Hermes-Exporte erfolgreich; keine neuen signierten Installationspakete. Unabhängige Prüfung ohne relevante Fehler.

```sh
node --test tests.mjs tests/*.test.mjs mobile/tests/*.test.mjs server/*.test.mjs
npm run typecheck --prefix mobile
npm run lint --prefix mobile
python3 scripts/check-docs.py
npm run export:web --prefix mobile -- --output-dir /tmp/vehiclesensex-diagnostic-web
npm run export:native --prefix mobile -- --output-dir /tmp/vehiclesensex-diagnostic-native
git diff --check
```

Tatsächliche Seite ohne Auto geprüft. Browserwerkzeug blieb bei Auswahl der Testdatei hängen; Nutzerdaten nicht geändert. Weitere Prüfung mit temporärer App-Kopie in /tmp, identischem Seitencode und ausschließlich durch synthetischen Speicher ersetzter Web-Speichergrenze. Testdaten: zwei Autos und 26 Messungen.

Bestätigt: Standardpaar überspringt neuere andere ECU; statusgetrennte DTC; ungelesener Status; echte Null und keine Differenz für null; keine Änderungen bei anderer/unbekannter ECU; 24 Messungen auf Seiten mit je 20; Symptome und HTML-Exportaufruf ohne Fehler; Fahrzeugwechsel löscht Symptome. Layout bei 390 px geprüft. Keine Konsolenfehler.

Keine physischen Messungen, native Freigabe oder PDF-Druckprüfung am Telefon. Datendifferenzen bestätigen keinen Reparaturerfolg. Anleitung: [Vergleich](../../mobile/DIAGNOSTIC-COMPARISON.de.md).
