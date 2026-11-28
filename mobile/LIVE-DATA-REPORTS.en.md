[Polski](LIVE-DATA-REPORTS.md) | [English](LIVE-DATA-REPORTS.en.md) | [Deutsch](LIVE-DATA-REPORTS.de.md)

# Live Data session reports

After actual readings, select CSV, JSON or PDF / HTML in the Live Data section. Export pauses refresh. The native app creates PDF and the browser creates HTML for saving or sharing. The retained buffer can still be exported after disconnection.

JSON retains format vehiclesensex-live-session version 1: vehicle/adapter/ECU scope, at most 300 cycles, actual times, units, scaling and pauses. It is neither a garage backup nor a full scan report and cannot authorize code clearing. This format has no import or automatic session storage.

The PDF/HTML summary includes minimum, maximum, arithmetic mean and the value from the latest cycle. No response and no recorded sample have separate counters. The last value is not carried over a gap. The mean is not time weighted; parameters are fetched sequentially. Total elapsed time includes pauses. Complete observations are in JSON/CSV.

ATRV is adapter voltage. ECU voltage from PID 42 is a separate parameter when selected and read. Neither value provides an automatic battery diagnosis. A full buffer indicates that earlier cycles may be unavailable, without asserting they were certainly lost.

Export rejects mixed vehicles, adapters, ECU scopes, invalid measurements and timestamps. VIN, plates, GPS, codes, ECU identification and private notes are omitted. Adapter or vehicle names can still identify the user; inspect the file before sharing. Data is not sent automatically.

These reports are a source change on main after dd64fcd. Previously verified native 0.6.0 packages from dd64fcd do not include this feature and need another build. Physical adapter and native PDF sharing tests have not been performed.

[Verification results](../docs/verification/2026-11-28-live-session-reports.en.md)
