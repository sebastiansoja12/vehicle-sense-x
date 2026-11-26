[Polski](2026-11-25-offline-catalog-design.md) | [English](2026-11-25-offline-catalog-design.en.md) | [Deutsch](2026-11-25-offline-catalog-design.de.md)

# Offline-Auswahl von Marke und Modell

Der Benutzer hat ausdrücklich die Anbindung des recherchierten Offline-Katalogs bei Erhalt manueller Eingabe angefordert. Frühere Anweisungen autorisieren fortlaufende Implementierung ohne wiederholte Entwurfsfreigabe. Die Arbeit bleibt im aktuellen Checkout mit der vorhandenen uncommitteten Anwendung; Commits, Merges oder Veröffentlichung sind kein Teil dieser Änderung.

Einen festgelegten, per Hash geprüften MeterApp-vehicle-db-Snapshot verwenden und Pkw-/MPV-Namen nur aus NHTSA, UK DfT, EEA und RDW extrahieren. Quellenhinweise und Datumsangaben erhalten. Andere Quellen ausschließen, statt Weiterverwendungsrechte abzuleiten. Eine kleinere mitgelieferte Namensliste generieren; keine Laufzeitanfragen, VIN-Uploads, Paketabhängigkeit oder Ableitung von Jahren/technischen Daten. Duplikate nach Groß-/Kleinschreibung/Diakritika zusammenführen, während modellunterscheidende Interpunktion (z. B. Golf+) getrennt bleibt. Namen müssen in die bestehenden Marken-/Modellgrenzen von 60/80 Zeichen passen.

Das Fahrzeugformular verwendet Marken- und markengebundene Modellauswahlfelder mit Suchfeld und begrenzter Ergebnisliste. Suchtext ist von bestätigten Werten getrennt. Die Wahl einer anderen Marke löscht das alte Modell. Manuelle Eingabe ist immer verfügbar; Moduswechsel erhalten eingegebene Werte. Beim Bearbeiten vorhandener Fahrzeuge außerhalb des Katalogs öffnet sich der manuelle Modus mit Erhalt sämtlicher bestehender Texte. Andere Felder und Speicherschema bleiben unverändert.

Erwogene Ansätze: Das vollständige Node-Paket mitzuliefern fügt irrelevante Daten/API und Größe hinzu; eine Online-API widerspricht der Offline-Auswahl. Der ausgewählte generierte Teildatensatz folgt der gewünschten Offline-Ausrichtung und ermöglicht eine reproduzierbare Prüfung jeder Quelle.

Überprüfung: Extraktion mit gemischten erlaubten/ausgeschlossenen Quellen; echte mitgelieferte europäische Paare; Suche nach Groß-/Kleinschreibung/Diakritika und Interpunktion; Markenwechsel; Bearbeiten/manueller Hin- und Rückwechsel; bestehende Sicherung speichern. Typprüfung/Lint, vollständige Tests, Bundle-Export für drei Plattformen und Browser-QA im Telefonformat. Eine Auswahlfunktion ist keine Bestätigung von Werksdaten oder eines vollständigen Fahrzeugkatalogs.
