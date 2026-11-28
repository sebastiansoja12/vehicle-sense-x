[Polski](CONSUMPTION-MAINTENANCE.md) | [English](CONSUMPTION-MAINTENANCE.en.md) | [Deutsch](CONSUMPTION-MAINTENANCE.de.md)

# Consumption, component schedules and oil

Open Consumption and maintenance from the garage, costs or service. Local analysis uses the selected car without a new account or dependencies. Switching cars resets forms. No sample data is added to the garage.

## Fuel charts and calculations

Choose 6 or 12 months through the analysis day. Consumption shows closed full-to-full cycles, including partial fills between full tanks. The first full tank establishes the baseline; its volume is not measured consumption. Open cycles stay outside the average. The average is distance-weighted: measured litres divided by measured kilometres times 100, not an arithmetic mean of points.

A complete cycle belongs to its closing date, with actual dates, odometers, litres and distance shown. Charts show the latest 24 cycles in range; averages include all of them. The horizontal axis is sequential cycles, not proportional time. Buttons select points; a text list exposes values. The second chart switches monthly purchased litres/costs. Purchases in a month are not fuel burned in that month; missing entries do not prove no driving.

Future fills are excluded. Duplicate/decreasing odometers interrupt measurement with a warning. A new valid baseline and another full fill are then required. Charts, garage summary and reports share the algorithm. Accuracy depends on complete entries and consistent filling practice.

## Component and fluid deadlines

Choose a component, inspect/replace, baseline date/odometer, km/month interval and source. Load a baseline from the latest 10 service entries or enter it manually; titles are not auto-matched. No universal numeric intervals are supplied. Consult the exact engine manual and operating conditions. Some listed components may not exist in the selected car.

With both intervals, the first reached boundary is due. Month ends clamp to the last valid day. Remaining days/km and interval progress are scheduling values, not measured wear. Mileage uses the garage's manual odometer without background tracking or a driving-rate date forecast.

Record service atomically creates the actual service/cost, closes the old deadline and calculates the next from actual service. Do not duplicate an existing repair: edit the baseline using its existing entry. Changing a plan does not prove repair. Enable date notifications separately in service; an enabled plan notification carries into the next cycle with a new ID, subject to OS permission. Manual reminders remain supported.

## Oil and OBD capabilities

Full scans request supported-PID page 40 only when advertised, and PID 5C only when supported. This is oil temperature, not level, pressure or remaining life. Source/time/ECU scope are displayed; imports are labelled. Zero remains zero; missing stays unknown; malformed frames/timeouts fail. Live Data adds no query. Older reports may lack this value.

The log records/corrects a manual level check, actual top-up litres and optional remaining-life display copied from the vehicle. This is not OBD evidence. It enters service/cost history without resetting the change interval or vehicle indicator, and does not displace a repair's diagnostic-comparison baseline. Neither temperature nor percentage determines top-up quantity or change deadline. For an out-of-range level, verify the current state according to the vehicle manual.

## Data, exports and limits

New fields are optional on existing records/reminders without changing the garage schema. JSON backups preserve schedules, observations and temperature. Reports include interval sources; service CSV adds oil columns. Titles/sources/notes are exported, so check them before sharing. Controlled transport tests and exports do not replace physical adapter testing.

Technical sources: [Expo 58 SVG](https://docs.expo.dev/versions/v58.0.0/sdk/svg/), [python-OBD oil-temperature PID](https://github.com/brendan-w/python-OBD/blob/master/obd/commands.py). No library code copied or dependency added. Examples separating level checks and change indicators: [Ford level check](https://www.fordservicecontent.com/Ford_Content/vdirsnet/OwnerManual/Home/Content?ProcUid=G1612710&Uid=G1724246&buildtype=web%2F1000&countryCode=USA&div=f&languageCode=en&moidRef=G539653&userMarket=USA&vFilteringEnabled=False&variantid=4163), [reset after changing](https://www.fordservicecontent.com/Ford_Content/vdirsnet/OwnerManual/Home/Content?ProcUid=G2254282&Uid=G2245241&buildtype=web&countryCode=USA&div=f&languageCode=en&userMarket=ZAF&vFilteringEnabled=False&variantid=8921). These are not universal intervals for other cars.
