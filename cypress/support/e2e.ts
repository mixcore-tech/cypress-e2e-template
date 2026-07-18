// Loaded automatically before every spec (supportFile in cypress.config.ts).

import 'allure-cypress'
// Registers cy.injectAxe / cy.checkA11y / cy.configureAxe. Inert unless a spec
// opts in (Navigator.visitUrl({ a11y: true }) or a direct cy.checkA11y()).
import 'cypress-axe'
// Collects window.__coverage__ after each test and merges it into .nyc_output.
// Produces data only when your app is instrumented (istanbul); a no-op warning
// otherwise. See docs/BEST-PRACTICES.md#code-coverage.
import '@cypress/code-coverage/support'
import './commands/api-commands'
import './commands/auth-commands'
// Optional DB module — inert until config/environments/<version>.db.js exists.
import './commands/db-commands'
