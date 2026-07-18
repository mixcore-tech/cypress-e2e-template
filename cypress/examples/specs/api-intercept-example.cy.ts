/**
 * EXAMPLE — the intercept-and-assert idiom.
 *
 * Register an intercept under a RANDOM alias right before the UI action that
 * fires the request, act, then assert on the intercepted response. This is how
 * feature specs verify that a Save actually hit the API — see
 * cypress/templates/specs/feature-crud.template.cy.ts
 */
import ApiHelper from '@core/api/api-helper'
import { HTTP_METHOD } from '@core/constants'
import { DataGenerator } from '@core/utils/data-generator'
import ExampleNetworkPage from '../pages/example-network-page'

describe('Example: API interception', () => {
    it('EX-8: assert on the response fired by a UI action', () => {
        ExampleNetworkPage.visit()

        const alias = DataGenerator.randomString()
        ApiHelper.interceptNetworkRequests('**/comments/*', HTTP_METHOD.get, alias)

        // Act through the page object — the spec never calls cy.get (lint-enforced).
        ExampleNetworkPage.clickGetCommentButton()

        ApiHelper.waitForApiResponse(alias).then((interception) => {
            expect(interception.response?.body).to.have.property('email')
            expect(interception.response?.body).to.have.property('name')
        })
    })
})
