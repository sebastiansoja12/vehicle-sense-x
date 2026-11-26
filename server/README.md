[Polski](README.md) | [English](README.en.md) | [Deutsch](README.de.md)

# Serwer proxy asystenta VehicleSenseX

Serwer HTTP dla Node 24.3+ bez zewnętrznych zależności. Klient mobilny nigdy nie otrzymuje klucza OpenAI.

```sh
cd server
cp .env.example .env
# Edit .env locally: OPENAI_API_KEY and a private APP_API_TOKEN are required.
npm start
npm test
```

Instalowanie pakietów nie jest potrzebne. `npm start` odczytuje `.env` wbudowanym mechanizmem Node. Nie dodawaj tego pliku do repozytorium. Wygeneruj token aplikacji lokalnie poleceniem z `.env.example`, a następnie wpisz go w ustawieniach asystenta w aplikacji. Token daje dostęp do płatnego API; zachowaj go w tajemnicy i wymień, jeżeli został udostępniony. Ani serwer, ani klient nie zapisują w logach zapytań, danych uwierzytelniających, pytań ani odpowiedzi. Poprawny składniowo klucz nie gwarantuje autoryzacji u dostawcy, środków ani dostępu do modelu.

Domyślny adres nasłuchiwania to `127.0.0.1:8787`. Zachowaj go do pracy lokalnej. Dla fizycznego telefonu wdróż serwer za odwrotnym proxy HTTPS albo prywatnym tunelem HTTPS i ogranicz dostęp sieciowy. Ustaw `HOST` jawnie tylko wtedy, gdy wymaga tego wdrożenie. Skonfiguruj proxy tak, aby nie logowało treści żądań ani nagłówków autoryzacji. Klient przyjmuje wyłącznie **adres bazowy serwera** (origin), np. `https://assistant.example.com` albo, tylko w środowisku deweloperskim, `http://127.0.0.1:8787`; dodaje do niego `/assistant`. Ścieżki URL, osadzone dane uwierzytelniające, parametry zapytania i fragmenty są odrzucane. Adres pętli zwrotnej telefonu wskazuje sam telefon, więc na fizycznym urządzeniu użyj adresu swojego wdrożenia HTTPS.

`OPENAI_MODEL` ma domyślną wartość `gpt-5-mini`, udokumentowaną jako zgodną z Responses; można ją zmienić na serwerze na model tekstowy dostępny w projekcie OpenAI. `OPENAI_API_KEY` jest odczytywany wyłącznie ze środowiska serwera. `APP_API_TOKEN` musi mieć 32–512 znaków bezpiecznych w URL (`A-Z a-z 0-9 . _ ~ -`). Brakująca lub niepoprawna konfiguracja blokuje płatne żądania odpowiedzią HTTP 503. Uwierzytelnienie porównuje skróty SHA-256 tokenów mechanizmem Node o stałym czasie porównania. Domyślnie CORS jest wyłączony dla originów przeglądarkowych; żądania natywne bez Origin są przyjmowane po uwierzytelnieniu. `ALLOWED_ORIGINS` jest opcjonalną, rozdzieloną przecinkami listą dokładnych dozwolonych originów (`https://app.example.com`); symbole wieloznaczne, ścieżki i końcowe ukośniki są niepoprawne. CORS uzupełnia uwierzytelnienie.

## Kontrakt HTTP

- `GET /health` → `{ "configured": true | false }`, bez płatnego wywołania i szczegółów sekretów. `configured` oznacza składniową poprawność konfiguracji lokalnej; ten endpoint nie weryfikuje konta OpenAI.
- `POST /assistant` wymaga `Authorization: Bearer <APP_API_TOKEN>` i `Content-Type: application/json`.
- Treść: `{ "question": "Co sprawdzić?", "context": { ... } }`.
- Sukces: `{ "answer": "..." }`. Błędy: `{ "error": "..." }` z odpowiednim statusem 4xx/5xx i stałym komunikatem po polsku. Surowe błędy dostawcy nigdy nie są przekazywane dalej.

Kontekst jest odtwarzany na podstawie białej listy niezależnie w kliencie i serwerze. Nieznane pola są **usuwane na każdym poziomie**, w tym VIN, tablice, notatki, współrzędne tras i identyfikatory. Żaden ukryty stan ani pełny obiekt pojazdu nie jest przekazywany. Dozwolone pola:

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

