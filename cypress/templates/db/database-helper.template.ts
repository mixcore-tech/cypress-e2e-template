/**
 * FILL-IN TEMPLATE — SQL verification/cleanup for the OPTIONAL DB module.
 *
 * Opt-in: create config/environments/<version>.db.js (copy local.db.example.js)
 * — the module activates automatically when that file exists. Until then the
 * db commands fail fast with a pointer. Full guide: docs/DATABASE-MODULE.md
 *
 * To adopt: copy to cypress/app/helpers/database-helper.ts and fill TABLES/QUERIES.
 * Prefer API cleanup (FeatureHelper.cleanupViaApi) when a DELETE endpoint exists;
 * use SQL only for data the API cannot remove or verify.
 */

/** Named tokens replaced inside query templates at call time. */
const QUERY_PARAM = {
    ids: 'ids',
    featureName: 'featureName'
}

const TABLES = {
    // TODO(template): your real table names
    features: 'TODO_FeaturesTable'
}

const QUERIES = {
    deleteFeatures: `DELETE FROM ${TABLES.features} WHERE Id IN (${QUERY_PARAM.ids})`,
    checkFeatureExists: `SELECT COUNT(*) FROM ${TABLES.features} WHERE Name = '${QUERY_PARAM.featureName}'`
}

export default class DatabaseHelper {
    /** Guarded delete — no-op when the spec created nothing. */
    static deleteFeatures(ids: number[]) {
        if (ids.length > 0) cy.dbDeleteByIds(QUERIES.deleteFeatures, ids)
    }

    static checkFeatureExists(name: string) {
        return cy.dbCheckRecordExists(QUERIES.checkFeatureExists, { [QUERY_PARAM.featureName]: name })
    }
}
