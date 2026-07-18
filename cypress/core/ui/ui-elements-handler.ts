import { AppSelectors } from '@app/app-selectors'
import { HTML_TAGS, TIMEOUT } from '../constants'
import { TypedInput } from './typed-input'

/**
 * Framework-agnostic element interaction layer.
 *
 * Page objects delegate ALL element interactions here instead of calling
 * cy.get directly. Anything app-specific (loader selector, dropdown option
 * selector, checked-state classes) is read from cypress/app/app-selectors.ts.
 *
 * Element queries retry for `defaultCommandTimeout` (set in cypress.config.ts)
 * — no per-call timeout parameters.
 */
export default class UIElementsHandler {
    static fillTextField(locator: string, text: string, force: boolean = false) {
        new TypedInput(cy.get(locator)).typeString(text, false, force)
    }

    static fillNumericField(locator: string, value: number) {
        new TypedInput(cy.get(locator)).typeNumber(value)
    }

    static verifyNumericField(locator: string, value: number) {
        new TypedInput(cy.get(locator)).verifyNumber(value)
    }

    /** Assert the element's (or its parent's) text contains the given value. */
    static verifyElementContainsText(locator: string, value: string, checkParent: boolean = false) {
        const chain = checkParent ? cy.get(locator).parent() : cy.get(locator)
        chain.invoke('text').then((text) => {
            expect(text).to.include(value)
        })
    }

    /** Assert the element's trimmed text equals (or contains) the expected text. */
    static verifyElementText(locator: string, expectedText: string, contains: boolean = false) {
        cy.log(`Verifying the text content of ${locator}`)
        cy.get(locator)
            .invoke('text')
            .then((text) => {
                const actualText = text.trim()
                if (contains) expect(actualText).to.contain(expectedText.trim())
                else expect(actualText).to.equal(expectedText.trim())
            })
    }

    static clickButton(locator: string, force: boolean = false) {
        cy.get(locator).should('be.enabled').click({ force })
    }

    static clickElement(locator: string, force: boolean = false) {
        cy.get(locator).click({ force })
    }

    static focusElement(locator: string) {
        cy.get(locator).focus()
    }

    static clickWrappedElement(element: JQuery<HTMLElement>) {
        cy.wrap(element).click()
    }

    /**
     * Open a dropdown and click the option with the given text.
     * The option selector defaults to AppSelectors.dropdownOptionSelector.
     */
    static selectFromDropdownList(
        locator: string,
        option: string,
        optionSelector: string = AppSelectors.dropdownOptionSelector,
        clickInnerDiv: boolean = false
    ) {
        if (clickInnerDiv)
            cy.get(locator)
                .find(HTML_TAGS.div)
                .eq(0)
                .then((element) => {
                    this.clickWrappedElement(element)
                })
        else this.clickElement(locator)
        cy.get(optionSelector).contains(option).click()
    }

    /**
     * Open a multi-select dropdown and click every given option, optionally
     * typing each into the search input first
     * (AppSelectors.multiSelectSearchSelector — skipped when null).
     */
    static selectFromMultiSelectList(
        locator: string,
        options: string[],
        optionSelector: string = AppSelectors.dropdownOptionSelector,
        search: boolean = false,
        clickOnBody: boolean = true
    ) {
        this.clickElement(locator)

        options.forEach((option) => {
            if (search && AppSelectors.multiSelectSearchSelector)
                this.fillTextField(AppSelectors.multiSelectSearchSelector, option)
            cy.get(optionSelector).contains(option).click()
        })

        if (clickOnBody) cy.get(HTML_TAGS.body).click(0, 0)
    }

    /** Yield true when the element currently has the given class. */
    static elementHasClass(locator: string, className: string) {
        return cy.get(locator).then(($element) => $element.hasClass(className))
    }

    /**
     * Generic primitive for styled two-state controls: clicks the element only
     * when its checked-state class does not match the desired state.
     */
    static toggleByStateClass(
        locator: string,
        checkedClass: string,
        shouldCheck: boolean = true,
        force: boolean = false
    ) {
        this.elementHasClass(locator, checkedClass).then((isChecked) => {
            if (isChecked !== shouldCheck) {
                this.clickElement(locator, force)
            }
        })
    }

    /**
     * Check/uncheck a checkbox. Uses AppSelectors.checkboxCheckedClass when your
     * app renders styled checkboxes; otherwise falls back to the native
     * .check()/.uncheck() commands on the input element.
     */
    static toggleCheckBox(locator: string, shouldCheck: boolean = true, force: boolean = false) {
        if (AppSelectors.checkboxCheckedClass) {
            this.toggleByStateClass(locator, AppSelectors.checkboxCheckedClass, shouldCheck, force)
        } else if (shouldCheck) {
            cy.get(locator).check({ force })
        } else {
            cy.get(locator).uncheck({ force })
        }
    }

