export class CollectionUtils {
    /** Find the first map key whose value equals the given value. */
    static getKeyByValue<K, V>(map: Map<K, V>, value: V): K | undefined {
        for (const [key, mapValue] of map.entries()) {
            if (mapValue === value) return key
        }
        return undefined
    }

    /**
     * Replace every named token inside a template (URL or SQL query) with its value.
     *
     *   formatWithParams('DELETE FROM Features WHERE Id IN (featureId)', { featureId: '1,2' })
     *   → 'DELETE FROM Features WHERE Id IN (1,2)'
     *
     * Tokens are matched whole-word (so 'ids' does not match inside 'Bids') and
     * substituted via a replacer function, so values containing '$' sequences
     * ($&, $', $$…) are inserted literally rather than expanded. Overlapping
     * token names are handled longest-first.
     */
    static formatWithParams(template: string, params: Record<string, unknown>): string {
        const tokens = Object.keys(params)
        if (tokens.length === 0) return template
        const pattern = tokens
            .sort((a, b) => b.length - a.length)
            .map((token) => token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
            .join('|')
        const regex = new RegExp(`\\b(?:${pattern})\\b`, 'g')
        return template.replace(regex, (matched) => String(params[matched]))
    }
}
