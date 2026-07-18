/**
 * Random test-data generators.
 *
 * Always generate names/emails/passwords randomly instead of hardcoding them —
 * it keeps specs idempotent, which matters because failed tests retry once in
 * run mode (retries.runMode = 1).
 */
export class DataGenerator {
    static randomString(
        length: number = 5,
        prefix: string = '',
        suffix: string = '',
        charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    ): string {
        let text = ''
        for (let i = 0; i < length; i++) {
            text += charset.charAt(Math.floor(Math.random() * charset.length))
        }
        return prefix + text + suffix
    }

    static randomNumber(maxNumber: number = 1000): number {
        return Math.ceil(Math.random() * maxNumber)
    }

    /** Random password with upper/lower case letters, digits and a symbol. */
    static randomPassword(): string {
        return (
            this.randomString(2, '', '', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') +
            this.randomString(5, '', '', 'abcdefghijklmnopqrstuvwxyz') +
            this.randomNumber() +
            this.randomString(2, '', '', '!@#$%^&*')
        )
    }

    static randomEmail(): string {
        const chars = 'abcdefghijklmnopqrstuvwxyz1234567890'
        let username = ''
        let domain = ''
        for (let i = 0; i < 10; i++) {
            username += chars.charAt(Math.floor(Math.random() * chars.length))
            domain += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return `${username}@${domain}.com`
    }

    /** Pick a random member of the given enum, optionally excluding one value. */
    static randomEnum<T extends object>(anEnum: T, excludeValue?: T[keyof T]): T[keyof T] {
        // Drop the numeric reverse-mapping keys TypeScript adds to numeric enums,
        // so we choose among the real member VALUES for both string and numeric enums.
        const values = Object.keys(anEnum)
            .filter((key) => isNaN(Number(key)))
            .map((key) => anEnum[key as keyof T])
        const candidates = excludeValue === undefined ? values : values.filter((value) => value !== excludeValue)
        if (candidates.length === 0) {
            throw new Error('randomEnum: no enum values to choose from (after applying the exclusion)')
        }
        return candidates[Math.floor(Math.random() * candidates.length)]
    }
}
