[Polski](2026-11-26-accessories.md) | [English](2026-11-26-accessories.en.md) | [Deutsch](2026-11-26-accessories.de.md)

# Plan für das Zubehörmodul

Ziel: empfohlene Zubehörarten für die Marke des aktiven Fahrzeugs, erreichbar über Garage und Start. Entscheidungen des Implementierers gemäß dem Wunsch nach Umsetzung ohne Rückfragen: redaktioneller Offline-Katalog für alle 563 Garagenmarken und manuelle Einträge, vier Kategorien, Allegro-Angebotssuche und zusätzliche offizielle Kataloge für 19 Hersteller, geprüft am 26.–27. November 2026. Die Markenauswahl bestätigt keine Teilekompatibilität.

## Umfang und Einschränkungen

Bestehendes Expo SDK 58 und gemeinsame UI-Komponenten. Keine Abhängigkeiten, Preise, Migrationen, automatischen Abrufe oder Übertragung von VIN/Kennzeichen. Links öffnen sich erst nach einem Klick, mit Fehlerbehandlung. Herstellerquellen belegen Kataloge und Produktarten; Reihenfolge und Begründungen sind redaktionelle Entscheidungen der App. Ein externer Angebotsaggregator wurde erwogen; ein statischer Katalog erfüllt die Anforderungen ohne Schlüssel, Server oder Profiling-Einwilligung. Bestehende Serveränderungen bleiben außerhalb des Umfangs.

## Umsetzung

- [x] Zuerst Markenerkennung, unbekannte Marken, Filter, Suche und Quellen testen; fehlende Implementierung bestätigen.
- [x] Daten und Auswahl in `mobile/src/accessories.ts`, Tests in `mobile/tests/accessories.test.mjs`.
- [x] Ansicht in `mobile/src/AccessoriesScreen.tsx`, Route `mobile/src/app/accessories.tsx`, Registrierung in `mobile/src/app/_layout.tsx` und Einstiege in `mobile/src/screens.tsx`.
- [x] Leere Garage, keine Ergebnisse, Fahrzeugwechsel und Fehler beim Öffnen von Quellen benötigen verständliche Oberflächen.
- [x] PL/EN/DE-Anleitungen ergänzen, vollständige Tests, Typen, Lint, Dokumentationsprüfung, Webexport und Ansichtskontrolle ausführen.

## Prüfung

Wichtige Fälle: VW-Alias und Škoda-Schreibweise, manuelle Namen, Trennung der BMW-Empfehlungen von anderen Marken, kombinierte Filter und Offline-Nutzung. Keine Garantie für generationsspezifische Kompatibilität oder aktuelle Preise. Physische Telefone gehören nicht zur lokalen Prüfung.

## Prüfung der ersten Version vom 26. November 2026

231/231 Anwendungstests, Typen, Lint, Dokumentationsprüfung sowie Web- und Android/iOS-JavaScript/Hermes-Exporte bestanden. Der erste Netzwerktestlauf wurde durch die Sandbox eingeschränkt; die Wiederholung mit Zugriff auf lokale Ports bestand vollständig. Die Codeprüfung ergab keine wichtigen Fehler.

Browserprüfungen bei 390 px umfassten eine leere Garage, das Hinzufügen eines Test-BMW, Einstiege über Garage und Start, die Kategorie Komfort, Suche ohne Akzente, keine Ergebnisse, Filterrücksetzung, Kartenlayout und den Übergang zum echten BMW-Katalog. Der einfache statische Vorschauserver hat keine Rückfallregel auf die Hauptseite für Routen; das produktive Webhosting muss Anwendungsrouten unterstützen. Keine signierten Pakete oder Telefon-/Screenreader-Tests durchgeführt.

## Erweiterung am 27. November 2026

Auf Wunsch des Benutzers umfasst das Modul jede Marke des Garagenkatalogs (563) und manuelle Einträge. Profile entstehen aus dem bestehenden Katalog ohne zweite Markenliste. Gemeinsame Vorschläge bieten jeder Marke vier Kategorien; geprüfte BMW-/Dacia-Systeme bleiben ihrer jeweiligen Marke zugeordnet. Jede Karte bietet Allegro-Suchen nach Marke, Modell, Modelljahr und Produktart. Dies ist eine Suche und keine Bestätigung von Verfügbarkeit oder Passform. Zusätzliche Herstellerkataloge decken 19 Marken ab. Seiten erhalten Daten erst nach einem Klick; Suchadressen enthalten weder VIN, Kennzeichen noch Historie oder Notizen. Ein Test durchläuft alle Katalogmarken und prüft vier Kategorien, manuelle Einträge, Sonderzeichen und den Schutz privater Daten.

Prüfung der Erweiterung: 7/7 Modultests (einschließlich jeder Marke und Kategorie), vollständige Testsuite mit 242/242, Typen, Lint, Dokumentation und Web-/Android-/iOS-JavaScript/Hermes-Exporte bestanden. Codeprüfung ohne wichtige Fehler. Browserprüfungen umfassten einen Saab 9-3 von 2008, sechs Vorschläge, Angebotssuche, die korrekte Suchadresse und Rückkehr zur App. Allegro verlangte CAPTCHA in der Testumgebung; Ergebnisinhalte wurden nicht geprüft. Physische Telefone wurden nicht getestet.
