# Best practices

The rules this template enforces or expects. Each exists because breaking it produced flaky or unmaintainable tests.

## data-cy selectors only

Locators tied to CSS classes or DOM structure break on every restyle. `data-cy` attributes exist only for tests, so they never break by accident.

```ts
// bad  — breaks when styling or layout changes
addButton: '.toolbar > button.primary'

// good — stable contract with the frontend
addButton: '[data-cy="add-button"]'
```

Missing attributes? Ask the frontend dev — adding them is a 10-minute PR.

<a id="no-hardcoded-waits"></a>

## No hardcoded waits

`cy.wait(milliseconds)` is always either too long (slow suite) or too short (flaky test). Wait on facts instead: an intercepted response or the loader disappearing. ESLint enforces this (`cypress/no-unnecessary-waiting`).

```ts
// bad — guesses how long the save takes
cy.wait(1000)

// good — waits exactly until the save happened
const alias = DataGenerator.randomString()
ApiHelper.interceptNetworkRequests(URLs.productsApi, HTTP_METHOD.post, alias)
AddEditProductDialog.clickSaveButton()
ApiHelper.waitForApiResponse(alias)
```

## Seed via API, assert via UI

Each test exercises ONE flow. Prerequisites are created through the API (fast, reliable); only the behavior under test goes through the UI.

```ts
// bad  — the edit test re-tests the add dialog first
ProductPage.clickAddButton() /* ...fill, save... */ ProductPage.clickEditButton(name)

// good — seed in one line, test only the edit
ProductHelper.addProductViaApi(authHeader).then(seeded => {
    ProductPage.clickEditButton(seeded.name)
})
```

## Clean up everything you create

Every created entity's id goes into the helper's `static createdIds`; `after()` deletes them (API, or the [DB module](DATABASE-MODULE.md)). A suite that leaks data eventually poisons its own assertions — and everyone else's.

## The intercept-assert idiom

Random alias → act → assert on the intercepted response → then assert the UI. The API response is the source of truth (and gives you the created id for cleanup); the UI check proves the app rendered it.

```ts
ApiHelper.waitForApiResponse(alias).then((interception) => {
  const created = interception.response?.body as IProductResponse
  ProductHelper.createdIds.push(created.id)
  ProductPage.verifyRecords([expectedRecord])
})
```

## Handling complex elements (uploads, downloads, shadow DOM, iframes)

When you hit a file input, a download, a web component, or an embedded frame, do **not** drop back to raw `cy.get` (it's lint-banned in specs and page objects anyway). `UIElementsHandler` covers all four — call them from your page object, exactly like the other interactions.

```ts
// File upload — path is relative to the project root; pass a mimeType when the
// app validates content type.
UIElementsHandler.uploadFile(this.locators.fileInput, 'cypress/fixtures/report.pdf', 'application/pdf')

// Download — asserts the file landed in Cypress's downloads folder, retrying
// until it exists (no bare cy.wait).
UIElementsHandler.verifyDownload('report.pdf')

// Shadow DOM — pierce a web component's shadow root. With an inner selector it
// yields the element inside; without it, the shadow root itself.
UIElementsHandler.getShadowElement('my-uploader', 'button.browse').click()

// Iframe — safely traverse into a same-origin frame (waits for its body to
// populate before searching).
UIElementsHandler.getIframeElement('iframe#editor', '.ql-editor').type('hello')
```

Wrap each in a named page-object method (`ProductPage.attachSpecSheet(path)`, `EditorPage.typeBody(text)`) so specs stay declarative and the selector lives in one place.

## Credentials never leak into screenshots

`cy.loginViaForm` types real credentials into the UI and `screenshotOnRunFailure` is on, so a failure on the login page could otherwise capture the password. The command sets `Cypress.Screenshot.defaults({ blackout: [AppSelectors.passwordFieldSelector] })`, blacking out **only** the password field (default `input[type="password"]`) — the rest of the page stays visible for debugging. Point `AppSelectors.passwordFieldSelector` at a custom control if yours isn't a native password input, or set it `null` to opt out.

## Test-case ids in titles

`it('TC-1347: add product with metadata', ...)` — reports, failures and test-management stay linked for free.

## Random data = safe retries

Failed tests retry once in run mode (`retries.runMode = 1`). A test that hardcodes `name: 'test-product'` fails its own retry with a duplicate-name error. `DataGenerator.randomString()` makes every attempt independent.

## Validate API responses at the boundary (Zod)

`cy.apiRequest` takes an optional `validate` Zod schema. When set, the response body is parsed through it: the command yields the **typed, parsed** value, and a shape drift throws a clear boundary error naming the offending fields — instead of an `as IResponse` cast that lies to the compiler and surfaces as a baffling `undefined` three layers later.

```ts
const productSchema = z.object({ id: z.number(), name: z.string() })
cy.apiRequest({ method: HTTP_METHOD.get, url: URLs.productsApi, validate: productSchema }).then((product) => {
  /* product is typed AND runtime-checked */
})
```

Store schemas alongside their types in `cypress/app/api/types/` (e.g. `product-schema.ts` next to `product-response.d.ts`) so the shape and its runtime guard live together. You can even derive the type from the schema with `z.infer<typeof productSchema>` and drop the hand-written interface.

Use it for the responses your tests depend on (seed/read/cleanup). It turns an unchecked cast into a loud, located failure at the seam — the same "fail where the problem is" philosophy as the table-header and column-index guards.

<a id="code-coverage"></a>

## Code coverage

`@cypress/code-coverage` is wired in `cypress/support/e2e.ts` and `cypress.config.ts`; it collects `window.__coverage__` after each test into `.nyc_output`, and `npm run coverage:report` turns that into an HTML/lcov report. **It only produces data when your app is instrumented with istanbul** (e.g. `babel-plugin-istanbul` / `vite-plugin-istanbul` in the app's dev/test build) — against an uninstrumented app or a public demo site it is a harmless no-op. Instrument your app, run the suite, then `npm run coverage:report`.

## Independent specs

One feature per spec file; no spec depends on another having run. `beforeEach` logs in via API; the spec seeds what it needs. This is what lets Cypress parallelize and lets you run a single spec while developing.

## Cache login with cy.session

`cy.loginViaApi`/`cy.loginViaForm` wrap their work in [`cy.session`](https://on.cypress.io/session) with `cacheAcrossSpecs: true`, so the real login runs **once per run** and every later test restores the cached session with no network round-trip. Independence is preserved — `testIsolation` still clears the browser between tests; `cy.session` just replays the cached state instead of re-authenticating. The template's spec skeleton captures the API auth header once in `before()` and calls `cy.loginViaApi` in `beforeEach` purely to restore the session. A `validate()` callback re-checks the token on each restore, so an expired session self-heals by re-running login. Net effect on a 40-test file: one auth request instead of forty-plus (and `retries.runMode = 1` no longer doubles them).
