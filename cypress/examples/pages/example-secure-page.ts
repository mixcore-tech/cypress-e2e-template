import UIElementsHandler from '@core/ui/ui-elements-handler'

/**
 * EXAMPLE — the page users land on after a successful demo login
 * (demo/app/secure.html).
 */
export default class ExampleSecurePage {
    static locators = {
        logoutButton: 'a[href="/logout"]',
        flashMessage: '#flash',
        pageHeader: 'h2'
    }

    static verifyLoggedIn() {
        cy.url().should('include', '/secure')
        UIElementsHandler.verifyElementContainsText(this.locators.flashMessage, 'You logged into a secure area!')
        UIElementsHandler.verifyElementContainsText(this.locators.pageHeader, 'Secure Area')
    }

    static clickLogoutButton() {
        UIElementsHandler.clickElement(this.locators.logoutButton)
    }
}
