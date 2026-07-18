import eslint from '@eslint/js'
import pluginCypress from 'eslint-plugin-cypress'
import tseslint from 'typescript-eslint'

export default tseslint.config(
    {
        ignores: [
            'node_modules',
            'allure-results',
            'allure-report',
            '.nyc_output',
            'coverage',
            'cypress/screenshots',
            'cypress/videos',
            'cypress/downloads'
        ]
    },
    eslint.configs.recommended,
    tseslint.configs.recommended,
    pluginCypress.configs.recommended,
    {
        rules: {
            // Bare cy.wait(milliseconds) is banned — wait on intercept aliases instead
            // (docs/BEST-PRACTICES.md#no-hardcoded-waits)
            'cypress/no-unnecessary-waiting': 'error',
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            // The declare-global Cypress.Chainable augmentation pattern needs namespaces
            '@typescript-eslint/no-namespace': 'off'
        }
    },
    {
        // Cypress.env() is deprecated in browser code and will be removed in a
        // future Cypress major. Banned here so the template never regresses;
        // the allowCypressEnv runtime flag can only flip to false once
        // allure-cypress stops reading Cypress.env('allure') itself.
        files: ['cypress/**/*.ts'],
        rules: {
            'no-restricted-properties': [
                'error',
                {
                    object: 'Cypress',
                    property: 'env',
                    message:
                        'Cypress.env() is deprecated in browser code: read env values with the async cy.env([ENV_KEY.x]) command; store runtime data with Cypress.expose (docs/ARCHITECTURE.md#reading-env-values-in-specs).'
                }
            ]
        }
    },
    // ------------------------------------------------------------------
    // Layer contracts (docs/ARCHITECTURE.md#layer-contracts) — enforced by
    // machinery, not just documented. Each block mirrors one table row.
    // ------------------------------------------------------------------
    {
        // The engine stays app-agnostic: app-selectors.ts is its ONLY window
        // into the app layer.
        files: ['cypress/core/**/*.ts'],
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: ['@app/*', '!@app/app-selectors', '**/app/*', '!**/app/app-selectors'],
                            message:
                                'cypress/core may import only @app/app-selectors from the app layer — the engine must stay app-agnostic (docs/ARCHITECTURE.md#layer-contracts).'
                        }
                    ]
                }
            ]
        }
    },
    {
        // Specs never drive elements directly — element access belongs to page
        // objects. Only the table-verification types are importable from core/ui.
        files: ['cypress/e2e/**/*.cy.ts', 'cypress/examples/specs/**/*.cy.ts', 'cypress/templates/specs/**/*.cy.ts'],
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: ['@core/ui/*', '!@core/ui/table-types', '**/core/ui/*', '!**/core/ui/table-types'],
                            message:
                                'Specs never touch UI handlers — interact through a page object (@app/pages); only @core/ui/table-types is importable (docs/ARCHITECTURE.md#layer-contracts).'
                        }
                    ]
                }
            ]
        }
    },
    {
        // Element/network access is a HANDLER responsibility, not a spec or
        // page-object one — so timeout, loader-wait, logging and intercept-alias
        // policy stay centralized in cypress/core. Specs act through page
        // objects; page objects delegate to UIElementsHandler/UITableHandler;
        // API traffic goes through ApiHelper / cy.apiRequest. This bans the raw
        // primitives that would bypass all of that. (core/support keep them.)
        files: [
            'cypress/e2e/**/*.ts',
            'cypress/examples/specs/**/*.ts',
            'cypress/templates/specs/**/*.ts',
            'cypress/app/pages/**/*.ts',
            'cypress/examples/pages/**/*.ts',
            'cypress/templates/pages/**/*.ts'
        ],
        rules: {
            'no-restricted-syntax': [
                'error',
                {
                    selector:
                        "CallExpression[callee.object.name='cy'][callee.property.name=/^(get|request|intercept)$/]",
                    message:
                        'Do not call cy.get / cy.request / cy.intercept directly here. Specs act through page objects; page objects delegate to UIElementsHandler / UITableHandler; API traffic goes through ApiHelper or cy.apiRequest (docs/ARCHITECTURE.md#layer-contracts).'
                }
            ]
        }
    },
    {
        // Commands are app-wide primitives. Entity helpers BUILD ON commands
        // (cy.apiRequest), so importing them here inverts the layering.
        files: ['cypress/support/**/*.ts'],
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: ['@app/helpers/*', '**/app/helpers/*'],
                            message:
                                'cypress/support must not import entity helpers — commands are app-wide primitives that helpers build on, not the reverse (docs/ARCHITECTURE.md#layer-contracts).'
                        }
                    ]
                }
            ]
        }
    },
    {
        files: ['scripts/**/*.mjs'],
        languageOptions: {
            globals: {
                console: 'readonly',
                process: 'readonly',
                fetch: 'readonly',
                AbortSignal: 'readonly'
            }
        }
    },
    {
        // Environment DB configs are CommonJS files loaded by cypress.config.ts
        files: ['config/environments/*.js'],
        languageOptions: {
            sourceType: 'commonjs',
            globals: {
                module: 'writable',
                require: 'readonly'
            }
        }
    }
)
