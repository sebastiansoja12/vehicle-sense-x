[Polski](LIVE-DATA-REPORTS.md) | [English](LIVE-DATA-REPORTS.en.md) | [Deutsch](LIVE-DATA-REPORTS.de.md)

# Live-Data-Sitzungsberichte

Nach tatsächlichen Messungen CSV, JSON oder PDF / HTML im Live-Data-Bereich wählen. Der Export pausiert die Aktualisierung. Die native App erzeugt PDF, der Browser HTML zum Speichern oder Teilen. Der verbleibende Puffer kann auch nach Trennung exportiert werden.

JSON behält das Format vehiclesensex-live-session Version 1: Fahrzeug-/Adapter-/ECU-Bereich, höchstens 300 Zyklen, tatsächliche Zeiten, Einheiten, Skalierung und Pausen. Es ist weder eine Garagensicherung noch ein vollständiger Scanbericht und erlaubt kein Löschen von Codes. Dieses Format hat keinen Import oder automatische Sitzungsspeicherung.

Die PDF/HTML-Zusammenfassung enthält Minimum, Maximum, arithmetischen Mittelwert und den Wert des letzten Zyklus. Keine Antwort und keine gespeicherte Probe haben getrennte Zähler. Der letzte Wert wird nicht über eine Lücke fortgeschrieben. Der Mittelwert ist nicht zeitgewichtet; Parameter werden nacheinander abgefragt. Die gesamte Dauer umfasst Pausen. Vollständige Beobachtungen stehen in JSON/CSV.

ATRV ist Adapterspannung. ECU-Spannung aus PID 42 ist ein separater Parameter, wenn gewählt und gelesen. Keiner der Werte liefert eine automatische Batteriediagnose. Ein voller Puffer zeigt an, dass frühere Zyklen möglicherweise nicht verfügbar sind, ohne einen sicheren Verlust zu behaupten.

Der Export lehnt gemischte Fahrzeuge, Adapter, ECU-Bereiche sowie ungültige Messungen und Zeitstempel ab. VIN, Kennzeichen, GPS, Codes, ECU-Identifikation und private Notizen werden ausgelassen. Adapter- oder Fahrzeugnamen können den Benutzer weiterhin identifizieren; Datei vor dem Teilen prüfen. Daten werden nicht automatisch gesendet.

Diese Berichte sind eine Quelländerung auf main nach dd64fcd. Zuvor geprüfte native 0.6.0-Pakete aus dd64fcd enthalten die Funktion nicht und benötigen einen weiteren Build. Physische Adaptertests und natives PDF-Teilen wurden nicht durchgeführt.

[Prüfergebnisse](../docs/verification/2026-11-28-live-session-reports.de.md)
