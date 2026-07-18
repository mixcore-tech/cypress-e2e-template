/**
 * EXAMPLE — table verification with ITableValidationPair.
 *
 * The signature pattern of this template: `identifiers` locate a row by one or
 * more column values, `data` asserts the remaining cells of that row.
 *
 * Your feature pages get the same verifyRecords/verifyRowExists methods from
 * cypress/templates/pages/feature-page.template.ts
 */
import { ITableValidationPair } from '@core/ui/table-types'
import { DataGenerator } from '@core/utils/data-generator'
import ExampleTablesPage from '../pages/example-tables-page'

describe('Example: data-table verification', () => {
    beforeEach(() => {
        ExampleTablesPage.visit()
    })

    it('EX-4: verify a full record located by one identifier', () => {
        const expectedRecord: ITableValidationPair = {
            identifiers: {
                [ExampleTablesPage.tableColumnsHeaders.LastName]: 'Bach'
            },
            data: {
                [ExampleTablesPage.tableColumnsHeaders.FirstName]: 'Frank',
                [ExampleTablesPage.tableColumnsHeaders.Email]: 'fbach@yahoo.com',
                [ExampleTablesPage.tableColumnsHeaders.Due]: '$51.00'
            }
        }
        ExampleTablesPage.verifyRecords([expectedRecord])
    })

    it('EX-5: multiple identifiers narrow the match to one row', () => {
        ExampleTablesPage.verifyRowExists({
            [ExampleTablesPage.tableColumnsHeaders.LastName]: 'Smith',
            [ExampleTablesPage.tableColumnsHeaders.FirstName]: 'John'
        })
    })

    it('EX-6: a record that does not exist', () => {
        ExampleTablesPage.verifyRowExists(
            { [ExampleTablesPage.tableColumnsHeaders.LastName]: DataGenerator.randomString(10) },
            false
        )
    })

    it('EX-7: verify the table rows count', () => {
        ExampleTablesPage.verifyRowsCount(4)
    })
})
