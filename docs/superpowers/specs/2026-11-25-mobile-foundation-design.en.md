[Polski](2026-11-25-mobile-foundation-design.md) | [English](2026-11-25-mobile-foundation-design.en.md) | [Deutsch](2026-11-25-mobile-foundation-design.de.md)

# VehicleSenseX — mobile app foundation

## Approved direction

The user approved the appearance in the phone preview and instructed implementation to begin. The product specification consists of the eight modules described in the conversation and the README. Preserve the light, flat interface, graphite, restrained red, five tabs and concrete data instead of decorative indicators.

## Stage goal

Deliver a runnable app for iOS, Android and browser verification. First stage: a multiple-vehicle garage, active-vehicle selection, refueling, service history and calculations based on real entries. No login or external services. No fictional vehicles or numbers by default. Sample data only after deliberately opening demo mode.

## Approach

- Selected by the implementer: React Native + Expo + TypeScript. One client for both stores; native components and support for later Bluetooth/GPS integrations.
- Two separate Swift/Kotlin apps would require implementing the approved interface twice.
- Wrapping the existing page offers no advantage at this stage for the intended hardware features. The prototype remains a separate reference in the root directory; implementation is developed in `mobile/`.
- Local persistence: AsyncStorage, a versioned and validated JSON document. This is a choice for a small record set in the first stage; do not use it for secrets, GPS traces or invoices. Move to a SQL database as history grows.

## Data rules

- Fuel and maintenance records always include the vehicle identifier. Changing the vehicle changes every summary.
- Prices and costs are stored in grosz, fuel quantities in milliliters, and mileage in whole kilometers.
- Validate Polish decimal commas and decimal points, quantity and price bounds, real calendar dates with no future entries, mileage and VIN.
- Refueling is added chronologically relative to the last refueling; mileage cannot decrease. A service entry may be historical. Vehicle mileage increases to the maximum of saved entries.
- Full-to-full consumption sums partial refueling between full tanks. Insufficient data produces `null`, never a fabricated result or zero.
- A read error or unknown schema does not reset data. A write error does not close the form or show success. Further writes are blocked until the previous one completes.
- Demo mode is separated from personal data and can be closed without changing the user's garage.

## Screens

Home, Diagnostics, Trips, Costs and Garage. Garage also leads to Maintenance, Condition, Driving Style and Assistant. Garage, fuel and maintenance are functional. Home and Condition show only available data; the absence of OBD2/GPS/AI is explicit. Do not create fake real scans or pretend model responses.

Forms in a native Modal, keyboard handling, screen-reader labels, Android Back, safe screen areas and touch targets of at least 44 px. The layout follows the approved design. The Tiguan render is used only in demo mode; do not assign this illustration to personal vehicles.

## Outside this stage

OBD2 requires adapter selection and hardware tests. GPS, background operation, notifications, attachments, VIN API, valuation, AI, accounts and synchronization remain separate stages. Do not publish the app in stores or add paid services.

## Verification

Logic tests: validation, vehicle isolation, partial refueling, cost totals and corrupt persistence. TypeScript without errors; platform bundle export. Phone web preview and a manual flow: add vehicle → refueling → maintenance → refresh → second vehicle. Physical-device tests and signed builds are reported separately.
