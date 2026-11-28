[Polski](ECU-IDENTIFICATION.md) | [English](ECU-IDENTIFICATION.en.md) | [Deutsch](ECU-IDENTIFICATION.de.md)

# ECU-Identifikation

Quellstand 0.6.0/Build 8 ergänzt einen separaten vollständigen CAN-Scan mit CALID, CVN und Steuergerätename. Cockpit, Emissionsbereitschaft, Öltemperatur und Werkstattvergleiche aus main bleiben erhalten.

Fahrzeug auswählen, Adapter verbinden und Basisscan abwarten. Bei mehreren antwortenden CAN-Steuergeräten eines auswählen. „Pełny skan z identyfikacją ECU“ liest die Maske von Dienst 09 und anschließend nur gemeldete CALIDs, CVNs und ECU-Namen. Gewöhnliche Basis- und erweiterte Scans erhalten diese Abfragen nicht. VIN behält separaten Abruf und Bestätigung.

Daten bleiben Fahrzeug, Protokoll und ECU-Adresse zugeordnet. Der Status unterscheidet nicht unterstützte Daten, fehlende Antworten und negative NRC-Antworten. NRC 78, mehrdeutige Daten und fehlerhafte Rahmen brechen die Identifikation ab; vor weiterer Abfrage neu verbinden. Ein verworfener Scan ersetzt keinen abgeschlossenen Bericht.

CALID erhält bis zu 16 Zeichen, CVN acht Hexadezimalziffern einschließlich führender Nullen. Listen behalten ihre Reihenfolge, mit höchstens 64 Einträgen, ohne genau einen CVN pro CALID anzunehmen. Der ECU-Name besitzt getrennten Herstellerkurznamen und Beschreibung. Diese Werte bestätigen weder Softwareoriginalität, Tuning, Reparatur noch Fahrzeugzustand.

Verlauf und JSON-Sicherungen erhalten die Identifikation. Diagnostisches CSV/PDF/HTML enthält sie und weist auf möglicherweise fahrzeugidentifizierende Texte hin. Verkaufsberichte und automatischer KI-Kontext lassen sie weg; KI erhält nur die bisherigen vier Basismesswerte. Verlaufvergleiche vergleichen ausschließlich beidseitig verfügbare Felder derselben ECU.

[Prüfung](../docs/verification/2026-11-28-ecu-identification.de.md)
