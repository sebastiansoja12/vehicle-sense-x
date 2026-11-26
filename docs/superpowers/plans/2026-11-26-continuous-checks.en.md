[Polski](2026-11-26-continuous-checks.md) | [English](2026-11-26-continuous-checks.en.md) | [Deutsch](2026-11-26-continuous-checks.de.md)

# Continuous project checks

> superpowers:executing-plans

**Goal:** Every push and pull request checks real tests, types, lint, exports and PL/EN/DE documentation.

**Architecture:** One GitHub Actions workflow on Ubuntu, pinned revisions of official actions and Node from `mobile/.nvmrc`. A standard-library Python script checks local Markdown files; tests execute it in temporary Git repositories.

**Specification:** [Release requirements](../../../mobile/RELEASE.en.md). Implementation choice: source checks rather than automatic EAS, publication or server deployment. No secrets or paid calls; the workflow token can only read contents.

## Steps

- [x] Tests for a missing language, orphan translation, incorrect navigation, local links and changed identifiers; run and observe failure.
- [x] `scripts/check-docs.py`: complete triplets, navigation, links and languages, matching commands and structure; implement and verify tests plus actual documentation.
- [x] `.github/workflows/verify.yml`: `npm ci` in `mobile`, all Node tests, types/lint, documentation validation and web/Hermes exports; read-only permissions, timeout and cancellation of older runs.
- [x] Update all three instruction variants; independent review, local checks, commit and push, then inspect the actual GitHub run.

## Review focus

Missing files and broken links must exit nonzero. Exclude `AGENTS.md` instructions, original licenses and JSON. The workflow has no Expo/OpenAI keys, does not sign apps and does not treat JavaScript export as native compilation. System sharing, notifications and radios require separate hardware tests.
