#!/usr/bin/env python3
"""
Simple HTTP server with CORS headers for Passport Reader AI
This allows Tesseract.js to load properly
"""

import http.server
import socketserver
import os

class CORSHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Cross-Origin-Embedder-Policy', 'require-corp')
        self.send_header('Cross-Origin-Opener-Policy', 'same-origin')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

PORT = 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

os.chdir(DIRECTORY)

with socketserver.TCPServer(("", PORT), CORSHTTPRequestHandler) as httpd:
    print(f"🚀 Passport Reader AI Server Running!")
    print(f"📍 Open your browser to: http://localhost:{PORT}")
    print(f"📁 Serving files from: {DIRECTORY}")
    print("\nPress Ctrl+C to stop the server")
    httpd.serve_forever()
