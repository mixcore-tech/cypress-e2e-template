# Changelog

All notable changes to this template are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Demo suite is now **self-hosted and deterministic**: `npm test` boots a bundled
  local app (`demo/app/` + `scripts/demo-server.mjs`) instead of third-party
  sites, and runs offline. `npm run demo` serves it for manual clicking.
- Example page objects now select by **`data-cy`**, following the template's own
  best practice; the demo UI was polished (shared nav, accessible login page).
- `defaultCommandTimeout` lowered from 30s to 10s so a large global timeout no
  longer masks slow selectors.

### Added

- **`AGENTS.md`** — a vendor-neutral AI-agent guide (replaces the Claude-specific
  file), documenting the machine-enforced guardrails that keep the architecture
  intact under agent-driven changes.
- **`docs/DEMO.md`** — a dedicated guide to the demo app, its mock API, the
  EX-1…EX-11 map, and how to run/delete it.

## [1.0.0] - 2026-07-19

Initial release.

### Added

- Layered architecture (specs → page objects → core handlers) with **ESLint-enforced** layer
  contracts — no bare `cy.get`/`cy.request`/`cy.intercept` in specs or page objects, core stays
  app-agnostic, support never imports entity helpers.
- Strict TypeScript with `@core`/`@app` path aliases (resolved at runtime by the webpack preprocessor).
- Scaffold generator (`npm run scaffold`, nested `group/name` supported) and a setup `doctor`.
- API layer: `cy.apiRequest` with optional Zod response validation; `cy.loginViaApi`/`loginViaForm`
  cached with `cy.session`; typed payload factories.
- Intercept-and-assert engine and semantic-table verification (`ITableValidationPair`).
- Accessibility scans via cypress-axe at the single navigation funnel (`visitUrl({ a11y: true })`).
- Handlers for file upload/download, shadow DOM and iframes.
- Allure reporting; optional SQL Server module (off by default).
- Sharded CI (cypress-split) that merges per-shard results into a trend report published to GitHub Pages.
- Dockerfile + docker-compose (Cypress + SQL Server), husky pre-commit hooks, `npm audit`, Dependabot, CODEOWNERS.
- Screenshot redaction of the password field during `loginViaForm`.
- Code-coverage wiring (`@cypress/code-coverage`, `npm run coverage:report`).
- Docs: README, ARCHITECTURE, ADDING-A-FEATURE-TEST, BEST-PRACTICES, DATABASE-MODULE, CONTRIBUTING.

[1.0.0]: https://github.com/mixcore-tech/cypress-e2e-template/releases/tag/v1.0.0
