[Polski](COCKPIT.md) | [English](COCKPIT.en.md) | [Deutsch](COCKPIT.de.md)

# Diagnose-Cockpit

In der Diagnose „Otwórz animowany kokpit” wählen. Die Ansicht erhält die aktuelle OBD2-Verbindung, ermöglicht erneutes Auslesen und Live alle 5 Sekunden. Die Garage öffnet außerdem ein separates Cockpit gespeicherter Messungen. Das Layout passt sich Telefonen, Tablets und eigenständigen Android-Radios im Querformat an, auf denen sich die App installieren lässt.

Das angezeigte Fahrzeug ist das aktive Garagenprofil mit seinem eigenen Foto. Ein Foto in der Garage hinzufügen; ansonsten bleiben Symbol und Hinweis. Wir laden weder ein beliebiges Foto noch ein 3D-Modell. Das Profil bestätigt nicht die Identität des verbundenen Fahrzeugs: ausgelesene VIN mit den Dokumenten vergleichen.

Vier Balken zeigen Drehzahl, Kühlmitteltemperatur, Motorlast und Adapterspannung. Sie animieren reale Messänderungen und beachten die systemseitige Bewegungsreduzierung. Fehlende Daten erscheinen als Strich. Live erfordert aktives Aktualisieren, passendes Fahrzeug, Adapter und ECU sowie eine höchstens 15 Sekunden alte Messung. Parameter und Fehlercodes haben getrennte Zeitstempel. Eine Teilmessung bestätigt nicht das Fehlen aller Fehler. Balkenskalen sind keine Zustandsgrenzen.

## CarPlay und Android Auto

Das vollständige animierte Cockpit läuft innerhalb der App. Bluetooth allein ermöglicht weder die Projektion auf das Radio noch den Ersatz der OBD2-Diagnosequelle. Android Auto bietet keine allgemeine Diagnosekategorie; die App deklariert keine falsche Navigations-, Medien- oder IoT-Kategorie.

Vorbereiteter nativer CarPlay-Code nutzt eine Systemliste: Miniatur des eigenen Fotos, Fahrzeugbeschreibung und letzte gespeicherte Diagnose mit Zeitstempel und ECU-Bereich. Keine Live-Werte oder Motoranimationen. Daten desselben Fahrzeugs aktualisieren die Liste höchstens alle 10 Sekunden; Fahrzeugwechsel oder Löschung entfernt die vorherige Identität sofort. Daten bleiben im Prozessspeicher, ohne separate Datei, Server, VIN, Kennzeichen, Notizen oder Adapternamen. Nach einem Prozessneustart die App zur Garagensynchronisierung öffnen; andernfalls zeigt die Liste keine Daten.

Die Integration ist standardmäßig deaktiviert. Apple muss Anwendungsbereich und Driving-Task-Entitlement genehmigen; eine Genehmigung dieser Funktion ist nicht garantiert. Erst nach Erhalt von Entitlement und passendem Signierungsprofil `enabled` für `./plugins/withCarPlay.cjs` in `mobile/app.json` auf `true` setzen und neu nativ kompilieren. Das Plugin registriert Szene und Entitlement; erneutes Deaktivieren entfernt seine Konfiguration und erhält andere Szenen. Expo Go und reine JS-Updates können CarPlay nicht ergänzen. Keine native Kompilierung oder Radioprüfung durchgeführt: Xcode und Android SDK fehlen in der Umgebung.

[Apple-Vorlagenregeln](https://developer.apple.com/download/files/CarPlay-Developer-Guide.pdf) · [Android-Kategorien für Fahrzeug-Apps](https://developer.android.com/training/cars)

## Sitzungssteuerung und Diagramm

Das aus der Diagnose geöffnete Cockpit kann den Adapter mit der aktuellen BLE-, Bluetooth-Classic- oder WLAN-Konfiguration verbinden, trennen, die Konfiguration öffnen, eine antwortende CAN-ECU wählen und das vollständige Auslesen im Verlauf speichern. Ein belegter Adapter verhindert parallele Operationen. Erfolgs- und Fehlermeldungen bleiben im Cockpit sichtbar. Die Speichertaste zeigt an, wenn genau dieser Bericht bereits im Verlauf liegt. Spätere Live-Messungen ändern weder gespeicherten Bericht noch Zeitstempel.

Einen von vier Parametern im Sitzungsdiagramm wählen. Es zeigt bis zu 60 echte Proben in einem Erfassungsfenster von höchstens 5 Minuten mit Anfangs-/Endzeit und beobachtetem Wertebereich. Nach Stoppen von Live bleibt das zuletzt erfasste Fenster erhalten; es stellt keine gegenwärtigen Messungen dar. Fehlende Parameter und Lücken über 15 Sekunden unterbrechen die Linie. Neues vollständiges Auslesen, ECU-Wechsel oder Neuverbindung startet ein neues Diagramm. Proben bleiben im Sitzungsspeicher und gelangen weder in Verlauf, Sicherung, KI noch CarPlay. Ohne Messungen werden keine Beispieldaten gezeichnet.
