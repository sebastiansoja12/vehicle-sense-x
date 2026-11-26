[Polski](VIN.md) | [English](VIN.en.md) | [Deutsch](VIN.de.md)

# Fahrzeugdaten aus der VIN

Das Formular zum Hinzufügen und Bearbeiten eines Autos kann echte Daten von NHTSA vPIC abrufen. Der Offline-Katalog und die manuelle Fahrzeugeingabe benötigen diesen Dienst nicht. NHTSA garantiert weder die Abdeckung aller Marken und Märkte, besonders der europäischen, noch vollständige Werksdaten. Das Ergebnis bestätigt weder Historie, Ausstattung, Eigentum noch Echtheit des Fahrzeugs.

## Zustimmung und Verwendung

1. Eine vollständige VIN mit 17 Zeichen eingeben. Ein leeres Feld, unzulässige Zeichen und eine Nummer aus lauter Nullen lösen keine Anfrage aus.
2. Der Übertragung dieser VIN an den US-Dienst NHTSA über HTTPS gesondert zustimmen. Weder Kennzeichen, Kilometerstand, Historie noch KI-Daten werden gesendet. Eine VIN-Änderung setzt die Zustimmung zurück und bricht die vorherige Anfrage ab; auch das Schließen des Formulars bricht sie ab.
3. Die Abrufschaltfläche drücken. Es gibt keine automatischen Anfragen oder Wiederholungen. Internetzugriff wird nur für diese Funktion benötigt.
4. Die Vorschau prüfen und die zu übernehmenden Felder auswählen. Standardmäßig sind ausschließlich leere Felder ausgewählt. Wird ein ausgewähltes Feld während des Abrufs geändert, ist das Übernehmen gesperrt; Änderungen anderer Felder bleiben erhalten. Ein Marken- oder Modellwechsel darf Werte nicht mit einer widersprüchlichen bestehenden Kombination verbinden.
5. Das Übernehmen ergänzt das Formular, nicht die gespeicherte Garage. Das Auto über eine separate Schaltfläche speichern. Beim Abbrechen wird kein Fahrzeug erstellt.

## Daten und Quelle

Übernommen werden nur ausdrücklich vorliegende Felder: Marke, Modell, Modelljahr, ganzzahliger Hubraum in cm³, Getriebe und Antrieb. Das Modelljahr kann vom Produktionsdatum abweichen. Motor oder Ausführung werden nicht durch Raten ergänzt, SAE HP wird nicht in metrische PS (KM) umgerechnet, ein Hubraum mit Nachkommastellen wird nicht gerundet und Ausstattung wird nicht erfunden. Fehlende oder nicht unterstützte Felder bleiben zur manuellen Eingabe offen.

Die Datenübernahme erfordert eine einzelne Antwort, dieselbe vollständige VIN und `ErrorCode=0`. Warnungen und teilweise Dekodierungen werden nicht als gesichertes Ergebnis behandelt. Der Dienst begrenzt den Anfrageverkehr; Fehler oder fehlende Daten blockieren die manuelle Eingabe nicht.

Die gespeicherte Quelle `nhtsa-vpic` enthält VIN, Abrufzeit und ausgewählte Werte. Die Garage zeigt, welche Felder noch dem Ergebnis entsprechen. Eine manuelle Feldänderung entfernt den Beleg für dieses Feld; ein manueller oder per OBD vorgenommener VIN-Wechsel entfernt die Zuordnung zu einer anderen Nummer. Bei erneutem Übernehmen werden nur ausgewählte Felder des neuen Ergebnisses gespeichert, damit ein altes Ergebnis kein neues Datum erhält. Die JSON-Sicherung erhält diese Metadaten; der Import lehnt abweichende VINs, unbekannte Quelltypen und nicht zum Auto passende Felder ab. Die Metadaten sind kein signiertes Herstellerzertifikat.

VIN und ihre Quellen gelangen nicht automatisch an die KI oder in den Verkaufsbericht. Die vollständige JSON-Sicherung enthält sie ebenso wie die VIN selbst. Eine manuell eingegebene Frage an den Assistenten ist ein separater Text — darin keine personenbezogenen Daten angeben. NHTSA verantwortet die eigene Verarbeitung der Anfragen; eine Löschung der VIN aus Anbieterprotokollen wird nicht zugesagt.

## Integration und Überprüfung

`vin-client.ts` verwendet ausschließlich den offiziellen HTTPS-Endpunkt, ein Zeitlimit von 20 s und ein Antwortlimit von 128 KiB, ohne Zugangsdaten oder automatische Wiederholungen. Der Browserstream wird byteweise begrenzt; natives Fetch kann Text zuvor puffern, daher wird die Grenze nach dem Lesen geprüft. Eine alte oder verspätete Antwort darf das Formular nicht überschreiben. Unverarbeitete Anbieterfehler und VIN werden vom Client nicht protokolliert.

Tests decken Zustimmung, fehlerhafte und teilweise Daten, Größe, Abbruch, das Zeitlimit trotz ignoriertem Signal, veraltete Felder, Quellenzuordnungen, Sicherungen und Ausschluss aus KI/Bericht ab. Der echte Client und das Webformular wurden mit einer öffentlichen Beispiel-VIN geprüft, ohne ein Beispielfahrzeug in der Garage zu speichern. 161 Tests, Typprüfung und Lint bestanden. Physische Geräte und das Netzwerkverhalten des Betriebssystems erfordern eine separate Überprüfung; die früheren Binärdateien der Version 0.2.0 enthalten die Funktionen der Version 0.2.1 nicht.

Quellen: [NHTSA vPIC API](https://vpic.nhtsa.dot.gov/api/), [FAQ und Einschränkungen](https://vpic.nhtsa.dot.gov/api/home/index/faq), [offizielles Datenbeispiel](https://www.nhtsa.gov/sites/nhtsa.gov/files/frenchik-vin-vpic.pdf).
