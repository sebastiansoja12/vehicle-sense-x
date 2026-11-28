[Polski](ECU-IDENTIFICATION.md) | [English](ECU-IDENTIFICATION.en.md) | [Deutsch](ECU-IDENTIFICATION.de.md)

# ECU identification

Source 0.6.0/build 8 adds a separate full CAN scan with CALID, CVN and controller name. Cockpit, emissions readiness, oil temperature and workshop comparisons from main are preserved.

Select a vehicle, connect the adapter and wait for the basic scan. If multiple CAN controllers replied, select one. “Pełny skan z identyfikacją ECU” reads the service 09 bitmap and then only advertised CALIDs, CVNs and ECU name. Ordinary basic and extended scans add none of these queries. VIN keeps its separate read and confirmation.

Data stays associated with the vehicle, protocol and ECU address. Status distinguishes unsupported data, no response and negative NRC responses. NRC 78, ambiguous data and malformed frames abort identification; reconnect before another query. A rejected scan does not replace a completed report.

CALID preserves up to 16 characters and CVN eight hexadecimal digits including leading zeroes. Lists retain order, capped at 64 items, without assuming one CVN per CALID. ECU name has separate manufacturer-reported acronym and description. These values do not establish software authenticity, tuning, repair or vehicle condition.

History and JSON backups preserve identification. Diagnostic CSV/PDF/HTML includes it and discloses potentially vehicle-identifying text. Sale reports and automatic AI context omit identification; AI receives only the existing four basic measurements. History comparisons compare only jointly available fields from the same ECU.

[Verification](../docs/verification/2026-11-28-ecu-identification.en.md)
