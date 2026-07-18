/**
 * EXAMPLE — pure API tests with cy.apiRequest (no UI at all).
 *
 * cy.apiRequest yields the response BODY directly and carries auth via its
 * `token` option. Entity helpers wrap it to seed and clean up test data — see
 * cypress/templates/helpers/feature-helper.template.ts
 *
 * The demo apiBaseUrl (config/environments/demo.json) is the public
 * JSONPlaceholder API.
 */
import { z } from 'zod'
import { URLs } from '@app/urls'
import { HTTP_METHOD } from '@core/constants'
import { DataGenerator } from '@core/utils/data-generator'
import { FixtureUtils } from '@core/utils/fixture-utils'

describe('Example: pure API tests', () => {
    it('EX-9: GET a resource and validate its body with a Zod schema', () => {
        // Pass `validate` to parse the response at the boundary: the command
        // yields the typed, parsed value, and a shape drift throws a clear error
        // here instead of an undefined three layers downstream. `user` is typed
        // from the schema — no generic argument needed.
        const userSchema = z.object({
            name: z.string().min(1),
            email: z.string().includes('@')
        })
        cy.apiRequest({
            method: HTTP_METHOD.get,
            url: `${URLs.usersApi}/1`,
            validate: userSchema
        }).then((user) => {
            expect(user.name).to.have.length.greaterThan(0)
            expect(user.email).to.contain('@')
        })
    })

    it('EX-10: POST a payload and assert the created id', () => {
        cy.apiRequest<{ id: number }>({
            method: HTTP_METHOD.post,
            url: URLs.postsApi,
            body: {
                title: DataGenerator.randomString(8, 'post-'),
                body: 'created by the API example',
                userId: DataGenerator.randomNumber(10)
            }
        }).then((created) => {
            expect(created.id).to.be.a('number')
        })
    })

    it('EX-11: load fixture reference data into the Cypress.expose fixtures namespace', () => {
        FixtureUtils.loadFixtureData('example-data.json', 'SAMPLE_RECORD')
        cy.then(() => {
            expect(FixtureUtils.getFixtureValue<string>('sampleName')).to.equal('Template Sample')
            expect(FixtureUtils.getFixtureValue<string>('sampleEmail')).to.contain('@')
        })
    })
})
