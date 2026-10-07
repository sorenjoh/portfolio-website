# Søren Johansen — Portfolio [Link](https://sorenfoto.com)

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

## Booking (e-mail)

Booking-siden (`/booking`) sender forespørgsler via [Formsubmit](https://formsubmit.co) til `booking@sorenfoto.com`.

**Engangskonfiguration (ejer):**

1. **Cloudflare Email Routing** for `sorenfoto.com`: opret destination-adresse (din indbakke) og en route for `booking@sorenfoto.com` → den destination. Uden dette lander mailen ikke hos dig.
2. **Formsubmit-bekræftelse:** send én testbooking fra live-siden (eller lokalt). Formsubmit sender en aktiveringsmail til `booking@sorenfoto.com` — åbn den via din routed indbakke og bekræft. Først herefter leveres rigtige forespørgsler.
3. Ingen API-nøgler eller secrets i repoet. Endpunkt og e-mail står i `SITE.booking` i `script.js`.
