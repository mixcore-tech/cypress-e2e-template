/**
 * Custom Cypress.config() keys injected per environment by setupNodeEvents
 * from config/environments/<version>.json.
 *
 * Declaring them here gives typed access via Cypress.config('apiBaseUrl')
 * everywhere — never use `//@ts-ignore` for config reads.
 */
declare namespace Cypress {
    interface ResolvedConfigOptions {
        /** Base URL of the API under test (consumed by cypress/app/urls.ts). */
        apiBaseUrl?: string
        // TODO(template): declare any additional custom config keys your app needs, e.g.:
        // adminBaseUrl?: string
        // tenantId?: string
    }
}
