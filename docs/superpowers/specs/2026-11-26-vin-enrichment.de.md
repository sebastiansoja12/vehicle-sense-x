[Polski](2026-11-26-vin-enrichment.md) | [English](2026-11-26-vin-enrichment.en.md) | [Deutsch](2026-11-26-vin-enrichment.de.md)

# Fahrzeugdaten aus der VIN

Das Fahrzeugformular nach gesonderter Zustimmung zur VIN-Übermittlung mit echten NHTSA-vPIC-Daten ergänzen.

Gewählt wurde die öffentliche API ohne Schlüssel; die vollständige SQL-Datenbank ist für ein Telefon zu groß, ein kommerzieller Decoder benötigt Anbieter und Zugangsdaten. Dies ist eine Implementierungsentscheidung im genehmigten Umfang; der Benutzer hat ununterbrochene Ausführung verlangt.

Nur vollständige VIN und Antwort mit ErrorCode=0 für dieselbe VIN. Felder: Marke, Modell, Modelljahr, Hubraum, Getriebe und Antrieb; keine Umrechnung von SAE HP in PS oder abgeleitete Ausstattung. Fehlende Daten bleiben leer; das gespeicherte Jahr als Fahrzeugjahr bezeichnen und ein Modelljahr der Quelle ausdrücklich kennzeichnen.

Ausdrückliche Zustimmung, Vorschau und einzelne Feldauswahl; standardmäßig sind nur leere Felder ausgewählt. Geänderte VIN oder Zielfelder verhindern die Übernahme. Quellenbelege bleiben nur bei unveränderten Werten erhalten; manuelle VIN-Änderung entfernt die Zuordnung. Metadaten gelangen weder zur KI noch in Verkaufsberichte.

Keine neue native Bibliothek. Nur HTTPS zur NHTSA, begrenzte Antwort und Wartezeit, Abbruch bei Schließen/VIN-Änderung, keine VIN-Protokolle oder automatischen Wiederholungen. Manuelle Eingabe und Offline-Katalog bleiben verfügbar.

NHTSA garantiert weder europäische Abdeckung noch vollständige Spezifikationen und bestätigt keine Fahrzeughistorie oder Echtheit. Binärdateien der vorigen Aufgabe enthalten diese neue Funktion nicht.

[NHTSA vPIC API](https://vpic.nhtsa.dot.gov/api/), [vPIC FAQ](https://vpic.nhtsa.dot.gov/api/home/index/faq).
