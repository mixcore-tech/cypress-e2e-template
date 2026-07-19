import Navigator from '@core/navigation/navigator'
import UIElementsHandler from '@core/ui/ui-elements-handler'

/**
 * EXAMPLE — page object for the bundled demo network page (demo/app/network.html).
 *
 * Even a one-button demo goes through a page object: the spec never calls
 * cy.get directly (lint-enforced), it asks the page to act.
 */
export default class ExampleNetworkPage {
    static locators = {
        getCommentButton: '[data-cy="get-comment"]'
    }

    static visit() {
        Navigator.visitUrl('/network')
    }

    static clickGetCommentButton() {
        UIElementsHandler.clickElement(this.locators.getCommentButton)
    }
}
