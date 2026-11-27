[Polski](README.md) | [English](README.en.md) | [Deutsch](README.de.md)

# OBD client boundaries

`index.ts` and `types.ts` are pure TypeScript, usable by the local persistence validator and Node tests. Import `createBleTransport` and `scanDevices` from **extensionless** `./ble` so Metro selects `.native.ts` or `.web.ts`.

An explicit scan returns an asynchronous stop function; stop scanning before connecting. It also ends after 15 seconds. No Bluetooth manager, scan, permissions request, connection, or OBD command runs on module import. Android API 31+ requests SCAN and CONNECT; older Android requests fine location. The Expo BLE config plugin must declare permissions and iOS usage text. The app needs a native development build, not Expo Go. Web reports unsupported BLE. Bluetooth Classic/SPP is provided separately on Android through `classic.android.ts`, using already bonded devices and an unsegmented ASCII stream. It is excluded from iOS autolinking; iOS supports BLE and Wi-Fi, not generic SPP.

The BLE profile identifies the actual device and adapter name. With empty UUID fields, native discovery selects exactly one custom serial service with one writable/notifying pair and excludes standard GATT services in 4-digit, 8-digit and canonical 128-bit UUID representations. Ambiguity fails explicitly. Advanced profiles accept the service UUID, writable characteristic UUID and notification characteristic UUID from the adapter vendor. No generic UUID or universal adapter compatibility is assumed. Discovered capabilities select acknowledged writes when available; otherwise explicit write-without-response support is required. Responses are ASCII in base64 notifications. Only an ELM327-compatible stream is supported.

Call `new Elm327Driver(transport, adapterName)`, then `initialize()`, then `readSnapshot(vehicleId)`. The driver follows advertised PID pages 00–E0 and reads basic RPM, coolant, load and ATRV. It does not request pages the ECU has not advertised. ATRV is adapter input voltage, distinct from PID 42 and battery health assessment.

The headers-off parser remains strict for legacy protocols. For ISO 15765-4 CAN (6/7/8/9), the first 0100 opens the protocol before ATDPN is read. The driver enables ATH1, ATD0 and ATCFC1, discovers actual 7E8–7EF or 18DAF1xx response IDs from a second functional request, then physically addresses one controller with ATSH and filters it with ATCRA. Multiple IDs require user selection; a single actual ID can be selected automatically. Every payload is checked against that selected ID in software. Other addressing, CAN FD, extended-address ISO-TP and negative response-pending sequences remain unsupported. Non-CAN multi-controller replies still fail explicitly.

DTC modes 03/07/0A preserve stored/pending/permanent status. A positive zero response is different from NO DATA. `readStatuses` names exactly the positive replies received; NO DATA omits that status. No positive DTC reply fails the read. Timeout, disconnect or malformed data fails the read, never creates a zero measurement or empty report. A partial read must not be displayed as an overall fault-free vehicle. Even complete DTC reads do not certify vehicle safety.

Channel commands are queued and responses end only at an ELM prompt. Overflow, invalid bytes, timeout, write failure, or disconnect rejects outstanding commands. A timed-out channel stays closed so late bytes cannot satisfy the next request. Reconnect before retrying.

Before `clearFaults({confirmed, backedUpSnapshot, vehicleId, tripRecording})`, the caller must **persist/export** the current report successfully and obtain a separate user confirmation. The driver requires the exact last real snapshot for the same vehicle and rejects trip recording. It cannot independently prove that the UI saved a backup or stopped recording. A mode 04 request is sent only after these guards; success requires a genuine 44 reply. A timeout is uncertain, since the ECU might already have processed the command. The report must be read again before another attempt. Mode 04 can erase freeze frames/readiness data; permanent DTCs cannot be cleared with this command.

## Sources and verification

