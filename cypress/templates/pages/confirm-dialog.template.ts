import UIElementsHandler from '@core/ui/ui-elements-handler'

/**
 * FILL-IN TEMPLATE — the app-wide confirmation dialog (delete confirmations etc.).
 * To adopt: copy to cypress/app/pages/confirm-dialog.ts and fill the selectors.
 */
export default class ConfirmDialog {
    static locators = {
        // TODO(template): your confirm dialog's data-cy selectors
        confirmButton: '[data-cy="TODO_confirm-yes-button"]',
        cancelButton: '[data-cy="TODO_confirm-no-button"]'
    }

    static clickConfirmButton() {
        UIElementsHandler.clickButton(this.locators.confirmButton)
    }

    static clickCancelButton() {
        UIElementsHandler.clickButton(this.locators.cancelButton)
    }
}
