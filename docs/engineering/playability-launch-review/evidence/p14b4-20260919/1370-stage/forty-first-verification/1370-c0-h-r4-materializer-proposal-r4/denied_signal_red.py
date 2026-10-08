#!/usr/bin/env python3
"""Scratch-only REDs for denied group signals and ambiguous group probes."""

import os
import signal
import subprocess
from unittest.mock import patch

import materialize


real_killpg = os.killpg


def assert_reaped_and_clear(child):
    assert child.poll() is not None, "direct child not reaped"
    try:
        real_killpg(child.pid, 0)
    except ProcessLookupError:
        return
    raise AssertionError("scratch child group survived")


# Both group signals are denied, but the direct-child fallback must reap and the
# subsequent real zero-signal probe must prove the now-empty group clear.
child = subprocess.Popen(["/bin/sleep", "30"], start_new_session=True)
sent = []


def deny_signals(pgid, sig):
    if sig != 0:
        sent.append(sig)
        raise PermissionError(1, "synthetic denied group signal")
    return real_killpg(pgid, sig)


try:
    with patch.object(materialize.os, "killpg", side_effect=deny_signals):
        materialize.stop_group(child)
finally:
    if child.poll() is None:
        child.kill()
        child.wait()
assert sent == [signal.SIGTERM, signal.SIGKILL], sent
assert_reaped_and_clear(child)


# An EPERM from *every* zero-signal probe is ambiguous even after a direct
# child is reaped. The source must STOP rather than pretend the group is clear.
child = subprocess.Popen(["/bin/sleep", "30"], start_new_session=True)
sent = []


def deny_all(pgid, sig):
    if sig != 0:
        sent.append(sig)
    raise PermissionError(1, "synthetic ambiguous group probe")


try:
    with patch.object(materialize.os, "killpg", side_effect=deny_all):
        try:
            materialize.stop_group(child)
        except RuntimeError as error:
            assert "STOP_GROUP_SURVIVOR" in str(error), error
        else:
            raise AssertionError("EPERM group probe was treated as clear")
finally:
    if child.poll() is None:
        child.kill()
        child.wait()
assert sent == [signal.SIGTERM, signal.SIGKILL], sent
assert_reaped_and_clear(child)

print("PASS: denied TERM/KILL still reaps direct child; EPERM probe remains STOP; real groups clear")