Pytanie i dozwolone pola tekstowe są przesyłane w postaci wpisanej przez użytkownika; nie umieszczaj w nich danych osobowych. Ekran zgody musi opisywać kontekst przed wysłaniem. Backend obsługuje tylko pojedyncze żądania, bez rozmów, wcześniejszych odpowiedzi, trwałego zapisu ani logów treści. Wysyła `store: false`, bez narzędzi i przeglądania internetu, pod stały adres `https://api.openai.com/v1/responses`; przekazane przez wywołującego pola modelu, serwera docelowego i historii są ignorowane. `store: false` nie jest obietnicą zerowej retencji u dostawcy: nadal obowiązuje polityka monitorowania nadużyć OpenAI.

Limity: treść JSON 16 KiB, pytanie 2000 znaków, marka/model 80 znaków, silnik/tytuł serwisu 120, 20 wpisów serwisowych, 50 DTC. Kwoty to nieujemne liczby całkowite w groszach; przebieg to nieujemne całkowite km. Wartości pomiarów `null` pozostają nieznane. Każdy proces serwera pozwala na 20 uwierzytelnionych prób na minutę, przy najwyżej 2 równocześnie odczytujących treść lub wywołujących dostawcę; sfałszowane nagłówki przekazanego IP nie omijają tego wspólnego limitu. Okno limitowania przechowuje tylko liczniki i czas, bez danych osobowych. Limit czasu treści żądania to 5 sekund; dostawcy domyślnie 25 sekund (`ASSISTANT_TIMEOUT_MS`, 100–30 000). JSON dostawcy ma limit 64 KiB, generowanie 1600 tokenów wyjściowych, a odpowiedź 8000 znaków. Klient kończy oczekiwanie po 30 sekundach i obsługuje anulowanie. Strumieniowanie odpowiedzi w przeglądarce/Node jest ograniczone bajtowo; natywny fetch może udostępniać tylko `text()`, więc klient natywny dodatkowo polega na ograniczeniu odpowiedzi po stronie zaufanego serwera proxy. Nie ma automatycznych ponowień płatnych wywołań. Przed udostępnieniem wielu niezaufanym użytkownikom lub uruchomieniem wielu procesów zastosuj wspólny limit na bramie i uwierzytelnienie poszczególnych użytkowników.

Instrukcje modelu wymagają zwięzłych odpowiedzi po polsku, rozróżnienia dowodów i niepewności, wskazywania brakujących lub starych danych oraz niewymyślania diagnostyki, interwałów producenta, cen ani badań zewnętrznych. AI ma charakter doradczy; oddzielne lokalne podsumowanie faktów działa bez konfiguracji.

## Integracja klienta

`mobile/src/assistant-client.ts` eksportuje `AssistantContext` oraz:

```ts
askAssistant({ endpoint, token, question, context, signal? }): Promise<string>
```

`signal` jest opcjonalnym `AbortSignal`; anulowanie odrzuca obietnicę z `name === 'AbortError'`, a przekroczenie czasu z `name === 'TimeoutError'`. Wywołujący odpowiada za zgodę i wybór pojazdu oraz powinien anulować żądanie przy zmianie pojazdu lub opuszczeniu ekranu. Tokenu i klucza nigdy nie wolno osadzać w źródłach, publicznych zmiennych czasu budowania, URL, raportach awarii ani analityce.

Testy używają lokalnego HTTP i wstrzykiwanych fikcyjnych odpowiedzi dostawcy. Nie wymagają rzeczywistego klucza ani płatnego wywołania. Publiczna funkcja `createAssistantServer({ env?, fetchImpl? })` pozwala osadzać serwer i wstrzykiwać transport.

Oficjalne materiały API sprawdzone podczas tej implementacji:

- [Szybki start dla deweloperów](https://developers.openai.com/api/docs/quickstart)
- [Parametry tworzenia Responses i odpowiedzi](https://developers.openai.com/api/reference/resources/responses/methods/create)
- [Model GPT-5 mini](https://developers.openai.com/api/docs/models/gpt-5-mini)
- [Kontrola danych i retencja u dostawcy](https://developers.openai.com/api/docs/guides/your-data)

Opcjonalne metadane diagnostyczne `ecu` zawierają wyłącznie zwalidowany numer standardowego protokołu CAN (6/7/8/9) i adres odpowiedzi. Są niezależnie dopuszczane przez białą listę klienta i serwera. Model otrzymuje informację, że dane dotyczą wybranego sterownika, a nie wszystkich sterowników. VIN, dowody źródła VIN i nieznane metadane ECU nie należą do akceptowanego kontekstu AI.
