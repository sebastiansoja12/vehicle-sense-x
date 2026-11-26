[Polski](2026-11-26-native-builds.md) | [English](2026-11-26-native-builds.en.md) | [Deutsch](2026-11-26-native-builds.de.md)

# Plan für Kompatibilität und native Builds

Der Benutzer hat weitere Implementierung, Android-/iOS-Builds, weitere Commits und deren Hochladen zu GitHub autorisiert; Commitnachrichten sollen aus einem englischen Satz ohne Angaben zur Mitautorschaft bestehen. Expo58-/RN0.88-App und echte ELM-Transporte erhalten. README und Dokumentation sollen auf Polnisch, Englisch und Deutsch verfügbar sein.

- [x] Lokale Werkzeuge und Zugriff geprüft: kein vollständiges Xcode und kein Android SDK; bestehendes persönliches Expo-Konto hat kostenloses Buildkontingent. Das konfigurierte GitHub-origin war leer.
- [x] Unabhängige Prüfungen nativen Codes: RN-Interop bleibt verfügbar; Directory ist kein Kompilierungsnachweis. RN0.88.1 ergänzt den TCP-Namespace, daher kein TCP-Patch erforderlich. Fehlendes BuildConfig in Classic wurde durch den Android-Compiler bestätigt.
- [x] Ausgangszustand verifiziert (135 Tests, Typen/Lint), Commit auf codex/native-build-compat ohne IDE-Einstellungen und Zugangsdaten.
- [x] Archiv durch Erlaubnisliste begrenzt, Validierungsprofile ohne Zugangsdaten und zugeordnetes Expo-Projekt; Inhaltsprüfung vor Hochladen (101 Dateien vor Classic-Plugin, 102 danach).
- [x] Echte Cloudbuilds für Android Release APK und iOS Release für Simulator, Classic-Fehler erkannt, reproduzierbare Korrektur per CNG-Plugin, erneuter Compilererfolg. Keine manuellen Änderungen an generierten Projekten.
- [ ] Android-Produktions-AAB wird nach ausdrücklicher Zustimmung zu einem neuen Schlüssel in Expo gebaut; fehlendes aktives Apple-Developer-Konto blockiert Store-IPA. Nicht veröffentlichen und keine neuen Kostenverpflichtungen eingehen.
- [x] Wiederholtes Prebuild, Tests, Typen/Lint, Archiv und heruntergeladene Artefakte geprüft; unabhängige Prüfung der Korrektur, weitere Commits/Push. Prüfungen des resultierenden AAB stehen aus.
- [x] Alle Markdown-Dokumente in drei Sprachen, Sprachumschalter und Dokumentationsindex, Befehlsübereinstimmung und Linkprüfung; Anweisungen in AGENTS.md und maschinenstrukturierte Berichte behalten die Quellsyntax.

Kompilierung, Signierung und Hardwaretest sind getrennte Nachweise. Ein Simulatorbuild ist kein Store-IPA, Interop ist keine Umschreibung auf TurboModules, und die Directory-Warnung wird nicht unterdrückt, um ein grünes Ergebnis zu erhalten. Details: [Buildbericht](../../verification/2026-11-26-native-builds.de.md).
