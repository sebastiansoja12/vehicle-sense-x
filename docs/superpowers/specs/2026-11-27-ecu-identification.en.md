[Polski](2026-11-27-ecu-identification.md) | [English](2026-11-27-ecu-identification.en.md) | [Deutsch](2026-11-27-ecu-identification.de.md)

# ECU identification

Goal: an optional full CAN scan with software identification reported by the selected controller. Requests 09 04, 09 06 and 09 0A follow the 09 00 support bitmap. Basic and existing extended scans gain no new queries. VIN retains its separate read and confirmation.

Extend the existing report instead of creating another store or querying identification on every connection: persistence, imports, backups and comparisons retain common ECU scope. This is an implementation decision within authorization for continuous expansion. Add no native dependency or controller programming.

Optional version 1 identification inside the report extension preserves garage schema 3 and older reports. Identification requires a confirmed CAN address/protocol. Distinguish no data, unsupported data and negative ECU responses with NRC. Response-pending NRC 78 fails the scan and requires reconnection; do not issue another query while pending.

CALID has 16 bytes per item; CVN has 4 bytes and eight hexadecimal digits; counts must match response lengths, capped at 64 items per list. ECU name has separate 4- and 15-character fields divided by a hyphen. Null padding is allowed only at the end of each field. Preserve list order without assuming one CVN per CALID. Reported identifiers do not establish software authenticity or vehicle condition.

UI shows source and retrieval times, diagnostic JSON/CSV/PDF/HTML retains identification, while the sale report and automatic AI context exclude it. Manufacturer text may contain vehicle-identifying data; disclose scope before diagnostic export. Comparisons require the same ECU and both values available, without inferring repair or tuning. Tests cover ISO-TP, bad counts/padding, wrong ECU, import, missing data, clearing after report modification and export protection. Physical adapters remain untested.

[SAE J1979-DA G4/G6/G10](https://zpost.com/forums/attachment.php?attachmentid=1460101&d=1468796937&s=792c484ee079d2d205539aa7012025a7)
