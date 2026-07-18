/**
 * FILL-IN TEMPLATE — the canonical login-dependent feature CRUD spec.
 *
 * The flow this template encodes (the backbone of every feature spec):
 *   beforeEach  log in through the API (fast — no UI) and keep the auth header
 *   add         act through page objects → intercept the save call under a
 *               RANDOM alias → assert on the API response → verify the table row
 *   edit        seed the entity through the API → change it in the UI → verify
 *   after       delete everything the spec created (API cleanup; DB alternative)
 *
 * The scaffold script (npm run scaffold) generated or can generate this spec
 * plus its page/factory/types/helper, wired into cypress/e2e/.
 */
import { ENV_KEY } from '@app/env-keys'
import { URLs } from '@app/urls'
import ApiHelper from '@core/api/api-helper'
import { HTTP_METHOD, HTTP_STATUS_CODE } from '@core/constants'
import { ITableValidationPair } from '@core/ui/table-types'
import { DataGenerator } from '@core/utils/data-generator'
import { IFeatureResponse } from '../api/types/feature-response'
import FeatureHelper from '../helpers/feature-helper.template'
import FeaturePage from '../pages/feature-page.template'

// The endpoint lives in cypress/app/urls.ts (URLs.featuresApi) — fill it in there.

let authHeader: string
let username: string
let password: string

describe('Feature CRUD', () => {
    before(() => {
        // Resolve credentials and perform the ONE real login for this run. Its
        // response gives the API auth header used to seed and clean up data.
        cy.env<Record<ENV_KEY, string>>([ENV_KEY.username, ENV_KEY.password]).then((credentials) => {
            username = credentials[ENV_KEY.username]
            password = credentials[ENV_KEY.password]
            cy.loginViaApi(username, password).then((loginResponse) => {
                // TODO(template): build the authorization header from YOUR login
                // response — its shape lives in cypress/app/api/types/login-response.d.ts
                authHeader = `Bearer ${loginResponse.access_token}`
            })
        })
    })

    beforeEach(() => {
        // Restore the cached session before each test — cy.session replays it
        // from cache (no repeated network login), and testIsolation cleared it.
        cy.loginViaApi(username, password)
    })

    after(() => {
        FeatureHelper.cleanupViaApi(authHeader)
        // DB-cleanup alternative (optional module — see docs/DATABASE-MODULE.md):
        // DatabaseHelper.deleteFeatures(FeatureHelper.createdIds)
    })

    it('TC-000: add a feature through the UI', () => {
        FeaturePage.visit()
        FeaturePage.clickAddButton()

        const name = DataGenerator.randomString(8)
        const description = DataGenerator.randomString(15)
        // TODO(template): fill your add dialog's fields through its page object, e.g.:
        // AddEditFeatureDialog.fillNameField(name)
        // AddEditFeatureDialog.fillDescriptionField(description)

        const alias = DataGenerator.randomString()
        ApiHelper.interceptNetworkRequests(URLs.featuresApi, HTTP_METHOD.post, alias)
        // TODO(template): click the dialog's save button through its page object

        ApiHelper.waitForApiResponse(alias).then((interception) => {
            const created = interception.response?.body as IFeatureResponse
            FeatureHelper.createdIds.push(created.id)

            // No cy.wait(milliseconds) here — the interception above already
            // synchronized the UI with the API, so the new row is on screen.
            const expectedRecord: ITableValidationPair = {
                identifiers: { [FeaturePage.tableColumnsHeaders.Name]: name },
                data: { [FeaturePage.tableColumnsHeaders.Description]: description },
                searchText: name
            }
            FeaturePage.verifyRecords([expectedRecord])
        })
    })

    it('TC-000: edit a feature seeded through the API', () => {
        FeatureHelper.addFeatureViaApi(authHeader).then((seededFeature) => {
            FeaturePage.visit()
            FeaturePage.clickEditButton(seededFeature.name)

            const newName = DataGenerator.randomString(8)
            // TODO(template): change the name in your edit dialog through its page object

            const alias = DataGenerator.randomString()
            ApiHelper.interceptNetworkRequests(`${URLs.featuresApi}/${seededFeature.id}`, HTTP_METHOD.put, alias)
            // TODO(template): click the dialog's save button through its page object

            ApiHelper.waitForApiResponse(alias, [HTTP_STATUS_CODE.success, HTTP_STATUS_CODE.noContent])
            FeaturePage.verifyRowExists({ [FeaturePage.tableColumnsHeaders.Name]: newName })
        })
    })
})
