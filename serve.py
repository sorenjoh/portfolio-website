#!/usr/bin/env python3
"""Local server. Usage: python3 serve.py [-local] [port]"""
import http.server, sys

LOCAL = "-local" in sys.argv
ports = [a for a in sys.argv[1:] if a.isdigit()]
PORT = int(ports[0]) if ports else 8000

class Handler(http.server.SimpleHTTPRequestHandler):
    def send_head(self):
        path = self.translate_path(self.path.split("?")[0])
        if LOCAL:
            import os
            if os.path.isdir(path): path = os.path.join(path, "index.html")
            elif not os.path.exists(path) and os.path.exists(path + ".html"): path += ".html"
            if path.endswith(".html") and os.path.exists(path):
                body = open(path, "rb").read().replace(
                    b"<head>", b"<head>\n<script>window.SITE_LOCAL=true;</script>", 1)
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                import io
                return io.BytesIO(body)
        return super().send_head()

print(f"Serving on http://localhost:{PORT}  (source: {'local files' if LOCAL else 'GitHub repo'})")
http.server.ThreadingHTTPServer(("", PORT), Handler).serve_forever()
