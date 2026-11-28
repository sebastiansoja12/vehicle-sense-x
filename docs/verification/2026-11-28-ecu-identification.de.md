[Polski](2026-11-28-ecu-identification.md) | [English](2026-11-28-ecu-identification.en.md) | [Deutsch](2026-11-28-ecu-identification.de.md)

# ECU-Identifikation · 0.6.0 / 8

Quellstand 0.6.0/Build 8 ergänzt einen separaten vollständigen CAN-Scan mit CALID, CVN und Steuergerätename. Cockpit, Emissionsbereitschaft, Öltemperatur und Werkstattvergleiche aus main bleiben erhalten.

## Prüfung

Nach der Integration bestanden 356 Quelltests; zwei zusätzliche Reviewregressionen erhöhen den Quelltestumfang auf 358. Der vollständige lokale main-Arbeitsbereich mit erhaltenen Oberflächenänderungen hat 371 bestandene Tests. Typen, Lint und PL/EN/DE-Dokumentation bestehen. Das Review korrigierte gemischte Pending-/NO-DATA-Antworten und fehlende Bereitschafts-/Öldaten in Basisexporten.

iOS-/Android-Builds 0.6.0 werden separat geprüft. Vorhandene Pakete 0.5.0 enthalten ECU-Identifikation und spätere main-Änderungen nicht. Physische Adapter-/Telefonprüfungen, nativer PDF-Export und Radioprojektion wurden nicht durchgeführt. Signierte iOS-Verteilung erfordert aktives Apple-Developer-Konto und passende CarPlay-Berechtigungen.

[Anleitung und Umfang](../../mobile/ECU-IDENTIFICATION.de.md)
