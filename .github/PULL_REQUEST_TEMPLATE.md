## What does this PR add or change?

<!-- One or two sentences. -->

## Checklist

- [ ] Spec titles carry a test-case id (`it('TC-1234: ...')`)
- [ ] All new locators use `data-cy` attributes
- [ ] No bare `cy.wait(milliseconds)` — waits go through intercept aliases or the loader
- [ ] Every entity the specs create is cleaned up in `after()` (API or DB)
- [ ] `npm run lint` and `npm run typecheck` pass locally
