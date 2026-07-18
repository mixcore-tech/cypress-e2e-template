import { defineConfig } from 'cypress'
import * as fs from 'fs'
import * as path from 'path'
import { allureCypress } from 'allure-cypress/reporter'

const ENVIRONMENTS_DIR = path.join(__dirname, 'config', 'environments')

/**
 * Loads config/environments/<version>.json and returns its content.
 * The file's top-level keys are merged into Cypress config (baseUrl, apiBaseUrl, ...);
 * its nested "env" object is merged into Cypress.env().
 */
function loadEnvironmentFile(version: string): Record<string, unknown> {
    const filePath = path.join(ENVIRONMENTS_DIR, `${version}.json`)
    if (!fs.existsSync(filePath)) {
        throw new Error(
            `Environment file not found: ${filePath}\n` +
                `Create it from config/environments/local.example.json ` +
                `(e.g. "cp config/environments/local.example.json config/environments/local.json"), ` +
                `or run against the built-in demo with --env version=demo`
        )
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

/**
 * Optional DB module: wired ONLY when config/environments/<version>.db.js exists.
 * Without it, the sqlServer:execute task is registered with a helpful error so
 * accidental cy.queryDatabase calls fail fast instead of hanging.
 */
function registerDbTasks(on: Cypress.PluginEvents, version: string): boolean {
    const dbConfigPath = path.join(ENVIRONMENTS_DIR, `${version}.db.js`)
    if (fs.existsSync(dbConfigPath)) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const sqlServer = require('cypress-sql-server')
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        on('task', sqlServer.loadDBPlugin(require(dbConfigPath)))
        return true
    }
    on('task', {
        'sqlServer:execute': () => {
            throw new Error(
                `The DB module is disabled. Create config/environments/${version}.db.js ` +
                    `(see config/environments/local.db.example.js) to enable ` +
                    `cy.queryDatabase / cy.dbCheckRecordExists / cy.dbDeleteByIds. ` +
                    `Details: docs/DATABASE-MODULE.md`
            )
        }
    })
    return false
}

export default defineConfig({
    e2e: {
        viewportWidth: 1680,
        viewportHeight: 1050,
        experimentalRunAllSpecs: true,
        experimentalMemoryManagement: true,
        // Element queries wait up to 10s — the core handlers rely on this single
        // knob instead of threading per-call timeouts through every signature.
        // Kept modest on purpose: a large global timeout hides slow selectors and
        // race conditions. Bump per-app in a local env if a genuinely slow app
        // needs it; the loader wait already allows longer (TIMEOUT.oneMin).
        defaultCommandTimeout: 10000,
        // Template code never reads Cypress.env() in the browser (deprecated,
        // removed in a future Cypress major) — lint-enforced: specs use the
        // async cy.env command, runtime data goes through Cypress.expose.
        // allowCypressEnv stays at its default (true) ONLY because
        // allure-cypress (<= 3.10.2) still reads Cypress.env('allure') at
        // import time; set `allowCypressEnv: false` here once allure migrates.
        requestTimeout: 60000,
        responseTimeout: 120000,
        screenshotOnRunFailure: true,
        retries: {
            openMode: 0,
            runMode: 1
        },
        supportFile: 'cypress/support/e2e.ts',
        setupNodeEvents(on, config) {
            // Bundle specs with the batteries-included preprocessor so the
            // @core/@app aliases (cypress/tsconfig.json "paths") resolve at
            // runtime too — it auto-registers tsconfig-paths-webpack-plugin.
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const webpackPreprocessor = require('@cypress/webpack-batteries-included-preprocessor')
            on('file:preprocessor', webpackPreprocessor({ typescript: require.resolve('typescript') }))
            allureCypress(on, config, { resultsDir: 'allure-results' })
            const version = config.env.version || 'demo'
            const envFile = loadEnvironmentFile(version)
            const dbEnabled = registerDbTasks(on, version)
            const envValues = (envFile.env ?? {}) as Record<string, unknown>
            delete envFile.env
            // The runnable examples target public demo sites, so only include them
            // for the demo environment — never against a real app's baseUrl.
            const specPattern =
                version === 'demo'
                    ? ['cypress/e2e/**/*.cy.ts', 'cypress/examples/specs/**/*.cy.ts']
                    : ['cypress/e2e/**/*.cy.ts']

            // Fold the resolved environment onto config, then let cypress-split
            // (below) shard the spec list in place.
            Object.assign(config, envFile)
            config.specPattern = specPattern
            // Drop completed-test snapshots only in run mode; keep them in open
            // mode so the runner's time-travel debugging works.
            config.numTestsKeptInMemory = config.isTextTerminal ? 0 : 50
            config.env = { ...config.env, ...envValues, dbEnabled }

            // Code-coverage tasks (merge/report). Emits to .nyc_output when the
            // app under test is instrumented; harmless no-op otherwise.
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            require('@cypress/code-coverage/task')(on, config)

            // Shard specs across CI containers when SPLIT / SPLIT_INDEX (or
            // --env split=<n>,splitIndex=<i>) are set. No-op locally when unset,
            // so `npm test` still runs the whole suite in one process.
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const cypressSplit = require('cypress-split')
            cypressSplit(on, config)

            return config
        }
    }
})
