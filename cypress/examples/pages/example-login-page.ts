import Navigator from '@core/navigation/navigator'
import UIElementsHandler from '@core/ui/ui-elements-handler'

/**
 * EXAMPLE — the page-object pattern on the bundled demo login page
 * (demo/app/login.html).
 *
 * Demonstrates: a static locators map, action methods that delegate to
 * UIElementsHandler (a page object never calls cy.get directly), navigation via
 * Navigator, and an opt-in accessibility scan ({ a11y: true }) that runs
 * cypress-axe through the same navigation funnel.
 *
 * The fill-in version for YOUR app: cypress/templates/pages/login-page.template.ts
 */
export default class ExampleLoginPage {
    static locators = {
        userNameField: '#username',
        passwordField: '#password',
        loginButton: 'button[type="submit"]',
        flashMessage: '#flash'
    }

    static visit() {
        // { a11y: true } injects axe and asserts zero violations after the page
        // settles — a live demonstration of the Navigator a11y funnel.
        Navigator.visitUrl('/login', { a11y: true })
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

    static verifyErrorMessage(message: string) {
        UIElementsHandler.verifyElementContainsText(this.locators.flashMessage, message)
    }
}
