[Polski](2026-11-27-consumption-maintenance.md) | [English](2026-11-27-consumption-maintenance.en.md) | [Deutsch](2026-11-27-consumption-maintenance.de.md)

# Consumption and maintenance — implementation plan

> For agentic workers: use superpowers:executing-plans and test-driven-development.

Goal: consumption charts/calculations, component maintenance and oil data using existing Expo 58, React Native 0.88 and react-native-svg 15.16. No new dependencies or invented OEM intervals. The user delegated implementation without further questions.

## Architecture and boundaries

Full-to-full calculations in fuel-analytics.ts include partial fill-ups until the next full tank and distance-weighted averages. First full tank is the baseline; open cycles are not consumption and monthly purchases are not usage. Selected vehicle and dates up to analysis day only. Duplicate/decreasing odometers break measurement with a warning. 6/12-month ranges assign entire cycles to closing dates and expose actual dates.

Optional schedule on existing Reminder validated by maintenance-model.ts: baseline date/odometer, km/month interval, component, inspect/replace and explicit source. First reached boundary is due. Remaining days/km and progress describe schedules, not component wear. Completion atomically records actual service and the next deadline. Existing manual reminders/notifications remain. No garage schema change. Optional oilObservation and maintenanceComponent on ServiceEntry survive edits/backups. Oil observations are manual, without invented diagnosis/top-up quantities.

Full scan reads advertised page 40 and PID 5C. Optional oilTemperatureC on DiagnosticSnapshot; NO DATA becomes null, transport/wrong-ECU errors fail. No new Live Data query. Temperature is not oil level/life. Display source/time/ECU in diagnostics, analytics and reports. No ECU writes.

## Tasks and checks

- [ ] Tests fuel-analytics.test.mjs: full/partial fill-ups, distance weighting, open cycles, future dates, other vehicle, duplicate/decreasing mileage and monthly purchases. Red, implement fuelAnalytics(state, vehicleId, today), green.
- [ ] Tests maintenance.test.mjs: month-end arithmetic, km OR date, source/bounds validation, old backups, new fields, atomic completion and renewal. Implement maintenance-model.ts, maintenance.ts and narrow records.ts/domain.ts/features.ts extensions.
- [ ] Tests oil-obd.test.mjs: advertised PID, zero, missing, malformed/timeout, CAN scope and clear protection. Extend protocol.ts, types.ts and driver.ts; preserve data in history/reports.
- [ ] insights.tsx, FuelCharts.tsx, MaintenancePlanner.tsx and OilLog.tsx with garage/costs/service entry points. SVG plus textual values; plan editing and service completion with validation. Vehicle switching resets forms. No sample records in user data.
- [ ] PL/EN/DE docs, repository tests, typecheck/lint, web/Hermes exports, synthetic 390 px UI and independent review. No claims of hardware testing, OBD oil level/life or OEM compatibility.
