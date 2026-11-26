[Polski](2026-11-26-ownership-expenses.md) | [English](2026-11-26-ownership-expenses.en.md) | [Deutsch](2026-11-26-ownership-expenses.de.md)

# Überprüfung der Besitzkosten 0.3.0

Quellversion 0.3.0/Build 4: fünf echte Ausgabenkategorien, Bearbeiten/Löschen, Summen, CSV und Schema 3. Alle 188/188 Tests bestanden, darunter 11 neue Ausgabentests, ebenso Typprüfung, Lint und Web-/Android-/iOS-Hermes-Exporte. Tests betreffen Grosz, Grenzen, Datum, Beziehungen, eindeutige IDs, Schema-1/2-Migration, Sicherungen, kaskadierendes Löschen, Fahrzeug-/KI-Isolation und Summen ohne Doppelzählung.

Die Prüfung fand eine fehlende Sperre für zukünftige Daten beim Sicherungsimport. Ein fehlschlagender Regressionstest und die Korrektur wurden ergänzt; Test und vollständige Suite bestanden. Lesen vorhandener Daten toleriert weiterhin eine zurückgestellte Uhr. Das tatsächliche Formular auf einer separaten lokalen Origin bestätigte Hinzufügen, Betragsänderung, Kategorieänderung, Nullablehnung, Startseitensummen und Persistenz nach Neuladen. Der Barrierefreiheitszustand der Kategorie wurde mit `aria-checked` korrigiert; eine Auswahl markiert eine Option und deaktiviert die vorherige Markierung. Keine Beispieldaten wurden in App-Pakete eingebettet.

Web-Export leert den Metro-Cache standardmäßig, da ein gepuffertes Expo-Manifest eine frühere Version in den Einstellungen anzeigte. Sauberer Export und Neuladen bestätigten 0.3.0. Der CSV-Generator bestand Tests und das Exportelement ist verfügbar; der Browser-Dateidownload wurde nicht bestätigt. Native Freigabe, Benachrichtigungen und Adapterverbindungen erfordern Telefontests.

Neue native Builds und CI für diese Revision benötigen eine separate Bestätigung. Zuvor geprüfte 0.2.2-Pakete enthalten keine Besitzkosten. Fehlende aktive Apple-Developer-Mitgliedschaft blockiert weiterhin ein Store-IPA; es wurde nichts in Stores eingereicht.
