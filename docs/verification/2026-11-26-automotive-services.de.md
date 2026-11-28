[Polski](2026-11-26-automotive-services.md) | [English](2026-11-26-automotive-services.en.md) | [Deutsch](2026-11-26-automotive-services.de.md)

# Werkstätten und Teilepreise — Prüfung

Werkstatt- und Teileangebotseiten, validierten abbrechbaren Client, authentifizierte Serverrouten und offizielle Anbieteradapter implementiert und eingebunden. Konfiguration und Token nur im Sitzungsspeicher. Keine Garagenmigration oder Abhängigkeiten. Wie angewiesen ohne weitere Fragen im bestehenden Verzeichnis und Branch gearbeitet; parallele fremde Änderungen erhalten.

Ergebnisse: 231 Tests bestanden, keine Fehler. Neue Tests umfassen 7 Client- und 7 Serverfälle. Typen, Lint, Dokumentation und Diff-Prüfung bestanden. Web-Export und Hermes-Pakete für iOS/Android erfolgreich. Keine signierten installierbaren APK/IPA-Artefakte.

```sh
node --test tests.mjs tests/*.test.mjs mobile/tests/*.test.mjs server/*.test.mjs
npm run typecheck --prefix mobile
npm run lint --prefix mobile
python3 scripts/check-docs.py
npm run export:web --prefix mobile
npm run export:native --prefix mobile -- --output-dir /tmp/vehiclesensex-native-final
git diff --check
```

Codereview fand blockierte Suche nach Rückkehr aus Einstellungen und ein zu niedriges Overpass-Ausführungsspeicherlimit. Status beim erneuten Fokus zurückgesetzt und Query-Speicherlimit entfernt, bei weiterhin begrenzten Antwortbytes. Fahrzeug-/Konfigurationswechsel erzeugen neuen Seitenkontext und brechen alte Anfragen ab.

Tatsächliche lokale Browseroberfläche und Ansicht 390×844 mit kontrolliertem Anbietertransport geprüft: Konfiguration, Zustimmung, Ortssuche, Ortsauswahl, Werkstatt mit Telefon/Navigation, zwei Angebote in unterschiedlichen Währungen, unbekannter Versand, bekannte Versandgesamtsumme, manueller Abbruch und Wechsel zu Einstellungen während aktiver Anfrage. Nach Rückkehr waren Eingaben und Suche aktiv, ohne verspätetes Ergebnis. Testdaten nur im temporären lokalen Testprozess.

Keine Liveanbieterprüfung: automatische Freigabeprüfung lehnte OSM-Test wegen Übertragung konkreter Testkoordinaten ab. Beschränkung nicht umgangen. Keine private Serverkonfiguration oder eBay-Produktionsschlüssel lokal vorhanden. Echte Preise benötigen Konto und Browse-API-Zugang. GPS, OBD und Radio benötigen Hardwaretests. Keine öffentliche Bereitstellung. Einrichtung: [Dienste](../../mobile/SERVICES.de.md).
