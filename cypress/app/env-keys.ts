/**
 * Names of the values your environment files provide, from the "env" block of
 * config/environments/<version>.json.
 *
 * Read them in specs with the async cy.env command, always through this enum
 * (so a renamed key is a one-line change):
 *
 *   cy.env<Record<ENV_KEY, string>>([ENV_KEY.username, ENV_KEY.password]).then(credentials => {
 *       cy.loginViaApi(credentials[ENV_KEY.username], credentials[ENV_KEY.password])
 *   })
 *
 * The legacy synchronous Cypress.env() is deprecated in browser code and
 * banned by lint (eslint.config.mjs) — it will be removed in a future
 * Cypress major.
 */
export enum ENV_KEY {
    username = 'username',
    password = 'password'
    // TODO(template): add any extra env keys your app needs, e.g.:
    // adminUsername = 'adminUsername',
    // adminPassword = 'adminPassword'
}
