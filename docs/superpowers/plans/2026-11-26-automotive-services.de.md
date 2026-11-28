[Polski](2026-11-26-automotive-services.md) | [English](2026-11-26-automotive-services.en.md) | [Deutsch](2026-11-26-automotive-services.de.md)

# Automotive services Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans. User authorized continuous execution without additional questions.

Goal: Werkstätten und Teilepreise in bestehender App. Architecture: privater Anbieter-Proxy und zwei Expo-Seiten. Tech Stack: Node, TypeScript, React Native, Expo 58. Spec: ../../specs/2026-11-26-automotive-services.de.md

Global Constraints: keine Abhängigkeiten oder Demodaten; keine VIN/Kennzeichen; Originalwährungen; Zustimmung für Suche und GPS; Token nur im Speicher.

Review Focus: ungültiger Ort, Abbruch/Fahrzeugwechsel, fehlende Preise/Versand, unsichere URLs, fehlende API-Schlüssel.

Task 1: Server. Tests in server/automotive.test.mjs für Autorisierung unabhängig von KI, feste URLs, ungültige Eingaben, Cache, unvollständige OSM-Daten, Geld und unbekannten Versand. server/automotive.mjs und Routen in server/index.mjs, Docker und Konfiguration implementieren. node --test server/*.test.mjs ausführen.

Task 2: Client. Tests in mobile/tests/automotive.test.mjs für Antwortvalidierung, Zustimmung, Positivliste, Abbruch und Timeout. mobile/src/automotive-client.ts, AutomotiveProvider.tsx, WorkshopsScreen.tsx, PartsScreen.tsx, Routen und Links in Garage/Start/Wartung implementieren.

Task 3: Dokumentation PL/EN/DE, Datenschutz und GPS-Rechte. Alle Tests, Typen, Lint, Dokumentationsprüfung und Web-Export. Ergebnisse und Grenzen festhalten. Ohne weitere Freigabe fortfahren; fremde Änderungen nicht committen.
