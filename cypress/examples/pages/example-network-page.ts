import UIElementsHandler from '@core/ui/ui-elements-handler'

/**
 * EXAMPLE — page object for the public network-requests demo
 * (https://example.cypress.io/commands/network-requests).
 *
 * Even a one-button demo goes through a page object: the spec never calls
 * cy.get directly (lint-enforced), it asks the page to act.
 */
export default class ExampleNetworkPage {
    static locators = {
        getCommentButton: '.network-btn'
    }

    static clickGetCommentButton() {
        UIElementsHandler.clickElement(this.locators.getCommentButton)
    }
}
