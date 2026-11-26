[Polski](2026-11-25-connected-modules-design.md) | [English](2026-11-25-connected-modules-design.en.md) | [Deutsch](2026-11-25-connected-modules-design.de.md)

# VehicleSenseX — übrige Module

Der Benutzer hat die fortlaufende Implementierung der übrigen Module mit Superpowers ohne weitere Freigabepausen beauftragt. Die freigegebene Oberfläche und Expo SDK 58 bleiben erhalten; der bisherige Plan bleibt abgeschlossen. Der neue Umfang erweitert die funktionierende App und ersetzt keine Benutzerdaten durch eine Demonstration.

## Ansatz und Einschränkungen

- Gewählt: lokale Module und funktionierende Integrationen mit ausdrücklichen Grenzen. GPS-Fahrten in der sichtbaren App; Stopp/Pause beim Wechsel in den Hintergrund, erhaltener Entwurf und manuelle Fahrten. Hintergrundaufzeichnung erfordert separate Gerätevalidierung und Store-Konfiguration.
- OBD2: echter ELM327-Client und BLE-Transport mit manuell angegebenen UUIDs. Kein Versprechen der Kompatibilität mit jedem Adapter oder Bluetooth Classic. Messungen haben Zeit und Quelle. Löschen erfordert Berichtssicherung und separate Bestätigung; nicht während einer Fahrtenaufzeichnung.
- KI: Proxyserver, Schlüssel ausschließlich in Server-Umgebungsvariablen. Ausdrückliche Zustimmung zur Übertragung minimalen Kontexts. Keine VIN, Kennzeichen, Fotos oder Routenkoordinaten im Standardkontext. Fehlender Schlüssel ergibt „nicht konfiguriert“, niemals eine fiktive Antwort. Die lokale Faktenübersicht funktioniert ohne KI.
- Alternativen: Sofortige native Hintergrundaufzeichnung erhöht das Risiko und erfordert Geräte; GPS-/OBD-/KI-Imitationen erfüllen den Auftrag nicht. Deshalb werden echte SDK-gestützte Abläufe und testbare Kernmodule implementiert und fehlende Hardwaretests dokumentiert.

## Fahrten und Analyse

Manueller Start/Stopp und GPS-Zustimmung erst beim Start. Fahrzeugzuordnung zum Startzeitpunkt, unabhängig von späteren Garagenwechseln. Verlauf, Fahrtauswahl, Streckenskizze, Entfernung, Zeit, Durchschnitts- und Höchstgeschwindigkeit sowie Kraftstoffkosten als Schätzung mit genannter Quelle. Schlechte Genauigkeit, nicht monotone Zeiten und GPS-Sprünge verwerfen; lange Lücken verbinden die Strecke nicht durch eine gerade Linie. Bei verweigertem GPS kann eine Fahrt manuell hinzugefügt werden. Manuelle Einträge erzeugen keine Fahrstilereignisse.

Die Analyse zeigt konkrete Beschleunigungs-/Bremsereignisse und ausdrückliche Schwellenwerte als validierungsbedürftige GPS-Heuristik. Kein erfundener Eco Score. Fehlende Daten sind von null zu unterscheiden. Demonstrationsdaten immer getrennt.

## Wartung, Kosten und Garage

Erinnerungen nach Datum oder Kilometerstand; der frühere Termin gilt. Bearbeiten und Löschen von Einträgen mit Bestätigung, CSV-Export und vollständige JSON-Sicherung mit validierter Wiederherstellung und Bestätigung des Ersetzens. Lokale Anhänge, sofern sich der Dateilebenszyklus sicher prüfen lässt; kein automatischer Upload. Für Fotos und VIN wird kein Anbieter erfunden.

## Zustand und Wert

Mess- und DTC-Verlauf, Umfang und Alter der Daten, Wartungsverlauf und anstehende Termine. Vor dem Verkauf exportierter Bericht mit Datum und Quellen; keine Bescheinigung der Funktionsfähigkeit. Der Wert ist eine Spanne aus eingetragenen Vergleichsangeboten mit Quelladresse und Datum, keine zufällige Bewertung. Kosten im Verhältnis zum Wert nur bei vorhandener Schätzung und als Schätzung gekennzeichnet.

## Daten und Schreibsicherheit

Migration des bestehenden Zustands v1 zum erweiterten v2 ohne Verlust von Garage, Tankvorgängen und Wartung. Ältere Sicherungen überschreiben kein neueres Schema. Jeder Datensatz hat vehicleId und wird beim Lesen validiert. Chronologie, Standortdatenschutz, Verlassen der Demo und Schreibfehler bleiben abgesichert. Entwürfe und Gespräche dürfen nicht zu einem anderen Auto wechseln.

## Überprüfung

Tests vor dem Code: Migration, Fahrzeugtrennung, GPS-Filter und Lücken, Fahrereignisse, OBD-Parser und Timeouts, Minimierung des KI-Kontexts, Serverfehler, Wartungstermine, CSV und Sicherung. Typen, Lint, Web-/iOS-/Android-Bundle, unabhängige Prüfung und Telefonvorschau. Fehlender physischer Adapter, Geräte-GPS und API-Schlüssel werden ausdrücklich gemeldet; diese Tests werden nicht als durchgeführt markiert.
