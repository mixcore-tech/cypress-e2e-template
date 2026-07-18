import Navigator from '@core/navigation/navigator'
import UIElementsHandler from '@core/ui/ui-elements-handler'
import UITableHandler, { ColumnValuePair, ITableValidationPair } from '@core/ui/ui-table-handler'

/**
 * FILL-IN TEMPLATE — page object for a feature list page with a data table.
 *
 * How to use: `npm run scaffold -- <feature-name>` copies and renames this file
 * into cypress/app/pages/ (recommended), or copy it there manually.
 * Runnable reference on real markup: cypress/examples/pages/example-tables-page.ts
 *
 * Rules this template encodes:
 *   - locators use data-cy attributes (ask your frontend dev to add them — a 10-minute PR)
 *   - a page object NEVER calls cy.get directly — it delegates to the handlers
 *   - specs reference table columns through tableColumnsHeaders keys, never magic strings
 */
export default class FeaturePage {
    static locators = {
        // TODO(template): replace every TODO_ selector with your page's data-cy attributes
        addButton: '[data-cy="TODO_add-button"]',
        // The `{text}` token inside this locator is replaced at call time — see
        // clickEditButton. A delimited token (not a bare word) so it can never
        // collide with a substring of the real selector.
        editButton: '[data-cy="TODO_edit-{text}"]',
        table: '[data-cy="TODO_features-table"]',
        searchField: '[data-cy="TODO_search-input"]'
    }

    static tableColumnsHeaders = {
        // TODO(template): the exact header texts of your table columns
        Name: 'TODO_Name',
        Description: 'TODO_Description'
    }

    static visit() {
        // TODO(template): your page's path relative to baseUrl
        Navigator.visitUrl('TODO_/features/path', { waitForApi: true })
    }

    static clickAddButton() {
        UIElementsHandler.clickButton(this.locators.addButton)
    }

    /** The `{text}` token inside the locator is replaced with the row's name. */
    static clickEditButton(name: string) {
        UIElementsHandler.clickButton(this.locators.editButton.replace('{text}', name))
    }

    static fillSearchField(text: string) {
        UIElementsHandler.fillTextField(this.locators.searchField, text)
    }

    static verifyRecords(expectedRecords: ITableValidationPair[]) {
        expectedRecords.forEach((expectedRecord) => {
            if (expectedRecord.searchText) this.fillSearchField(expectedRecord.searchText)
            UITableHandler.verifyTableRecord(this.locators.table, [expectedRecord])
        })
    }

    static verifyRowExists(identifiers: ColumnValuePair<string | number>, shouldExist: boolean = true) {
        UITableHandler.verifyTableRowExists(this.locators.table, identifiers, shouldExist)
    }
}
