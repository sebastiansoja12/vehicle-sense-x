[Polski](2026-11-26-automotive-services.md) | [English](2026-11-26-automotive-services.en.md) | [Deutsch](2026-11-26-automotive-services.de.md)

# Automotive services Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans. User authorized continuous execution without additional questions.

Goal: Workshops and part prices in the existing app. Architecture: private provider proxy and two Expo screens. Tech Stack: Node, TypeScript, React Native, Expo 58. Spec: ../../specs/2026-11-26-automotive-services.en.md

Global Constraints: no dependencies or demo data; no VIN/plates; original currencies; consent for requests and GPS; memory-only token.

Review Focus: invalid location, cancellation/car changes, missing prices/shipping, unsafe URLs, missing API keys.

Task 1: server. Test server/automotive.test.mjs for authorization independent of AI, fixed URLs, invalid input, cache, partial OSM, money and unknown shipping. Implement server/automotive.mjs and routes in server/index.mjs, Docker and configuration. Run node --test server/*.test.mjs.

Task 2: client. Test mobile/tests/automotive.test.mjs for response validation, consent, whitelisted payloads, cancellation and timeout. Implement mobile/src/automotive-client.ts, AutomotiveProvider.tsx, WorkshopsScreen.tsx, PartsScreen.tsx, routes and garage/home/maintenance links.

Task 3: PL/EN/DE documentation, privacy and GPS permissions. Full tests, types, lint, docs checker and web export. Record results and limits. Execute without further approval as instructed; do not commit unrelated changes.
