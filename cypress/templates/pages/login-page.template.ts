import Navigator from '@core/navigation/navigator'
import UIElementsHandler from '@core/ui/ui-elements-handler'

/**
 * FILL-IN TEMPLATE — your app's login page.
 *
 * To adopt: copy to cypress/app/pages/login-page.ts and resolve the TODOs.
 * Runnable reference on real markup: cypress/examples/pages/example-login-page.ts
 */
export default class LoginPage {
    static locators = {
        // TODO(template): your login page's data-cy selectors
        userNameField: '[data-cy="TODO_username-input"]',
        passwordField: '[data-cy="TODO_password-input"]',
        loginButton: '[data-cy="TODO_login-button"]',
        errorMessage: '[data-cy="TODO_login-error"]'
    }

    static visit() {
        Navigator.visitUrl('/')
    }

    static fillUserNameField(userName: string) {
        UIElementsHandler.fillTextField(this.locators.userNameField, userName)
    }

    static fillPasswordField(password: string) {
        UIElementsHandler.fillTextField(this.locators.passwordField, password)
    }

    static clickLoginButton() {
        UIElementsHandler.clickButton(this.locators.loginButton)
    }

    static verifyLoginFormVisible() {
        UIElementsHandler.isElementVisible(this.locators.userNameField)
        UIElementsHandler.isElementVisible(this.locators.passwordField)
        UIElementsHandler.isElementVisible(this.locators.loginButton)
    }

    static verifyInvalidCredentialsError() {
        // TODO(template): the exact error text your app shows for bad credentials
        UIElementsHandler.verifyElementContainsText(this.locators.errorMessage, 'TODO_Incorrect username or password')
    }

    static verifySessionPersisted() {
        // TODO(template): assert whatever your app stores after a successful login
        cy.window().then((win) => {
            const token = win.localStorage.getItem('TODO_access_token_key')
            expect(token, 'session token persisted').to.be.a('string').and.to.have.length.greaterThan(0)
        })
    }
}
