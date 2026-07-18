# Contributing

Maintained by [Mixcore Tech](http://mixcore-tech.com/). Thanks for improving the template. This guide covers how to propose a change, run the suite locally, and — most importantly — the **architectural boundaries** the framework enforces. They aren't style preferences; they're what keeps a 300-spec, multi-squad suite maintainable, and most of them fail CI (and your local pre-commit hook) if broken.

## Getting set up

```sh
nvm use && npm install     # Node 20+ (22 pinned in .nvmrc); installs the pre-commit hook automatically
npm test                   # demo suite against public sites — proves your setup
npm run doctor             # checks env, Node, Java, login, and remaining TODOs
```

## Before you open a PR

Run the same gates CI runs — the pre-commit hook runs the first two on staged files, but run them across the repo before pushing:

```sh
npm run typecheck          # strict TypeScript, no errors
npm run lint               # ESLint flat config — architectural rules are ERRORS
npm test                   # demo suite green (11 tests)
```

CI additionally shards the suite across containers, runs `npm audit`, and re-runs the scaffold generator to prove generated code still type-checks and lints. If any of the above is red locally, CI will be too.

## The architectural rules (non-negotiable, lint-enforced)

The engine (`cypress/core`) is framework-agnostic and the app layer (`cypress/app`) is yours. The boundaries between them are enforced by `eslint.config.mjs`, not just documented — see [docs/ARCHITECTURE.md#layer-contracts](docs/ARCHITECTURE.md#layer-contracts).

| Rule                                                                          | Why                                                                                                                              | Enforced by                              |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| **No bare `cy.get` / `cy.request` / `cy.intercept`** in specs or page objects | Element/network access is a handler responsibility so timeout, loader-wait, logging and intercept-alias policy stay in one place | `no-restricted-syntax` (error)           |
| **Specs never import `@core/ui/*`** (except `@core/ui/table-types`)           | Specs act through page objects; only the handlers touch elements                                                                 | `no-restricted-imports` (error)          |
| **`cypress/core` imports only `@app/app-selectors`** from the app layer       | The engine must not know your pages, endpoints, or specs                                                                         | `no-restricted-imports` (error)          |
| **`cypress/support` never imports `@app/helpers/*`**                          | Entity helpers build on commands, not the reverse                                                                                | `no-restricted-imports` (error)          |
| **No `cy.wait(<ms>)`**                                                        | Fixed sleeps are flaky or slow; wait on intercept aliases or the loader                                                          | `cypress/no-unnecessary-waiting` (error) |
| **No `Cypress.env()` in browser code**                                        | Deprecated; use the async `cy.env([ENV_KEY.x])` and `Cypress.expose`                                                             | `no-restricted-properties` (error)       |

Conventions that aren't lint-checked but reviewers will hold the line on:

- **Page objects hold selectors + actions, delegating to `UIElementsHandler`/`UITableHandler`** — no assertions built from raw `cy` chains. `verify*` methods are fine; they call the core verifiers.
- **`data-cy` selectors only** — not CSS classes or DOM structure.
- **Random test data** (`DataGenerator`) — `retries.runMode = 1` re-runs failures, so hardcoded names collide with themselves.
- **Login is cached** — specs use `cy.loginViaApi` (wrapped in `cy.session`); never hand-roll a per-test network login.
- **Test titles carry ids** — `it('TC-1234: ...')`.
- **Every fill-in point is a `// TODO(template):` marker** with a compiling `TODO_` placeholder (or a fail-fast throw for load-bearing gaps).

## Changing the engine (`cypress/core/**`)

Core is owned by the framework architects ([CODEOWNERS](.github/CODEOWNERS)) — every squad's tests depend on it, so treat an engine change like a framework release:

1. Open an issue describing the need first; a handler gap is usually the right fix, not a `cy.get` in a page object.
2. Keep it app-agnostic — the only app import allowed in core is `@app/app-selectors`.
3. Add or update the runnable example in `cypress/examples/**` that proves the behavior, and the fill-in skeleton in `cypress/templates/**` if the pattern is one consumers reproduce.
4. A CODEOWNERS review is required to merge.

## Adding a feature pattern (examples + templates)

Every pattern lives twice: a **runnable** proof in `cypress/examples/**` (green via `npm test`) and a **fill-in** skeleton in `cypress/templates/**` (type-checked, excluded from `specPattern`, instantiated by `npm run scaffold`). Keep the pair in sync; the CI scaffold-probe will fail if generated output stops compiling.

## Commit & PR

- Small, focused commits; imperative subject line.
- Reference the issue.
- Fill in the PR template checklist; make sure `typecheck`, `lint`, and the demo suite are green.
