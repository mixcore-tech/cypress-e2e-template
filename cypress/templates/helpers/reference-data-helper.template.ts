import { HTTP_METHOD } from '@core/constants'
import { CollectionUtils } from '@core/utils/collection-utils'

// TODO(template): the endpoint returning your reference list (roles, categories, ...)
const REFERENCE_DATA_URL = 'TODO_https://api.mixcore-tech.com/api/reference-items'
/** Cypress.expose key the loaded map is cached under. */
const REFERENCE_EXPOSE_KEY = 'TODO_referenceNameById'

/**
 * FILL-IN TEMPLATE — load-once reference-data cache.
 *
 * Slow-changing lookup data (roles, categories, timezones, ...) is fetched once
 * per run and cached via Cypress.expose (the browser-side runtime store — the
 * legacy Cypress.env() is deprecated and banned by lint) as a Map<id, name>.
 * Factories then resolve display names to ids without extra requests:
 *
 *   ReferenceDataHelper.loadReferenceDataToEnv(token)
 *   const roleId = ReferenceDataHelper.getIdByName('Administrator')
 */
export default class ReferenceDataHelper {
    private static isLoaded = false

    static loadReferenceDataToEnv(token: string, loadByForce: boolean = false) {
        if (ReferenceDataHelper.isLoaded && !loadByForce) return

        cy.apiRequest<Array<{ id: number; name: string }>>({
            method: HTTP_METHOD.get,
            url: REFERENCE_DATA_URL,
            token
        }).then((items) => {
            const nameById = new Map<number, string>()
            items.forEach((item) => nameById.set(item.id, item.name))
            Cypress.expose(REFERENCE_EXPOSE_KEY, nameById)
        })
        cy.then(() => {
            ReferenceDataHelper.isLoaded = true
        })
    }

    /** Resolve an id by its display name from the cached map. */
    static getIdByName(name: string): number | undefined {
        return CollectionUtils.getKeyByValue(Cypress.expose(REFERENCE_EXPOSE_KEY) as Map<number, string>, name)
    }
}
