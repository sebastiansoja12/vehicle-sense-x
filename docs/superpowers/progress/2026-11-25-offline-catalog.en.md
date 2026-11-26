[Polski](2026-11-25-offline-catalog.md) | [English](2026-11-25-offline-catalog.en.md) | [Deutsch](2026-11-25-offline-catalog.de.md)

# Offline catalog implementation ledger

- User authorized offline integration with manual fallback and continued work. Existing checkout/uncommitted application preserved; no commit/push/publish.
- Implemented generated pinned subset, search and immutable make/model selection, manual mode, form/settings notices. 563 makes / 17,966 model/name variants / 288,926 bytes including metadata. Source dates and upstream hash/commit retained. No network use at runtime and no extra dependency.
- Seven domain/extraction tests observed failing against the initial empty implementation, then passing. Model display spelling is retained from the source; expectations use inspected actual names rather than assuming every name is upper case. Meaningful punctuation is preserved, not treated as an alias.
- Both generated artifacts reproduce exactly with the pinned local input and --check. TypeScript initially caught widened external-link types; generated provenance is now immutable with literal types. Lint duplicate import corrected.
- Browser QA at 390×844 verified search with diacritics, scoped models, cleared stale model, manual-mode value preservation, clean reopen and attribution. No test vehicle saved in the user's garage; no console errors observed.
- Independent reviewer read source/save callers and ran scoped tests and reproduction. One P2: selector accessible names omitted current values. Browser assertion failed before the fix and passed for both DACIA and DUSTER after including chosen values in accessible labels.
- Final automated run: 114 tests passing (101 mobile, 9 server, 4 original prototype), typecheck/lint exit 0, web and native JS/Hermes export exit 0 after final code changes. Native signed builds and actual VoiceOver/TalkBack remain unperformed.
- Review scope boundaries: source attribution/filtering were reviewed, not independent legal interpretation; actual native accessibility/keyboard requires device checks. These remain explicit release checks rather than claims of completed validation.
