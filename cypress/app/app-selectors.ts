/**
 * App-specific UI conventions consumed by the core engine.
 *
 * This is the ONLY file the core reads for application specifics — fill it in
 * once for YOUR application and every handler adapts. A `null` value disables
 * the related behavior (safe default), so the template runs before you touch it.
 */
export const AppSelectors = {
    /**
     * Global loading indicator (progress bar / spinner) selector.
     * The core waits for it to disappear before verifying tables and after
     * navigation. null = loader waits are a no-op.
     */
    // TODO(template): set your app's loader selector, e.g. '.spinner' or '[data-loading]' — see docs/ARCHITECTURE.md#app-selectors
    loaderSelector: null as string | null,

    /**
     * Selector matching the options of an OPEN dropdown list,
     * e.g. '[role="option"]', 'select option', 'li'.
     */
    // TODO(template): set your app's dropdown option selector — see docs/ARCHITECTURE.md#app-selectors
    dropdownOptionSelector: '[role="option"]',

    /**
     * CSS class your UI framework puts on a CHECKED styled checkbox.
     * null = UIElementsHandler.toggleCheckBox falls back to the native
     * input .check()/.uncheck() commands.
     */
    // TODO(template): set if your app renders styled checkboxes, e.g. 'is-checked'
    checkboxCheckedClass: null as string | null,

    /**
     * CSS class marking a toggle/switch control as ON.
     * null = UIElementsHandler.toggleSwitch falls back to native .check()/.uncheck().
     */
    // TODO(template): set if your app uses toggle switches, e.g. 'is-on'
    toggleCheckedClass: null as string | null,

    /**
     * CSS class your app puts on an invalid input field, e.g. 'is-invalid'.
     * Required by UIElementsHandler.verifyInputInvalid.
     */
    // TODO(template): set your app's invalid-input class
    invalidInputClass: null as string | null,

    /**
     * Search input rendered inside an OPEN multi-select dropdown, used by
     * UIElementsHandler.selectFromMultiSelectList when `search` is true.
     * null = your multi-selects have no search box (search requests are skipped).
     */
    // TODO(template): adjust if your multi-selects use a different search input
    multiSelectSearchSelector: 'input[type="search"]' as string | null,

    /**
     * Password input(s) to black out of failure screenshots so credentials
     * typed via cy.loginViaForm never leak into CI artifacts. Only this field is
     * redacted — the rest of the UI stays debuggable. null = no redaction.
     * Defaults to every native password input; widen it if your app uses a
     * custom/styled control (e.g. '[data-cy="password"], input[type="password"]').
     */
    passwordFieldSelector: 'input[type="password"]' as string | null,

    /**
     * URL glob matching your app's API traffic. Used by
     * Navigator.visitUrl({ waitForApi: true }) and ApiHelper.interceptAppApi.
     */
    // TODO(template): adjust to your API path shape, e.g. '**/rest/**'
    apiRequestGlob: '**/api/**',

    /**
     * Background color flashed on input fields while typing — a visual aid when
     * watching runs in the interactive runner. null = disabled.
     */
    typingHighlightColor: null as string | null
}
