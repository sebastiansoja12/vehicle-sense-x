[Polski](2026-11-28-automatic-adapter.md) | [English](2026-11-28-automatic-adapter.en.md) | [Deutsch](2026-11-28-automatic-adapter.de.md)

# Automatische Adaptererkennung

> superpowers:executing-plans · superpowers:test-driven-development

[Spec](../specs/2026-11-28-automatic-adapter.de.md)

## Ansatz

Der normale Bildschirm benötigt keine Kennungen, UUIDs, IP-Adresse oder Port. Bluetooth sucht BLE-Geräte und unter Android gekoppelte Classic-Geräte; der Benutzer wählt einen Namen, die App verbindet sofort und prüft ELM-/ECU-Antworten.

Manuelle Konfiguration bleibt in einem standardmäßig geschlossenen erweiterten Bereich. Die Geräteauswahl entfernt alte UUIDs und verwendet das aktuelle Suchergebnis. Die Liste zeigt keine Kennungen. Abbruch, Bildschirmwechsel und verspätete Antworten dürfen keine weitere Verbindung starten. DTC-Löschen und ECU-Bereichsauswahl behalten ihre bisherigen Schutzmaßnahmen.

## Aufgabe 1

mobile/src/obd/adapter-discovery.ts · mobile/tests/obd-adapter-discovery.test.mjs

- [x] ATI: RED → GREEN; Wi-Fi prüft ausschließlich das gespeicherte lokale Profil und den dokumentierten Standard 192.168.0.10:35000 mit ATI. Jeder Prüfsocket wird vor der echten Sitzung mit normalen Zeitlimits geschlossen. Das Telefon muss dem Adapternetz über die Systemeinstellungen beitreten. Kein vollständiger Netzwerkscan oder Versprechen universeller Adapterkompatibilität.
- [x] Bluetooth: deviceId → profile; UUID = empty.

## Aufgabe 2

mobile/src/obd/DiagnosticsScreen.tsx · mobile/tests/obd-screen.test.mjs · mobile/src/obd/wifi.native.ts · mobile/src/obd/wifi.web.ts

- [ ] UI: RED → GREEN; Der normale Bildschirm benötigt keine Kennungen, UUIDs, IP-Adresse oder Port. Bluetooth sucht BLE-Geräte und unter Android gekoppelte Classic-Geräte; der Benutzer wählt einen Namen, die App verbindet sofort und prüft ELM-/ECU-Antworten.
- [ ] Tests und Grenzen: tests; typecheck; lint; PL/EN/DE; web; iOS/Android Hermes.
- [ ] Review; commit; push main.
