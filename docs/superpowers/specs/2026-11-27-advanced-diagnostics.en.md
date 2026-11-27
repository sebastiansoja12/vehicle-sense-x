[Polski](2026-11-27-advanced-diagnostics.md) | [English](2026-11-27-advanced-diagnostics.en.md) | [Deutsch](2026-11-27-advanced-diagnostics.de.md)

# Advanced OBD diagnostics

Goal: expanded scans of real data, emissions monitors, freeze frame, parameter selection, charts and exports.

Extend the existing ELM327 driver. Basic scans stay fast; extended scans read supported standard PIDs, PID 01 readiness and service 02 frame 0. Data always belongs to the selected ECU. Unavailable readings remain unknown.

An optional version 1 extension preserves old reports and garage schema 3. All new data is validated on import. AI still receives only the existing basic fields. Clearing requires an exact backup of the current report and confirmation.

Live Data supports up to 8 selected PIDs, 2/5/10-second intervals, a chart of the last 300 cycles and CSV export. Gaps are not interpolated. ECU changes reset session history. Full reports retain their own timestamp and never change during Live Data.

Add a standalone HTML/PDF report and CSV, extended history display and comparison limited to common fault statuses within matching ECU scope. A code absent from a later report is not evidence of repair.

Do not add fabricated sensors, condition scores, universal ABS/airbag coverage, ECU coding or actuator activation. Hardware remains unverified until phone and vehicle testing.

[ELM327](https://www.elmelectronics.com/wp-content/uploads/2017/01/ELM327DS.pdf) · [PID](https://www.csselectronics.com/pages/obd2-pid-table-on-board-diagnostics-j1979) · [Readiness](https://python-obd.readthedocs.io/en/latest/Responses/)
