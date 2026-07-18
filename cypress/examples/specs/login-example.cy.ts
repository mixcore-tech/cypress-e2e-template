/**
 * EXAMPLE — login flow against the public demo site (demo environment).
 *
 * Demonstrates: page-object delegation, credentials read with the async
 * cy.env command through ENV_KEY (values from config/environments/demo.json;
 * the legacy synchronous Cypress.env() is deprecated and banned by lint), and
 * a negative case with random data.
 *
 * Start your app's login spec from cypress/templates/specs/login.template.cy.ts
 */
import { ENV_KEY } from '@app/env-keys'
import { DataGenerator } from '@core/utils/data-generator'
import ExampleLoginPage from '../pages/example-login-page'
import ExampleSecurePage from '../pages/example-secure-page'

describe('Example: login flow', () => {
    beforeEach(() => {
        ExampleLoginPage.visit()
    })

    it('EX-1: login form is visible', () => {
        ExampleLoginPage.verifyLoginFormVisible()
    })

    it('EX-2: valid credentials reach the secure area and can log out', () => {
        cy.env<Record<ENV_KEY, string>>([ENV_KEY.username, ENV_KEY.password]).then((credentials) => {
            ExampleLoginPage.fillUserNameField(credentials[ENV_KEY.username])
            ExampleLoginPage.fillPasswordField(credentials[ENV_KEY.password])
        })
        ExampleLoginPage.clickLoginButton()

        ExampleSecurePage.verifyLoggedIn()

        ExampleSecurePage.clickLogoutButton()
        ExampleLoginPage.verifyLoginFormVisible()
    })

    it('EX-3: wrong password shows an error message', () => {
        cy.env<Record<ENV_KEY, string>>([ENV_KEY.username]).then((credentials) => {
            ExampleLoginPage.fillUserNameField(credentials[ENV_KEY.username])
        })
        ExampleLoginPage.fillPasswordField(DataGenerator.randomPassword())
        ExampleLoginPage.clickLoginButton()

        ExampleLoginPage.verifyErrorMessage('Your password is invalid!')
    })
})
