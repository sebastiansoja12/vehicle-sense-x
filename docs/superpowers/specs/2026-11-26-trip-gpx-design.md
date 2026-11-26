[Polski](2026-11-26-trip-gpx-design.md) | [English](2026-11-26-trip-gpx-design.en.md) | [Deutsch](2026-11-26-trip-gpx-design.de.md)

# Eksport GPX 1.1

Zakres `originalTrips`: eksport zapisanej trasy GPS obok istniejącego JSON. Bez nowych zależności, map, usług i danych pokazowych.

`tripGpx` waliduje cały rekord i korzysta z segmentów `analyzeTrip`. Każda przerwa, odrzucenie pomiaru i pauza pozostają oddzielnym `trkseg`; pojedyncze punkty nie znikają. Wymagane są co najmniej dwa przyjęte punkty łącznie. Wpis ręczny, błędny rekord lub niewystarczający ślad powoduje widoczny błąd.

GPX zawiera nazwę z kodowaniem XML, rzeczywiste współrzędne WGS84 i czas UTC każdego pomiaru; nie dopisuje wysokości, prędkości ani przebiegu. Współrzędne używają zapisu dziesiętnego; +180° staje się równoważnym −180°. Niedozwolone znaki XML w nazwie powodują błąd.

Przycisk udostępnia `vehiclesensex-przejazd.gpx` jako `application/gpx+xml` przez istniejący `shareTextFile`. Ostrzeżenie mówi o dokładnej lokalizacji i czasie pomiarów.

Źródło: [oficjalny schemat GPX 1.1](https://www.topografix.com/GPX/1/1/) (`gpxType`, `trkType`, `trksegType`, `wptType`).
