[Polski](README.md) | [English](README.en.md) | [Deutsch](README.de.md)

# VehicleSenseX

Eine mobile App für OBD2-Diagnose, Fahrzeugakten, Fahrtenaufzeichnung und Besitzkosten. Aktuelle Quellversion: 0.4.0. React Native 0.88.1, Expo SDK 58, React 19.3 und TypeScript 6. Die Garage startet leer; Messwerte stammen vom Gerät oder von Einträgen des Besitzers.

[Dokumentation PL/EN/DE](docs/README.de.md) · [App-Anleitung](mobile/README.de.md) · [Builds und Release](mobile/RELEASE.de.md)

## Module

| Modul | Verfügbare Funktionen |
| --- | --- |
| OBD2 Diagnostics | ELM327 über BLE, Wi-Fi/TCP und Bluetooth Classic/SPP unter Android; CAN-Steuergerätewahl, PIDs, DTC-Status, VIN, Verlauf und Berichte |
| My Garage | Mehrere Fahrzeuge, Offline-Marken-/Modellkatalog, vollständige manuelle Eingabe, Fotos und optionale NHTSA-Daten nach separater Zustimmung |
| Drive Analytics | Distanz, Zeit, Geschwindigkeit und Beschleunigungs-/Bremsheuristiken aus gültigen GPS-Messungen |
| Maintenance | Wartung, Kosten, Notizen, Rechnungen/Fotos, Datums-/Kilometertermine und separat aktivierte lokale Benachrichtigungen |
| Fuel & Expenses | Voll-/Teilbetankungen, Verbrauch, Versicherung, Parken, Gebühren, Bearbeiten, Monats-/Jahressummen und CSV |
| AI Car Assistant | Lokale Zusammenfassung und echte Anfragen an einen konfigurierten Server nach Zustimmung; der Anbieterschlüssel bleibt auf dem Server |
| Trips | Manuelle Einträge, Vordergrund-GPS, Entwurfswiederherstellung, Spur ohne Kartenkacheln und GPX-/JSON-/CSV-Export |
| Vehicle Health & Value | Belege und fehlende Daten, Angebotsvergleiche des Besitzers und PDF-/HTML-Verkaufsbericht |

Fünf Hauptregister: Start, Diagnose, Fahrten, Kosten und Garage. Wartung, Zustand, Fahranalyse und Assistent sind über die Garage erreichbar. Die helle Oberfläche verwendet Graphit und einen roten Akzent sowie ausdrückliche Einheiten, Quellen und Daten.

## Starten

Node 24.18.0, npm und festgelegte Abhängigkeiten:

```sh
cd mobile
nvm use
npm ci
npm run web
```

Nach Installation der Abhängigkeiten startet `npm start` im Hauptverzeichnis das mobile Projekt. Bluetooth und TCP funktionieren in kompilierten Android-/iOS-Apps; die Releaseanleitung beschreibt EAS-Profile. Anleitung zur Assistentenbereitstellung: [Server](server/README.de.md).

## Daten und Belege

Die Garage wird lokal gespeichert; eine vollständige JSON-Sicherung enthält auch Notizen, VIN, Fotos und genaue GPS-Routen. Die App ergänzt keine Datenbankverschlüsselung. Schema 3 migriert ältere Daten; vor Rückkehr zu einer älteren App eine Sicherung behalten. CSV-Exporte und Berichte beschreiben die geteilten Daten.

Adapterkompatibilität verlangt Prüfung des konkreten Geräts und Fahrzeugs. Lesen eines Steuergeräts belegt nicht den Zustand des ganzen Autos. Ein Eco-Driving-Wert benötigt Kalibrierung; die Bewertung nutzt ausdrücklich hinzugefügte Angebote statt automatischer externer Preise.

## Überprüfung und Release

GitHub Actions prüft Pushes und Pull Requests: App-/Transport-/Servertests, Typen, Lint, PL-/EN-/DE-Dokumentation und Web-/Hermes-Exporte. Im Hauptverzeichnis nach Installation der mobilen Abhängigkeiten:

```sh
node --test tests.mjs tests/*.test.mjs mobile/tests/*.test.mjs server/*.test.mjs
npm run typecheck --prefix mobile
npm run lint --prefix mobile
python3 scripts/check-docs.py
```

Die Dokumentationsprüfung benötigt Python 3.9+ und Git. Quell- und Formularergebnisse: [Überprüfung 0.3.0](docs/verification/2026-11-26-ownership-expenses.de.md). Physische Telefon-/Adaptertests, ein signiertes Store-IPA, Herausgeberangaben und Bereitstellung eines eigenen KI-Servers bleiben dokumentierte Releasevoraussetzungen. Keine Einreichung in Stores erfolgte.

## Früherer HTML-Prototyp

Die Oberflächenentwurfsdateien bleiben im Hauptverzeichnis als historisches Material erhalten. Start mit `npm run prototype` unter http://127.0.0.1:5173. Die aktuelle App befindet sich in `mobile/`.

Version 0.4.0 ergänzt automatischen ECU-Scan, separate Live Data, Behandlung von Verbindungsverlust und einen Radio-Audiotest über System-Bluetooth. [0.4.0](docs/verification/2026-11-26-obd-radio.de.md)
