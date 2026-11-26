[Polski](2026-11-25-can-ecu-design.md) | [English](2026-11-25-can-ecu-design.en.md) | [Deutsch](2026-11-25-can-ecu-design.de.md)

# CAN-ECU-Auswahl und gerahmte Antworten

Fortsetzung des Benutzerauftrags für eine echte Bluetooth-/WLAN-OBD-Implementierung. Der aktuelle Parser ohne Header verweigert bewusst Antworten mehrerer ECUs. ISO-15765-4-Protokolle 6/7/8/9 anhand der offiziellen ELM327DSK-Abschnitte zu Headern, mehrzeiligen Antworten und Empfangsfiltern erweitern. Keine proprietären Befehle oder abgeleiteten ECU-Namen.

Beim ersten Auslesen startet 0100 die Protokollerkennung; ATDPN identifiziert das Protokoll. Ältere Protokolle behalten den bestehenden Parser. CAN aktiviert Header, deaktiviert die DLC-Anzeige und aktiviert normale automatische Flusssteuerung. Eine funktionale 0100-Anfrage erkennt tatsächliche Standard-OBD-Antwortadressen. Eine einzelne Adresse darf automatisch ausgewählt werden; mehrere Adressen erfordern eine ausdrückliche Benutzerwahl. Entsprechenden physischen Anfrageheader und exakten Empfangsfilter konfigurieren. Jede nachfolgende Antwort muss von dieser ausgewählten Adresse kommen; Messungen niemals über ECUs hinweg zusammenführen.

ISO-TP-Single-/First-/Consecutive-Frames je CAN-ID getrennt zusammensetzen und Längen sowie Sequenznummern erzwingen. Verschachtelung ist erlaubt; unvollständige, doppelte oder fehlerhafte Nachrichten schlagen fehl. Nur Standardantwortadressen mit 11 Bit 7E8–7EF und 29 Bit 18DAF1xx sind zulässig; andere Adressierungsarten bleiben ausdrücklich nicht unterstützt.

Ein optionaler validierter ECU-Geltungsbereich (Protokoll und Antwortadresse) wird mit gespeicherten/importierten Snapshots und Berichten übertragen, ohne alte Datensätze zu migrieren oder zu ersetzen. Berichte und Oberfläche kennzeichnen eine Einzelsteuergeräteprüfung eindeutig. Löschen bleibt durch den exakten gespeicherten Snapshot geschützt und verwendet bei CAN nun physische Adressierung; eine positive Bestätigung der ausgewählten ECU ist erforderlich. ECU-Wechsel entzieht die bisherige Löschfreigabe. Die KI darf keine auf einen Geltungsbereich begrenzte Messung ohne Erhalt dieses Bereichs erhalten. Client-/Server-Whitelist um validierte Protokoll-/Adressfelder erweitern und diese im Zustimmungsdialog offenlegen.

Validierung auf physischen Geräten bleibt erforderlich. Nicht-CAN-Rahmung für mehrere Steuergeräte, erweiterte Adressierung, CAN FD, ausstehende Negativantworten und proprietäre Diagnose bleiben nicht unterstützt, statt geraten zu werden.
