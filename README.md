# Bark Site

Standalone landing page for the [Bark Discord bot](https://github.com/warmbo/bark).

A flashy, self-contained HTML site that describes Bark and links to the live dashboard. Served independently from the bot itself — the bot's login and dashboard remain unchanged.

## Structure

- `index.html` — full landing page with WebGL shader background, feature grid, modules table, dashboard preview, and CTA sections
- `assets/style.css` — all styles (dark theme, glassmorphism cards, responsive layout)
- `assets/bark-avatar.png` — the Bark bot's Discord avatar
- `assets/dashboard-preview.png` — screenshot of the Bark dashboard workspace

## How login works

The site is served from `bark.warx.org` with Caddy path-based routing:
- `/` → serves the static landing page (this repo)
- `/auth/*`, `/dashboard`, `/api/*`, `/static/*`, `/guild/*`, `/s/*` → proxied to the Bark bot instance

The login button links to `/auth/login` (the bot's Discord OAuth2 flow). After authentication, the bot redirects back to `/dashboard`. A JavaScript check on page load calls `/auth/me` to detect an existing session and updates the button to "Dashboard" accordingly. Login state is cached in `localStorage`.

## Development

Open `index.html` directly in a browser — no build step needed. All assets are relative paths.

## License

MIT