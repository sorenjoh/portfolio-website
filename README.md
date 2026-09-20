# Portfolio — Søren Johansen

A minimal, image-first portfolio. Three plain HTML pages, no build step,
plus a hidden admin panel that writes changes straight back to GitHub.

## Files

- `index.html` — Work (the project grid, filterable by Video / Foto)
- `bio.html` — Bio
- `contact.html` — Contact
- `style.css` — shared styling
- `script.js` — grid rendering, lightbox, **and the admin panel**
- `projects.json` — your project data (currently 3 placeholders)
- `assets/` — put your own images here if you're not linking external ones

## How the admin panel works

You never edit `projects.json` by hand day-to-day. Instead:

1. Open your live site.
2. Open the browser console (F12, or Cmd+Opt+J on Mac).
3. Type `admin()` and press enter.
4. Enter your admin code. On the first correct entry per tab, the panel opens
   on top of the page — no reload.
5. The first time, fill in the **GitHub connection** fields (see setup below)
   and add/edit/delete projects in the list.
6. Click **Save changes** — this commits the updated `projects.json` directly
   to your GitHub repo via the GitHub API. The grid on your current tab
   updates immediately; the live site for everyone else catches up within
   about a minute, once GitHub Pages redeploys.

### One-time setup

**1. Set your own admin code.** The code ships set to a placeholder
(`changeme`) — change it before you publish. Open the browser console on any
page (even opened locally) and run:

```js
crypto.subtle.digest("SHA-256", new TextEncoder().encode("your-secret-code"))
  .then(b => console.log(Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2, "0")).join("")))
```

Copy the printed hash, then in `script.js` replace the value of
`ADMIN_CODE_HASH` with it. Commit and push. Save the actual code (not the
hash) in Bitwarden — that's the thing you'll type into the `prompt()` box.

Only the hash lives in the code, so anyone reading your site's source can't
recover your code from it directly — though keep in mind this is still a
public static site, so treat the code as light protection, not a vault.

**2. Create a GitHub personal access token.** This lets the panel commit on
your behalf.

- Go to GitHub → Settings → Developer settings → Personal access tokens →
  Fine-grained tokens → Generate new token.
- Resource owner: your account. Repository access: **only select**
  `portfolio-website`.
- Permissions: **Contents → Read and write**. Nothing else.
- Generate, and copy the token — you won't see it again.

**3. In the admin panel**, fill in:
- **Owner**: `sorenjoh`
- **Repo**: `portfolio-website`
- **Branch**: `main`
- **Token**: the one you just generated

These save to your browser's local storage after the first successful save,
so you won't need to retype them next time on that device.

⚠️ The token is stored only in your own browser (`localStorage`), never in
the site's code or the repo. Don't paste it on a shared computer, and if a
token ever leaks, revoke it from GitHub immediately and generate a new one.

## Adding images or video

- **Images**: drop the file in `assets/`, then set `thumbnail` to
  `assets/your-file.jpg` in the admin panel.
- **Video**: upload to YouTube or Vimeo (unlisted is fine), paste the link
  into the Video URL field.

## Going live with GitHub Pages

1. Repo → **Settings → Pages**.
2. Under "Build and deployment", choose **Deploy from a branch**, branch
   `main`, folder `/ (root)`.
3. Your site is live at `https://sorenjoh.github.io/portfolio-website/`
   within a minute.

## Custom domain

1. Buy a domain (One.com, Simply.com, Namecheap, etc.).
2. Add a file named `CNAME` (no extension) to the repo root containing just
   your domain, e.g. `sorenjohansen.dk`.
3. At your domain registrar, set DNS:
   - Four `A` records on `@` pointing to:
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - A `CNAME` record on `www` pointing to `sorenjoh.github.io`
4. In **Settings → Pages**, enter your domain under "Custom domain", wait for
   verification (can take up to 24h), then enable "Enforce HTTPS".

## Editing contact details

In `contact.html`, replace `din@email.dk` and the Instagram/LinkedIn links
with your real ones.
