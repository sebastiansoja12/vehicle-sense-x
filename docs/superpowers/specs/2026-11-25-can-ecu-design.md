# CAN ECU selection and framed replies

Continuation of the user's real Bluetooth/Wi-Fi OBD implementation request. The current headers-off parser deliberately refuses multiple ECU replies. Extend ISO 15765-4 protocols 6/7/8/9 using the official ELM327DSK sections on headers, multiline responses and receive filters. No proprietary commands or inferred ECU names.

On first read, 0100 starts protocol discovery; ATDPN identifies it. Legacy protocols retain the existing parser. CAN enables headers, disables displayed DLC and enables normal automatic flow control. A functional 0100 discovers actual standard OBD response addresses. A single address may be selected automatically; several addresses require an explicit user choice. Configure the corresponding physical request header and exact receive filter. Each subsequent reply must come from that selected address; never merge readings across ECUs.

Reassemble ISO-TP single/first/consecutive frames separately by CAN ID, enforcing lengths and sequence numbers. Interleaving is allowed; incomplete, duplicate or malformed messages fail. Only standard 11-bit 7E8–7EF and 29-bit 18DAF1xx response addresses are eligible; other addressing remains explicitly unsupported.

An optional validated ECU scope (protocol and response address) travels with saved/imported snapshots and reports, without migrating or replacing old records. Reports and UI clearly identify a single-controller scan. Clearing remains guarded by the exact saved snapshot and now uses physical addressing for CAN; positive acknowledgement from the selected ECU is required. Changing ECU invalidates the previous clear permission. AI must not receive a scoped reading without preserving its scope. Extend the client/server whitelist with validated protocol/address fields and disclose them on the consent screen.

Physical-device validation remains required. Non-CAN multi-controller framing, extended addressing, CAN FD, pending negative responses and proprietary diagnostics remain unsupported rather than guessed.
