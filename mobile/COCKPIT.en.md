[Polski](COCKPIT.md) | [English](COCKPIT.en.md) | [Deutsch](COCKPIT.de.md)

# Diagnostic cockpit

In Diagnostics choose “Otwórz animowany kokpit”. The view keeps the current OBD2 connection, supports another reading and Live every 5 seconds. Garage also opens a separate cockpit for saved readings. Layout adapts to phones, tablets and landscape standalone Android radios where the app can be installed.

The displayed vehicle is the active garage profile with its own photo. Add a photo in Garage; otherwise a symbol and instructions remain. We do not fetch a random photo or 3D model. The profile does not establish the connected vehicle’s identity: compare the observed VIN with its documents.

Four bars show engine speed, coolant temperature, engine load and adapter voltage. They animate real measurement changes and respect system reduced motion. Missing data is a dash. The Live label requires active streaming, matching vehicle, adapter and ECU, and a sample no older than 15 seconds. Parameter and code timestamps are separate. A partial reading does not establish absence of all faults. Bar scales are not health thresholds.

## CarPlay and Android Auto

The full animated cockpit runs within the app. Bluetooth alone cannot project it onto a radio or replace the OBD2 diagnostic source. Android Auto offers no general diagnostics category; the app does not declare a false navigation, media or IoT category.

Prepared native CarPlay source uses a system list: an owner-photo thumbnail, vehicle description and latest saved diagnostics with timestamp and ECU scope. It sends no Live readings or engine animations. Same-vehicle data refreshes at most every 10 seconds; changing/removing a vehicle immediately removes its previous identity. Data stays in process memory, without a separate file, server, VIN, plates, notes or adapter names. After a process restart open the app to synchronize the garage; otherwise the list shows no data.

Integration is disabled by default. Apple must approve the app’s scope and Driving Task entitlement; approval for this feature is not guaranteed. Only after obtaining the entitlement and matching signing profile set `enabled` to `true` for `./plugins/withCarPlay.cjs` in `mobile/app.json` and create a new native build. The plugin registers the scene and entitlement; disabling it again removes its configuration while preserving other scenes. Expo Go and a JS-only update cannot add CarPlay support. No native compilation or radio test was performed: the environment lacks Xcode and Android SDK.

[Apple template rules](https://developer.apple.com/download/files/CarPlay-Developer-Guide.pdf) · [Android car app categories](https://developer.android.com/training/cars)

## Session controls and chart

The cockpit opened from Diagnostics can connect the adapter using the current BLE, Bluetooth Classic or Wi-Fi configuration, disconnect it, open configuration, select a responding CAN ECU and save the full reading to history. A busy adapter prevents concurrent operations. Success messages and errors remain visible in the cockpit. The save button indicates when this exact report is already in history. Later Live measurements do not change the saved report or its timestamp.

Select one of four parameters in the session chart. It shows up to 60 actual samples in a collection window of at most 5 minutes, with start/end times and observed value range. Stopping Live retains the last captured window; it does not represent measurements from the present moment. Missing parameter readings and gaps over 15 seconds break the line. A new full reading, ECU change or reconnection starts a new chart. Samples stay in session memory and never enter history, backup, AI or CarPlay. No sample data is drawn when measurements are absent.
