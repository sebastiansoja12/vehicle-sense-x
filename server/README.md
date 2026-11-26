# VehicleSenseX assistant proxy

A dependency-free Node 24.3+ HTTP server. Mobile never receives the OpenAI key.

```sh
cd server
cp .env.example .env
# Edit .env locally: OPENAI_API_KEY and a private APP_API_TOKEN are required.
npm start
npm test
```

No package install is necessary. `npm start` reads `.env` with Node's built-in loader. Do not commit it. Generate the app token locally with the command in `.env.example`, then enter it in the app's assistant settings. This token grants paid API access; keep it private and rotate it if shared. Neither the server nor client logs requests, credentials, questions, or answers. A syntactically valid key is not a guarantee of provider authorization, credits, or model access.

The default bind address is `127.0.0.1:8787`. Keep it for local work. For a physical phone, deploy behind an HTTPS reverse proxy or a private HTTPS tunnel and restrict network access. Set `HOST` explicitly only when needed for that deployment. Configure the proxy not to log bodies or authorization headers. The client accepts a server **origin**, such as `https://assistant.example.com` or development-only `http://127.0.0.1:8787`; it appends `/assistant`. URL paths, embedded credentials, queries and fragments are rejected. Phone loopback means the phone itself, so use your HTTPS deployment URL on a physical device.

`OPENAI_MODEL` defaults to documented Responses-compatible `gpt-5-mini`; override it server-side with a text model available to your OpenAI project. `OPENAI_API_KEY` is read only from the server environment. `APP_API_TOKEN` must have 32–512 URL-safe characters (`A-Z a-z 0-9 . _ ~ -`). Missing/invalid configuration disables paid requests with HTTP 503. Authentication compares SHA-256 token digests with Node's constant-time comparison. CORS is disabled for browser origins by default; native requests without Origin are accepted after authentication. `ALLOWED_ORIGINS` is an optional comma-separated exact allowlist (`https://app.example.com`); wildcard, paths and trailing slashes are invalid. CORS supplements authentication.

## HTTP contract

- `GET /health` → `{ "configured": true | false }`, no paid call or secret details. `configured` means local configuration is syntactically valid; health does not verify the OpenAI account.
- `POST /assistant` requires `Authorization: Bearer <APP_API_TOKEN>` and `Content-Type: application/json`.
- Body: `{ "question": "Co sprawdzić?", "context": { ... } }`.
- Success: `{ "answer": "..." }`. Errors: `{ "error": "stable Polish message" }` with a suitable 4xx/5xx status. Raw provider errors are never forwarded.

Context is rebuilt from a whitelist independently in the client and server. Unknown fields are **dropped at every depth**, including VIN, plates, notes, route coordinates and identifiers. No implicit state or full vehicle object is forwarded. Allowed fields:

```ts
type AssistantContext = {
  vehicle: { make: string; model: string; year: number; engine: string; mileage: number };
  fuelSummary?: { consumption: number | null; totalCents: number };
  recentServices: { date: string; title: string; mileage: number; costCents: number }[];
  diagnostics?: {
    timestamp: number; // Unix milliseconds, original reading time
    codes: string[]; // Uppercase five-character OBD DTCs
    parameters: { rpm: number | null; coolantC: number | null; loadPercent: number | null; voltageV: number | null };
  };
};
```

The question and allowed free-text fields are sent as entered; do not include personal data in them. Consent UI must describe the context before sending. The backend only handles individual requests, with no conversations, previous responses, persistence or content logs. It sends `store: false`, no tools and no external browsing to the fixed `https://api.openai.com/v1/responses` endpoint; caller-supplied model/upstream/history fields are ignored. `store: false` is not a promise of zero provider retention: OpenAI's abuse-monitoring policy still applies.

Limits: JSON body 16 KiB, question 2,000 characters, make/model 80 characters, engine/service title 120, 20 service entries, 50 DTCs. Monetary values are nonnegative integer cents; mileage is nonnegative integer km. Measurement nulls remain unknown. Each server process allows 20 authenticated attempts per minute with at most 2 concurrently reading/calling upstream; spoofed forwarded-IP headers cannot bypass this shared limit. The rate window stores only counters and time, no personal data. Request-body timeout is 5 seconds; upstream timeout defaults to 25 seconds (`ASSISTANT_TIMEOUT_MS`, 100–30,000). Upstream JSON is capped at 64 KiB, generation at 1,600 output tokens, answer at 8,000 characters. The client times out after 30 seconds and supports cancellation. Browser/Node response streaming is byte-bounded; native fetch may expose only `text()`, so native clients depend additionally on the trusted proxy's server-side output limit. No automatic paid retries occur. Use a shared gateway rate limit and per-user authentication before serving multiple untrusted users or multiple processes.

The model instructions require concise Polish answers, evidence/uncertainty distinctions, acknowledgement of missing or old data, and no invented diagnostics, manufacturer intervals, prices or external research. AI is advisory; the separate local factual summary remains usable without configuration.

## Client integration

`mobile/src/assistant-client.ts` exports `AssistantContext` and:

```ts
askAssistant({ endpoint, token, question, context, signal? }): Promise<string>
```

`signal` is an optional `AbortSignal`; cancellation rejects with `name === 'AbortError'`, timeout with `name === 'TimeoutError'`. The caller owns consent and vehicle selection and should abort when switching vehicle or leaving the screen. Token and key must never be embedded in source, build-time public variables, URLs, crash reports, or analytics.

Tests use local HTTP and injected fake upstream responses. No configured real key and no paid call are needed. Public server construction is exported as `createAssistantServer({ env?, fetchImpl? })` for embedding and transport injection.

Official API references checked for this implementation:

- [Developer quickstart](https://developers.openai.com/api/docs/quickstart)
- [Responses create parameters and output](https://developers.openai.com/api/reference/resources/responses/methods/create)
- [GPT-5 mini model](https://developers.openai.com/api/docs/models/gpt-5-mini)
- [Data controls and provider retention](https://developers.openai.com/api/docs/guides/your-data)

Optional diagnostic `ecu` metadata contains only a validated standard CAN protocol number (6/7/8/9) and response address. It is whitelisted independently on client and server. The model is told this covers the selected controller, not every controller. VIN, VIN-source evidence and unknown ECU metadata are not part of the accepted AI context.
