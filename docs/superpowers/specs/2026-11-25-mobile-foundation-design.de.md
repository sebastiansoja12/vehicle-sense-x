[Polski](2026-11-25-mobile-foundation-design.md) | [English](2026-11-25-mobile-foundation-design.en.md) | [Deutsch](2026-11-25-mobile-foundation-design.de.md)

# VehicleSenseX — Grundlage der mobilen App

## Freigegebene Ausrichtung

Der Benutzer hat das Erscheinungsbild in der Telefonvorschau freigegeben und den Beginn der Implementierung angeordnet. Die Produktspezifikation bilden die acht im Gespräch und im README beschriebenen Module. Beibehalten werden die helle, flache Oberfläche, Graphit, sparsames Rot, fünf Register und konkrete Daten statt dekorativer Anzeigen.

## Etappenziel

Eine startfähige App für iOS, Android und zur Prüfung im Browser bereitstellen. Erste Etappe: Garage mit mehreren Autos, Auswahl des aktiven Autos, Tankvorgänge, Wartungsverlauf und Berechnungen auf Grundlage tatsächlicher Einträge. Ohne Anmeldung und externe Dienste. Standardmäßig keine fiktiven Autos oder Zahlen. Beispieldaten nur nach bewusstem Öffnen des Demonstrationsmodus.

## Ansatz

- Vom Implementierenden gewählt: React Native + Expo + TypeScript. Ein Client für beide Stores; native Komponenten und Möglichkeit späterer Bluetooth-/GPS-Integrationen.
- Zwei separate Swift-/Kotlin-Apps würden die doppelte Umsetzung der freigegebenen Oberfläche erfordern.
- Ein Container für die bestehende Website bietet in dieser Etappe für die angestrebten Hardwarefunktionen keinen Vorteil. Der Prototyp bleibt eine getrennte Vorlage im Hauptverzeichnis; die Implementierung entsteht unter `mobile/`.
- Lokale Speicherung: AsyncStorage, versioniertes und validiertes JSON-Dokument. Eine Wahl für einen kleinen Datensatz in der ersten Etappe; nicht für Geheimnisse, GPS-Spuren oder Rechnungen verwendet. Bei wachsendem Verlauf Wechsel zu einer SQL-Datenbank.

## Datenregeln

- Kraftstoff- und Wartungsdatensätze enthalten immer die Fahrzeugkennung. Ein Fahrzeugwechsel ändert sämtliche Übersichten.
- Preise und Kosten werden in Groschen, Kraftstoffmengen in Millilitern und Kilometerstände in ganzen Kilometern gespeichert.
- Validierung von polnischem Dezimalkomma und Dezimalpunkt, Mengen- und Preisgrenzen, echtem Kalenderdatum ohne zukünftige Einträge, Kilometerstand und VIN.
- Tankvorgänge werden chronologisch relativ zum letzten Tankvorgang hinzugefügt; der Kilometerstand darf nicht sinken. Wartungseinträge können historisch sein. Der Fahrzeugkilometerstand wächst auf das Maximum der gespeicherten Einträge.
- Verbrauch nach der Volltankmethode summiert die Teilbetankungen zwischen Vollbetankungen. Unzureichende Daten ergeben `null`, niemals ein erfundenes Ergebnis oder null als Messwert.
- Lesefehler oder unbekanntes Schema setzen keine Daten zurück. Ein Schreibfehler schließt das Formular nicht und zeigt keinen Erfolg. Weitere Schreibvorgänge bleiben bis zum Abschluss des vorherigen gesperrt.
- Der Demomodus ist von eigenen Daten getrennt und lässt sich ohne Änderung der Benutzergarage schließen.

## Bildschirme

Start, Diagnose, Fahrten, Kosten und Garage. Die Garage führt außerdem zu Wartung, Zustand, Fahrstil und Assistent. Garage, Kraftstoff und Wartung sind funktionsfähig. Start und Zustand zeigen nur verfügbare Daten; fehlendes OBD2/GPS/KI wird ausdrücklich ausgewiesen. Keine Attrappen echter Prüfungen oder vorgetäuschten Modellantworten.

Formulare im nativen Modal, Tastaturbehandlung, Screenreader-Beschriftungen, Android-Zurück, sichere Bildschirmbereiche und Berührungsflächen von mindestens 44 px. Das Layout entspricht dem freigegebenen Entwurf. Das Tiguan-Rendering dient ausschließlich dem Demomodus; eigenen Autos wird diese Illustration nicht zugewiesen.

## Außerhalb dieser Etappe

OBD2 erfordert die Angabe eines Adapters und Hardwaretests. GPS, Hintergrundbetrieb, Benachrichtigungen, Anhänge, VIN-API, Bewertung, KI, Konten und Synchronisierung bleiben separate Etappen. Keine Veröffentlichung der App in Stores und keine kostenpflichtigen Dienste.

## Überprüfung

Logiktests: Validierung, Fahrzeugtrennung, Teilbetankungen, Kostensummen und beschädigte Speicherung. TypeScript ohne Fehler; Export der Plattformbundles. Webvorschau im Telefonformat und manueller Ablauf Fahrzeug hinzufügen → Tanken → Wartung → Neuladen → zweites Fahrzeug. Tests physischer Geräte und signierte Builds werden separat gemeldet.
