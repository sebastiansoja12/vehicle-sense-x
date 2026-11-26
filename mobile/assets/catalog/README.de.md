[Polski](README.md) | [English](README.en.md) | [Deutsch](README.de.md)

# Mitgelieferte Fahrzeugnamen

Generiert aus [MeterApp/vehicle-db](https://github.com/MeterApp/vehicle-db), Upstream-Commit `f37e44e01fad7f67d3625c95b792f2caa1524536`, geprüft am 2026-11-25.

Enthalten sind ausschließlich Pkw-/MPV-Marken-/Modellnamen mit mindestens einem dieser Quellenbits:

- NHTSA vPIC — öffentliche Daten der US-Regierung. [FAQ zu Quelle/Bedingungen](https://vpic.nhtsa.dot.gov/api/home/index/faq).
- UK Department for Transport / Driver and Vehicle Licensing Agency — enthält Informationen des öffentlichen Sektors, lizenziert unter der [Open Government Licence v3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/). [Quelle](https://www.gov.uk/government/statistical-data-sets/vehicle-licensing-statistics-data-files).
- European Environment Agency — Überwachung der CO2-Emissionen von Personenkraftwagen und Lieferwagen, Verordnung (EU) 2019/631. Lizenziert unter [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/). [Quelle](https://www.eea.europa.eu/en/datahub/datahubitem-view/fa8b1229-3db6-495d-b18e-9c9b3267c02b).
- RDW (Dienst Wegverkeer) — Open Data RDW, Public Domain/CC0. [Quelle](https://opendata.rdw.nl/Voertuigen/Open-Data-RDW-Gekentekende_voertuigen/m9d7-ebf2).

Änderungen durch VehicleSenseX: ausgewählte Quellen und Fahrzeugtypen filtern, Zulassungs-/Modelljahre und einzelne Fahrzeugdatensätze weglassen, Duplikate nach Groß-/Kleinschreibung/Diakritika/Leerraum zusammenführen, zuerst beobachtete Anzeigeschreibweise behalten und unterschiedliche Interpunktion getrennt erhalten. Keine Herstellerfotos, Logos, technischen Fahrzeugdaten oder vorgelagerter Anwendungscode enthalten. Die Datenhinweise gelten unabhängig vom Anwendungscode für den Datensatz. Das Upstream-Paket nennt ISC für seinen Code und behält separat die Bedingungen der Quelldaten bei.

Der Teildatensatz enthält **563 Markennamen und 17.966 Modell-/Namensvarianten** (~289 KB einschließlich Metadaten). Dies sind Quellenbezeichnungen, keine Garantie vollständiger Produktionsmodelle, Werksausstattungen, Jahre oder VIN-Identität. Ältere und fehlende Fahrzeuge können weiterhin manuell eingegeben werden. Die App enthält die obige Namensnennung und Quellen-/Lizenzlinks im Formular sowie unter Einstellungen → Katalog samochodów.

## Reproduzieren

Node 24 verwenden; keine Installation von Abhängigkeiten erforderlich. Unter `mobile/`:

```sh
node scripts/build-vehicle-catalog.mjs
```

Lädt nur das festgelegte öffentliche JSON herunter, prüft vor dem Parsen SHA-256, validiert/filtert Namen und Tupel und erzeugt anschließend `src/vehicle-catalog-data.ts` sowie `assets/catalog/provenance.json` neu. Der Build lädt niemals automatisch Daten herunter; die eingecheckte generierte Datei wird offline mitgeliefert.

Wenn die genaue Upstream-Datei bereits lokal verfügbar ist:

```sh
node scripts/build-vehicle-catalog.mjs --input /absolute/path/compact.json --check
```

Erwarteter SHA-256: `405b677d96ee5f33bdc1e314ab74bcf5e7f5d112f176de335f1e9bafb5cff3a5`. `--check` vergleicht beide generierten Artefakte, ohne sie zu ändern. Eine Aktualisierung erfordert die bewusste Prüfung/Ersetzung von festgelegtem Commit, Hash, Datenstand, Namensnennung und Abdeckungsprüfungen. Zeilen ausschließlich ausgeschlossener Quellen gelangen nicht in die App.
