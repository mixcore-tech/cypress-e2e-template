# The demo app & example suite

This template ships a **self-contained demo**: a small local web app plus a set
of runnable Cypress specs that drive it. It's the "hello world" of the template —
a green, offline proof of every pattern (page-object login, table verification,
intercept-and-assert, pure API + Zod validation, accessibility scanning) before
you point anything at your own app.

Nothing here talks to a third-party site. `npm test` boots the app, runs the
specs against it, and shuts it down.

## Run it

```sh
npm test          # headless — boots the demo app, runs all 11 example tests, exits
npm run demo      # just serve the app at http://localhost:5188 to click through it
npm run cy:open   # interactive Cypress runner — watch the specs drive the app
```

For the interactive runner, if Cypress fails to start with `bad option:
--no-sandbox`, your shell has `ELECTRON_RUN_AS_NODE=1` (some VS Code terminals set
it) — clear it for the command:

```sh
env -u ELECTRON_RUN_AS_NODE npm run cy:open
```

No setup, env file, or credentials are needed — the demo environment
(`config/environments/demo.json`) points `baseUrl`/`apiBaseUrl` at
`http://localhost:5188` and ships throwaway demo credentials.

## The two halves

| Half      | Where                                                   | What it is                                                                                         |
| --------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| The app   | `demo/app/` + `scripts/demo-server.mjs`                 | Static HTML/CSS/JS pages + a zero-dependency `node:http` server with a tiny deterministic JSON API |
| The tests | `cypress/examples/specs/` (+ `cypress/examples/pages/`) | Cypress specs that drive the app through page objects — the runnable examples                      |

Both are **deletable as a pair** once your team has learned the patterns: remove
`demo/` and `cypress/examples/` and switch the demo env to your own app.

## The app

Served by `npm run demo` on `http://localhost:5188`:

| Page        | Route      | What it exercises                                                                                             |
| ----------- | ---------- | ------------------------------------------------------------------------------------------------------------- |
| Login       | `/login`   | Accessible login form (`data-cy` selectors); posts to `/api/login`, redirects to `/secure`, or shows an error |
| Secure area | `/secure`  | Post-login page, gated on a session token; has a Logout link                                                  |
| Tables      | `/tables`  | A semantic `<table>` with four rows — the target of the table-verification engine                             |
| Network     | `/network` | A button that fires `GET /api/comments/1` — the target of the intercept example                               |

Selectors follow the template's own rule — **`data-cy` attributes only** — and
the pages keep `id`/`class` only where the app's own JS needs them.

### Mock API (deterministic)

| Endpoint                | Response                                       |
| ----------------------- | ---------------------------------------------- |
| `POST /api/login`       | `200 { token }` for the demo creds, else `401` |
| `GET /api/users/:id`    | `200 { id, name, email }`                      |
| `POST /api/posts`       | `201 { id: 101, ...body }` (constant id)       |
| `GET /api/comments/:id` | `200 { postId, id, name, email, body }`        |

Response shapes are fixed on purpose so the specs are deterministic. They are also
the contract the specs assert on — change one and update the matching spec.

## The tests — which example proves what

All 11 live in `cypress/examples/specs/`. Each drives one page through a page
object in `cypress/examples/pages/` (a spec never calls `cy.get` directly).

| Spec                          | Test                                                                          | Demonstrates                                                                 |
| ----------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `login-example.cy.ts`         | EX-1: login form is visible                                                   | Page-object visit + a **live cypress-axe scan** (`visitUrl({ a11y: true })`) |
|                               | EX-2: valid credentials reach the secure area and can log out                 | Full login → secure → logout flow, creds via `cy.env`                        |
|                               | EX-3: wrong password shows an error message                                   | Negative path with random data                                               |
| `table-example.cy.ts`         | EX-4: verify a full record located by one identifier                          | `ITableValidationPair` — locate a row, assert its cells                      |
|                               | EX-5: multiple identifiers narrow the match to one row                        | Multi-column row match                                                       |
|                               | EX-6: a record that does not exist                                            | Asserting absence                                                            |
|                               | EX-7: verify the table rows count                                             | Row count                                                                    |
| `api-intercept-example.cy.ts` | EX-8: assert on the response fired by a UI action                             | Intercept-and-assert idiom (random alias → act → assert response)            |
| `api-request-example.cy.ts`   | EX-9: GET a resource and validate its body with a Zod schema                  | `cy.apiRequest` + Zod `validate`                                             |
|                               | EX-10: POST a payload and assert the created id                               | Pure API POST                                                                |
|                               | EX-11: load fixture reference data into the Cypress.expose fixtures namespace | `FixtureUtils`                                                               |

## From demo to your app

The examples show the patterns working; your **own** tests go in `cypress/e2e/`
(generated with `npm run scaffold`, from the skeletons in `cypress/templates/`).
When you're ready to cut the demo loose:

1. Delete `demo/` and `cypress/examples/`.
2. Point `config/environments/demo.json` (or your own env file) at your app, or
   just use `config/environments/local.json`.
3. Follow [ADDING-A-FEATURE-TEST.md](ADDING-A-FEATURE-TEST.md) to build your first
   real feature test.
