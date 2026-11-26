[Polski](2026-11-26-trip-gpx-design.md) | [English](2026-11-26-trip-gpx-design.en.md) | [Deutsch](2026-11-26-trip-gpx-design.de.md)

# GPX 1.1 export

Scope `originalTrips`: export a saved GPS trip next to existing JSON. No new dependencies, maps, services or demo data.

`tripGpx` validates the complete record and reuses `analyzeTrip` segments. Every gap, rejected measurement and pause stays a separate `trkseg`; singleton points remain. At least two accepted points overall are required. Manual entries, invalid records or insufficient tracks produce a visible error.

GPX includes the XML-escaped name, actual WGS84 coordinates and each measurement's UTC time; it adds no altitude, speed or mileage. Coordinates use decimal notation; +180° becomes the equivalent −180°. Invalid XML characters in the name cause an error.

The button shares `vehiclesensex-przejazd.gpx` as `application/gpx+xml` through existing `shareTextFile`. A warning discloses precise locations and measurement times.

Source: [official GPX 1.1 schema](https://www.topografix.com/GPX/1/1/) (`gpxType`, `trkType`, `trksegType`, `wptType`).
