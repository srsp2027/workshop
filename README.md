# Workshop website — Structure and Rigidity of Sets and PDEs

Static site, no build step: `index.html` (content), `style.css` (colours/fonts), `waves.js` (the generative header).

## Put it online with GitHub Pages (free)

1. On github.com, create a new **public** repository, e.g. `srsp2027`.
2. Click **Add file → Upload files**, drag in `index.html`, `style.css`, `waves.js` (and this README), then **Commit**.
3. Go to **Settings → Pages**. Under *Build and deployment* choose **Deploy from a branch**, branch `main`, folder `/ (root)`, **Save**.
4. After a minute the site is live at `https://<your-username>.github.io/srsp2027/`.

## Editing

Open `index.html` on GitHub, click the pencil icon, edit, **Commit changes**. The site updates within a minute.

- **Speakers**: one `<li>` line per speaker — copy a line to add one.
- **Programme**: one `<div class="slot">` per row; add `break` for coffee/lunch or `hl` to highlight in red.
- **Header drawing**: change `data-seed` on the `<svg class="waves">` for a different drawing, `data-lines` for more/fewer lines.
- **Colours**: the three colours are at the top of `style.css`.
- **EU emblem**: `eu-funded.svg` is the official "Funded by the European Union" logo (converted from the EPS) — upload it together with the other files.

## Custom domain (optional)

If the department gives you a domain, add it under Settings → Pages → Custom domain.
