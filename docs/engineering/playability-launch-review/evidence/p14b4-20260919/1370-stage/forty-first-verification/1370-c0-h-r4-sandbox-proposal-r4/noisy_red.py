#!/usr/bin/env python3
"""Tiny scratch-only group cleanup REDs; no game or protected path writes."""

import os
import sys
import tempfile
from pathlib import Path

from canary import PIPE_CAP, bounded_group_child


with tempfile.TemporaryDirectory(prefix="h-r4-canary-noisy-", dir=Path(__file__).parent) as root:
    env = dict(os.environ)
    env["PYTHONDONTWRITEBYTECODE"] = "1"

    def run(label, program, expected):
        try:
            bounded_group_child([sys.executable, "-c", program], env, root, timeout=2)
        except RuntimeError as error:
            message = str(error)
            assert "STOP_BOUNDARY" in message and expected in message, (label, message)
            assert "direct child reaped and group clear" in message, (label, message)
        else:
            raise AssertionError(f"{label}: expected STOP")

    success = bounded_group_child([sys.executable, "-c", "print('small')"], env, root, timeout=2)
    assert success == (b"small\n", b"", 0), success

    # The grandchild inherits the outer pipes, floods stdout, and would keep the
    # process group alive after its direct parent exits. The supervisor must stop
    # at cap + 1 byte, kill the whole group, reap, and prove no group remains.
    noisy_grandchild = (
        "import os,subprocess,sys,time; "
        "subprocess.Popen([sys.executable,'-c',"
        "'import os,sys,time; sys.stdout.buffer.write(b\\\"x\\\"*(1024*1024)); sys.stdout.flush(); time.sleep(30)'],"
        "stdout=sys.stdout,stderr=sys.stderr); time.sleep(30)"
    )
    run("noisy grandchild", noisy_grandchild, "pipe cap exceeded")
    run("nonzero exit", "import sys; sys.exit(7)", "child exit 7")
    run("timeout", "import time; time.sleep(30)", "timeout")

print(f"PASS: bounded {PIPE_CAP}-byte pipes, noisy grandchild, nonzero, timeout, and group clear")
