# Søren Johansen — Portfolio

## Run locally

```sh
python3 serve.py          # projects.json + assets fetched from the GitHub repo (default)
python3 serve.py -local   # projects.json + assets loaded from the local files
```

Or with Node's `serve` (no Python needed):

```sh
npx serve .               # GitHub repo (default)
npx serve .               # then open http://localhost:3000/?local
```

The `-local` flag above maps to adding `?local` (or `#local`) to the URL.

Open http://localhost:8000 (serve.py) or http://localhost:3000 (npx serve). Optional port: `python3 serve.py -local 3000`, `npx serve . -l 8000`.
