# Adding a feature test — the cookbook

One continuous worked example: CRUD tests for a **Products** feature. Time budget: under an hour once [login works](#login).

## Before you start

- The login spec is green (`npm run run:spec -- cypress/e2e/login.cy.ts`). If not, do README → "Point it at YOUR app" first.
- You know your feature's API endpoints (open the browser network tab on the feature's page, or your API's swagger).

<a id="login"></a>

## Step 0 (once per project): implement login

Feature specs never log in through the UI — they call `cy.loginViaApi`, which POSTs credentials to your token endpoint and persists the session the way your app expects. The command wraps the work in `cy.session` (with `cacheAcrossSpecs`), so the real login fires **once per run** and every later test restores the cached session with no network round-trip. Open `cypress/support/commands/auth-commands.ts` and follow the `TODO(template)` markers; two worked examples (JSON login, OAuth2 password grant) are in the file.

The examples show the _shape_ of the answer — the code below finds the actual _values_ for your app.

<a id="find-auth"></a>

### How to find your Auth setup

You need four things: the token endpoint URL, the request body format, the token field in the response, and the `localStorage`/`cookie` keys your app reads the session back from. All four are visible in the browser once you log in by hand.

1. **Open DevTools → Network, then log in manually.** In Chrome/Edge: F12 → **Network** tab → check **Preserve log** → log into your app in the normal UI.
2. **Find the auth request.** Look for the call fired when you submit the form — usually `POST` to something like `/auth/login`, `/oauth/token`, `/connect/token`, or `/api/session`. Filter the Network list by `Fetch/XHR` and sort by time if needed.
   - Its **Request URL** → goes into `URLs.loginApi` (`cypress/app/urls.ts`).
   - The **Request Method** and, under **Payload / Request**, the **body format** → tells you `body: { username, password }` (JSON) vs. a `grant_type=password&...` form string (`form: true`). This picks Example A vs. Example B in `auth-commands.ts`.
3. **Read the response.** On that same request, open the **Response / Preview** tab. Note the exact field holding the token (`access_token`? `token`? `jwt`?) and any refresh token — these become your `ILoginResponse` fields (`cypress/app/api/types/login-response.d.ts`).
4. **Find where the app stores the session.** DevTools → **Application** tab → **Local Storage** (and **Cookies**) for your origin. Log in and watch which key appears — that exact key string is your `ACCESS_TOKEN_KEY` in `auth-commands.ts`. Many SPAs use `localStorage`; some use an httpOnly cookie (in which case the browser persists it for you and you only need the API call to succeed).
5. **Map it in.** Fill `URLs.loginApi`, the `ILoginResponse` shape, and the two `localStorage.setItem(...)` keys in the `cy.loginViaApi` session setup. Run `npm run doctor` — it now tells you whether login is still unimplemented — then green the login spec.

> Tip: right-click the auth request in the Network tab → **Copy → Copy as cURL** to see the full URL, headers, and body in one place; it maps almost line-for-line onto the `cy.request` in the examples.

<a id="urls"></a>

## 1. Scaffold it

```sh
npm run scaffold -- product
```

(Nesting works too: `npm run scaffold -- shop/product` puts every generated file under a `shop/` feature folder — imports are unaffected because they go through the `@core`/`@app` aliases.)

This generates six files, renamed and wired together:

| File                                          | Purpose                                          |
| --------------------------------------------- | ------------------------------------------------ |
| `cypress/e2e/product.cy.ts`                   | the CRUD spec (add + edit, cleanup in `after()`) |
| `cypress/app/pages/product-page.ts`           | page object: locators + table headers + actions  |
| `cypress/app/api/product-factory.ts`          | builds valid randomized request payloads         |
| `cypress/app/api/types/product-payload.d.ts`  | request body type                                |
| `cypress/app/api/types/product-response.d.ts` | response body type                               |
| `cypress/app/helpers/product-helper.ts`       | seeds via API, tracks created ids, cleans up     |

List every fill-in point: `npm run todo | grep product`

## 2. Register the URLs

The scaffold already inserted a placeholder entry into `cypress/app/urls.ts` (the single URL registry — the generated helper and spec reference it):

```ts
export const URLs = {
  // ...
  productsApi: `${apiBaseUrl}/TODO_product`
}
```

Point it at your real endpoint, e.g. `${apiBaseUrl}/api/products`.

## 3. Define the types

Fill `product-payload.d.ts` and `product-response.d.ts` with the real request/response shapes from your API. Only type the fields your tests touch — `id` plus whatever you assert.

## 4. The factory

`product-factory.ts` must build a payload your API accepts. Randomize everything user-visible with `DataGenerator` so reruns never collide:

```ts
static initializeProductPayload(overrides: Partial<IProductPayload> = {}): IProductPayload {
    return {
        name: DataGenerator.randomString(8),
        price: DataGenerator.randomNumber(500),
        ...overrides
    }
}
```

## 5. The entity helper

The generated `product-helper.ts` already encodes the convention: `addProductViaApi` seeds one entity and pushes its id onto `static createdIds`; `cleanupViaApi` deletes them all and resets the array. It already reads `URLs.productsApi` — just adjust the DELETE call if your API differs.

## 6. The page object

Fill `product-page.ts`:

- **Locators**: `data-cy` attributes only. If the page doesn't have them, ask the frontend dev — adding `data-cy="add-button"` attributes is a 10-minute PR that makes every future test stable.
- **`tableColumnsHeaders`**: the exact header texts of the list table.
- **`visit()`**: the page's path relative to `baseUrl`.

Remember the rule: the page object never calls `cy.get` — it delegates to `UIElementsHandler`/`UITableHandler`. If you need an interaction the handlers don't cover, add a method to the handler (framework change), not a `cy.get` in the page.

Dialogs get their own page objects — copy `cypress/templates/pages/confirm-dialog.template.ts` for the delete-confirmation, and model add/edit dialogs on the same shape.

## 7. The spec

The generated `product.cy.ts` encodes the canonical flow — fill the marked gaps:

```ts
beforeEach(() => {
  // async cy.env — the synchronous Cypress.env() is disabled in browser code
  cy.env<Record<ENV_KEY, string>>([ENV_KEY.username, ENV_KEY.password]).then((credentials) => {
    cy.loginViaApi(credentials[ENV_KEY.username], credentials[ENV_KEY.password]).then((loginResponse) => {
      // typed by cypress/app/api/types/login-response.d.ts — no cast needed
      authHeader = `Bearer ${loginResponse.access_token}`
    })
  })
})

it('TC-1234: add a product through the UI', () => {
  ProductPage.visit()
  ProductPage.clickAddButton()
  // fill the dialog via its page object...

  const alias = DataGenerator.randomString() // random alias
  ApiHelper.interceptNetworkRequests(URLs.productsApi, HTTP_METHOD.post, alias)
  AddEditProductDialog.clickSaveButton() // act

  ApiHelper.waitForApiResponse(alias).then((interception) => {
    // assert on the API
    const created = interception.response?.body as IProductResponse
    ProductHelper.createdIds.push(created.id) // track for cleanup
    ProductPage.verifyRecords([
      {
        // assert on the UI
        identifiers: { [ProductPage.tableColumnsHeaders.Name]: name },
        data: { [ProductPage.tableColumnsHeaders.Price]: price }
      }
    ])
  })
})

after(() => {
  ProductHelper.cleanupViaApi(authHeader)
})
```

Why this shape works:

- **Seed via API, assert via UI** — the edit test creates its product with `ProductHelper.addProductViaApi`, not by clicking through the add dialog again. Each test exercises one flow.
- **The interception replaces sleeps** — after `waitForApiResponse` resolves, the UI has its data; there is never a reason for `cy.wait(1000)`.
- **Cleanup always runs** — whatever ids landed in `createdIds` get deleted, so reruns start clean. If your API has no DELETE endpoint, use the [DB module](DATABASE-MODULE.md).

## 8. Run and debug

```sh
npm run run:spec -- cypress/e2e/product.cy.ts        # headless
npm run open:local                                    # interactive, time-travel debugging
npm run report:allure                                 # rich report of the last run
```

## Done checklist

- [ ] `npm run todo | grep product` → no hits
- [ ] Spec passes twice in a row (proves cleanup + random data work)
- [ ] Titles carry your test-management ids (`TC-1234: ...`)
- [ ] `npm run lint && npm run typecheck` green
