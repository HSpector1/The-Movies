#!/usr/bin/env python3
"""Atomically update the external marathon recovery state."""

from __future__ import annotations

import argparse

from foundry_common import STATE_PATH, atomic_write_json, git_sha, read_json, retained_bytes, utc_now


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--phase")
    parser.add_argument("--completed", action="append", default=[])
    parser.add_argument("--error", action="append", default=[])
    parser.add_argument("--next")
    parser.add_argument("--count", action="append", default=[], metavar="KEY=VALUE")
    parser.add_argument("--status")
    args = parser.parse_args()

    state = read_json(STATE_PATH)
    if args.phase:
        state["phase"] = args.phase
    if args.status:
        state["status"] = args.status
    for item in args.completed:
        if item not in state["completed_work"]:
            state["completed_work"].append(item)
    state["errors"].extend({"at_utc": utc_now(), "message": item} for item in args.error)
    for entry in args.count:
        key, raw_value = entry.split("=", 1)
        state["candidate_counts"][key] = int(raw_value)
    if args.next:
        state["next_resumable_step"] = args.next
    state["updated_utc"] = utc_now()
    state["retained_marathon_bytes"] = retained_bytes()
    state["git"]["current_sha"] = git_sha()
    atomic_write_json(STATE_PATH, state)


if __name__ == "__main__":
    main()
