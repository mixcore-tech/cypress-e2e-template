import { Interception } from 'cypress/types/net-stubbing'
import { AppSelectors } from '@app/app-selectors'
import { HTTP_METHOD, HTTP_STATUS_CODE, TIMEOUT } from '../constants'

/**
 * API interception engine.
 *
 * The canonical idiom: register an intercept under a RANDOM alias right before
 * the UI action that triggers the request, perform the action, then assert on
 * the intercepted response:
 *
 *   const alias = DataGenerator.randomString()
 *   ApiHelper.interceptNetworkRequests(URLs.featuresApi, HTTP_METHOD.post, alias)
 *   FeaturePage.clickSaveButton()
 *   ApiHelper.waitForApiResponse(alias).then(interception => { ... })
 *
 * Every method returns a Cypress chainable, so status assertions run in the
 * command queue and a failure fails the test.
 */
export default class ApiHelper {
    /** Register a cy.intercept for the given URL/glob and method under the given alias. */
    static interceptNetworkRequests(requestUrl: string, method: string, alias: string) {
        cy.log(`Intercepting ${requestUrl} as @${alias} ...`)
        return cy.intercept({ url: requestUrl, method }).as(alias)
    }

    /** Intercept your app's own API traffic (glob from AppSelectors.apiRequestGlob). */
    static interceptAppApi(
        alias: string,
        method: HTTP_METHOD = HTTP_METHOD.get,
        glob: string = AppSelectors.apiRequestGlob
    ) {
        return this.interceptNetworkRequests(glob, method, alias)
    }

    /**
     * Wait for an intercepted alias, assert its status code, and yield the full
     * Interception (request + response) for further assertions. The default
     * timeout suits a UI action that has already fired; pass a longer one (e.g.
     * TIMEOUT.twoMins) when the request races a page load.
     */
    static waitForApiResponse(
        alias: string,
        statusCode: number | number[] = HTTP_STATUS_CODE.success,
        timeout: number = TIMEOUT.thirtySec
    ): Cypress.Chainable<Interception> {
        cy.log(`Waiting for @${alias} ...`)
        return cy.wait(`@${alias}`, { timeout }).then((interception) => {
            const actualStatusCode = interception.response?.statusCode
            if (Array.isArray(statusCode)) expect(statusCode).to.include(actualStatusCode)
            else expect(actualStatusCode).to.equal(statusCode)
            return interception
        })
    }
}
