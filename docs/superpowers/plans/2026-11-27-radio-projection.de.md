[Polski](2026-11-27-radio-projection.md) | [English](2026-11-27-radio-projection.en.md) | [Deutsch](2026-11-27-radio-projection.de.md)

# Plan für Radio ohne Adapter

Ziel: Bluetooth-Audio ohne OBD2 erweitern: echte Audioausgänge prüfen, lokale Fahrzeugübersicht vorlesen und Radioverbindung konfigurieren. Der Benutzer wünscht Umsetzung ohne Rückfragen.

Grenzen: Bluetooth allein fügt einem Radio kein CarPlay/Android Auto hinzu. VehicleSenseX-Projektion ist derzeit nicht implementiert: CarPlay benötigt Entitlement, Profil und native Vorlagen; Android Auto benötigt passende Kategorie und native Oberfläche. Android Car Hardware API bietet ausgewählte Daten nur auf kompatiblen Hosts mit Berechtigungen, ohne universellen DTC-/CAN-Zugriff. Audiowege bestätigen weder Projektion noch Diagnose.

Umsetzung: lokales Expo-Modul liest den aktuellen AVAudioSession-Ausgang unter iOS und verfügbare AudioManager-Ausgänge unter Android. Kein erzwungenes Routing, Gesprächsprofil, Pairing oder Netzwerk. UI unterscheidet verfügbare Ausgänge vom aktiven Audioweg. Aktualisierung bei Rückkehr und manuell. Sprache nur nach Tastendruck; Abbruch beim Verlassen oder im Hintergrund. Übersicht enthält Marke/Modell, gespeicherten Kilometerstand, berechneten Verbrauch und Terminanzahl, ohne VIN, Kennzeichen, Titel oder Notizen. Bestehende Sprachausgabe mit Längenprüfung und Timeout wiederverwenden.

Prüfung: Tests für Übersicht, Datenschutz, native Grenze und Sprachabbruch; vollständige Suite, Typen, Lint, Dokumentation, Autolinking und Exporte. Native Modulkompilierung bei verfügbaren Werkzeugen. Physisches Radio und Apple-Entitlement bleiben externe Voraussetzungen.

[Apple CarPlay](https://developer.apple.com/documentation/carplay/preparing-your-ios-app-for-carplay-development) · [Android for Cars](https://developer.android.com/training/cars) · [Car Hardware API](https://developer.android.com/training/cars/apps/library/car-hardware-api)

Ergebnis: 247/247 Tests, Typen, Lint, Dokumentation und Web-/Android-/iOS-JavaScript/Hermes-Exporte bestanden. Autolinking erkennt das lokale Modul unter Apple und Android; Archivprüfung bestätigt enthaltene Quellen und ausgeschlossene Geheimnisse. Codeprüfung ohne wichtige Probleme. Die Webansicht wird gerendert und deaktiviert Hardwarefunktionen. Xcode, CocoaPods und Android SDK fehlen auf dem Host; Swift/Kotlin wurden daher weder nativ kompiliert noch auf Telefon/Radio getestet. CarPlay-/Android-Auto-Projektion wurde nicht implementiert und kein Entitlement erteilt.
