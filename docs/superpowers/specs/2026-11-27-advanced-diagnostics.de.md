[Polski](2026-11-27-advanced-diagnostics.md) | [English](2026-11-27-advanced-diagnostics.en.md) | [Deutsch](2026-11-27-advanced-diagnostics.de.md)

# Erweiterte OBD-Diagnose

Ziel: erweiterte Scans echter Daten, Emissionsmonitore, Freeze Frame, Parameterauswahl, Diagramme und Exporte.

Den vorhandenen ELM327-Treiber erweitern. Basisscans bleiben schnell; erweiterte Scans lesen unterstützte Standard-PIDs, PID-01-Bereitschaft und Service-02-Rahmen 0. Daten gehören immer zur gewählten ECU. Fehlende Werte bleiben unbekannt.

Eine optionale Erweiterung der Version 1 erhält alte Berichte und Garagenschema 3. Alle neuen Daten werden beim Import validiert. Die KI erhält weiterhin nur die bisherigen Basisfelder. Löschen erfordert eine genaue Sicherung des aktuellen Berichts und Bestätigung.

Live Data unterstützt bis zu 8 gewählte PIDs, Intervalle von 2/5/10 Sekunden, die letzten 300 Zyklen im Diagramm und CSV. Lücken werden nicht interpoliert. ECU-Wechsel setzen den Sitzungsverlauf zurück. Vollständige Berichte behalten ihren eigenen Zeitpunkt und ändern sich bei Live Data nicht.

Eigenständigen HTML/PDF-Bericht und CSV, erweiterten Verlauf sowie Vergleich nur gemeinsamer Fehlerstatus im passenden ECU-Umfang ergänzen. Ein später fehlender Code beweist keine Reparatur.

Keine erfundenen Sensoren, Zustandsnoten, universelle ABS-/Airbag-Abdeckung, ECU-Codierung oder Aktoraktivierung ergänzen. Hardware bleibt bis zu Tests mit Telefon und Fahrzeug ungeprüft.

[ELM327](https://www.elmelectronics.com/wp-content/uploads/2017/01/ELM327DS.pdf) · [PID](https://www.csselectronics.com/pages/obd2-pid-table-on-board-diagnostics-j1979) · [Readiness](https://python-obd.readthedocs.io/en/latest/Responses/)
