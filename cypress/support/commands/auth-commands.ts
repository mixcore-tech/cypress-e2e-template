import { AppSelectors } from '@app/app-selectors'
import { ILoginResponse } from '@app/api/types/login-response'

/**
 * Authentication commands — the first thing to implement when pointing this
 * template at YOUR app (README → "Point it at YOUR app", step 3).
 *
 * Both commands wrap their work in cy.session, so the real login runs ONCE per
 * user and every later test restores the cached session with no network round
 * trip (cacheAcrossSpecs shares it across spec files too). cy.loginViaApi is the
 * workhorse feature specs call; cy.loginViaForm exists for specs that must reach
 * the app through the login FORM.
 */

// TODO(template): the localStorage key(s) YOUR app reads its session from.
const ACCESS_TOKEN_KEY = 'TODO_access_token_key'
// This command stashes the full login response under this key so it can be read
// back out of the RESTORED session — cy.session caches browser storage, not the
// JS values a setup callback returns. Leave as-is; it is an internal detail.
const LOGIN_RESPONSE_KEY = 'cypressTemplate:loginResponse'

declare global {
    namespace Cypress {
        interface Chainable {
            /**
             * Log in through your app's API and persist the session (cy.session
             * cached — the network login fires once). Yields your login
             * endpoint's response body (cypress/app/api/types/login-response.d.ts),
             * read back from the restored session, so specs can build an API auth
             * header without a second round trip.
             */
            loginViaApi(username: string, password: string): Chainable<ILoginResponse>

            /** Log in by driving the login form (cy.session cached; use in form-level specs). */
            loginViaForm(username: string, password: string): Chainable<void>

            /** Clear the persisted session so the browser is logged out. */
            logout(): Chainable<void>
        }
    }
}

/** Read the login response the session setup stashed, from any restored origin. */
function readStashedLoginResponse(): Cypress.Chainable<ILoginResponse> {
    return cy.getAllLocalStorage({ log: false }).then((all) => {
        for (const origin of Object.keys(all)) {
            const raw = all[origin]?.[LOGIN_RESPONSE_KEY]
            if (typeof raw === 'string') return JSON.parse(raw) as ILoginResponse
        }
        return {} as ILoginResponse
    })
}

Cypress.Commands.add('loginViaApi', (username: string, password: string) => {
    Cypress.log({
        displayName: 'loginViaApi',
        message: `${username} / ${'*'.repeat(password.length)}`
    })

    cy.session(
        ['api', username],
        () => {
            // TODO(template): implement your app's API login — see docs/ADDING-A-FEATURE-TEST.md#login
            // (and "How to find your Auth setup" in that doc for discovering the values below).
            //
            // The pattern: visit '/' once so localStorage belongs to your app's origin,
            // POST the credentials to your token endpoint (URLs.loginApi — fill it in
            // cypress/app/urls.ts), persist the token(s) the way your app expects, AND
            // stash the whole body under LOGIN_RESPONSE_KEY so the command can yield it.
            //
            // Example A — JSON login endpoint:
            //
            // return cy.visit('/').then(() => {
            //     return cy.request({
            //         method: 'POST',
            //         url: URLs.loginApi,
            //         body: { username, password }
            //     }).then(response => {
            //         expect(response.status).to.eq(HTTP_STATUS_CODE.success)
            //         const body = response.body as ILoginResponse
            //         cy.window().then(win => {
            //             win.localStorage.setItem(ACCESS_TOKEN_KEY, body.access_token)
            //             win.localStorage.setItem(LOGIN_RESPONSE_KEY, JSON.stringify(body))
            //         })
            //     })
            // })
            //
            // Example B — OAuth2 password grant (token endpoint expects a form body):
            //
            // const payload =
            //     `grant_type=password&scope=TODO_scopes&client_id=TODO_CLIENT_ID` +
            //     `&client_secret=TODO_CLIENT_SECRET&username=${encodeURIComponent(username)}` +
            //     `&password=${encodeURIComponent(password)}`
            // return cy.visit('/').then(() => {
            //     return cy.request({ method: 'POST', url: URLs.loginApi, body: payload, form: true })
            //         .then(response => {
            //             const body = response.body as ILoginResponse
            //             expect(body.access_token).to.not.be.empty
            //             cy.window().then(win => {
            //                 win.localStorage.setItem(ACCESS_TOKEN_KEY, body.access_token)
            //                 win.localStorage.setItem(LOGIN_RESPONSE_KEY, JSON.stringify(body))
            //             })
            //         })
            // })

            throw new Error(
                'TODO(template): implement the cy.loginViaApi session setup in cypress/support/commands/auth-commands.ts — see docs/ADDING-A-FEATURE-TEST.md#login'
            )
        },
        {
            // Reuse the same login across every spec file in the run.
            cacheAcrossSpecs: true,
            // Cypress calls this on every restore; if it fails, the session is
            // discarded and setup re-runs — so an expired token self-heals.
            validate() {
                cy.getAllLocalStorage({ log: false }).then((all) => {
                    const present = Object.values(all).some((store) => typeof store?.[ACCESS_TOKEN_KEY] === 'string')
                    expect(present, 'a persisted session token exists').to.equal(true)
                })
            }
        }
    )

    return readStashedLoginResponse()
})

Cypress.Commands.add('loginViaForm', (username: string, password: string) => {
    Cypress.log({
        displayName: 'loginViaForm',
        message: `${username} / ${'*'.repeat(password.length)}`
    })

    // Redact the password field from any failure screenshot taken during the
    // form flow, so a credential typed into the UI never lands in a CI artifact.
    // Only the password input is blacked out — the rest of the page stays
    // visible for debugging.
    if (AppSelectors.passwordFieldSelector) {
        Cypress.Screenshot.defaults({ blackout: [AppSelectors.passwordFieldSelector] })
    }

    cy.session(['form', username], () => {
        // TODO(template): drive your login page via your LoginPage page object
        // (create it from cypress/templates/pages/login-page.template.ts):
        //
        // LoginPage.visit()
        // LoginPage.fillUserNameField(username)
        // LoginPage.fillPasswordField(password)
        // LoginPage.clickLoginButton()
        // // wait for the landing page / persisted session before the setup returns

        throw new Error(
            'TODO(template): implement the cy.loginViaForm session setup in cypress/support/commands/auth-commands.ts — see docs/ADDING-A-FEATURE-TEST.md#login'
        )
    })
})

Cypress.Commands.add('logout', () => {
    Cypress.log({ displayName: 'logout', message: 'clearing session' })

    // Drop every cached cy.session so the next login re-authenticates.
    Cypress.session.clearAllSavedSessions()

    // TODO(template): also clear whatever your app persists for the session, e.g.:
    //
    // cy.window().then(win => {
    //     win.localStorage.removeItem('TODO_access_token_key')
    // })
    //
    // ...and/or click your app's logout control / call its logout endpoint.

    throw new Error('TODO(template): implement cy.logout in cypress/support/commands/auth-commands.ts')
})

export {}
