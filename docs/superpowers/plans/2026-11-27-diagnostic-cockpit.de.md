[Polski](2026-11-27-diagnostic-cockpit.md) | [English](2026-11-27-diagnostic-cockpit.en.md) | [Deutsch](2026-11-27-diagnostic-cockpit.de.md)

# Diagnosecockpit und Fahrzeugansicht

Animiertes Cockpit für Telefon/Tablet und eigenständige Android-Radios: aktives Fahrzeug, eigenes Foto, vier echte Parameter, Quelle/Zeit, ECU-Umfang und Fehlerstatus. Balken animieren nur Messwertänderungen und beachten reduzierte Bewegung. Fehlende Fotos werden nicht durch andere Autos ersetzt. Eingebettete Diagnoseansicht erhält die Verbindung; eigene Route zeigt gespeicherte Messungen. Fehlende oder veraltete Daten werden weder zu Null noch Live.

Die native CarPlay-Ansicht nutzt Systemlisten, echtes Fahrzeugfoto und gespeicherte Diagnostik mit Zeit/Umfang. Sie imitiert kein animiertes Cockpit und aktualisiert die UI höchstens alle 10 Sekunden. Daten ohne VIN/Kennzeichen/Notizen bleiben nur im Prozessspeicher; nach Neustart ist die Synchronisierung mit der geöffneten App erforderlich. Szenen-/Entitlement-Konfiguration ist optional und bis Apple-Zustimmung deaktiviert. Ohne Diagnosekategorie in Android Auto wird die App nicht als Navigation, Medien oder IoT deklariert. Das vollständige Cockpit bleibt App-UI und keine Android-Auto-Projektion.

Tests zuerst: Fahrzeug-/ECU-Trennung, Aktualität/Herkunft, fehlende Daten, echtes Foto, Payload ohne Kennungen und explizites Plugin-Opt-in. Dann Modell, Cockpit, Einbettung, CarPlay-Szene und Synchronisierung. Gesamte Testsuite, Typen, Lint, Dokumentation, CNG-Konfiguration, Exporte und UI prüfen. Fehlende Xcode-/Android-SDK-Werkzeuge und Apple-Zustimmung begrenzen native Tests und Veröffentlichung; Quellcode nicht als auf einem Radio laufend beschreiben.

## Prüfergebnisse

Gesamte Suite: 273 Tests bestanden, darunter 10 für Cockpit-Modell, native Brücke und CarPlay-Konfiguration. Typen, Lint, Dokumentationsprüfung und JS-Exporte für Web/iOS/Android bestanden. Apple-Autolinking erkennt das lokale Radiomodul. Konfiguration mit deaktiviertem, aktiviertem und erneut deaktiviertem Plugin geprüft; Telefonszenen und fremde CarPlay-Szenen bleiben erhalten.

Web-Vorschau: leere Garage, Testfahrzeug anlegen, Navigation von Garage zum Cockpit, fehlende Messungen als Striche, Layouts mit 390 × 844 und 1280 × 800, Rückkehr zur Diagnose und sichtbarer Adapterfehler im eingebetteten Cockpit. Testdaten bleiben in einer separaten lokalen Vorschau. Codeprüfung fand versteckte Fehler, verbleibende Konfiguration nach Deaktivierung und Alt-Cache-Risiko; Meldung und Konfigurationsentfernung korrigiert, Cache durch Prozessspeicher ersetzt.

Keine Swift-/Kotlin-Kompilierung, Geräteprüfung, CarPlay-Simulator- oder Radioprüfung und keine Apple-Genehmigung. JS-Exporte und Autolinking bestätigen diese Schritte nicht. [Cockpit-Anleitung](../../../mobile/COCKPIT.de.md)

## Fortsetzung: Sitzungssteuerung im Cockpit

Ziel: Auslesen, ECU wählen, Bericht speichern, verbinden und trennen, ohne das Cockpit zu verlassen. Bestehende Diagnoseaktionen und ihre Operationssperre weiterverwenden, ohne zweiten Transport. Die Profilkonfiguration öffnet das bisherige Formular. Gespeichert wird der vollständige Bericht, nicht spätere Live-Proben.

Das Diagramm hält bis zu 60 echte Proben im zuletzt erfassten Fenster von höchstens 5 Minuten im Speicher. Daten müssen Fahrzeug, Adapter, ECU und aktuellem vollständigem Auslesen entsprechen; doppelte, zukünftige und ältere Antworten werden ignoriert. Fehlende Parameter und Lücken über 15 Sekunden unterbrechen die Linie. Metrikauswahl zeigt beobachteten Wertebereich und Zeit. Neues vollständiges Auslesen oder ECU-Auswahl startet ein neues Diagramm. Keine neuen Treiber, Android-Auto-Kategorien oder Entitlement-Änderungen.

Reihenfolge: Isolations- und Geometrietests, Probenmodell, SVG-Diagramm mit bestehender Bibliothek, Cockpit-Aktionen, Dokumentation und Typen/Lint/Tests/Exporte sowie Vorschau. Sperren bei belegtem Adapter und fehlende Messungen ebenfalls prüfen.

Fortsetzung geprüft: 283 Tests der gesamten Suite bestanden; 5 neue Diagrammtests decken Grenzen, Duplikate, Isolation, fehlende Daten, Lücken, konstante Werte und vollständigen Bericht mit Emissionsbereitschaft ab. Typen, Lint, Dokumentation und JS-Exporte für Web/iOS/Android bestanden. Telefonvorschau bestätigt Verbindungs-/Konfigurationstasten, sichtbaren Verbindungsfehler, gesperrtes Auslesen/Live/Speichern ohne Sitzung, Metrikauswahl und Rückkehr zur Konfiguration. Prüfung präzisierte die Beschreibung des angehaltenen Erfassungsfensters; die Metrikbeschriftung kennzeichnet zusätzlich die Auswahl. Diagrammbetrieb mit echtem Adapter und native Kompilierung bleiben ungeprüft. Auf Benutzerwunsch wurde ein lokaler main-Branch mit allen nicht eingecheckten Änderungen angelegt.
