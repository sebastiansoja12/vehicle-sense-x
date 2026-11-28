[Polski](2026-11-28-live-session-reports.md) | [English](2026-11-28-live-session-reports.en.md) | [Deutsch](2026-11-28-live-session-reports.de.md)

# Live-Data-Sitzungsberichte — Prüfung

JSON-Beobachtungen und eine PDF/HTML-Zusammenfassung wurden neben bestehendem CSV ergänzt. Jedes Format prüft Fahrzeug-, Adapter- und ECU-Bereich, das 300-Zyklen-Limit, Skalierung, Werte und Chronologie. JSON erhält Pausen; Statistiken unterscheiden keine Antwort von keiner gespeicherten Probe.

Nach Reviewkorrekturen bestanden alle 384 Tests im lokalen main-Arbeitsbereich, einschließlich 13 neuer Berichts- und Oberflächentests. Die Zahl umfasst erhaltene, nicht eingecheckte Änderungen anderer Module. Typen, Lint, PL/EN/DE-Dokumentation sowie web- und iOS/Android-Hermes-Exporte bestehen.

Das unabhängige Review fand eine umgangene CSV-Validierung und rückwärtslaufende Beobachtungszeiten. Beide Probleme wurden RED reproduziert und GREEN korrigiert. CSV wird im gemeinsamen Serialisierer vor der Dateifreigabe validiert. Ein Test bestätigt, dass Sitzungs-JSON keine vollständige Messsicherung zur Freigabe des DTC-Löschens ist.

Keine OBD-Befehle, nativen Abhängigkeiten, Sitzungsimporte oder Änderungen des Garagenschemas wurden ergänzt. Physisches Adapter-/Telefonverhalten und Darstellung oder Teilen nativer PDF wurden nicht geprüft. Bestehende native dd64fcd-Pakete enthalten diese spätere Quelländerung nicht.

```sh
node --test tests.mjs tests/*.test.mjs mobile/tests/*.test.mjs server/*.test.mjs
npm run typecheck --prefix mobile
npm run lint --prefix mobile
python3 scripts/check-docs.py
npm run export:web --prefix mobile
npm run export:native --prefix mobile
```

[Anleitung](../../mobile/LIVE-DATA-REPORTS.de.md) · [Spezifikation](../superpowers/specs/2026-11-28-live-session-reports.de.md) · [Plan](../superpowers/plans/2026-11-28-live-session-reports.de.md)
