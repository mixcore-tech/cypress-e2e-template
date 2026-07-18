/**
 * FILL-IN TEMPLATE — login/logout spec for YOUR app.
 *
 * To adopt: move this file to cypress/e2e/login.cy.ts (drop ".template" from
 * the name and point the page import at your adopted LoginPage), then resolve
 * every TODO(template). Get this spec green BEFORE building feature specs —
 * everything else depends on login.
 *
 * Runnable reference: cypress/examples/specs/login-example.cy.ts
 */
import { ENV_KEY } from '@app/env-keys'
import { URLs } from '@app/urls'
import ApiHelper from '@core/api/api-helper'
import { HTTP_METHOD, HTTP_STATUS_CODE } from '@core/constants'
import { DataGenerator } from '@core/utils/data-generator'
import LoginPage from '../pages/login-page.template'

// The login endpoint lives in cypress/app/urls.ts (URLs.loginApi) — fill it in there.

describe('Login', () => {
    beforeEach(() => {
        LoginPage.visit()
    })

    // TODO(template): prefix titles with your test-management ids, e.g. 'TC-1234: ...'
    it('TC-000: login page renders', () => {
        LoginPage.verifyLoginFormVisible()
    })

    it('TC-000: valid credentials log in and persist a session', () => {
        cy.env<Record<ENV_KEY, string>>([ENV_KEY.username, ENV_KEY.password]).then((credentials) => {
            LoginPage.fillUserNameField(credentials[ENV_KEY.username])
            LoginPage.fillPasswordField(credentials[ENV_KEY.password])
        })

        const alias = DataGenerator.randomString()
        ApiHelper.interceptNetworkRequests(URLs.loginApi, HTTP_METHOD.post, alias)
        LoginPage.clickLoginButton()
        ApiHelper.waitForApiResponse(alias)

        // TODO(template): the path your app lands on after login
        cy.url().should('include', 'TODO_/landing/path')
        LoginPage.verifySessionPersisted()
    })

    it('TC-000: wrong password is rejected with an error message', () => {
        cy.env<Record<ENV_KEY, string>>([ENV_KEY.username]).then((credentials) => {
            LoginPage.fillUserNameField(credentials[ENV_KEY.username])
        })
        LoginPage.fillPasswordField(DataGenerator.randomPassword())

        const alias = DataGenerator.randomString()
        ApiHelper.interceptNetworkRequests(URLs.loginApi, HTTP_METHOD.post, alias)
        LoginPage.clickLoginButton()
        // TODO(template): adjust to the status your API returns for bad credentials
        ApiHelper.waitForApiResponse(alias, HTTP_STATUS_CODE.badRequest)

        LoginPage.verifyInvalidCredentialsError()
    })

    it('TC-000: logout clears the session', () => {
        cy.env<Record<ENV_KEY, string>>([ENV_KEY.username, ENV_KEY.password]).then((credentials) => {
            cy.loginViaApi(credentials[ENV_KEY.username], credentials[ENV_KEY.password])
        })
        cy.logout()

        LoginPage.visit()
        LoginPage.verifyLoginFormVisible()
    })
})