Primary protocol source: [ELM Electronics ELM327DSK datasheet](https://www.elmelectronics.com/wp-content/uploads/2017/01/ELM327DS.pdf), especially prompt/echo handling, voltage, PID/DTC examples, fault clearing and multiline responses. Load PID 04 uses SAE J1979 A×100/255 scaling. Manufacturer-specific PIDs and descriptions are not guessed.

BLE API: [official react-native-ble-plx documentation](https://dotintent.github.io/react-native-ble-plx/) and installed upstream **3.5.1** source/type definitions (`Device`, `BleManager`, Expo config plugin); [official React Native PermissionsAndroid](https://reactnative.dev/docs/permissionsandroid); [Expo SDK 58 reference](https://docs.expo.dev/versions/v58.0.0/). The generated online BLE reference identifies itself as 3.3.0; installed 3.5.1 signatures were checked before implementation.

Node tests exercise real parsing, driver decisions, command buffering/queueing, timeout/disconnect handling, backup confirmation guards, base64 notification transport and web fallback. BLE peripheral methods are controlled at the external hardware boundary. Physical adapters, OS permission dialogs, characteristic subscription timing, iOS/Android radio behavior and SDK 58 native binary compatibility have not been tested on hardware.


## Wi-Fi / Classic transport

`wifi.native.ts` connects using react-native-tcp-socket 6.4.3 and the shared ELM channel. A local IPv4 address and TCP port come from the adapter instructions. No default endpoint, proxy, HTTP bridge or measurement generator is used. `wifi-core.ts` is exercised against real local TCP sockets for fragmented responses, disconnects and deadlines. Native Wi-Fi routing with an internet-free adapter and concurrent mobile data still needs device validation. The implementation deliberately does not pass `interface: wifi`: installed upstream Android code otherwise binds the process to that network globally without a corresponding reset.

`classic.android.ts` uses react-native-bluetooth-classic 1.73.0-rc.17, BLUETOOTH_CONNECT on API 31+, paired devices, RFCOMM, ASCII and an empty delimiter. Thus the shared channel sees genuine prompt bytes across arbitrary read fragments; no prompt is appended in JavaScript. Opening has a 15-second deadline and late connections are disconnected. Physical SPP disconnection rejects pending reads. The source and installed types were checked against the [maintainer's documentation](https://kenjdavidson.com/react-native-bluetooth-classic/react-native/rn-bluetooth-device/).

Broad ELM327 compatibility is the objective, not a claim of universal hardware support. Manufacturer protocols, locked adapters, MFi-specific protocols, and non-CAN multi-ECU protocols require additional implementations and hardware fixtures. [Apple External Accessory](https://developer.apple.com/documentation/externalaccessory/) documents the separate MFi accessory model.

## CAN framing and saved scope

`can.ts` validates standard OBD response addresses and reassembles ISO-TP single/first/consecutive frames independently per CAN ID. Interleaving is supported; missing, duplicate, incomplete or out-of-sequence frames fail. Declared payload length removes padding; DTC parsing requires an explicit CAN count and rejects empty counted codes. Automatic flow control remains with the adapter; no hand-crafted bus packets are injected.

Snapshots optionally retain `ecu: { protocol: 6|7|8|9, responseId }`. Existing snapshots remain valid. The UI, JSON backup, sales report and whitelisted AI context retain that scope; a single ECU scan is never described as all controllers. Unknown fields are dropped at both AI boundaries. Changing ECU invalidates the last clear permission before any configuration command. Failed physical configuration invalidates initialization; reconnect before further work. CAN clearing is physically addressed and requires a valid 44 from exactly the selected ECU; an uncertain outcome cannot simply be retried with the old snapshot.

Protocol source: ELM327DSK pp. 17 (ATDPN/D0), 41–45 (headers/ISO-TP), 47 (ATCRA). The [python-OBD CAN implementation](https://github.com/brendan-w/python-OBD/blob/master/obd/protocols/protocol_can.py) also documents CAN DTC count placement. No upstream application code was copied. Tests cover 11/29-bit addressing, interleaving and sequence/length failures, controller selection, failed configuration, wrong-controller responses, scope propagation and clear guards. Physical CAN adapters and ECU behavior remain unverified.

## Local VIN reading

`readVin(vehicleId)` is available only after CAN controller selection. It sends 0902 physically to that controller and applies the same frame/identity checks. The decoder requires 49 02 01 plus exactly 17 valid uppercase ASCII VIN characters; all-zero placeholders fail. The result is previewed and confirmed before an atomic garage update. A stale existing VIN prevents replacement. Optional local source evidence is validated against the stored VIN and removed if that VIN is edited manually. No internet decoder, manufacturer specification, checksum guarantee or vehicle-authenticity claim is attached. VIN remains excluded from AI and sales reports. Hardware VIN reads have not been performed.

## Session and live measurements

Starting a session through `startDiagnostics()` includes initialization and a full ECU scan. An adapter acknowledgement alone is insufficient; no vehicle response closes the connection. Multiple CAN addresses require controller selection.

The `readLiveParameters()` method refreshes supported measurements and voltage only. It uses the last full scan PID list, scoped to the vehicle and selected ECU. It does not poll fault codes again or change the report. A live measurement, ECU change, reinitialization and clear attempt invalidate permission to clear based on the earlier report.

Transports expose `onDisconnected()` between commands as well. Before the first command, BLE tolerates startup ASCII data up to 8192 characters; excess or invalid bytes close the connection. After the first command, strict request/response ownership still applies.


## Advanced OBD diagnostics

The `readSnapshot(vehicleId, {extended: true})` option adds a validated version 1 extension without changing garage schema 3. The catalog contains 54 scalar PIDs; other advertised PIDs remain visible ECU capabilities without an invented decoder. Mode 02 has independent support maps and frame number 0. The triggering code is checked again after collection; a change aborts the scan. The ECU can overwrite a frame with the same code, so collection is not guaranteed atomic. Retrieval time is not fault occurrence time.

PID 4F/50 configuration changes MAP, MAF and commanded lambda scaling. It is fetched during an extended scan or the first Live Data measurement requiring it and cached within ECU scope. Basic scans do not need it. No reply for advertised configuration leaves dependent values unknown. The optional second fuel-trim byte is accepted; only the named primary bank is displayed. O2 sensors have neutral ordinal labels because bank layout cannot be assumed without location interpretation.

Import checks physical bounds, unique supported PIDs, readiness advertised by PID 01, frame 0 and agreement with duplicated basic fields. JSON exported before clearing is matched by its entire payload rather than report ID. CSV preserves negative numeric values and neutralizes formulas in text. HTML escapes textual data and excludes VIN, plates and routes. Automatic AI context retains the existing four fields.

The basic scan reads RPM, coolant, load, adapter voltage and available fault statuses. A separate extended scan requests supported catalog entries, PID 01 readiness monitors and freeze frame 0. This does not establish access to all controllers or manufacturer diagnostics. Missing data stays unknown.

Live Data supports up to 8 advertised PIDs. The 2/5/10-second pause starts after the previous cycle completes, so actual cadence depends on the adapter. The chart holds the latest 300 cycles in session memory. Missing readings and resumptions create separate segments. Export CSV before leaving the screen or changing vehicles; sessions are not automatically saved in the garage.

The full report retains its timestamp and codes during Live Data. Save it in history, download JSON/CSV or export PDF in the native app and HTML in the browser. History offers search and pages of 20 records. Comparison requires the same vehicle and explicit matching CAN ECU address and protocol; older unscoped reports remain readable and exportable. Only common DTC statuses are compared. A code not reported again does not establish repair.

Clearing requires the exact current report, a saved copy, acknowledgement that the copy was retained and a separate command confirmation. PDF/CSV does not replace a complete JSON or history backup. Run a new full scan after Live Data. Disconnecting cannot undo a clearing command already sent. A cancelled scan does not replace the previous completed report.

[Scope and verification](../../../docs/verification/2026-11-27-advanced-diagnostics.en.md)
