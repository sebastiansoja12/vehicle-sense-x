[Polski](2026-11-26-automotive-services.md) | [English](2026-11-26-automotive-services.en.md) | [Deutsch](2026-11-26-automotive-services.de.md)

# Automotive services Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans. User authorized continuous execution without additional questions.

Goal: Warsztaty i ceny części w istniejącej aplikacji. Architecture: prywatny serwer proxy dostawców; klient Expo z dwoma ekranami. Tech Stack: Node, TypeScript, React Native, Expo 58. Spec: ../../specs/2026-11-26-automotive-services.md

Global Constraints: bez nowych zależności i bez danych demonstracyjnych; brak VIN/tablic; ceny w oryginalnej walucie; zgoda na zapytanie i GPS; token tylko w pamięci.

Review Focus: błędna lokalizacja, przerwanie/zmiana auta, brak cen/transportu, złośliwe URL, brak kluczy API.

Task 1: serwer. Testy w server/automotive.test.mjs: autoryzacja bez AI, stałe adresy, błędne wejścia, cache, częściowe OSM, kwoty i nieznana dostawa. Następnie server/automotive.mjs i trasy w server/index.mjs, Docker i konfiguracja. Uruchom node --test server/*.test.mjs.

Task 2: klient. Testy w mobile/tests/automotive.test.mjs: walidacja wyników, zgoda, biała lista pól, anulowanie i timeout. Następnie mobile/src/automotive-client.ts oraz AutomotiveProvider.tsx, WorkshopsScreen.tsx, PartsScreen.tsx, trasy i wejścia z garażu/startu/serwisu.

Task 3: dokumentacja PL/EN/DE, prywatność i uprawnienia GPS. Pełne testy, typy, lint, walidator dokumentacji i eksport web. Zapis wyników oraz ograniczeń. Wykonanie bez kolejnego zatwierdzenia zgodnie z poleceniem użytkownika; bez commitowania cudzych zmian.
