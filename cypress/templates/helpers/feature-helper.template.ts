import { URLs } from '@app/urls'
import { HTTP_METHOD } from '@core/constants'
import { FeatureFactory } from '../api/feature-factory.template'
import { IFeaturePayload } from '../api/types/feature-payload'
import { IFeatureResponse } from '../api/types/feature-response'

/**
 * FILL-IN TEMPLATE — entity helper: seeds test data via the API and tracks
 * every created id for cleanup. The endpoint is URLs.featuresApi — fill it in
 * cypress/app/urls.ts (the single URL registry), not here.
 *
 * The convention this template encodes:
 *   - every entity a spec creates (via API or captured from an interception)
 *     is pushed onto the static `createdIds` array
 *   - the spec's after() hook calls cleanupViaApi (or the DB module's
 *     DatabaseHelper.deleteFeatures) and the array resets
 *   - specs therefore never leak data into the environment
 */
export default class FeatureHelper {
    /** Ids of every entity this run created — consumed by cleanup. */
    static createdIds: number[] = []

    /** Seed one feature through the API and remember its id. */
    static addFeatureViaApi(token: string, overrides: Partial<IFeaturePayload> = {}) {
        return cy
            .apiRequest<IFeatureResponse>({
                method: HTTP_METHOD.post,
                url: URLs.featuresApi,
                body: FeatureFactory.initializeFeaturePayload(overrides),
                token
                // TODO(template): for a runtime-checked response, define a Zod schema
                // for IFeatureResponse and pass it here — a shape drift then fails
                // loudly at the seam (docs/BEST-PRACTICES.md#validate-api-responses-at-the-boundary-zod):
                //   validate: FeatureResponseSchema
            })
            .then((response) => {
                FeatureHelper.createdIds.push(response.id)
                return cy.wrap(response, { log: false })
            })
    }

    /** DELETE everything this spec created, then reset the tracker. */
    static cleanupViaApi(token: string) {
        FeatureHelper.createdIds.forEach((id) => {
            cy.apiRequest({
                method: HTTP_METHOD.delete,
                url: `${URLs.featuresApi}/${id}`,
                token,
                // cleanup must never fail the suite
                failOnStatusCode: false
            })
        })
        cy.then(() => {
            FeatureHelper.createdIds = []
        })
    }
}
