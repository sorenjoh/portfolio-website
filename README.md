# Portfolio — Søren Johansen

Simpel, hurtig portfolio-hjemmeside til video og foto. Bygget uden byggeværktøjer —
bare rene HTML/CSS/JS-filer, så den er nem at hoste og redigere.

## Filer

- `index.html` — selve hjemmesiden
- `style.css` — design
- `script.js` — henter projekter fra `projects.json` og viser dem
- `projects.json` — alle dine projekter (det er her indholdet bor)
- `admin.html` — lokalt værktøj til at tilføje/redigere/slette projekter
- `assets/` — læg dine egne billeder her, hvis du ikke linker til eksterne billeder

## Sådan tilføjer/redigerer du projekter

**Nemmeste metode (ingen værktøjer):** Åbn `projects.json` direkte i GitHub
(tryk på blyant-ikonet for at redigere) og tilføj et nyt objekt til listen, f.eks.:

```json
{
  "id": "proj-003",
  "title": "Bryllupsvideo — Anna & Mikkel",
  "category": "video",
  "client": "Privat kunde",
  "year": "2026",
  "description": "Highlight-video fra en bryllupsdag i København.",
  "coverColor": "#3A6B65",
  "videoUrl": "https://youtu.be/DIT-VIDEO-ID",
  "thumbnail": ""
}
```

`category` skal være enten `"video"` eller `"foto"`. Vil du have flere kategorier
(f.eks. "reklame" eller "fitness"), tilføj dem bare i `projects.json` og som en ny
filter-knap i `index.html` (kopiér en af `<button data-category="...">`-linjerne).

**Med værktøj (mere brugervenligt):** Åbn `admin.html` via en lokal server
(fetch virker ikke hvis du blot dobbeltklikker filen). Nemmeste måde:

```bash
# fra mappen med filerne
python3 -m http.server 8000
```

Åbn så `http://localhost:8000/admin.html`, tilføj/redigér projekter, og tryk
**"Download projects.json"**. Upload den downloadede fil til GitHub og overskriv
den gamle.

## Sådan lægger du billeder/video på

- **Billeder:** Læg filen i `assets/`, og skriv f.eks. `"thumbnail": "assets/mit-billede.jpg"`.
- **Video:** Upload til YouTube eller Vimeo (kan sættes til "unlisted" hvis du ikke
  vil have den offentligt søgbar), og sæt linket i `"videoUrl"`.

## Sådan får du siden live med GitHub Pages

1. Gå til dit repo → **Settings → Pages**.
2. Under "Build and deployment" vælg **Deploy from a branch**, branch `main`, mappe `/ (root)`.
3. Efter et minuts tid ligger siden på `https://sorenjoh.github.io/portfolio-website/`.

## Sådan sætter du dit eget domæne op

1. Køb et domæne (f.eks. hos One.com, Simply.com eller Namecheap).
2. I repoet, opret en fil kaldet `CNAME` (ingen filendelse) med dit domæne som eneste
   indhold, f.eks. `sorenjohansen.dk`.
3. Hos din domæneudbyder, sæt disse DNS-records:
   - Fire `A`-records på `@` der peger på GitHub Pages' IP'er:
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - Eller en `CNAME`-record på `www` der peger på `sorenjoh.github.io`
4. I repoets **Settings → Pages**, indtast dit domæne under "Custom domain" og
   vent på at GitHub verificerer det (kan tage op til et døgn). Slå "Enforce HTTPS" til
   bagefter.

## Ret kontaktinfo

I `index.html`, find linjen med `mailto:din@email.dk` og skift til din rigtige mail.
Overvej også at tilføje et par linjer om priser eller "svar inden for 24 timer" —
det gør det nemmere for virksomheder at tage første skridt.
