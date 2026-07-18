import { ZodType } from 'zod'
import { HTTP_METHOD } from '@core/constants'

export interface IApiRequestOptions<T = unknown> {
    method: HTTP_METHOD
    url: string
    body?: object | string | boolean | null
    /** Authorization header value, e.g. `Bearer ${accessToken}`. */
    token?: string
    /** Extra headers merged into the request. */
    headers?: Record<string, string>
    /** Set false to assert on error responses yourself. Default true. */
    failOnStatusCode?: boolean
    /**
     * Optional Zod schema. When provided, the response body is parsed through it
     * and the command yields the PARSED, typed value. A mismatch throws a clear
     * boundary error naming the drifted fields — so an API shape change fails
     * loudly here instead of as a baffling `undefined` three layers downstream.
     */
    validate?: ZodType<T>
}

declare global {
    namespace Cypress {
        interface Chainable {
            /**
             * Generic authenticated API request that yields the response BODY
             * (or, when `validate` is set, the schema-parsed body). The single
             * building block for seeding and cleaning up test data — wrap it in
             * entity helpers (see cypress/templates/helpers/feature-helper.template.ts).
             */
            apiRequest<T = unknown>(options: IApiRequestOptions<T>): Chainable<T>
        }
    }
}

Cypress.Commands.add('apiRequest', (options: IApiRequestOptions) => {
    const { method, url, body, token, headers = {}, failOnStatusCode = true, validate } = options

    Cypress.log({
        displayName: 'apiRequest',
        message: `${method} ${url}`
    })

    const requestHeaders: Record<string, string> = { ...headers }
    if (token) requestHeaders.authorization = token
    // TODO(template): add headers EVERY request needs here, e.g. a tenant id:
    // requestHeaders.tenant = String(Cypress.config('tenantId'))

    // Yield the body via .then (not .its('body')) so a null/absent body — common
    // on DELETE/204 responses — doesn't trip .its()'s implicit not-null assertion
    // and fail cleanup hooks that pass failOnStatusCode: false.
    return cy
        .request({
            method,
            url,
            body,
            headers: requestHeaders,
            failOnStatusCode
        })
        .then((response) => {
            if (!validate) return response.body

            const result = validate.safeParse(response.body)
            if (!result.success) {
                const issues = result.error.issues
                    .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
                    .join('\n')
                throw new Error(
                    `API schema validation failed for ${method} ${url} — the response does not match ` +
                        `the expected shape (schema drift). Fix the schema or the API, not the downstream test:\n${issues}`
                )
            }
            return result.data
        })
})
