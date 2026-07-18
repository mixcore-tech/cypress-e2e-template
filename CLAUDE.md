# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A framework-agnostic Cypress 15 + TypeScript E2E test **template**. It ships a finished engine (`cypress/core/`), runnable examples against public demo sites, and `TODO(template)`-marked skeletons that consuming teams fill in for their own app. Allure reporting is built in; a SQL Server module is optional and off by default.

## Commands

```sh
npm test                                  # demo example suite, headless (public site, zero setup)
npm run cy:open                           # interactive runner, demo environment
npm run run:local                         # run against config/environments/local.json
npm run run:spec -- <path>                # single spec (demo env)
npm run typecheck                         # tsc over core+app+examples+templates+config
npm run lint                              # ESLint flat config (cypress/no-unnecessary-waiting is an error)
npm run scaffold -- <feature-name>        # generate spec/page/factory/types/helper for a feature (<group>/<name> nests them)
npm run doctor [-- version=<env>]         # setup checker
npm run todo                              # list all TODO(template) fill-in markers
npm run report:allure                     # serve Allure report (needs Java)
```

Infra: CI (`.github/workflows/ci.yml`) shards the suite across 3 containers via cypress-split (wired in `cypress.config.ts`; reads `SPLIT`/`SPLIT_INDEX`, no-op locally), merges Allure results, and publishes a trend report to GitHub Pages on `main`. `Dockerfile`/`docker-compose.yml` give a pinned Cypress image + an mssql service for the DB module. A husky pre-commit hook runs lint-staged (`eslint --fix` + prettier). cypress-axe is registered in `support/e2e.ts`; opt in per visit via `Navigator.visitUrl({ a11y: true })`. @cypress/code-coverage is wired (support import + config task; `npm run coverage:report`) — emits only when the app is istanbul-instrumented. Ownership: `.github/CODEOWNERS` assigns `cypress/core`, config, templates, scripts to the framework architects; contribution rules in `CONTRIBUTING.md`. Note: `overrides` in package.json pins the batteries preprocessor's peer to webpack-preprocessor 7 (its declared peer of 6 is stale and crashes on TS) — needed for a clean `npm ci`.

## Environment System

`--env version=<name>` (default `demo`) selects `config/environments/<name>.json`: top-level keys merge into `Cypress.config()` (`baseUrl`, `apiBaseUrl`); the nested `"env"` block provides the env values (`username`, `password`). Only `demo.json` and `*.example.*` files are committed — real env files are gitignored. If `config/environments/<name>.db.js` exists, `cypress.config.ts` wires cypress-sql-server (the optional DB module); otherwise the `sqlServer:execute` task throws a fail-fast pointer.

`Cypress.env()` is deprecated in browser code and banned by lint (removed in a future Cypress major). Specs read env values with the async `cy.env([ENV_KEY.x])` command; runtime shared data (fixtures, reference caches) uses `Cypress.expose` (FixtureUtils namespaces fixture data under `Cypress.expose('fixtures')`). `allowCypressEnv` stays at its default only because allure-cypress (≤3.10.2) still reads `Cypress.env('allure')` — flip it to false in cypress.config.ts when allure migrates.

Custom config keys are typed in `cypress/support/index.d.ts` — never use `@ts-ignore` for config reads.

## Architecture

Layering (lint-enforced via `no-restricted-imports` blocks in eslint.config.mjs: core→app only through app-selectors; specs never import `@core/ui/*` except `table-types`; support never imports `@app/helpers/*`; documented in docs/ARCHITECTURE.md#layer-contracts). Cross-layer imports use the `@core/*`/`@app/*` aliases (cypress/tsconfig.json `paths`, resolved at runtime by `@cypress/webpack-batteries-included-preprocessor` wired in cypress.config.ts); relative imports only within a layer.

- `cypress/core/` — the engine; consumers never edit it. `ui/ui-elements-handler.ts` (element interactions; timeouts come from `defaultCommandTimeout`, not per-call params; also `uploadFile`/`verifyDownload`/`getShadowElement`/`getIframeElement`), `ui/ui-table-handler.ts` (semantic-`<table>` verification via `ITableValidationPair`), `api/api-helper.ts` (intercept-with-random-alias engine: `interceptNetworkRequests` → act → `waitForApiResponse`), `navigation/navigator.ts` (single visit funnel; `visitUrl({ a11y: true })` runs a cypress-axe scan after the loader settles), `utils/` (DataGenerator, CollectionUtils.formatWithParams for token-templating URLs/SQL, DateUtils, FixtureUtils — fixture data lands namespaced under `Cypress.env('fixtures')`). Core imports nothing app-specific except `@app/app-selectors` — the single config contract (loader selector, dropdown option selector, multi-select search selector, checked classes, API glob; `null` disables a behavior).
- `cypress/app/` — the consumer's layer: `app-selectors.ts`, `env-keys.ts` (ENV_KEY enum), `urls.ts` (the single URL registry — all endpoints, built from `apiBaseUrl`; the scaffold inserts TODO entries at its `scaffold:endpoints` marker), `api/types/login-response.d.ts` (`ILoginResponse`, what `cy.loginViaApi` yields), plus their `pages/`, `api/` (factories + payload/response `.d.ts`), `helpers/` (entity helpers with `static createdIds: number[]` + `after()` cleanup convention).
- `cypress/support/commands/` — `api-commands.ts` (generic `cy.apiRequest` yielding the response body; optional `validate` Zod schema parses the body and throws a categorized drift error), `auth-commands.ts` (`cy.loginViaApi`/`loginViaForm`/`logout` — ship as fail-fast TODO throws until the consumer implements them; demo examples never call them; `loginViaForm` blacks out `AppSelectors.passwordFieldSelector` from failure screenshots), `db-commands.ts` (optional SQL Server module, inert until a `<version>.db.js` exists).
- `cypress/examples/` — runnable demos (in `specPattern`) against the-internet.herokuapp.com (login + tables), example.cypress.io (interception) and jsonplaceholder (API). Deletable as one folder.
- `cypress/templates/` — fill-in skeletons: valid TypeScript, type-checked, **excluded from `specPattern`**. They are also the source files `scripts/scaffold.mjs` instantiates (renaming `feature`→name variants; only template-to-template imports are rewritten — to `@app/...` destinations — so generated files can nest at any depth). Type skeletons stay plain `.d.ts` (no `.template` marker) so TypeScript treats them as declaration files.

Page objects are static classes: `locators` (data-cy selectors; a delimited `{text}` token in a locator is `.replace()`d at call time), `tableColumnsHeaders`, camelCase action methods delegating to the handlers — never `cy.get`/element interactions directly (browser-level reads like `cy.url()`/`cy.window()` are allowed).

## Conventions

- Test titles carry test-case ids: `it('TC-1234: ...')`.
- No bare `cy.wait(milliseconds)` — lint-enforced; wait on intercept aliases or the loader.
- All user-visible test data is random (`DataGenerator`) because `retries.runMode = 1` re-runs failed tests.
- Every fill-in point is a greppable `// TODO(template):` comment with a `TODO_` placeholder value that still compiles; load-bearing gaps throw descriptive errors instead.
- The zero-reference rule: the template must contain no product-specific names — verify with the greps in the repo history's plan or `npm run todo` for fill-in points.

## Gotcha

If Cypress fails to start with `bad option: --no-sandbox`, the shell has `ELECTRON_RUN_AS_NODE=1` (VS Code extension hosts set it). Run Cypress with `env -u ELECTRON_RUN_AS_NODE ...`.
