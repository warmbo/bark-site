#!/usr/bin/env python3
"""Branded error page server (404 / 502).

Serves the correct branded 404 page based on the request Host header, so any
site that Caddy routes here on a miss (unknown subdomain, unmatched route)
shows a page matching that site's aesthetic instead of Caddy's default:
  - *.warx.org (Bark)      -> bark-404.html   (+ bark-avatar.png logo)
  - *.warho.me / warmbo     -> wartab-404.html
  - everything else         -> warmbo-404.html

Also serves the small set of static assets the pages reference (the Bark logo)
so the 404 page renders its branding. Run: python3 serve-errors.py [port]
"""
import http.server
import os
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ERRORS = HERE / "errors"
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8095
BIND = os.environ.get("ERRORS_HOST", "0.0.0.0")

# Safe-to-serve static assets (relative to HERE/assets) for the branded pages.
_ALLOWED_ASSETS = {"/assets/bark-avatar.png"}


def _page_for(host: str) -> Path:
    h = (host or "").lower()
    if "warx.org" in h:
        return ERRORS / "bark-404.html"
    if "warho.me" in h or "warmbo.com" in h:
        return ERRORS / "wartab-404.html"
    return ERRORS / "warmbo-404.html"


class ErrorHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        # Serve a known static asset (brand logo) so the 404 page renders it.
        if self.path in _ALLOWED_ASSETS:
            asset = HERE / self.path.lstrip("/")
            try:
                body = asset.read_bytes()
            except OSError:
                body = b""
            if body:
                ctype = "image/png" if asset.suffix == ".png" else "application/octet-stream"
                self.send_response(200)
                self.send_header("Content-Type", ctype)
                self.send_header("Content-Length", str(len(body)))
                self.send_header("Cache-Control", "public, max-age=86400")
                self.end_headers()
                self.wfile.write(body)
                return

        page = _page_for(self.headers.get("Host", ""))
        try:
            body = page.read_bytes()
        except OSError:
            body = b"404 Not Found"
        self.send_response(404)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format, *args):
        pass


if __name__ == "__main__":
    with http.server.ThreadingHTTPServer((BIND, PORT), ErrorHandler) as httpd:
        print(f"serve-errors on {BIND}:{PORT} (pages: {ERRORS})", flush=True)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass
