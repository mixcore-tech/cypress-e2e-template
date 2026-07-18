#!/usr/bin/env node
/**
 * Feature scaffold generator — zero dependencies.
 *
 * Usage:   npm run scaffold -- <feature-name>            (kebab-case, e.g. product-catalog)
 *          npm run scaffold -- <group>/<feature-name>    (nested, e.g. shop/product-catalog)
 *
 * Copies the skeletons from cypress/templates/ into your working layers,
 * renaming "feature" to your name in identifiers, file names and paths:
 *
 *   templates/specs/feature-crud.template.cy.ts → cypress/e2e/[group/]<name>.cy.ts
 *   templates/pages/feature-page.template.ts    → cypress/app/pages/[group/]<name>-page.ts
 *   templates/api/feature-factory.template.ts   → cypress/app/api/[group/]<name>-factory.ts
 *   templates/api/types/feature-payload.d.ts    → cypress/app/api/[group/]types/<name>-payload.d.ts
 *   templates/api/types/feature-response.d.ts   → cypress/app/api/[group/]types/<name>-response.d.ts
 *   templates/helpers/feature-helper.template.ts→ cypress/app/helpers/[group/]<name>-helper.ts
 *
 * Templates import the engine and app layers through the @core/@app aliases
 * (cypress/tsconfig.json "paths"), so generated imports never depend on folder
 * depth — only template-to-template imports are rewritten, to the generated
 * files' @app locations. A TODO endpoint entry is also inserted into
 * cypress/app/urls.ts (at the `scaffold:endpoints` marker) so everything
 * compiles immediately. Nothing is ever overwritten — the script refuses to
 * run if any output file exists.
 */
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const templatesDir = path.join(repoRoot, 'cypress', 'templates')

const rawName = process.argv[2]
if (!rawName || !/^([a-z][a-z0-9-]*\/)*[a-z][a-z0-9-]*$/.test(rawName)) {
    console.error('Usage: npm run scaffold -- <feature-name>  (or <group>/<feature-name>)')
    console.error(
        'Every segment must be kebab-case: lowercase letters, digits and dashes, ' +
            'e.g. "product", "product-catalog" or "shop/product-catalog".'
    )
    process.exit(1)
}

const segments = rawName.split('/')
const kebab = segments.at(-1)
const group = segments.slice(0, -1).join('/') // '' when not nested
const groupPrefix = group ? `${group}/` : ''
const pascal = kebab
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
const camel = pascal.charAt(0).toLowerCase() + pascal.slice(1)
const screaming = kebab.replaceAll('-', '_').toUpperCase()

/**
 * Template-to-template imports become imports of the GENERATED files at their
 * @app locations. Depth-independent, so nested groups need no special casing.
 * (@core/@app imports and the factory's sibling './types/' import pass through
 * untouched.)
 */
const IMPORT_RULES = [
    ["from '../pages/", `from '@app/pages/${groupPrefix}`],
    ["from '../helpers/", `from '@app/helpers/${groupPrefix}`],
    ["from '../api/", `from '@app/api/${groupPrefix}`]
]

// Single-pass replacement map. Applied via ONE regex scan (longest key first)
// so a replacement's own text — e.g. the kebab name, which itself contains
// "feature" for a name like "feature-flag" — is never re-matched by a later
// rule. Sequential replaceAll passes corrupt any name containing "feature".
const NAME_REPLACEMENTS = {
    'feature-': `${kebab}-`, // file names inside import specifiers
    FEATURE: screaming, // SCREAMING_SNAKE constants
    Feature: pascal, // classes, interfaces, PascalCase identifiers
    feature: camel // camelCase identifiers and prose
}
const NAME_REGEX = new RegExp(
    Object.keys(NAME_REPLACEMENTS)
        .sort((a, b) => b.length - a.length)
        .join('|'),
    'g'
)
const applyNameReplacements = (content) => content.replace(NAME_REGEX, (matched) => NAME_REPLACEMENTS[matched])

const FILES = [
    { source: 'specs/feature-crud.template.cy.ts', target: `cypress/e2e/${groupPrefix}${kebab}.cy.ts` },
    { source: 'pages/feature-page.template.ts', target: `cypress/app/pages/${groupPrefix}${kebab}-page.ts` },
    { source: 'api/feature-factory.template.ts', target: `cypress/app/api/${groupPrefix}${kebab}-factory.ts` },
    { source: 'api/types/feature-payload.d.ts', target: `cypress/app/api/${groupPrefix}types/${kebab}-payload.d.ts` },
    { source: 'api/types/feature-response.d.ts', target: `cypress/app/api/${groupPrefix}types/${kebab}-response.d.ts` },
    { source: 'helpers/feature-helper.template.ts', target: `cypress/app/helpers/${groupPrefix}${kebab}-helper.ts` }
]

// Refuse to overwrite anything — check every target before writing the first file.
const collisions = FILES.map((file) => file.target).filter((target) => fs.existsSync(path.join(repoRoot, target)))
if (collisions.length > 0) {
    console.error('Refusing to overwrite existing files:')
    collisions.forEach((target) => console.error(`  - ${target}`))
    console.error('Delete them (or pick another feature name) and run the scaffold again.')
    process.exit(1)
}

for (const file of FILES) {
    let content = fs.readFileSync(path.join(templatesDir, file.source), 'utf-8')

    for (const [from, to] of IMPORT_RULES) content = content.replaceAll(from, to)
    content = content.replaceAll(".template'", "'") // imports point at the generated names
    content = applyNameReplacements(content)

    const targetPath = path.join(repoRoot, file.target)
    fs.mkdirSync(path.dirname(targetPath), { recursive: true })
    fs.writeFileSync(targetPath, content)
    console.log(`  created ${file.target}`)
}

// Register the endpoint in the single URL registry so the generated helper and
// spec compile immediately (URLs.<camel>sApi). Inserted as a TODO placeholder
// right below the `scaffold:endpoints` marker.
const urlsPath = path.join(repoRoot, 'cypress', 'app', 'urls.ts')
const urlsMarker = '// scaffold:endpoints'
const endpointKey = `${camel}sApi`
const urlsContent = fs.readFileSync(urlsPath, 'utf-8')
if (urlsContent.includes(`${endpointKey}:`)) {
    console.log(`  kept    cypress/app/urls.ts (URLs.${endpointKey} already exists)`)
} else if (urlsContent.includes(urlsMarker)) {
    const markerLine = urlsContent.split('\n').find((line) => line.includes(urlsMarker))
    const endpointLine = '    ' + endpointKey + ': `${apiBaseUrl}/TODO_' + kebab + '`,'
    fs.writeFileSync(urlsPath, urlsContent.replace(markerLine, `${markerLine}\n${endpointLine}`))
    console.log(`  updated cypress/app/urls.ts (added URLs.${endpointKey} — TODO placeholder)`)
} else {
    console.log(`  ⚠ cypress/app/urls.ts has no "${urlsMarker}" marker — add URLs.${endpointKey} to it yourself.`)
}

console.log(`
Created ${FILES.length} files for "${rawName}".

Next steps (full walkthrough: docs/ADDING-A-FEATURE-TEST.md):
  1. Point URLs.${endpointKey} in cypress/app/urls.ts at your real endpoint
  2. Fill the payload/response types from your API (swagger or the network tab)
  3. Resolve every marker:  npm run todo | grep ${kebab}
  4. Run it:  npm run run:spec -- cypress/e2e/${groupPrefix}${kebab}.cy.ts
`)
