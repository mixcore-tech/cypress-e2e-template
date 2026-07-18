# Database module (optional)

Direct SQL Server access from tests, via [cypress-sql-server]. Use it for two things only:

- **Cleanup** of data your API cannot delete
- **Verification** of state the UI/API don't expose (e.g. an email-log table)

It is **off by default** because most teams don't have (or want) SQL access from tests, and API cleanup is safer and portable. Prefer `FeatureHelper.cleanupViaApi` whenever a DELETE endpoint exists.

<a id="enable"></a>

## Enable it in 3 steps

1. Copy the example config for the environment you run:

   ```sh
   cp config/environments/local.db.example.js config/environments/local.db.js
   ```

2. Fill in the connection (user, password, server, database). The file is gitignored — never commit DB credentials. **Keep `options.rowCollectionOnRequestCompletion: true`** (already set in the example) — without it the driver returns no rows, so `cy.queryDatabase` yields nothing and `cy.dbCheckRecordExists` always reports `false`.

3. That's it — the module activates automatically whenever `config/environments/<version>.db.js` exists for the environment you run. `npm run doctor` reports `DB module: ON`.

Without the file, the db commands fail fast with a pointer to this doc instead of hanging.

## Using it

Three generic commands (registered in `cypress/support/commands/db-commands.ts`):

```ts
cy.queryDatabase(queryTemplate, params) // raw rows
cy.dbCheckRecordExists(countQueryTemplate, params) // boolean from a COUNT(*)
cy.dbDeleteByIds(deleteQueryTemplate, ids) // no-op when ids is empty
```

Never inline SQL in specs — build a `DatabaseHelper` from the template:

```sh
cp cypress/templates/db/database-helper.template.ts cypress/app/helpers/database-helper.ts
```

It encodes the structure: a `TABLES` map, parameterized `QUERIES` (named tokens replaced at call time), and guarded `deleteX(ids)` methods. Specs then clean up in `after()`:

```ts
after(() => {
  DatabaseHelper.deleteProducts(ProductHelper.createdIds)
})
```

## CI

Provide the db file from a secret before the run step:

```yaml
- name: Write DB config
  run: printf '%s' "$CYPRESS_DB_JS" > config/environments/ci.db.js
  env:
    CYPRESS_DB_JS: ${{ secrets.CYPRESS_DB_JS }}
```

## Warnings

- **Never point tests at a production database.** The delete queries are real.
- DB schemas drift; SQL in tests couples you to them. Keep the surface small — cleanup and existence checks, not business assertions.

[cypress-sql-server]: https://www.npmjs.com/package/cypress-sql-server
