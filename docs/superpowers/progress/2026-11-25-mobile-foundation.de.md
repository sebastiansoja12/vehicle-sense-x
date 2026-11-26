[Polski](2026-11-25-mobile-foundation.md) | [English](2026-11-25-mobile-foundation.en.md) | [Deutsch](2026-11-25-mobile-foundation.de.md)

# SDD-Protokoll — Plan: docs/superpowers/plans/2026-11-25-mobile-foundation.md

- Entscheidung: Unter `mobile/` im aktuellen Repository ohne ersten Commit implementieren. Kein früherer Commit für einen isolierten Worktree vorhanden; der Erhalt des laufenden freigegebenen Prototyps hat Vorrang vor dem Erzeugen einer Historie allein für Werkzeuge. Nachteil: kein Git-Commitbereich für die Prüfung; der Prüfer erhält genaue neue Dateipfade.
- Entscheidung: Der Benutzer hat den visuellen Entwurf bereits freigegeben und die Implementierung angefordert. Das vorhandene README und die Beschreibung der acht Module bestimmen den autorisierten Umfang; die neue Spezifikation dokumentiert Implementierungsentscheidungen ohne erneute Freigabeanforderung. Nachteil: Die Technologien bleiben die Wahl des Implementierenden und können vor einer Store-Veröffentlichung ersetzt werden.
- Umsetzungsprüfung: Ein unvoreingenommener Prüfer fand keine Widersprüche oder fehlenden Produktentscheidungen, die die Implementierung blockieren.
- Vorprüfung: Modellschnittstellen werden von Speicherung und Bildschirmen gemeinsam genutzt; `vehicleId`, ganzzahlige Cent/ml und nullable Verbrauch sind konsistent.
- Entscheidung: Die generierte Expo AGENTS.md verlangt Expo Router. Dokumentierte Dateirouten unter `mobile/src/app/` statt eines eigenen zustandsbasierten Navigators verwenden. Nachteil: zusätzliche SDK-kompatible Routing-Abhängigkeiten.
- Aufgabe 1: abgeschlossen. RED: 11 Tests schlagen vor der Implementierung fehl; GREEN: 11/11 `node --test mobile/tests/domain.test.mjs`.
- Entscheidung: Für privilegierte npm-/Expo-Befehle den ausdrücklichen Node-24-Pfad verwenden. Die privilegierte Shell verwendet sonst Node 20, unterhalb der Mindestanforderung von SDK 58. Keine systemweite Node-Installation geändert.

- Aufgabe 2: abgeschlossen. Repository-Tests vor Implementierung RED, danach GREEN. Abgelehnte Speicherung erhält gespeicherten und bestätigten Zustand; beschädigter Zustand wird nicht zurückgesetzt.
- Abschlussprüfung: Ein unvoreingenommener Prüfer identifizierte drei wichtige Datenintegritätsprobleme. Keine kritischen oder geringfügigen Befunde.
- Abschluss: Überschreiben durch veraltete Register und Überschreiben neuerer Schemas behoben — drei Repository-Regressionstests RED→GREEN; Web Locks serialisieren Webänderungen, die innerhalb der Sperre das neueste validierte Dokument lesen.
- Abschluss: gespeicherte Tankchronologie korrigiert — Regressionstest für rückläufigen Kilometerstand in Kalenderreihenfolge RED→GREEN.
- Abschluss: Übernahme des Kilometerstands des aktiven Autos im Formular für ein zweites Auto behoben — Browser reproduzierte vor der Korrektur 68450 statt leer; leerer Kilometerstand nach Neuladen des korrigierten Providers bestätigt.
- Aufgabe 3: abgeschlossen. Browser bestätigte erstes Fahrzeug, Tanken mit polnischem Dezimalkomma (262.85 PLN), Wartung (250.99 PLN), Summe nach Neuladen (513.84 PLN), zweites Auto bei 5000 km und null unabhängige Kosten. Verlassen der Demo führte zur leeren eigenen Garage zurück, bevor temporäre QA-Einträge hinzugefügt wurden.
- Entscheidung: Temporäre Browser-QA lief unter 127.0.0.1:8081; saubere Vorschau wird unter 127.0.0.1:8083 bereitgestellt, da localhost:8081 auf einen anderen vorhandenen Dienst zeigt. Nachteil: die genaue Vorschau-URL verwenden. Kein anderer Dienst wurde geändert. Eigener QA-Server nach Prüfung beendet.
- Entscheidung: Physische iOS-Tests sind nicht möglich: xcodebuild meldet Command Line Tools ohne Xcode. JS-/Hermes-Bundles sind geprüft; signierte Builds und Tastatur-/Zurück-Verhalten auf physischen Geräten bleiben ungeprüft.
- Abschlussprüfung: 23/23 Tests (19 mobil + 4 Prototyp), TypeScript, ESLint ohne Fehler oder Warnungen, Webexport und iOS-/Android-Hermes-Bundle-Exporte. Keine Store-Einreichung, kein Git-Push oder Merge. Implementierung bleibt im aktuellen Checkout uncommittet; ursprünglicher Prototyp erhalten.
- Zurückgestellte geringfügige Befunde: keine aus der unabhängigen Prüfung. Fehlendes Bearbeiten/Löschen, Sicherungsexport und Hardwareintegrationen sind dokumentierte Umfangsgrenzen.
