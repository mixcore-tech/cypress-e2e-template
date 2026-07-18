import { AppSelectors } from '@app/app-selectors'
import ApiHelper from '../api/api-helper'
import { HTTP_METHOD, HTTP_STATUS_CODE, TIMEOUT } from '../constants'
import UIElementsHandler from '../ui/ui-elements-handler'
import { DataGenerator } from '../utils/data-generator'

export interface IVisitOptions {
    /** Wait for the app's API traffic (and loader) to settle after the visit. */
    waitForApi?: boolean
    /** URL glob to wait on; defaults to AppSelectors.apiRequestGlob. */
    apiGlob?: string
    /** Status codes accepted from the awaited request. */
    acceptedStatuses?: number[]
    /**
     * Run an axe accessibility scan once the page has settled (loader gone).
     * Default false — opt in per visit. Fails the test on any violation.
     */
    a11y?: boolean
    /** Restrict the a11y scan to a region / exclude nodes (cypress-axe context). */
    a11yContext?: Parameters<Cypress.Chainable['checkA11y']>[0]
    /** axe run options for the a11y scan (rules, runOnly, includedImpacts, ...). */
    a11yOptions?: Parameters<Cypress.Chainable['checkA11y']>[1]
}

export default class Navigator {
    /**
     * Visit an absolute URL or a path relative to baseUrl (cy.visit semantics).
     * With { waitForApi: true }, waits for the first matching GET request and
     * for the app loader to disappear before returning. With { a11y: true },
     * runs an axe scan once the page has settled.
     */
    static visitUrl(url: string, options: IVisitOptions = {}) {
        const {
            waitForApi = false,
            apiGlob = AppSelectors.apiRequestGlob,
            acceptedStatuses = [HTTP_STATUS_CODE.success, HTTP_STATUS_CODE.noContent],
            a11y = false,
            a11yContext,
            a11yOptions
        } = options

        if (waitForApi) {
            const alias = DataGenerator.randomString()
            ApiHelper.interceptNetworkRequests(apiGlob, HTTP_METHOD.get, alias)
            cy.visit(url)
            // Page-load requests can be slow on cold starts — wait longer than the
            // post-action default.
            ApiHelper.waitForApiResponse(alias, acceptedStatuses, TIMEOUT.twoMins)
            UIElementsHandler.waitForLoaderToDisappear()
        } else {
            cy.visit(url)
        }

        if (a11y) this.runA11yScan(a11yContext, a11yOptions)
    }

    /**
     * Inject axe into the app-under-test and assert zero accessibility
     * violations. Waits for the loader first so the scan sees the settled DOM.
     * The single a11y entry point — every page inherits it via visitUrl.
     */
    private static runA11yScan(
        context?: Parameters<Cypress.Chainable['checkA11y']>[0],
        axeOptions?: Parameters<Cypress.Chainable['checkA11y']>[1]
    ) {
        UIElementsHandler.waitForLoaderToDisappear()
        cy.injectAxe()
        cy.checkA11y(context, axeOptions)
    }
}
