[Polski](2026-11-26-continuous-checks.md) | [English](2026-11-26-continuous-checks.en.md) | [Deutsch](2026-11-26-continuous-checks.de.md)

# Automatische Projektprüfungen

> superpowers:executing-plans

**Ziel:** Jeder Push und Pull Request prüft echte Tests, Typen, Lint, Exporte und die Dokumentation PL/EN/DE.

**Architektur:** Ein GitHub-Actions-Workflow auf Ubuntu, festgelegte Revisionen offizieller Actions und Node aus `mobile/.nvmrc`. Ein Python-Skript mit Standardbibliothek prüft lokale Markdown-Dateien; Tests führen es in temporären Git-Repositories aus.

**Spezifikation:** [Releaseanforderungen](../../../mobile/RELEASE.de.md). Implementierungsentscheidung: Quellprüfungen statt automatischem EAS, Veröffentlichung oder Serverbereitstellung. Keine Geheimnisse oder kostenpflichtigen Aufrufe; das Workflow-Token darf Inhalte nur lesen.

## Schritte

- [x] Tests für fehlende Sprache, verwaiste Übersetzung, falsche Navigation, lokale Links und geänderte Bezeichner; ausführen und Fehlschlag beobachten.
- [x] `scripts/check-docs.py`: vollständige Sprachtrios, Navigation, Links und Sprachen, identische Befehle und Struktur; implementieren und Tests sowie tatsächliche Dokumentation prüfen.
- [x] `.github/workflows/verify.yml`: `npm ci` in `mobile`, alle Node-Tests, Typen/Lint, Dokumentationsprüfung und Web-/Hermes-Exporte; Leserechte, Zeitlimit und Abbruch älterer Läufe.
- [ ] Alle drei Anleitungsvarianten aktualisieren; unabhängige Prüfung, lokale Kontrollen, Commit und Push, danach den tatsächlichen GitHub-Lauf prüfen.

## Prüfschwerpunkte

Fehlende Dateien und defekte Links müssen einen Fehlercode liefern. Anweisungen in `AGENTS.md`, Originallizenzen und JSON ausschließen. Der Workflow hat keine Expo-/OpenAI-Schlüssel, signiert keine Apps und setzt JavaScript-Export nicht mit nativer Kompilierung gleich. Systemfreigabe, Benachrichtigungen und Funkverbindungen erfordern separate Hardwaretests.
