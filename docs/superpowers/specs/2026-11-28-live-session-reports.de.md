[Polski](2026-11-28-live-session-reports.md) | [English](2026-11-28-live-session-reports.en.md) | [Deutsch](2026-11-28-live-session-reports.de.md)

# Live-Data-Sitzungsberichte

Ziel: die tatsächlich vorhandenen letzten 300 Zyklen als JSON und eine PDF/HTML-Zusammenfassung für die Werkstatt exportieren.

Der Umfang umfasst ein Fahrzeug, einen Adapter und einen ECU-Bereich; fehlende oder geänderte Bereiche werden nicht stillschweigend kombiniert. Null als Zahlenwert ist eine Messung; null bedeutet keine Antwort, eine fehlende PID keine gespeicherte Probe. Der Mittelwert ist arithmetisch und nicht zeitgewichtet. Messzeiten und ausdrückliche Pausen bleiben erhalten. ATRV ist Adapterspannung, kein Batterietest.

JSON projiziert ausschließlich Mess-, Skalierungs- und Bereichsfelder. Ohne VIN, Kennzeichen, GPS, DTC oder ECU-Identifikation. PDF/HTML enthält Zusammenfassung und Statistik; vollständige Beobachtungen bleiben in JSON/CSV. Eine Sitzung ersetzt keine vollständige Scansicherung vor dem Löschen. Kein Import, zusätzliche OBD-Befehle, Abhängigkeiten oder Datenmigrationen.

Bestehenden Puffer und Dateifreigabe erweitern. Dauerhafte Aufzeichnung würde ein neues Datenmodell benötigen; dieser Umfang exportiert vorhandene Beobachtungen. Der Benutzer autorisierte kontinuierliche Implementierung ohne Fragen und ausschließlich main.
