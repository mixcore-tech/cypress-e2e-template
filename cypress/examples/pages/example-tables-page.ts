import Navigator from '@core/navigation/navigator'
import UITableHandler, { ColumnValuePair, ITableValidationPair } from '@core/ui/ui-table-handler'

/**
 * EXAMPLE — table verification on a real public data table
 * (https://the-internet.herokuapp.com/tables, #table1).
 *
 * Demonstrates: the tableColumnsHeaders map (spec code references headers by
 * key, never by magic string) and delegation to UITableHandler.
 *
 * The fill-in version for YOUR app: cypress/templates/pages/feature-page.template.ts
 */
export default class ExampleTablesPage {
    static locators = {
        table: '#table1'
    }

    static tableColumnsHeaders = {
        LastName: 'Last Name',
        FirstName: 'First Name',
        Email: 'Email',
        Due: 'Due'
    }

    static visit() {
        Navigator.visitUrl('/tables')
    }

    static verifyRecords(expectedRecords: ITableValidationPair[]) {
        UITableHandler.verifyTableRecord(this.locators.table, expectedRecords)
    }

    static verifyRowExists(identifiers: ColumnValuePair<string | number>, shouldExist: boolean = true) {
        UITableHandler.verifyTableRowExists(this.locators.table, identifiers, shouldExist)
    }

    static verifyRowsCount(expectedCount: number) {
        UITableHandler.verifyTableRowsCount(this.locators.table, expectedCount)
    }
}
