"""Local feasibility server; no deployment. Usage: python3 serve_web.py BUILD_DIR."""
import http.server
import os
import sys


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cross-Origin-Opener-Policy", "same-origin")
        self.send_header("Cross-Origin-Embedder-Policy", "require-corp")
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


os.chdir(sys.argv[1])
http.server.ThreadingHTTPServer(("127.0.0.1", 8060), Handler).serve_forever()
