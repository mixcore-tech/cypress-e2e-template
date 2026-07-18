const apiBaseUrl = Cypress.config('apiBaseUrl')

/**
 * Central endpoint map — every API URL used by commands, helpers and specs
 * lives here, built from the per-environment `apiBaseUrl`
 * (config/environments/<version>.json). There is no other URL registry:
 * templates and scaffold output reference URLs.* entries, never local constants.
 */
export const URLs = {
    /** Used by the runnable API examples (public JSONPlaceholder demo API). */
    usersApi: `${apiBaseUrl}/users`,
    postsApi: `${apiBaseUrl}/posts`,

    // TODO(template): replace these sample paths with your app's real endpoints.
    // scaffold:endpoints — `npm run scaffold` inserts new entries directly below this line; keep the marker.
    loginApi: `${apiBaseUrl}/TODO_auth/login`,
    featuresApi: `${apiBaseUrl}/TODO_features`

    // With a path parameter, filled at call time via CollectionUtils.formatWithParams:
    // featureByIdApi: `${apiBaseUrl}/api/features/featureId`,
}
