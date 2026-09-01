#!/usr/bin/env python3
"""Serve the prebuilt audition app on loopback only, with no telemetry."""

from __future__ import annotations

import argparse
import functools
import http.server
from pathlib import Path


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parent / "dist" / "client")
    args = parser.parse_args()
    root = args.root.resolve()
    if not (root / "index.html").is_file():
        raise SystemExit(f"Built audition app missing: {root / 'index.html'}")
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(root))
    server = http.server.ThreadingHTTPServer(("127.0.0.1", args.port), handler)
    print(f"Project: Studio audition desk: http://127.0.0.1:{args.port}/", flush=True)
    print("Localhost only. Press Control-C in this window to stop.", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
