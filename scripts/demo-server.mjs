#!/usr/bin/env node
/**
 * Self-contained demo app server — zero dependencies (node:http only).
 *
 * Serves the static demo app in demo/app/ plus a tiny deterministic JSON API, so
 * the example suite (`npm test`) runs offline against a bundled app instead of a
 * third-party public site. Response shapes are the contract the example specs
 * assert on — see demo/app and cypress/examples/specs.
 *
 * Port: DEMO_PORT overrides; otherwise it is read from the demo environment's
 * baseUrl (config/environments/demo.json), keeping a single source of truth.
 */
import http from 'node:http'
import { readFileSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const appDir = path.join(repoRoot, 'demo', 'app')
const TOKEN_KEY = 'demo:token'

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8'
}

function resolvePort() {
    if (process.env.DEMO_PORT) return Number(process.env.DEMO_PORT)
    try {
        const env = JSON.parse(readFileSync(path.join(repoRoot, 'config', 'environments', 'demo.json'), 'utf-8'))
        return Number(new URL(env.baseUrl).port) || 5188
    } catch {
        return 5188
    }
}

const PORT = resolvePort()

const PAGE_ROUTES = {
    '/': 'login.html',
    '/login': 'login.html',
    '/secure': 'secure.html',
    '/tables': 'tables.html',
    '/network': 'network.html'
}

function sendJson(res, status, data) {
    res.writeHead(status, { 'Content-Type': MIME['.json'] })
    res.end(JSON.stringify(data))
}

async function sendFile(res, fileName) {
    try {
        const content = await readFile(path.join(appDir, fileName))
        res.writeHead(200, { 'Content-Type': MIME[path.extname(fileName)] ?? 'text/plain; charset=utf-8' })
        res.end(content)
    } catch {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
        res.end('Not found')
    }
}

function readBody(req) {
    return new Promise((resolve) => {
        let data = ''
        req.on('data', (chunk) => (data += chunk))
        req.on('end', () => {
            try {
                resolve(data ? JSON.parse(data) : {})
            } catch {
                resolve({})
            }
        })
    })
}

const server = http.createServer(async (req, res) => {
    const { pathname } = new URL(req.url, `http://localhost:${PORT}`)

    // --- JSON API (shapes are the contract the example specs assert on) ---
    if (pathname === '/api/login' && req.method === 'POST') {
        const { username, password } = await readBody(req)
        if (username === 'tomsmith' && password === 'SuperSecretPassword!') {
            return sendJson(res, 200, { token: 'demo-token-abc123' })
        }
        return sendJson(res, 401, { error: 'Invalid credentials' })
    }
    if (pathname.startsWith('/api/users/') && req.method === 'GET') {
        const id = Number(pathname.split('/').pop())
        return sendJson(res, 200, { id, name: 'Leanne Graham', email: 'leanne@demo.test' })
    }
    if (pathname === '/api/posts' && req.method === 'POST') {
        const body = await readBody(req)
        return sendJson(res, 201, { id: 101, ...body })
    }
    if (pathname.startsWith('/api/comments/') && req.method === 'GET') {
        const id = Number(pathname.split('/').pop())
        return sendJson(res, 200, {
            postId: 1,
            id,
            name: 'demo comment',
            email: 'commenter@demo.test',
            body: 'demo comment body'
        })
    }

    // --- logout: clear the session token client-side, back to login ---
    if (pathname === '/logout') {
        res.writeHead(200, { 'Content-Type': MIME['.html'] })
        return res.end(
            `<!doctype html><html lang="en"><head><meta charset="utf-8" /><title>Logout</title></head>` +
                `<body><script>localStorage.removeItem('${TOKEN_KEY}');location.replace('/login')</script></body></html>`
        )
    }

    // --- static assets ---
    if (/\.(css|js)$/.test(pathname)) {
        return sendFile(res, path.basename(pathname))
    }

    // --- pages ---
    if (PAGE_ROUTES[pathname]) {
        return sendFile(res, PAGE_ROUTES[pathname])
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Not found')
})

server.listen(PORT, () => {
    const base = `http://localhost:${PORT}`
    console.log(`\n  Cypress Demo App is running — open any page:\n`)
    console.log(`    Login    ${base}/login`)
    console.log(`    Tables   ${base}/tables`)
    console.log(`    Network  ${base}/network`)
    console.log(`\n  This is the app the example suite runs against. Stop with Ctrl+C.\n`)
})
