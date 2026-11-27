[Polski](DIAGNOSTIC-COMPARISON.md) | [English](DIAGNOSTIC-COMPARISON.en.md) | [Deutsch](DIAGNOSTIC-COMPARISON.de.md)

# Diagnosevergleich und Werkstattbericht

Die Seite ist über Diagnose oder Garage erreichbar. Sie arbeitet offline mit zwei gespeicherten Messungen des ausgewählten Autos, ohne neue OBD-Befehle, KI-Anfragen oder Anbieterschlüssel.

## Messungen auswählen

B ist standardmäßig die neueste Messung; A die nächstfrühere mit gleicher ECU-Adresse und gleichem Protokoll. Falls keine passt, wird die nächstfrühere gewählt, aber Unterschiede bei unbekanntem oder anderem Bereich deaktiviert. Gleiche Zeitstempel begründen keine Reihenfolge. Andere A/B aus einer Liste mit je 20 Einträgen wählen. A muss verschieden und älter sein. Gelöschte Auswahl erneut wählen; Fahrzeugwechsel setzt Auswahl und Symptome zurück.

## Bedeutung des Vergleichs

Codes werden getrennt nach gespeichertem, ausstehendem und dauerhaftem Status verglichen. In einem Bericht nicht gelesener Status bleibt unbekannt. Derselbe Code in zwei Status bleibt zwei Einträge, ohne Zusammenführung zu einem Fehler. Fehlen in B bedeutet nur dort nicht beobachtet, keine bestätigte Reparatur. Unbekannter oder anderer ECU-Bereich zeigt beide Rohcodelisten ohne Änderungen. Importe sind als ungeprüft markiert.

Drehzahl, Kühlmitteltemperatur, Last und Adapterspannung zeigen A, B und B minus A nur bei passender ECU und zwei vorhandenen Werten. Null bleibt Null; fehlende Messung ohne Differenz. Zwei Momentaufnahmen, kein Trend oder Verbesserungswert. Fahrbedingungen, Temperaturen oder vorheriges Löschen können Ergebnisse ändern. Adapterspannung ist kein Batteriezustandstest.

## Bericht und Datenschutz

Optional bis zu 2000 Zeichen für Symptome und Bedingungen eingeben. Text wird nicht in Garage oder Backup gespeichert; Verlassen der Seite kann ihn verwerfen. HTML im Browser oder PDF am Telefon enthält Fahrzeugbeschreibung, UTC-Zeiten, Quellen/Bereiche, beide Codelisten, Parameter und Grenzen. VIN, Kennzeichen, Fotos, GPS und Servicenotizen fehlen. Adapternamen und Symptome werden wie eingegeben exportiert: vor Weitergabe prüfen.

Export erfolgt lokal; Systemfreigabe kann den Bericht an die gewählte Anwendung senden. Benutzer-HTML wird maskiert, keine Netzwerkressourcen werden geladen. Keine Diagnose, Reparaturbestätigung oder technische Prüfung. Enthält nur zwei gewählte Messungen, nicht die gesamte Historie.

## Prüfung

Tests prüfen Zeitfolge, ECU-/Protokollbereich, andere Autos, fehlende gemeinsame Status, Null/null, Standardauswahl, Importe, Validierung und Datenschutz/HTML-Maskierung. Bestehendes Datenschema und Export; Garagenkopien bleiben kompatibel.
