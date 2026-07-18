/**
 * The response body of YOUR login endpoint — what cy.loginViaApi yields.
 * Specs build their authorization header from these fields, so typing them once
 * here removes every inline cast.
 */
export interface ILoginResponse {
    // TODO(template): match your login endpoint's real response shape
    // (e.g. rename to accessToken, add expiresIn, drop refresh_token, ...)
    access_token: string
    refresh_token?: string
}
