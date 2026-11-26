[Polski](2026-11-25-connected-modules.md) | [English](2026-11-25-connected-modules.en.md) | [Deutsch](2026-11-25-connected-modules.de.md)

# SDD-Protokoll — Plan: docs/superpowers/plans/2026-11-25-connected-modules.md

- Entscheidung: Der Benutzer hat ausdrücklich fortlaufende Implementierung ohne Freigabepausen angefordert. Freigegebene Oberfläche/Technologien beibehalten; mit dokumentierten Standardentscheidungen fortfahren.
- Entscheidung: Das Repository hat weiterhin keinen ersten Commit und enthält vorhandene unversionierte Arbeit; aktuellen Checkout behalten und Agentenänderungen durch ausdrückliche Dateizuständigkeit trennen. Kein Merge/Push angefordert.
- Vorprüfung: Fahrten und Diagnose stellen unabhängige Datensatztypen bereit; der Hauptagent verantwortet gemeinsame Domäne/Schema/Provider, Paketinstallation und sämtliche Bildschirme. Der Serveragent verantwortet unabhängige Server-/Clientdateien. Kein Agent bearbeitet gemeinsame Dateien.
- Entscheidung: Hintergrundaufzeichnung und Hardwareprüfung erfordern Geräte; Vordergrundaufzeichnung und echte konfigurierbare Transporte implementieren, physische Prüfung als nicht durchgeführt melden. Der Benutzer lehnte später Demo vollständig ab; mobiler Democode, generiertes Autobild und Beispieldatensätze wurden entfernt.

## Implementiert und integriert

- GPS-Domäne, Vordergrundaufzeichnung, serialisierter wiederherstellbarer Entwurf, Eigentümersperre, Web-Aufzeichnungssperre, Fahrtenverlauf und ehrliche GPS-Heuristiken. Pausen und Lücken teilen die Strecke; fehlende Messungen werden niemals zu einem Score.
- ELM327-Parser/-Treiber und Befehlswarteschlange, BLE-Erkennung/manuelles Profil, echtes WLAN-TCP und Android Classic/SPP. Auslesestatus unterscheiden unbekannte Werte von einer erfolgreichen Nullantwort. Löschen erfordert die aktuelle Messung, eine gespeicherte/geteilte Sicherung und separate Bestätigung. Keine Hardwarekompatibilitätsaussage umfasst jeden Adapter: Multi-ECU-/segmentierte Antworten schlagen weiterhin ausdrücklich fehl.
- KI-HTTP-Server mit privater Authentifizierung, Limits und minimalem Kontext aus einer Whitelist; Client mit Zustimmung. Keine VIN, Kennzeichen, Medien oder GPS-Daten übertragen. Kein kostenpflichtiger OpenAI-Liveaufruf; öffentliche Mehrbenutzerauthentifizierung/-bereitstellung liegt außerhalb des aktuellen Servers mit privatem Token.
- Schema v2, Behandlung von Speicherfehlern, validierte Migration zu SQLite auf nativen Plattformen, Wartungserinnerungen/-benachrichtigungen, Berichte, CSV und validierte JSON-Wiederherstellung. Sicherungsexport und -import teilen ein UTF-8-Limit von 20 MB.
- Technische Fahrzeugfelder, tatsächlich vom Benutzer gewählte Fahrzeugfotos, Wartungs-PDFs/-Bilder, begrenzte eingebettete lokale Dateien und Archivbewahrung. Bildvorbereitung lässt sich abbrechen; veraltete Auswahlresultate werden verworfen.
- Veröffentlichungsprofile, Symbol, Datenschutzinformationen, Berechtigungen und Paketkennungen konfiguriert. Keine Kontoverknüpfung, Signierung, native Binärkompilierung oder Store-Einreichung durchgeführt.

## Letzte Überprüfung — 2026-11-25

- Testlauf im Hauptverzeichnis: 107 bestanden, Exit-Code 0 (94 mobil, 9 HTTP-Server, 4 früherer Prototyp).
- Mobiles TypeScript und Expo Lint: Exit-Code 0.
- Expo-Exporte: Web und iOS/Android JS/Hermes, Exit-Code 0 nach Änderungen zum Abbruch von Sicherung/Medien.
- Natives Autolinking-JSON: BLE und TCP unter iOS/Android gefunden; Classic wie beabsichtigt nur unter Android.
- Abhängigkeitsaudit nach gezieltem minimatch-Override: zum Installationszeitpunkt keine gemeldeten Schwachstellen. Expo-Fingerprint-Glob-Hilfsfunktionen mit der aktualisierten transitiven Abhängigkeit geprüft.
- Browser-QA: leere Hauptgarage/Datenschutz und isolierter Formularspeichertest eines Produktionsbuilds mit technischen Daten. Die Dateiauswahl-Automatisierung lief ab; Medienauswahl/-upload wurde NICHT überprüft. Den alten Demo-Screenshot nicht als aktuelle App wiederverwenden.
- Unabhängige abschließende Agentenprüfung nicht verfügbar, da Folgeläufe ein Workspace-Guthabenlimit meldeten. Integrationsprüfung lokal durchgeführt; externe Hardware-/Systemdialoge und signierte native Builds bleiben ungeprüft. Siehe mobile/RELEASE.md.

## Fahrzeugkatalog-Recherche

Die jüngste Benutzeranweisung verlangt eine öffentliche Marken-/Modelldatenbank. Die Recherche steht in `docs/research/2026-11-25-vehicle-catalogs.md`. Kandidatendaten wurden nur unter /private/tmp untersucht; keine neue Katalogabhängigkeit und kein Datensatz wurde eingebunden. Datenherkunft, Jahresbedeutung und gemischte Modell-/Ausstattungsnamen müssen im Integrationsentwurf sichtbar bleiben.

## Nachfolgende Implementierung in dieser Sitzung

Der obige reine Recherchestand wurde durch den ausdrücklichen Integrationsauftrag des Benutzers überholt. Siehe `2026-11-25-offline-catalog.md`: eingebundene Offline-Auswahl, manuelle Alternative, Quellen und unabhängige Prüfung. Weitere Arbeiten ergänzten echte CAN-ECU-Auswahl/ISO-TP und lokales bestätigtes VIN-Auslesen; siehe `2026-11-25-can-ecu.md` und `2026-11-25-obd-vin.md`, jeweils mit unabhängiger Prüfung. Die obige CAN-Multi-ECU-Einschränkung betrifft nun den älteren Nicht-CAN-Pfad; ausgewählte Standard-CAN-Steuergeräte werden im Code unterstützt.

Die jüngste Abschlussprüfung steht in `2026-11-25-release-preflight.md`: 135 Tests bestanden, Typen/Lint/JS-Exporte für drei Plattformen erfolgreich; CNG erzeugte beide nativen Konfigurationen in einer temporären Kopie. Doctor bleibt bei 19/20, da Classic/TCP als ungetestet auf New Architecture markiert sind. Es wurden keine nativen Binärdateien kompiliert, keine physischen Adaptertests und kein echter KI-Aufruf durchgeführt und keine Store-Veröffentlichung vorgenommen.
