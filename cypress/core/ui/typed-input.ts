import { AppSelectors } from '@app/app-selectors'

/**
 * Wraps a Cypress input chain with clear-then-type behavior and an optional
 * visual highlight while typing (AppSelectors.typingHighlightColor).
 */
export class TypedInput {
    constructor(public element: Cypress.Chainable<JQuery<HTMLElement>>) {}

    typeString(value: string, pressEnter: boolean = false, force: boolean = false) {
        this.element.clear({ force })
        if (AppSelectors.typingHighlightColor)
            this.element.invoke('css', 'background-color', AppSelectors.typingHighlightColor)

        if (value !== '') {
            this.element.type(value, { force })
            if (pressEnter) this.element.type('{enter}', { force })
        }

        if (AppSelectors.typingHighlightColor) return this.element.invoke('css', 'background-color', '')
        return this.element
    }

    typeNumber(value: number, force: boolean = false, pressEnter: boolean = false, clearFirst: boolean = true) {
        if (clearFirst) this.element.clear({ force })
        if (AppSelectors.typingHighlightColor)
            this.element.invoke('css', 'background-color', AppSelectors.typingHighlightColor)

        this.element.type(String(value), { force })
        if (pressEnter) this.element.type('{enter}', { force })

        if (AppSelectors.typingHighlightColor) return this.element.invoke('css', 'background-color', '')
        return this.element
    }

    verifyNumber(expectedNumber: number) {
        return this.element.invoke('val').then((currentValue) => {
            expect(Number(currentValue)).to.equal(expectedNumber)
        })
    }
}
