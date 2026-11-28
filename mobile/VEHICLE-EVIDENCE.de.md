[Polski](VEHICLE-EVIDENCE.md) | [English](VEHICLE-EVIDENCE.en.md) | [Deutsch](VEHICLE-EVIDENCE.de.md)

# Datenprüfung und OBD-Bereitschaft

Erreichbar über Garage, Zustand und Diagnose. Lokale Analyse ohne Daten-/VIN-Übertragung; keine automatischen Änderungen, Kosten oder Termine.

## Emissionsmonitore

ELM327-Vollscan liest PID 01 nur nach ECU-Unterstützungsanzeige. MIL, DTC-Zahl dieses PID und getrennte Verfügbarkeits-/Abschlussflags für Benzin/Diesel. Unterstützte PID 30/31 liefern Aufwärm-/Distanzzähler seit Löschen. Live Data fragt sie nicht erneut ab. Keine Daten bleiben unbekannt; Timeout oder falsche Frames erzeugen keinen erfolgreichen leeren Messwert.

Ausgewählte ECU und Vollscan-Zeitpunkt. Abgeschlossene Monitore bestätigen keine bestandene Prüfung. Niedrige Zähler/unfertige Monitore haben mehrere Ursachen, kein Beweis versteckter Fehler. Keine Gesamtkilometerstände. Ältere Messungen können das optionale Feld vermissen; JSON-Backups, Verkaufsberichte und Vergleiche erhalten es ohne Garagenschemaänderung. Physische Telefon-/Adapter-/ECU-Prüfung nötig.

## Prüfung gespeicherter Daten

Karten unterscheiden gespeicherte, begrenzte, fehlende und widersprüchliche Daten. OBD-/Importquelle, ECU-Adresse, drei DTC-Status, Bereitschaft, zukünftige Daten, Verbrauchsgrundlage und Kilometerchronologie über Tank-/Serviceeinträge prüfen. Zukunftsdaten begründen keinen heutigen Nachweis. Fehlende Codes/Widersprüche bedeuten kein gesundes Fahrzeug.

Kilometerstände zwischen verschiedenen Tagen vergleichen; innerhalb eines Tages keine festgelegte Reihenfolge. Später niedrigerer Wert fordert Prüfung von Datum, Einheit oder Eingabefehler, kein Betrugsvorwurf. Keine Kilometerablesung mehrerer ECUs oder Historienauthentifizierung. Bis zu 10 Details und Gesamtzahl anzeigen.

## Service und Messungen verknüpfen

Für letzten nicht zukünftigen Servicetag OBD-markierte Messungen von strikt früheren/späteren Tagen mit gleicher ECU/Protokoll suchen. Messungen am Servicetag ohne Reparaturzeit mehrdeutig; Importe begründen den Nachweis nicht automatisch. Schaltfläche öffnet exakt die gefundenen IDs im Vergleich.

Verknüpft verfügbare Daten, bestätigt weder Reparaturausführung noch Erfolg. Backupmetadaten sind keine digitale Signatur. Ohne gemeinsame Status bleibt der Codevergleich unvollständig. Keine Zustandsnote oder fehlende-Daten-als-Erfolg-Aussage.