    /**
     * Turn a toggle/switch control on or off. Uses AppSelectors.toggleCheckedClass
     * when configured; otherwise falls back to native .check()/.uncheck().
     */
    static toggleSwitch(locator: string, shouldBeOn: boolean = true, force: boolean = false) {
        if (AppSelectors.toggleCheckedClass) {
            this.toggleByStateClass(locator, AppSelectors.toggleCheckedClass, shouldBeOn, force)
        } else if (shouldBeOn) {
            cy.get(locator).check({ force })
        } else {
            cy.get(locator).uncheck({ force })
        }
    }

    /**
     * Wait for the app's global loader to disappear.
     * No-op when AppSelectors.loaderSelector is not configured.
     */
    static waitForLoaderToDisappear(loaderSelector: string | null = AppSelectors.loaderSelector) {
        if (!loaderSelector) return cy.then(() => undefined)
        cy.log('Waiting for the loader to disappear ...')
        return cy.get(HTML_TAGS.body).then(($body) => {
            if ($body.find(loaderSelector).length > 0) {
                // Slow pages: give the loader longer than the default to clear.
                cy.get(loaderSelector, { timeout: TIMEOUT.oneMin }).should('not.exist')
            }
        })
    }

    static isElementVisible(locator: string) {
        cy.get(locator).should('be.visible')
    }

    /**
     * Assert an input is marked invalid by your app.
     * Requires AppSelectors.invalidInputClass (or an explicit class argument).
     */
    static verifyInputInvalid(locator: string, invalidClass: string | null = AppSelectors.invalidInputClass) {
        if (!invalidClass) {
            throw new Error(
                'verifyInputInvalid needs an invalid-input class: set AppSelectors.invalidInputClass ' +
                    'in cypress/app/app-selectors.ts or pass one explicitly.'
            )
        }
        cy.get(locator).should('have.class', invalidClass)
    }

    static verifyElementExists(locator: string) {
        cy.get(locator).should('exist')
    }

    static verifyElementCount(locator: string, count: number) {
        cy.get(locator).should('have.length', count)
    }

    /** Type the given date string (e.g. 'MM/DD/YYYY') into a date input. */
    static fillDateField(locator: string, date: string) {
        return cy.get(locator).type(date)
    }

    /**
     * Attach a file to a file input via .selectFile(). `filePath` is relative to
     * the project root (a fixture path works too). Pass `mimeType` when the app
     * validates the content type — the file is then read and re-attached with it.
     */
    static uploadFile(locator: string, filePath: string, mimeType?: string) {
        if (!mimeType) {
            return cy.get(locator).selectFile(filePath, { force: true })
        }
        const fileName = filePath.split('/').pop() ?? 'upload'
        // Read as a Buffer (encoding: null) so binary uploads stay intact.
        return cy.readFile(filePath, null).then((contents) => {
            cy.get(locator).selectFile(
                { contents: contents as Cypress.FileReference, fileName, mimeType },
                { force: true }
            )
        })
    }

    /**
     * Assert a file finished downloading into Cypress's downloads folder.
     * cy.readFile retries until the file exists or the timeout elapses, so no
     * bare cy.wait is needed.
     */
    static verifyDownload(fileName: string, timeout: number = TIMEOUT.thirtySec) {
        const downloadsFolder = Cypress.config('downloadsFolder')
        return cy.readFile(`${downloadsFolder}/${fileName}`, { timeout }).should('exist')
    }

    /**
     * Pierce a shadow root. With `innerSelector`, yields the matching element(s)
     * inside the host's shadow DOM; without it, yields the shadow root itself.
     *
     *   UIElementsHandler.getShadowElement('my-widget', 'button.save').click()
     */
    static getShadowElement(hostSelector: string, innerSelector?: string) {
        return innerSelector ? cy.get(hostSelector).shadow().find(innerSelector) : cy.get(hostSelector).shadow()
    }

    /**
     * Safely traverse into a same-origin iframe and yield an element inside it.
     * Waits for the iframe document body to populate before searching, so it
     * doesn't race the frame load.
     *
     *   UIElementsHandler.getIframeElement('iframe#editor', '.ql-editor').type('hi')
     */
    static getIframeElement(iframeSelector: string, innerSelector: string) {
        return cy
            .get(iframeSelector)
            .its('0.contentDocument.body', { timeout: TIMEOUT.thirtySec })
            .should('not.be.empty')
            .then((body) => cy.wrap(body as HTMLElement))
            .find(innerSelector)
    }
}
