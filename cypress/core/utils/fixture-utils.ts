export class FixtureUtils {
    /**
     * Load one section of a fixture file into the shared `Cypress.expose('fixtures')`
     * namespace so every spec can read seeded reference data without re-reading
     * the fixture. Data goes to Cypress.expose — the sanctioned browser-side
     * store — NOT the deprecated, lint-banned `Cypress.env()`, and never among
     * the env values (those belong to the environment files / ENV_KEY).
     *
     *   fixture example-data.json: { "SAMPLE_RECORD": { "name": "...", "email": "..." } }
     *   FixtureUtils.loadFixtureData('example-data.json', 'SAMPLE_RECORD')
     *   → FixtureUtils.getFixtureValue('name'), FixtureUtils.getFixtureValue('email')
     */
    static loadFixtureData(fixturePath: string, dataKey: string) {
        cy.log(`Loading fixture ${fixturePath} [${dataKey}] into Cypress.expose('fixtures')`)
        return cy.fixture(fixturePath).then((data) => {
            const section = data[dataKey]
            if (!section) throw new Error(`Fixture ${fixturePath} has no key "${dataKey}"`)
            Cypress.expose('fixtures', { ...(Cypress.expose('fixtures') ?? {}), ...section })
        })
    }

    /** Read one value previously loaded by loadFixtureData. */
    static getFixtureValue<T = unknown>(key: string): T {
        return ((Cypress.expose('fixtures') ?? {}) as Record<string, T>)[key]
    }
}
