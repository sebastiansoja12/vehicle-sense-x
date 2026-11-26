[Polski](README.md) | [English](README.en.md) | [Deutsch](README.de.md)

# VehicleSenseX-Assistentenproxy

Ein HTTP-Server ohne Abhängigkeiten für Node 24.3+. Der mobile Client erhält niemals den OpenAI-Schlüssel.

```sh
cd server
cp .env.example .env
# Edit .env locally: OPENAI_API_KEY and a private APP_API_TOKEN are required.
npm start
npm test
```

Keine Paketinstallation erforderlich. `npm start` liest `.env` mit dem integrierten Node-Loader. Diese Datei nicht committen. Den App-Token lokal mit dem Befehl in `.env.example` erzeugen und anschließend in den Assistenteneinstellungen der App eingeben. Dieser Token gewährt kostenpflichtigen API-Zugriff; privat halten und bei Weitergabe austauschen. Weder Server noch Client protokollieren Anfragen, Zugangsdaten, Fragen oder Antworten. Ein syntaktisch gültiger Schlüssel garantiert weder Anbieterautorisierung noch Guthaben oder Modellzugriff.

Die Standard-Bind-Adresse ist `127.0.0.1:8787`. Für lokale Arbeit beibehalten. Für ein physisches Telefon hinter einem HTTPS-Reverse-Proxy oder privaten HTTPS-Tunnel bereitstellen und Netzwerkzugriff beschränken. `HOST` nur bei Bedarf für diese Bereitstellung ausdrücklich setzen. Den Proxy so konfigurieren, dass weder Bodies noch Authorization-Header protokolliert werden. Der Client akzeptiert einen Server-**Origin**, etwa `https://assistant.example.com` oder nur für Entwicklung `http://127.0.0.1:8787`; er hängt `/assistant` an. URL-Pfade, eingebettete Zugangsdaten, Abfragen und Fragmente werden abgelehnt. Telefon-Loopback bezeichnet das Telefon selbst; auf einem physischen Gerät daher die HTTPS-Bereitstellungs-URL verwenden.

`OPENAI_MODEL` verwendet standardmäßig das dokumentierte Responses-kompatible `gpt-5-mini`; serverseitig durch ein im OpenAI-Projekt verfügbares Textmodell überschreiben. `OPENAI_API_KEY` wird nur aus der Serverumgebung gelesen. `APP_API_TOKEN` muss 32–512 URL-sichere Zeichen enthalten (`A-Z a-z 0-9 . _ ~ -`). Fehlende/ungültige Konfiguration deaktiviert kostenpflichtige Anfragen mit HTTP 503. Authentifizierung vergleicht SHA-256-Token-Digests mit dem zeitkonstanten Node-Vergleich. CORS ist für Browser-Origins standardmäßig deaktiviert; native Anfragen ohne Origin werden nach Authentifizierung akzeptiert. `ALLOWED_ORIGINS` ist eine optionale kommagetrennte Liste exakter erlaubter Origins (`https://app.example.com`); Platzhalter, Pfade und abschließende Schrägstriche sind ungültig. CORS ergänzt die Authentifizierung.

## HTTP-Vertrag

- `GET /health` → `{ "configured": true | false }`, kein kostenpflichtiger Aufruf und keine Geheimnisdetails. `configured` bedeutet, dass die lokale Konfiguration syntaktisch gültig ist; Health prüft nicht das OpenAI-Konto.
- `POST /assistant` erfordert `Authorization: Bearer <APP_API_TOKEN>` und `Content-Type: application/json`.
- Body: `{ "question": "Co sprawdzić?", "context": { ... } }`.
- Erfolg: `{ "answer": "..." }`. Fehler: `{ "error": "..." }` mit passendem 4xx/5xx-Status und einer festen polnischen Meldung. Ungefilterte Anbieterfehler werden niemals weitergegeben.

Kontext wird unabhängig in Client und Server aus einer Whitelist neu aufgebaut. Unbekannte Felder werden **auf jeder Tiefe entfernt**, einschließlich VIN, Kennzeichen, Notizen, Routenkoordinaten und Kennungen. Kein impliziter Zustand und kein vollständiges Fahrzeugobjekt wird weitergeleitet. Erlaubte Felder:

```ts
type AssistantContext = {
  vehicle: { make: string; model: string; year: number; engine: string; mileage: number };
  fuelSummary?: { consumption: number | null; totalCents: number };
  recentServices: { date: string; title: string; mileage: number; costCents: number }[];
  diagnostics?: {
    timestamp: number; // Unix milliseconds, original reading time
    codes: string[]; // Uppercase five-character OBD DTCs
    parameters: { rpm: number | null; coolantC: number | null; loadPercent: number | null; voltageV: number | null };
    ecu?: { protocol: 6 | 7 | 8 | 9; responseId: string };
  };
};
```

