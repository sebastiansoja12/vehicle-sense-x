[Polski](2026-11-27-market-and-feasibility.md) | [English](2026-11-27-market-and-feasibility.en.md) | [Deutsch](2026-11-27-market-and-feasibility.de.md)

# Markt und Machbarkeit für VehicleSenseX

Analyse vom 27. November 2026: öffentliche Herstellerangaben zu acht Produkten/Plattformen und aktueller App-Code. Keine Hardwarekäufe, privaten Kontentests, vollständigen Preisvergleiche oder Beweise weltweiter Einzigartigkeit. Fehlende Erwähnung ist fehlender Nachweis, kein Beweis einer fehlenden Funktion.

## Marktangebot

| Produkt | Dokumentierte Funktionen und Bedingungen | Folgerung |
| --- | --- | --- |
| [Car Scanner](https://apps.apple.com/us/app/car-scanner-elm-obd2/id1259933623) | ELM327-Diagnose, Aufzeichnung, Emissionsbereitschaft, Freeze Frame und ausgewählte plattformspezifische Codierungs-/Servicefunktionen. | Basismessungen/Historie allein unterscheiden uns nicht; Datenqualität und Kompatibilität zählen. |
| [OBDeleven](https://support.obdeleven.com/en/articles/5603309-does-obdeleven-support-my-vehicle) | OBD, Live-Daten/Historie; modell-/jahr-/regionsabhängig, erweiterte Funktionen und manuelle VAG-Codierung. | Generisches ELM327 bedeutet keine vollständige ECU-/SFD-Unterstützung. |
| [Carista](https://carista.com/en-us/pages/carista-obd2-app) | Diagnose, Anpassung und unterstützte Serviceaufgaben einschließlich Batterieanmeldung und DPF. | Schreibfunktionen einzeln je Plattform implementieren und prüfen. |
| [Carly](https://support.mycarly.com/hc/en-us/articles/360011226299-What-features-does-Carly-support-for-my-car) | Diagnose, Smart Mechanic, Garage, Service; unterstützter Used Car Check liest Kilometerstände mehrerer ECUs. | Prüfung manueller Einträge ist keine Mehrsteuergeräte-Kilometerprüfung. |
| [Fuelio](https://fuel.io/) | Tankungen, Verbrauch, GPS, Kosten und Erinnerungen, je Plattform/Tarif unterschiedlich. | Kostenbuch oder lokale Garage sind nicht einzigartig. |
| [Drivvo](https://www.drivvo.com/en/) | Kraftstoff/Kosten/Service, Kosten je km, günstigere Tankstellen, Web und Flottenfunktionen. | TCO, Synchronisierung und Flottenverwaltung bleiben echte Lücken. |
| [FIXD](https://www.fixdapp.com/features/) | Warnleuchtenerklärungen, Wartungspläne/Meldungen, mehrere Autos mit eigenem Sensor. | Modellspezifische Intervalle brauchen zuverlässige Quellen. |
| [Smartcar](https://smartcar.com/docs/api-reference/evs/get-battery-capacity) | API-Plattform statt direkter Endkunden-App; Berechtigungen, Kompatibilität und Region zählen. Beispiel-Kapazitätsseite gilt nur für Kanada. | OEM-Konten/EV-Daten benötigen eigene autorisierte Integration, keine Adapterspannung. |

## Machbarkeit und Bedingungen

| Bereich | Machbarkeit | Aussagegrenze |
| --- | --- | --- |
| Standard-OBD: DTC, Live-Daten, Bereitschaft | Kompatibles ELM327 und unterstützte ECU-PID. | Ausgewählte ECU/Umfang; fehlend ist nicht Null. |
| Freeze Frame, weitere PID, Aufzeichnung/Diagramme | Technisch möglich; Parser, Sitzungsformat und Hardwaretests nötig. | Protokollmöglichkeit ist keine fertige Funktion. |
| ABS, Airbags, TPMS, Batterieanmeldung, DPF, Codierung/SFD | Abhängig von Marke, Protokoll, Sicherheit, Herstellerzugang und Hardware. | Kein universelles Alles-Aktivieren; keine ECU-Schreibvorgänge in dieser Änderung. |
| Werkstätten, Preise, Buchung, OEM-Passform | Werkstatt-/Angebotscode vorhanden; Livekonfiguration nötig. Buchung/gesicherte Passform brauchen passende APIs/Verträge. | Fahrzeugtextsuche beweist keine Passform; unbekannter Versand ist nicht kostenlos. |
| Bluetooth-Audio / CarPlay / Android Auto | Systemaudio; [CarPlay](https://developer.apple.com/carplay/) erfordert passende Freigabe, [Android Auto](https://developer.android.com/training/cars/apps/library) unterstützte Kategorie und Vorlagenoberfläche. | Radiokopplung ermöglicht weder ECU-Zugang noch automatische Projektion. |
| Fernbefehle, EV-SoH, Ausfallvorhersage | Echte Daten, Autorisierung und validierte Methoden nötig. | Vier Basis-PID belegen weder SoH, echten Kilometerstand noch sichere Diagnose. |

## In dieser Iteration umgesetzt

OBD-Bereitschaft: Vollscan liest angekündigte PID 01 sowie verfügbare 30/31. MIL, DTC-Zahl aus PID 01, Benzin-/Dieselmonitore und verfügbare Aufwärm-/Distanzzähler seit Löschen. Unterstützung und Abschluss getrennt. In Historie, JSON und Berichten erhalten. Kein Prüfergebnis oder Nachweis versteckter Fehler. Semantik anhand [python-OBD-Dokumentation](https://python-obd.readthedocs.io/en/latest/Responses/) und Protokollimplementierung geprüft; kein Bibliothekscode kopiert oder Abhängigkeit ergänzt.

Datenprüfung: lokal Quelle/ECU/Status, Bereitschaft, zukünftige Daten und sinkende Kilometerstände zwischen verschiedenen Tank-/Servicetagen prüfen. Echte Vorher-/Nachher-Messungen mit gleicher ECU/Protokoll finden und genau dieses Paar öffnen. Importe und Messungen am Servicetag bestätigen keine Reihenfolge. Keine neue Datenbank/Server oder Zustandsnote.

## Vorgeschlagenes Unterscheidungsmerkmal

Kombination aus offenem Audit fehlender/widersprüchlicher Daten, Zuordnung des Service zu vergleichbaren ECU-Messungen und Erhalt der Unsicherheit in Ergebnis/Bericht. Öffentliche Konkurrenzangaben beschreiben Historie, Diagnose oder Used Car Check, belegen aber nicht denselben evidenzbegrenzten Ablauf. Produktinterpretation, keine weltweite Einzigartigkeitsbehauptung.

## Nächste Prioritäten

1. Freeze Frame und längere echte Parametersitzungen mit Lücken und ECU-Bereich.
2. Dauerhafte Reparaturfälle: Symptome, Angebote, Teile, Arbeit, echte Rechnung und erneute Messung; Schema/Migration nötig, keine Istkosten vor Ausführung.
3. Vollständige TCO/Budget mit Zeitraum, Distanz und fehlenden Kosten; Gesamtkosten nicht durch teilweise aufgezeichnete Strecken teilen.
4. Lizenzierte Passform/Herstellerintervalle, Buchungsanbieter und autorisierte EV-/OEM-APIs.
5. Eigene zugelassene CarPlay-/Android-Auto-Oberfläche und Fahrzeug-/Adapterprüfung.

## Prüfgrenzen

Öffentliche Dokumentation zum genannten Datum. Nicht alle Autos, Adapter oder Konkurrenztarife getestet. Neue Befehle mit kontrolliertem Transport einschließlich CAN/Fehlern geprüft, nicht physisch gemessen. Quelle, Zeitpunkt, Bereich und Lücken bleiben sichtbar; Eintragsprüfung authentifiziert keine Fahrzeughistorie.
