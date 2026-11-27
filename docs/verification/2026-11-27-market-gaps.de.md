[Polski](2026-11-27-market-gaps.md) | [English](2026-11-27-market-gaps.en.md) | [Deutsch](2026-11-27-market-gaps.de.md)

# Markt und neue Funktionen — Prüfung

OBD-Emissionsbereitschaft und lokale Prüfung vorhandener Fahrzeugdaten ergänzt. Vergleichbare Messungen vor/nach dem Servicetag werden gewählt; Reparaturerfolg und Echtheit werden nicht bestätigt. Acht Produkte und Integrationsgrenzen: [Marktanalyse](../research/2026-11-27-market-and-feasibility.de.md). Bedienung: [Anleitung](../../mobile/VEHICLE-EVIDENCE.de.md).

Sieben Bereitschafts- und neun Audittests prüfen Benzin-/Dieselmonitore, Nullzähler, fehlende Daten, ungültige Frames, Timeout, CAN-Bereich, Sicherungen/Berichte, Löschschutz, verschiedene Fahrzeuge/ECUs, zukünftige Daten, Eintragsreihenfolge und Servicepaare. Unabhängige Prüfung fand zukünftige Messungen als verfügbare Bereitschaftsnachweise; Regressionstest und Klassifikationskorrektur ergänzt. Simulierter Transport ersetzt keine Hardware.

Gesamttests: 273/273 bestanden. Typprüfung und Lint bestanden. Web- und Android/iOS-Hermes-Exporte erfolgreich. Exportpakete sind keine signierten Installationsdateien. Prüfungen mit folgenden Befehlen.

```sh
node --test tests.mjs tests/*.test.mjs mobile/tests/*.test.mjs server/*.test.mjs
npm run typecheck --prefix mobile
npm run lint --prefix mobile
python3 scripts/check-docs.py
npm run export:web --prefix mobile -- --output-dir /tmp/vehiclesensex-market-web
npm run export:native --prefix mobile -- --output-dir /tmp/vehiclesensex-market-native
git diff --check
```

Oberfläche in temporärer App-Kopie mit identischen Bildschirmen und synthetischem Web-Speicher geprüft. Nutzerdaten unverändert. Bei 390 px bestätigt: begrenzter Diagnoseumfang, sinkender eingetragener Kilometerstand 9000 → 8500 km, Vorher-/Nachher-Servicepaar, Navigation zu genau diesen Messungs-IDs und abgeschlossene/unvollständige/nicht unterstützte Monitore. MIL, null Aufwärmzyklen und Distanz seit Löschen sichtbar. Keine Konsolenfehler.

Keine physische Fahrzeugmessung oder Adapter-/Telefonprüfung. Aktuelle Teilepreise erfordern Produktions-API-Konfiguration; Suche allein bestätigt weder Passform noch Buchungen. Weltweite Einzigartigkeit des vorgeschlagenen Merkmals wurde nicht nachgewiesen.
