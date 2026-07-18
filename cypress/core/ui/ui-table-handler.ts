import { HTML_TAGS } from '../constants'
import { ColumnValuePair, ITableValidationPair } from './table-types'
import UIElementsHandler from './ui-elements-handler'

// Re-exported so page objects can keep importing everything table-related from
// here; SPECS import the types from @core/ui/table-types (lint-enforced).
export type { ColumnValuePair, ITableValidationPair }

/**
 * Verification engine for semantic HTML tables (<thead>/<th> + <tbody>/<tr>/<td>).
 *
 * The signature pattern: build an ITableValidationPair whose `identifiers`
 * locate the row (column header → expected cell text) and whose `data` asserts
 * the remaining cells, then call verifyTableRecord.
 *
 * Every method returns a Cypress chainable and does its asserting inside the
 * command queue (cy.then / .should), so a failed check fails the test — never a
 * detached promise that resolves regardless of the outcome.
 */
export default class UITableHandler {
    /** Map each column header text to its zero-based column index. */
    static findTableColsIndexes(tableSelector: string) {
        const columnIndexes: Record<string, number> = {}
        cy.get(`${tableSelector} ${HTML_TAGS.thead} ${HTML_TAGS.th}`).each(($th, index) => {
            columnIndexes[$th.text().trim()] = index
        })
        return cy.then(() => columnIndexes)
    }

    /**
     * Resolve an identifier's column index from the header row, throwing if the
     * header is not found (so a typo fails loudly instead of matching eq(-1),
     * i.e. the last cell).
     */
    private static columnIndexOf($thead: JQuery<HTMLElement>, heading: string): number {
        const index = $thead
            .find(HTML_TAGS.th)
            .filter((_, th) => {
                const text = Cypress.$(th).text().trim()
                const divText = Cypress.$(th).find('div').text().trim()
                return text === heading || divText === heading
            })
            .index()
        if (index < 0) {
            throw new Error(`Column header "${heading}" was not found in the table header row.`)
        }
        return index
    }

    /**
     * Find the flat index (within `tbody > tr`) of the first row matching ALL
     * identifiers. Yields -1 when no row matches.
     */
    static findTableRecordIndex(tableSelector: string, identifiers: ColumnValuePair<string | number>) {
        cy.log(`Looking up a record in the ${tableSelector} table`)
        return cy.get(`${tableSelector} ${HTML_TAGS.thead}`).then(($thead) => {
            const matchers = Object.entries(identifiers).map(([heading, expectedValue]) => ({
                columnIndex: this.columnIndexOf($thead, heading),
                expectedValue: String(expectedValue)
            }))

            return cy.get(`${tableSelector} ${HTML_TAGS.tbodyTr}`).then(($rows) => {
                // Iterate the flat collection so the index we yield matches how
                // verifyTableRecord re-selects the row (.find('tbody > tr').eq(i)).
                let matchedIndex = -1
                $rows.each((rowIndex, row) => {
                    if (matchedIndex !== -1) return
                    const matches = matchers.every(({ columnIndex, expectedValue }) => {
                        const $cell = Cypress.$(row).find(HTML_TAGS.td).eq(columnIndex)
                        return (
                            $cell.text().trim() === expectedValue || $cell.find('div').text().trim() === expectedValue
                        )
                    })
                    if (matches) matchedIndex = rowIndex
                })
                return matchedIndex
            })
        })
    }

    /** Assert whether a row matching the identifiers exists in the table. */
    static verifyTableRowExists(
        tableSelector: string,
        identifiers: ColumnValuePair<string | number>,
        shouldExist: boolean = true
    ) {
        UIElementsHandler.waitForLoaderToDisappear()
        return this.findTableRecordIndex(tableSelector, identifiers).then((rowIndex) => {
            const exists = rowIndex >= 0
            expect(exists, `table record ${JSON.stringify(identifiers)} exists`).to.equal(shouldExist)
        })
    }

    /**
     * Locate each expected record's row via its identifiers, then assert every
     * `data` cell (column header → expected text) on that row.
     */
    static verifyTableRecord(tableSelector: string, expectedRecords: ITableValidationPair[]) {
        UIElementsHandler.waitForLoaderToDisappear()
        return this.findTableColsIndexes(tableSelector).then((columnIndexes) => {
            expectedRecords.forEach(({ identifiers, data }) => {
                this.findTableRecordIndex(tableSelector, identifiers).then((rowIndex) => {
                    expect(rowIndex, `row matching ${JSON.stringify(identifiers)} found`).to.be.at.least(0)

                    Object.entries(data).forEach(([columnName, expectedValue]) => {
                        const columnIndex = columnIndexes[columnName]
                        expect(columnIndex, `column "${columnName}" exists in the table header`).to.be.a('number')
                        cy.log(`Validating cell ${columnName}, expecting ${expectedValue}`)
                        cy.get(tableSelector)
                            .find(HTML_TAGS.tbodyTr)
                            .eq(rowIndex)
                            .find(HTML_TAGS.td)
                            .eq(columnIndex)
                            .invoke('text')
                            .then((text) => {
                                expect(text.trim()).to.include(String(expectedValue ?? '').trim())
                            })
                    })
                })
            })
        })
    }

    /** Yield the number of body rows in the table. */
    static getTableRowsCount(tableSelector: string) {
        return cy.get(`${tableSelector} ${HTML_TAGS.tbodyTr}`).its('length')
    }

    /** Assert the table's body row count, retrying until it settles. */
    static verifyTableRowsCount(tableSelector: string, expectedCount: number) {
        UIElementsHandler.waitForLoaderToDisappear()
        return cy.get(`${tableSelector} ${HTML_TAGS.tbodyTr}`).should('have.length', expectedCount)
    }
}
