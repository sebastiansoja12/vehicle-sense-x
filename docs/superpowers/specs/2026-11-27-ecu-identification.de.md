[Polski](2026-11-27-ecu-identification.md) | [English](2026-11-27-ecu-identification.en.md) | [Deutsch](2026-11-27-ecu-identification.de.md)

# ECU-Identifikation

Ziel: ein optionaler vollständiger CAN-Scan mit der vom ausgewählten Steuergerät gemeldeten Softwareidentifikation. Abfragen 09 04, 09 06 und 09 0A folgen der Unterstützungstabelle 09 00. Basis- und bisherige erweiterte Scans erhalten keine neuen Abfragen. VIN behält separaten Abruf und Bestätigung.

Der vorhandene Bericht wird erweitert, statt einen weiteren Speicher oder automatische Identifikationsabfragen bei jeder Verbindung einzuführen: Speicherung, Importe, Sicherungen und Vergleiche behalten denselben ECU-Bereich. Dies ist eine Implementierungsentscheidung innerhalb der Freigabe zur kontinuierlichen Erweiterung. Keine neue native Abhängigkeit oder Steuergeräteprogrammierung.

Optionale Identifikation der Version 1 in der Berichtserweiterung erhält Garagenschema 3 und ältere Berichte. Sie erfordert bestätigte CAN-Adresse und Protokoll. Fehlende Daten, nicht unterstützte Daten und negative ECU-Antworten mit NRC werden unterschieden. NRC 78 für ausstehende Antworten beendet den Scan mit Fehler und erfordert Neuverbindung; während des Wartens keine weitere Abfrage senden.

CALID enthält 16 Bytes pro Eintrag; CVN 4 Bytes und acht Hexadezimalziffern; Anzahl und Antwortlänge müssen übereinstimmen, mit höchstens 64 Einträgen pro Liste. Der ECU-Name besitzt getrennte Felder mit 4 und 15 Zeichen, durch einen Bindestrich getrennt. Nullauffüllung ist ausschließlich am Ende jedes Feldes erlaubt. Listenreihenfolge bleibt erhalten, ohne genau einen CVN pro CALID anzunehmen. Gemeldete Kennungen bestätigen weder Softwareoriginalität noch Fahrzeugzustand.

Die Oberfläche zeigt Quelle und Abrufzeiten; diagnostisches JSON/CSV/PDF/HTML enthält die Identifikation, Verkaufsbericht und automatischer KI-Kontext lassen sie weg. Herstellertext kann fahrzeugbezogene Kennungen enthalten; der Umfang wird vor Diagnoseexport offengelegt. Vergleiche erfordern dieselbe ECU und beidseitig verfügbare Werte, ohne Reparatur oder Tuning abzuleiten. Tests prüfen ISO-TP, falsche Anzahl/Auffüllung, andere ECU, Import, fehlende Daten, Löschen nach Berichtänderung und Exportschutz. Physische Adapter bleiben ungeprüft.

[SAE J1979-DA G4/G6/G10](https://zpost.com/forums/attachment.php?attachmentid=1460101&d=1468796937&s=792c484ee079d2d205539aa7012025a7)
