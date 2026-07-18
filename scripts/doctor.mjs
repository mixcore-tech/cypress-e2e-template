#!/usr/bin/env node
/**
 * Setup checker — zero dependencies.
 *
 * Usage:   npm run doctor                    (checks the "local" environment)
 *          npm run doctor -- version=demo    (checks another environment)
 *
 * Verifies the things that most often burn a first hour: Node version, the
 * environment file and its keys, reachability of baseUrl, Java for Allure,
 * and whether the optional DB module is on. Exits 1 only on hard failures.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const environmentsDir = path.join(repoRoot, 'config', 'environments')

const versionArg = process.argv.find((arg) => arg.startsWith('version='))
const version = versionArg ? versionArg.split('=')[1] : 'local'

let failed = false
const ok = (message) => console.log(`  ✔ ${message}`)
const warn = (message) => console.log(`  ⚠ ${message}`)
const fail = (message) => {
    console.log(`  ✖ ${message}`)
    failed = true
}
const info = (message) => console.log(`  ℹ ${message}`)

console.log(`\nChecking setup for environment "${version}"\n`)

// 1. Node version
const nodeMajor = Number(process.versions.node.split('.')[0])
if (nodeMajor >= 20) ok(`Node ${process.versions.node} (>= 20 required)`)
else fail(`Node ${process.versions.node} is too old — this template needs Node 20+ (see .nvmrc)`)

// 2. Environment file exists
const envFilePath = path.join(environmentsDir, `${version}.json`)
if (!fs.existsSync(envFilePath)) {
    fail(
        `Missing config/environments/${version}.json — create it with:\n` +
            `      cp config/environments/local.example.json config/environments/${version}.json`
    )
} else {
    ok(`config/environments/${version}.json exists`)

    // 3. Required keys present and filled
    try {
        const envFile = JSON.parse(fs.readFileSync(envFilePath, 'utf-8'))
        const problems = []
        for (const key of ['baseUrl', 'apiBaseUrl']) {
            if (!envFile[key]) problems.push(`top-level "${key}" is missing or empty`)
        }
        for (const key of ['username', 'password']) {
            const value = envFile.env?.[key]
            if (!value) problems.push(`env.${key} is missing or empty`)
            else if (String(value).startsWith('TODO_')) problems.push(`env.${key} still has a TODO_ placeholder`)
        }
        if (problems.length === 0) ok('environment file has baseUrl, apiBaseUrl and env credentials')
        else problems.forEach((problem) => fail(`${version}.json: ${problem}`))

        // 4. baseUrl reachable (warn only — VPNs and self-signed certs make this unreliable)
        if (envFile.baseUrl) {
            try {
                const response = await fetch(envFile.baseUrl, {
                    method: 'HEAD',
                    signal: AbortSignal.timeout(5000)
                })
                ok(`baseUrl ${envFile.baseUrl} is reachable (HTTP ${response.status})`)
            } catch {
                warn(`baseUrl ${envFile.baseUrl} is not reachable from here — is the app running / VPN connected?`)
            }
        }
    } catch (error) {
        fail(`config/environments/${version}.json is not valid JSON: ${error.message}`)
    }
}

// 5. Java (only needed for Allure reports)
const java = spawnSync('java', ['-version'], { encoding: 'utf-8' })
if (java.error) warn('Java not found — "npm run report:allure" will not work; tests are unaffected')
else ok('Java found (Allure reports available)')

// 6. Optional DB module
const dbConfigPath = path.join(environmentsDir, `${version}.db.js`)
if (fs.existsSync(dbConfigPath)) info(`DB module: ON (${version}.db.js found)`)
else info('DB module: OFF (no db config — see docs/DATABASE-MODULE.md to enable)')

// 7. Is login implemented? Every feature spec depends on it, yet the env file
// can be perfect while cy.loginViaApi still throws — so check it explicitly
// instead of letting "All checks passed" hide the biggest remaining task.
const authCommandsPath = path.join(repoRoot, 'cypress', 'support', 'commands', 'auth-commands.ts')
if (fs.existsSync(authCommandsPath)) {
    const authSource = fs.readFileSync(authCommandsPath, 'utf-8')
    const stillThrows = /throw new Error\(\s*['"`]TODO\(template\): implement (the )?cy\.login/.test(authSource)
    if (stillThrows) {
        warn(
            'Login is NOT implemented yet — cy.loginViaApi/cy.loginViaForm still throw their ' +
                'TODO(template) errors. Every feature spec depends on login; implement it first ' +
                '(docs/ADDING-A-FEATURE-TEST.md#login — see "How to find your Auth setup"). ' +
                'Budget 1-4 hrs depending on your auth (JSON vs OAuth2/SSO).'
        )
    } else {
        ok('login commands are implemented (no TODO throw left in auth-commands.ts)')
    }
}

// 8. Remaining TODO(template) markers
function countTodos(dir) {
    let count = 0
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (['node_modules', 'screenshots', 'videos', 'downloads'].includes(entry.name)) continue
        const fullPath = path.join(dir, entry.name)
        if (entry.isDirectory()) count += countTodos(fullPath)
        else if (/\.(ts|js|json|mjs)$/.test(entry.name)) {
            count += (fs.readFileSync(fullPath, 'utf-8').match(/TODO\(template\)/g) ?? []).length
        }
    }
    return count
}
// Same directories as the `todo` npm script, so the two never disagree.
const todoCount = ['cypress', 'config', 'scripts'].reduce(
    (total, dir) => total + countTodos(path.join(repoRoot, dir)),
    0
)
info(`${todoCount} TODO(template) markers remaining (list them with: npm run todo)`)

console.log('')
if (failed) {
    console.log('Doctor found problems — fix the ✖ items above and re-run "npm run doctor".\n')
    process.exit(1)
}
console.log('All checks passed.\n')
