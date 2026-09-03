#!/usr/bin/env python3
"""Serve the immutable offline audition directory on loopback only."""

from __future__ import annotations

import argparse
import http.server
import socketserver
import webbrowser
from pathlib import Path


class ReusableLoopbackServer(socketserver.TCPServer):
    allow_reuse_address = True


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument("--no-open", action="store_true")
    args = parser.parse_args()
    root = Path(__file__).resolve().parent
    handler = lambda *handler_args, **kwargs: http.server.SimpleHTTPRequestHandler(  # noqa: E731
        *handler_args, directory=str(root), **kwargs
    )
    url = f"http://127.0.0.1:{args.port}/index.html"
    with ReusableLoopbackServer(("127.0.0.1", args.port), handler) as server:
        print(f"Offline audition desk: {url}")
        if not args.no_open:
            webbrowser.open(url)
        server.serve_forever()


if __name__ == "__main__":
    main()
