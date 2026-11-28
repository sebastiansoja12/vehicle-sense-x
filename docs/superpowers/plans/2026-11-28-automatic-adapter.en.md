[Polski](2026-11-28-automatic-adapter.md) | [English](2026-11-28-automatic-adapter.en.md) | [Deutsch](2026-11-28-automatic-adapter.de.md)

# Automatic adapter recognition

> superpowers:executing-plans · superpowers:test-driven-development

[Spec](../specs/2026-11-28-automatic-adapter.en.md)

## Approach

The normal screen requires no identifiers, UUIDs, IP address or port. Bluetooth searches BLE devices and paired Classic devices on Android; the user selects a name and the app connects immediately and checks the ELM/ECU response.

Manual configuration remains behind an advanced section closed by default. Selecting a device clears stale UUIDs and uses the current search result. The list hides identifiers. Cancellation, leaving the screen and late responses cannot start another connection. DTC clearing and ECU scope selection retain their existing guards.

## Task 1

mobile/src/obd/adapter-discovery.ts · mobile/tests/obd-adapter-discovery.test.mjs

- [x] ATI: RED → GREEN; Wi-Fi probes only the remembered local profile and documented default 192.168.0.10:35000 with ATI. Every probe socket closes before the real session with normal timeouts. The phone must join the adapter network in system settings. No full network scan or universal adapter compatibility claim.
- [x] Bluetooth: deviceId → profile; UUID = empty.

## Task 2

mobile/src/obd/DiagnosticsScreen.tsx · mobile/tests/obd-screen.test.mjs · mobile/src/obd/wifi.native.ts · mobile/src/obd/wifi.web.ts

- [ ] UI: RED → GREEN; The normal screen requires no identifiers, UUIDs, IP address or port. Bluetooth searches BLE devices and paired Classic devices on Android; the user selects a name and the app connects immediately and checks the ELM/ECU response.
- [ ] Tests and limits: tests; typecheck; lint; PL/EN/DE; web; iOS/Android Hermes.
- [ ] Review; commit; push main.
