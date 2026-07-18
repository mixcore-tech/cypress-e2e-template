# AGENTS.md

Guidance for AI coding agents (and humans) working in this repository. This is a
Cypress 15 + TypeScript E2E test **template**: a finished engine (`cypress/core/`),
runnable examples against a bundled local demo app, and `TODO(template)`-marked
skeletons that consuming teams fill in for their own app.

**Read this first.** No tool-specific setup is required — this single file is the
contract. It works with any agent (Claude Code, Cursor, Copilot, Windsurf, Aider,
…); the repo carries no per-tool config.

## What makes this repo safe for agents

The architecture is **machine-enforced**, so a change that violates it fails
`npm run lint`, `npm run typecheck`, or CI before it can merge — an agent (or a
human) cannot silently break the design. Treat the checks below as hard rules,
not suggestions, and run them before you consider a change done.

## Commands

```sh
npm test                                  # demo example suite, headless (bundled local app, zero setup)
npm run cy:open                           # interactive runner (boots the demo app)
npm run run:local                         # run against config/environments/local.json
npm run run:spec -- <path>                # single spec (local env)
npm run typecheck                         # tsc over core+app+examples+templates+config
npm run lint                              # ESLint flat config — architectural rules are ERRORS
npm run scaffold -- <feature-name>        # generate spec/page/factory/types/helper (<group>/<name> nests them)
npm run doctor [-- version=<env>]         # setup checker
npm run todo                              # list all TODO(template) fill-in markers
```

The demo suite is fully self-contained: `npm test` starts a zero-dependency local
app (`scripts/demo-server.mjs` serving `demo/app/`), runs Cypress against it, and
stops it — no third-party sites, deterministic and offline.

## Guardrails that will FAIL your change if you break them

Enforced by `eslint.config.mjs` (`no-restricted-*`) and `cypress/tsconfig.json`
(strict). Do not fight them — write code that satisfies them:

- **No bare `cy.get` / `cy.request` / `cy.intercept` in specs or page objects.**
  Specs act through page objects; page objects delegate to `UIElementsHandler` /
  `UITableHandler`; API traffic goes through `ApiHelper` / `cy.apiRequest`. Only
  `cypress/core/**` and `cypress/support/**` may hold those primitives.
- **`cypress/core` may import from `@app` only via `@app/app-selectors`** — the
  engine stays app-agnostic.
- **Specs never import `@core/ui/*`** except `@core/ui/table-types`.
- **`cypress/support` never imports `@app/helpers/*`** (commands are primitives
  helpers build on, not the reverse).
- **No `Cypress.env()` in browser code** — read env values with the async
  `cy.env([ENV_KEY.x])` command; store runtime data with `Cypress.expose`.
- **No `cy.wait(<ms>)`** — wait on intercept aliases or the loader.
- **Strict TypeScript**, no `@ts-ignore` for config reads (type custom config
  keys in `cypress/support/index.d.ts`).

CI additionally runs a **scaffold guard**: it generates a throwaway feature and
re-typechecks/lints it, so the generator can never silently rot.

## Architecture

Layering (documented in `docs/ARCHITECTURE.md`). Cross-layer imports use the
`@core/*` / `@app/*` aliases (resolved at runtime by the webpack preprocessor);
relative imports only within a layer.

- `cypress/core/` — the engine; **you do not edit it to add a feature** (see
  below). Element/table handlers, the intercept engine, navigation, utils.
- `cypress/app/` — the consumer's layer: `app-selectors.ts`, `env-keys.ts`,
  `urls.ts` (the single URL registry), plus `pages/`, `api/`, `helpers/`.
- `cypress/support/commands/` — `cy.apiRequest` (+ optional Zod `validate`),
  `cy.loginViaApi/loginViaForm/logout` (cached with `cy.session`), optional DB.
- `cypress/examples/` — runnable demos against the bundled local app.
- `cypress/templates/` — fill-in skeletons the scaffold instantiates.

Page objects are static classes: `locators` (data-cy selectors; a delimited
`{text}` token is `.replace()`d at call time), `tableColumnsHeaders`, and
camelCase action methods that delegate to the handlers.

## How to add a feature

1. `npm run scaffold -- <name>` — generates the spec/page/factory/types/helper set
   and inserts a `URLs.<name>sApi` entry.
2. Resolve every `TODO(template)` marker (`npm run todo | grep <name>`): endpoints
   in `cypress/app/urls.ts`, payload/response types, page selectors (data-cy).
3. Verify: `npm run typecheck && npm run lint && npm test`.

## Editing the engine (`cypress/core/**`)

Do **not** edit `cypress/core/**` when adding a feature — a missing capability is
almost always a new handler method, not a `cy.get` in a page object. If you find
a **genuine bug** in the engine, open an issue (or a dedicated PR) rather than
patching core inside a feature PR, so engine changes stay reviewable on their own.
See `CONTRIBUTING.md`.

## Environment system

`--env version=<name>` (default `demo`) selects `config/environments/<name>.json`:
top-level keys merge into `Cypress.config()` (`baseUrl`, `apiBaseUrl`); the nested
`"env"` block provides env values. Only `demo.json` and `*.example.*` are
committed — real env files are gitignored. If `config/environments/<name>.db.js`
exists, the optional SQL Server DB module activates; otherwise its task throws a
fail-fast pointer.

## Gotcha

If Cypress fails to start with `bad option: --no-sandbox`, the shell has
`ELECTRON_RUN_AS_NODE=1` (some VS Code extension hosts set it). Run with it
cleared: `env -u ELECTRON_RUN_AS_NODE npm test`.

---

Works with any AI agent — no per-tool config lives in this repo. Keep this file
the single source of truth for how to operate here.
