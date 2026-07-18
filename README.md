# Cypress E2E Template

[![CI](https://github.com/mixcore-tech/cypress-e2e-template/actions/workflows/ci.yml/badge.svg)](https://github.com/mixcore-tech/cypress-e2e-template/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Cypress](https://img.shields.io/badge/Cypress-15-17202C?logo=cypress&logoColor=white)](https://www.cypress.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node-20%2B-339933?logo=node.js&logoColor=white)](.nvmrc)

A framework-agnostic **Cypress 15 + TypeScript** end-to-end test template by [Mixcore Tech](http://mixcore-tech.com/), built for developers — you write specs and page objects; the framework layers are done.

- **Layered page-object architecture** — specs → page objects → generic UI/table handlers; app specifics live in one config file
- **API-first testing** — token-based login command (no UI login in feature specs), intercept-and-assert on real API calls, typed payload factories
- **Table verification engine** — assert whole table rows with a single `ITableValidationPair`
- **Allure reporting** built in, plus an **optional SQL Server module** (off by default) for DB verification/cleanup

Docs: [Architecture](docs/ARCHITECTURE.md) · [Adding a feature test](docs/ADDING-A-FEATURE-TEST.md) (the cookbook) · [Database module](docs/DATABASE-MODULE.md) · [Best practices](docs/BEST-PRACTICES.md)

## Prerequisites

- **Node 20+** (22 pinned in `.nvmrc` — run `nvm use`)
- **Chrome** (or any Cypress-supported browser)
- **Java 11+** — ONLY needed for `npm run report:allure`. Tests run fine without Java.
- Optional: SQL Server access — only if you enable the [DB module](docs/DATABASE-MODULE.md)

## 5-minute quick start

```sh
# 1. Get the code ("Use this template" on GitHub, or clone)
nvm use && npm install

# 2. Prove your machine works — runs the demo suite against a public site
npm test

# 3. Watch the same specs interactively
npm run cy:open

# 4. Open the Allure report (needs Java)
npm run report:allure
```

If step 2 is green, your setup works. Everything after this is wiring the template to YOUR app.

## Scripts

| Script                                                  | What it does                                                                                                                                 |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm test`                                              | Run the demo example suite headless (public site, zero setup)                                                                                |
| `npm run cy:open`                                       | Open the interactive runner on the demo environment                                                                                          |
| `npm run open:local` / `npm run run:local`              | Open / run against YOUR app (`config/environments/local.json`)                                                                               |
| `npm run run:spec -- <path>`                            | Run a single spec against YOUR app (local env), e.g. `npm run run:spec -- cypress/e2e/login.cy.ts` (use `run:spec:demo` for an example spec) |
| `npm run report:allure`                                 | Serve the Allure report from the last run (needs Java)                                                                                       |
| `npm run scaffold -- <name>`                            | Generate a page/spec/factory/types/helper set for a new feature (`<group>/<name>` nests it into a feature folder)                            |
| `npm run doctor`                                        | Check your setup (env file, keys, reachability, Java, DB module)                                                                             |
| `npm run todo`                                          | List every remaining `TODO(template)` fill-in point                                                                                          |
| `npm run lint` / `npm run typecheck` / `npm run format` | Code quality                                                                                                                                 |

Note the `--` when passing arguments through npm (`npm run run:spec -- <path>`). `run:spec` targets your local env; to run a single spec against a different environment, call Cypress directly: `npx cypress run --env version=<name> --spec <path>`.

## Project structure

```
config/environments/   per-environment config: demo.json (committed), local.json (you create, gitignored)
cypress/
  core/                THE ENGINE — handlers, table/intercept/data utilities. You never edit these.
  app/                 YOUR layer: app-selectors.ts, env-keys.ts, urls.ts + your pages/api/helpers
  support/             Cypress bootstrap: commands (apiRequest, login, optional db), type augmentation
  e2e/                 YOUR specs (scaffold output lands here; group them per feature folder)
  examples/            runnable demos against a public site — delete this folder when done with it
  templates/           fill-in skeletons the scaffold copies — never run, always type-checked
  fixtures/            static test data (mirror your feature folders as it grows)
scripts/               scaffold.mjs + doctor.mjs
docs/                  architecture, cookbook, DB module, best practices
```

Cross-layer imports use the `@core/*` and `@app/*` aliases (defined in `cypress/tsconfig.json`, resolved at runtime by the preprocessor wired in `cypress.config.ts`), so files can live at any folder depth.

## Point it at YOUR app

Honest time budget — the total swings on your auth complexity, so plan the steps separately rather than anchoring on one number:

| Step | What                                                    | Typical time                                               |
| ---- | ------------------------------------------------------- | ---------------------------------------------------------- |
| 1    | Environment file (`baseUrl`, `apiBaseUrl`, credentials) | ~15 min                                                    |
| 2    | `app-selectors.ts` (~6 values)                          | ~15 min                                                    |
| 3    | **Implement login** — the real variable                 | **1–4 hrs** (JSON login ~1 hr; OAuth2/SSO/MFA up to a day) |
| 4    | Adopt & green the login spec                            | ~30 min                                                    |
| 5    | First scaffolded feature test                           | ~1 hr                                                      |

Step 3 dominates and is the one to protect in a sprint plan — everything downstream is blocked until login is green. `npm run doctor` flags whether login is still unimplemented so the estimate never hides.

1. **Create your environment file** (gitignored — never commit credentials):

   ```sh
   cp config/environments/local.example.json config/environments/local.json
   npm run doctor   # tells you exactly what is still missing
   ```

   Fill in `baseUrl` (your web app), `apiBaseUrl` (your API) and the `env` credentials.

2. **Fill `cypress/app/app-selectors.ts`** — your app's loader/spinner selector, dropdown option selector, and (if styled) checkbox/toggle checked classes. One file, ~6 values; every handler adapts automatically.

3. **Implement login** in `cypress/support/commands/auth-commands.ts` — follow the `TODO(template)` markers (two worked examples are in the file: JSON login and OAuth2 password grant). Fill in `URLs.loginApi` in `cypress/app/urls.ts` and the response shape in `cypress/app/api/types/login-response.d.ts`.

4. **Adopt the login spec**: copy `cypress/templates/specs/login.template.cy.ts` and `cypress/templates/pages/login-page.template.ts` into `cypress/e2e/` and `cypress/app/pages/` (drop `.template` from the names and point the spec's page import at `@app/pages/login-page` — everything else already imports via aliases), fill the selectors, then:

   ```sh
   npm run run:spec -- cypress/e2e/login.cy.ts
   ```

   Get this green before anything else — every feature spec depends on login.

5. **Build your first feature test**:

   ```sh
   npm run scaffold -- product
   ```

   ...and follow [docs/ADDING-A-FEATURE-TEST.md](docs/ADDING-A-FEATURE-TEST.md) end to end.

## Verify your setup

- [ ] `npm run doctor` passes
- [ ] `npm test` green (demo suite)
- [ ] Login spec green against your app
- [ ] First scaffolded feature spec green
- [ ] `npm run todo` shows no markers left in files you have adopted

## Accessibility checks

`cypress-axe` is wired into the one navigation funnel, so any page gets an axe scan by opting in — no per-spec setup:

```ts
FeaturePage.visit() // normal
Navigator.visitUrl('/dashboard', { a11y: true }) // + fail on any a11y violation
```

The scan runs after the loader settles. Scope or tune it with `a11yContext` / `a11yOptions` (cypress-axe passthrough). Off by default — turn it on page by page as you fix issues.

## Run in Docker

Reproducible runs (and the optional SQL Server for the DB module) via `docker compose`:

```sh
docker compose run --rm --no-deps cypress          # demo suite, no DB
docker compose run --rm cypress npm run run:local  # your app, with the mssql service up
```

The image is pinned to the project's Cypress version. See [`Dockerfile`](Dockerfile) / [`docker-compose.yml`](docker-compose.yml).

## CI, parallelism & the live report

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs lint + typecheck + `npm audit` + a scaffold guard, then the suite **sharded across 3 containers** (`cypress-split`), then merges every shard's Allure results into a **trend report published to GitHub Pages** on each push to `main`. Add shards by extending the matrix. A `pre-commit` hook (husky + lint-staged) runs `eslint --fix` + `prettier` on staged files so the architectural rules gate locally too.

## Troubleshooting

- **`allure: JAVA_HOME not set` / Allure fails** — install Java 11+ (e.g. Temurin), or skip Allure; tests don't need it.
- **`Environment file not found`** — step 1 above, or run `npm run doctor` for the exact command.
- **Cypress prints `bad option: --no-sandbox` and fails to start** — something set `ELECTRON_RUN_AS_NODE=1` in your shell (VS Code tasks/extensions can). Run with it cleared: `env -u ELECTRON_RUN_AS_NODE npm test`.
- **Self-signed HTTPS on localhost APIs** — set `"chromeWebSecurity": false` in your environment's needs or trust the certificate locally.
- **Corporate proxy blocks the Cypress binary download** — see Cypress's proxy docs; set `HTTP_PROXY`/`HTTPS_PROXY` before `npm install`.

## License

[MIT](LICENSE) © [Mixcore Tech](http://mixcore-tech.com/) — clone it, adapt it, ship it.
