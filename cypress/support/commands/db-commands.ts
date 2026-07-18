import { CollectionUtils } from '@core/utils/collection-utils'

/**
 * Optional DB module (SQL Server via cypress-sql-server).
 *
 * These commands are always registered but stay inert until you create
 * config/environments/<version>.db.js (see local.db.example.js). Without that
 * file, calling them fails fast with a pointer to docs/DATABASE-MODULE.md.
 *
 * Build your table names and query templates in a DatabaseHelper
 * (see cypress/templates/db/database-helper.template.ts).
 */

declare global {
    namespace Cypress {
        interface Chainable {
            /** Run a SQL template with named-token substitution and yield the raw rows. */
            queryDatabase(queryTemplate: string, params?: Record<string, unknown>): Chainable<unknown[][]>

            /** Run a COUNT(*) template and yield true when the count is > 0. */
            dbCheckRecordExists(countQueryTemplate: string, params: Record<string, unknown>): Chainable<boolean>

            /**
             * Run a DELETE template whose `ids` token becomes a comma-separated
             * id list. No-op when ids is empty.
             */
            dbDeleteByIds(deleteQueryTemplate: string, ids: number[], idsToken?: string): Chainable<unknown>
        }
    }
}

/** cypress-sql-server returns each cell either as a plain value or as { value }. */
function cellValue(cell: unknown): unknown {
    if (cell !== null && typeof cell === 'object' && 'value' in (cell as Record<string, unknown>)) {
        return (cell as Record<string, unknown>).value
    }
    return cell
}

Cypress.Commands.add('queryDatabase', (queryTemplate: string, params: Record<string, unknown> = {}) => {
    const query = CollectionUtils.formatWithParams(queryTemplate, params)
    Cypress.log({ displayName: 'queryDatabase', message: query })
    // Unwrap tedious cell objects ({ value, metadata }) to plain values so callers
    // can index rows[r][c] directly, matching the documented "raw rows" contract.
    return cy
        .task<unknown[][]>('sqlServer:execute', query)
        .then((rows) => (rows ?? []).map((row) => (Array.isArray(row) ? row.map(cellValue) : row)))
})

Cypress.Commands.add('dbCheckRecordExists', (countQueryTemplate: string, params: Record<string, unknown>) => {
    const query = CollectionUtils.formatWithParams(countQueryTemplate, params)
    Cypress.log({ displayName: 'dbCheckRecordExists', message: query })
    return cy.task('sqlServer:execute', query).then((rows) => {
        const first = Array.isArray(rows) ? (rows as unknown[][])[0]?.[0] : undefined
        return Number(cellValue(first) ?? 0) > 0
    })
})

Cypress.Commands.add('dbDeleteByIds', (deleteQueryTemplate: string, ids: number[], idsToken: string = 'ids') => {
    if (!ids || ids.length === 0) {
        Cypress.log({ displayName: 'dbDeleteByIds', message: 'no ids to delete — skipping' })
        return
    }
    const query = CollectionUtils.formatWithParams(deleteQueryTemplate, { [idsToken]: ids.join(',') })
    Cypress.log({ displayName: 'dbDeleteByIds', message: query })
    return cy.task('sqlServer:execute', query)
})

export {}
