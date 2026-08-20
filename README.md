# Bark Site

Standalone landing page for the [Bark Discord bot](https://github.com/warmbo/bark).

A self-contained, dashboard-derived site that accurately describes what Bark is and
does, shows the real dashboard, and links to the live instance. Served independently
from the bot itself — the bot's login and dashboard remain unchanged.

Related repositories: the [bark](https://github.com/warmbo/bark) bot (its `dev` branch
is the dev instance) and the [bark-plugins](https://github.com/warmbo/bark-plugins)
add-on set.

## Structure

- `index.html` — full product landing page: hero, "What Bark Actually Does", dashboard
  showcase with real screenshots, authorization hierarchy, all 9 core modules,
  plugins, self-hosting, installation, security, "why Bark", final CTA, footer.
- `assets/style.css` — all styles. Derived from the Bark dashboard's v0.3 design
  system (sharp, dark navy/near-black, thin borders, electric-blue accent, dense,
  restrained motion, self-hosted fonts, no CDN drift).
- `assets/site.js` — progressive enhancement only (mobile nav, login-state detection,
  scroll reveal). Content is fully visible without JS.
- `assets/fonts/` — self-hosted Inter + JetBrains Mono woff2 (same files the dashboard
  ships; no Google Fonts dependency).
- `assets/screenshots/` — authentic, optimized WebP captures of the Bark dashboard
  (overview, members, moderation, statistics, modules), presented as an accessible
  keyboard-navigable tour.
- `assets/bark-og.png` — 1200×630 OpenGraph/Twitter product share card.
- `assets/bark-avatar.png` — the Bark bot's Discord avatar.
- `assets/bark-wallpaper.png` — first-party wallpaper used as a restrained backdrop.
- `docs/redesign-2026-08-20.md` — the capability matrix, current-site audit, proposed
  architecture, content map and design rules that drove the redesign.

## How login works

The site is served from `bark.warx.org` with Caddy path-based routing:

- `/` → serves the static landing page (this repo, via `bark-site.service` on `:8092`)
- `/auth/*`, `/dashboard`, `/api/*`, `/static/*`, `/guild/*`, `/s/*` → proxied to the Bark bot instance

The login button links to `/auth/login` (the bot's Discord OAuth2 flow). After
authentication the bot redirects back to `/dashboard`. A JavaScript check on page load
calls `/auth/me` to detect an existing session and updates the buttons to "Dashboard"
accordingly. This is progressive enhancement — with JS disabled the buttons simply
link to `/auth/login`.

## Deployment

The site is served by the `bark-site.service` systemd unit on the box
(CT1109): `python3 -m http.server 8092 --directory ~/Projects/bark-site`.
Deploy by committing to `main` and pulling/updating the checkout — the
server picks changes up immediately (no restart needed).

## Development

Open `index.html` directly in a browser — no build step needed. All assets are
relative paths.

## License

MIT
