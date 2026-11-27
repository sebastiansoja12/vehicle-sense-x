[Polski](2026-11-26-automotive-services.md) | [English](2026-11-26-automotive-services.en.md) | [Deutsch](2026-11-26-automotive-services.de.md)

# Werkstätten und Teilepreise

Entscheidung nach Nutzerfreigabe: bestehende Expo-App ohne neue Abhängigkeiten erweitern. Werkstätten und Angebote direkt in der App anzeigen.

Werkstätten: polnischer Ort oder GPS, Ortsauswahl, Radius 5/10/25 km, Reparatur/Reifen/Prüfung/Teilehandel, Luftlinie, Adresse, Telefon, Öffnungszeiten und Navigation. OpenStreetMap über Server, Nominatim und Overpass. Daten können unvollständig sein.

Teile: eBay Polen Browse API mit OAuth auf dem Server. Suche/OEM und optional Marke/Modell/Jahr/Motor, ohne VIN und Kennzeichen. Preis mit Währung, bekannte Versandkosten, Verkäufer, Zustand, Quelle und Abrufzeit. Keine Passformgarantie.

Privater Server mit App-Token, unabhängig vom KI-Schlüssel. Fehlende eBay-Schlüssel sperren Angebote mit klarem Fehler. Zustimmung vor Übertragung von Ort oder Suche. Abbruch, Limits, Cache und Antwortvalidierung. Keine Änderung des Garagenschemas; Ergebnisse und Token nur im Speicher. Bestehende Diagnose und Radio bleiben Grundlage.

Externe Karten-/Shoplinks wurden abgelehnt, offizielle APIs gewählt. Eigener Gesamtkatalog, Buchung und Zahlung benötigen weitere Vereinbarungen. Öffentliche OSM-Dienste nur für mäßige private Nutzung; Produktion benötigt eigene Dienste. Hardwaretests und eBay-Produktionszugang bleiben erforderlich.
