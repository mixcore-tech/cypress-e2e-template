# demo/

The bundled demo web app the example suite runs against — static HTML/CSS/JS in
`app/`, served by `../scripts/demo-server.mjs`. It has no build step and no
dependencies.

```sh
npm run demo      # serve it at http://localhost:5188
npm test          # run the example specs against it (headless)
npm run cy:open   # watch the specs drive it interactively
```

Full write-up — pages, the mock API contract, and which example spec proves what:
[docs/DEMO.md](../docs/DEMO.md).

Deletable together with `cypress/examples/` once your team has learned the
patterns and you're testing your own app.