Frage und erlaubte Freitextfelder werden wie eingegeben übertragen; darin keine personenbezogenen Daten angeben. Die Zustimmungsoberfläche muss den Kontext vor dem Senden beschreiben. Das Backend verarbeitet nur einzelne Anfragen, ohne Gespräche, vorherige Antworten, Speicherung oder Inhaltsprotokolle. Es sendet `store: false`, keine Werkzeuge und keine externe Browsersuche an den festen Endpunkt `https://api.openai.com/v1/responses`; vom Aufrufer vorgegebene Modell-/Upstream-/Historienfelder werden ignoriert. `store: false` ist kein Versprechen fehlender Datenspeicherung beim Anbieter: Die OpenAI-Regeln zur Missbrauchsüberwachung gelten weiterhin.

Limits: JSON-Body 16 KiB, Frage 2.000 Zeichen, Marke/Modell 80 Zeichen, Motor/Wartungstitel 120, 20 Wartungseinträge, 50 DTCs. Geldbeträge sind nichtnegative ganzzahlige Cent; Kilometerstände sind nichtnegative ganze km. Messwerte mit `null` bleiben unbekannt. Jeder Serverprozess erlaubt 20 authentifizierte Versuche pro Minute mit höchstens 2 gleichzeitig lesenden/Upstream aufrufenden Anfragen; gefälschte Forwarded-IP-Header können dieses gemeinsame Limit nicht umgehen. Das Zeitfenster speichert nur Zähler und Zeit, keine personenbezogenen Daten. Timeout des Anfragebodys ist 5 Sekunden; Upstream-Timeout standardmäßig 25 Sekunden (`ASSISTANT_TIMEOUT_MS`, 100–30.000). Upstream-JSON ist auf 64 KiB begrenzt, Generierung auf 1.600 Ausgabetokens, Antwort auf 8.000 Zeichen. Der Client hat 30 Sekunden Timeout und unterstützt Abbruch. Browser-/Node-Antwortstreaming ist bytebegrenzt; natives Fetch stellt möglicherweise nur `text()` bereit, daher hängen native Clients zusätzlich vom serverseitigen Ausgabelimit des vertrauenswürdigen Proxys ab. Keine automatischen kostenpflichtigen Wiederholungen. Vor Bereitstellung für mehrere nicht vertrauenswürdige Benutzer oder mehrere Prozesse gemeinsames Gateway-Ratenlimit und Authentifizierung je Benutzer verwenden.

Die Modellanweisungen verlangen kurze polnische Antworten, Trennung von Nachweisen/Unsicherheit, Anerkennung fehlender oder alter Daten und keine erfundene Diagnose, Herstellerintervalle, Preise oder externe Recherche. KI dient der Beratung; die separate lokale Faktenübersicht bleibt ohne Konfiguration nutzbar.

## Clientintegration

`mobile/src/assistant-client.ts` exportiert `AssistantContext` und:

```ts
askAssistant({ endpoint, token, question, context, signal? }): Promise<string>
```

`signal` ist ein optionales `AbortSignal`; Abbruch weist mit `name === 'AbortError'` zurück, Timeout mit `name === 'TimeoutError'`. Der Aufrufer verantwortet Zustimmung und Fahrzeugauswahl und sollte bei Fahrzeugwechsel oder Verlassen des Bildschirms abbrechen. Token und Schlüssel dürfen niemals in Quellcode, öffentliche Buildvariablen, URLs, Absturzberichte oder Analysen eingebettet werden.

Tests verwenden lokales HTTP und injizierte simulierte Upstream-Antworten. Kein konfigurierter echter Schlüssel und kein kostenpflichtiger Aufruf erforderlich. Die öffentliche Servererzeugung wird als `createAssistantServer({ env?, fetchImpl? })` für Einbettung und Transportinjektion exportiert.

Für diese Implementierung geprüfte offizielle API-Referenzen:

- [Developer quickstart](https://developers.openai.com/api/docs/quickstart)
- [Responses-Erstellungsparameter und -Ausgabe](https://developers.openai.com/api/reference/resources/responses/methods/create)
- [GPT-5-mini-Modell](https://developers.openai.com/api/docs/models/gpt-5-mini)
- [Datenkontrollen und Aufbewahrung beim Anbieter](https://developers.openai.com/api/docs/guides/your-data)

Optionale diagnostische `ecu`-Metadaten enthalten nur eine validierte Standard-CAN-Protokollnummer (6/7/8/9) und Antwortadresse. Sie werden unabhängig auf Client und Server in die Whitelist aufgenommen. Das Modell wird darauf hingewiesen, dass dies das ausgewählte Steuergerät betrifft, nicht jedes Steuergerät. VIN, VIN-Quellenbelege und unbekannte ECU-Metadaten gehören nicht zum akzeptierten KI-Kontext.
