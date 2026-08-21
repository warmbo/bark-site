#!/usr/bin/env python3
"""Branded static server for the bark-site landing page.

Serves the static files in this directory (same as ``python -m http.server``)
but returns a branded 404 page (``404.html``) on any unknown path instead of
Python's default "Nothing matches the given URI" error page.

Run:  python3 serve.py [port]
      (default port 8092, matching bark-site.service)
"""
import functools
import http.server
import os
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8092
BIND = os.environ.get("BARK_SITE_HOST", "0.0.0.0")


class BrandedHandler(http.server.SimpleHTTPRequestHandler):
    """SimpleHTTPRequestHandler that serves 404.html on any error."""

    # Serve from this repo's directory regardless of where we're launched.
    directory = str(HERE)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=self.directory, **kwargs)

    def send_error(self, code, message=None, explain=None):
        """Return the branded 404 page for client errors instead of the
        bare Python error body. Only 404 (not found) is branded; other
        statuses keep Caddy's/Python's default so real errors stay honest."""
        if code == 404:
            path = HERE / "404.html"
            if path.exists():
                try:
                    body = path.read_bytes()
                except OSError:
                    body = b"404 Not Found"
                self.send_response(404)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Length", str(len(body)))
                self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
                self.end_headers()
                self.wfile.write(body)
                return
        super().send_error(code, message, explain)


if __name__ == "__main__":
    handler = functools.partial(BrandedHandler)
    with http.server.ThreadingHTTPServer((BIND, PORT), handler) as httpd:
        print(f"bark-site serving {HERE} on {BIND}:{PORT}", flush=True)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass
