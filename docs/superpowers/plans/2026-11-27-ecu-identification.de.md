[Polski](2026-11-27-ecu-identification.md) | [English](2026-11-27-ecu-identification.en.md) | [Deutsch](2026-11-27-ecu-identification.de.md)

# ECU-Identifikation

> superpowers:executing-plans

[Spec](../specs/2026-11-27-ecu-identification.de.md)

## Task 1: Identifikationsdecoder und Validierung

- [x] Tests für 09-00-Maske, CALID, CVN, ECU-Name, negative Antworten und Import schreiben; Fehler beobachten, dann Decoder und Erweiterungsvalidierung implementieren.

```sh
node --test mobile/tests/obd-identification.test.mjs
```

Erwartet: neue Tests schlagen zuerst fehl und bestehen anschließend; kein Messwertgenerator und kein Schreiben in die ECU.

## Task 2: Optionaler CAN-Scan und Antwortzustände

- [x] Tests an der CAN-Transportgrenze schreiben: nur gemeldete Typen, separate Aktivierung, kein VIN, Mehrrahmenantworten, andere ECU und NRC 78. Scanoption, Fortschritt und Identifikation im exakten Bericht ergänzen.

```sh
node --test mobile/tests/obd-identification-driver.test.mjs
```

Erwartet: neue Tests schlagen zuerst fehl und bestehen anschließend; kein Messwertgenerator und kein Schreiben in die ECU.

## Task 3: Oberfläche, Vergleiche und sichere Exporte

- [ ] Exporte, Sicherungen, Ausschluss aus Verkaufsbericht/KI und Vergleiche testen. Vollständigen CAN-Scan, Details, Exporthinweis und Datenvergleiche ergänzen.

```sh
node --test mobile/tests/obd-identification-reports.test.mjs mobile/tests/obd-screen.test.mjs
```

Erwartet: neue Tests schlagen zuerst fehl und bestehen anschließend; kein Messwertgenerator und kein Schreiben in die ECU.

## Task 4: Vollständige Prüfung, Review, Dokumentation und gepushte Commits

- [ ] Alle Tests, Typen, Lint, PL/EN/DE-Prüfung und Web-/Hermes-Exporte ausführen. Frisches Review anfordern, bestätigte Befunde mit Tests beheben und Commits ohne Co-authored pushen.

```sh
node --test tests.mjs tests/*.test.mjs mobile/tests/*.test.mjs server/*.test.mjs
```

Erwartet: neue Tests schlagen zuerst fehl und bestehen anschließend; kein Messwertgenerator und kein Schreiben in die ECU.

