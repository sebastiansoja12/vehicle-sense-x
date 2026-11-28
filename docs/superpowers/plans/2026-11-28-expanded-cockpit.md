[Polski](2026-11-28-expanded-cockpit.md) | [English](2026-11-28-expanded-cockpit.en.md) | [Deutsch](2026-11-28-expanded-cockpit.de.md)

# Rozbudowany kokpit diagnostyczny

Cel: animowany schemat auta, wskaźniki pomiarów, identyfikacja VIN i wybierane zdjęcia poglądowe modelu.

Architektura: istniejące Expo SDK 58, React Native Animated i react-native-svg. Bez nowych zależności. Odczyty i tożsamość mają odrębne źródła.

Ruch pomiarów tylko dla świeżego Live; brak danych, historia i import pozostają statyczne. Obsłużyć ograniczenie ruchu, utratę fokusu i tło.

Zdjęcie właściciela ma pierwszeństwo. Commons po świadomym uruchomieniu wyszukiwania, wyłącznie marka/model/rok; bez VIN i rejestracji. Użytkownik wybiera fotografię z podpisem autora/licencji.

Droga /cockpit używa istniejącego cyklu połączenia OBD; odczyt VIN zachowuje potwierdzenie przed zapisem.

Najpierw testy zakresu danych i klienta zdjęć; potem implementacja, TypeScript/lint, pełne testy, eksporty i przegląd 320/390/1440 px.

Sprzęt OBD, fizyczne urządzenia i zgodność zdjęcia z generacją wymagają osobnej weryfikacji.

`mobile/src/DiagnosticCockpit.tsx`, `mobile/src/CockpitVehicle.tsx`, `mobile/src/CockpitIdentity.tsx`, `mobile/src/vehicle-images.ts`, `mobile/src/cockpit.ts`, `mobile/src/obd/DiagnosticsScreen.tsx`, `mobile/src/app/cockpit.tsx`.

Weryfikacja: testy obejmują potwierdzenie VIN w bezpośrednim kokpicie, wymianę zdjęcia po błędzie, zakres raportu i klienta Commons (anulowanie, limity, źródła i aktualny CDN). Zdjęcia wybierane z Commons są podglądem tej sesji; trwałe zdjęcie właściciela dodaje się w Garażu.

`mobile/src/CockpitDetails.tsx`, `mobile/tests/cockpit.test.mjs`, `mobile/tests/cockpit-ui.test.mjs`, `mobile/tests/vehicle-images.test.mjs`, `mobile/tests/obd-screen.test.mjs`.

Wynik końcowy: 383 testy przeszły; TypeScript, lint i kontrola dokumentacji bez błędów. Eksport JavaScript dla web/iOS/Android przebudowano z wyczyszczeniem pamięci bundlera. W przeglądarce sprawdzono układ 320/390/1440 px, uruchamianie i zatrzymywanie podglądu animacji, wybór podzespołu i ograniczenie połączeń OBD do aplikacji natywnej. Rzeczywisty klient Commons zwrócił zdjęcia modelu z autorem i licencją.
