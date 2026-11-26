[Polski](2026-11-25-vehicle-catalogs.md) | [English](2026-11-25-vehicle-catalogs.en.md) | [Deutsch](2026-11-25-vehicle-catalogs.de.md)

# Öffentliche Fahrzeugkataloge für VehicleSenseX

Recherchedatum: 2026-11-25. Anforderung: ein bestimmtes Modell einer bestimmten Marke auswählen, mit brauchbarer Abdeckung für Polen/Europa. Anschließende Umsetzung: Der Benutzer hat danach die Integration angefordert. Ein auf einen festen Stand gesetzter Offline-Teildatensatz ist nun im Garagenformular enthalten; manuelle Eingaben bleiben möglich. Quellenauswahl und Überprüfung sind in `mobile/assets/catalog/README.md` und im Offline-Katalog-Plan beschrieben. Das vollständige vorgelagerte Node-Paket wurde nicht installiert.

## Ergebnisse

| Quelle | Verwendung | Grenzen und Bedingungen |
| --- | --- | --- |
| [NHTSA vPIC](https://vpic.nhtsa.dot.gov/api/) | Offizielle kostenlose API für Marke/Modell/Jahr und VIN-Dekodierung | Laut [offiziellen FAQ](https://vpic.nhtsa.dot.gov/api/home/index/faq) ist keine App-Registrierung/Lizenzierung erforderlich. Ausländische Fahrzeuge sind erfasst, wenn sie für den US-Markt registriert sind; als alleiniger europäischer Katalog ungeeignet. Keinen unbegrenzten Durchsatz zusagen. |
| [RDW registered vehicles](https://opendata.rdw.nl/Voertuigen/Open-Data-RDW-Gekentekende_voertuigen/m9d7-ebf2) | Europäische Marken-/Handelsnamenbeobachtungen aus dem niederländischen Register | Die offiziellen Metadaten kennzeichnen den Datensatz als Public Domain / CC0. Zulassungsdatensätze sind kein vollständiger Produktionskatalog der Hersteller. Nur aggregierte Marken-/Modellnamen extrahieren, keine Kennzeichen oder einzelnen Fahrzeugdatensätze. |
| [EEA new passenger cars](https://www.eea.europa.eu/en/datahub/datahubitem-view/fa8b1229-3db6-495d-b18e-9c9b3267c02b) | Europäische Marken und Handelsnamen aus Neuzulassungsmeldungen | Berichts-/Zulassungsjahr darf nicht als Produktionsjahr bezeichnet werden. Nationale Benennungen variieren. |
| [MeterApp vehicle-db](https://github.com/MeterApp/vehicle-db) | Kombinierter Offline-Katalog mit Quellenfiltern; praktischer Kandidat für eine Auswahlfunktion | Der Code nennt ISC; die Quelldaten behalten ihre eigenen Bedingungen. Die Quellenmetadaten nennen EEA als CC BY 4.0, UK DfT als OGL 3.0 und RDW als Public Domain. Die Bedingungen ausgewählter Quellen einzeln prüfen; die Codelizenz lizenziert nicht alle Daten neu. |

Die [CC-BY-4.0-Bedingungen](https://creativecommons.org/licenses/by/4.0/) erlauben kommerzielle Weiterverwendung und Bearbeitung mit Namensnennung, Lizenzlink und Kennzeichnung von Änderungen. Bei der Verteilung sollten die Datensatzhinweise getrennt von der Anwendungslizenz erhalten bleiben. Die Weiterverwendung von Datensätzen gewährt keine Rechte an Autofotos oder Herstellerlogos.

## Tatsächliche Datenprüfung

Die im Repository verlinkte Datei `data/compact.json` wurde in eine temporäre Datei heruntergeladen, ohne Code oder Installationsskripte auszuführen. SHA-256 des Snapshots: `405b677d96ee5f33bdc1e314ab74bcf5e7f5d112f176de335f1e9bafb5cff3a5` (7.975.596 Bytes). Dies ist ein Hash des geprüften Inhalts, keine festgelegte Upstream-Version und keine Zusicherung der Richtigkeit.

Mit dem Tupelschema der [vorgelagerten Suchimplementierung](https://github.com/MeterApp/vehicle-db/blob/main/src/index.ts) wurden tatsächliche Marken-/Modelldatensätze für SKODA/OCTAVIA, VOLKSWAGEN/GOLF, DACIA/DUSTER, CUPRA/FORMENTOR und TOYOTA/COROLLA bestätigt. Es handelt sich um Katalogbeobachtungen, nicht um hinzugefügte Benutzerfahrzeuge oder Demomessungen.

Qualitätsgrenzen: Die kombinierten Daten enthalten auch getrennte Zeichenfolgen wie OCTAVIA, OCTAVIA COMBI, OCTAVIA ELEGANCE und OCTAVIA ELEGNE. BMW-Namen umfassen sowohl Modellfamilien als auch Motor-/Ausstattungsbezeichnungen. Eine ungefilterte Auswahlliste aller Namen wäre unübersichtlich und teils mehrdeutig. Die Bedeutung des Jahres variiert zwischen Quellen; durch Auffüllen von Beobachtungslücken darf kein Produktionszeitraum abgeleitet werden. Eine vollständige Abdeckung von Generationen, Motorkennbuchstaben, Getriebekombinationen und Werksausstattung wurde nicht nachgewiesen.

## Empfohlener Anwendungsablauf

Einen versionierten Offline-Teildatensatz mit Pkw-Marken-/Modellnamen aus ausdrücklich ausgewählten offenen europäischen Quellen verwenden; Namensnennung und Herkunft erhalten. Akzente und Groß-/Kleinschreibung für die Suche normalisieren, die angezeigte Schreibweise aber beibehalten. Quellen-IDs, stabile interne Kennungen und Originalnamen erhalten, damit geprüfte Aliasse nicht unbemerkt unterschiedliche Autos zusammenführen.

Zuerst eine Markensuche und dann eine auf diese Marke begrenzte Modellsuche anbieten. Beim Markenwechsel eine Modellauswahl der vorherigen Marke löschen. Für fehlende Autos einen ausdrücklichen Weg zur manuellen Eingabe anbieten und bestehende manuell eingegebene Fahrzeugdaten behalten. Das vom Eigentümer bestätigte Produktionsjahr unabhängig von Beobachtungen zum Zulassungsjahr erfassen. Motor und Ausstattung bleiben manuell, bis eine geeignete verifizierte Quelle für technische Daten integriert ist. Der Katalog darf weder eine VIN-Prüfung noch automatische Kompatibilität mit einem OBD-Adapter suggerieren.

Eine spätere Integration benötigt eine festgelegte Quelle/Version, reproduzierbare Extraktion, Kataloghinweise in der App, Tests für markenübergreifende Auswahl/Zurücksetzen/Suche und eine kleine geprüfte europäische Abdeckungsmatrix. Für eine Offline-Auswahl müssen zur Laufzeit weder VIN noch Kennzeichen oder Standort übertragen werden.
