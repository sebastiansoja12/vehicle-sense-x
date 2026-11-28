[Polski](2026-11-27-ecu-identification.md) | [English](2026-11-27-ecu-identification.en.md) | [Deutsch](2026-11-27-ecu-identification.de.md)

# ECU identification

> superpowers:executing-plans

[Spec](../specs/2026-11-27-ecu-identification.en.md)

## Task 1: Identification decoders and validation

- [x] Write tests for the 09 00 bitmap, CALID, CVN, ECU name, negative responses and import; observe failure, then implement decoders and extension validation.

```sh
node --test mobile/tests/obd-identification.test.mjs
```

Expected: new tests fail first and then pass; there is no measurement generator or ECU write.

## Task 2: Optional CAN scan and response states

- [x] Write CAN transport-boundary tests: only advertised types, separate opt-in, no VIN, multiframe replies, wrong ECU and NRC 78. Add scan option, progress and identification in the exact report.

```sh
node --test mobile/tests/obd-identification-driver.test.mjs
```

Expected: new tests fail first and then pass; there is no measurement generator or ECU write.

## Task 3: Interface, comparisons and safe exports

- [x] Test exports, backups, exclusion from sale reports/AI and comparisons. Add the full CAN scan button, details, export disclosure and data comparisons.

```sh
node --test mobile/tests/obd-identification-reports.test.mjs mobile/tests/obd-screen.test.mjs
```

Expected: new tests fail first and then pass; there is no measurement generator or ECU write.

## Task 4: Full verification, review, documentation and pushed commits

- [x] Run full tests, types, lint, PL/EN/DE validation and web/Hermes exports. Request a fresh review, fix confirmed findings with tests and push commits without Co-authored.

```sh
node --test tests.mjs tests/*.test.mjs mobile/tests/*.test.mjs server/*.test.mjs
```

Expected: new tests fail first and then pass; there is no measurement generator or ECU write.

