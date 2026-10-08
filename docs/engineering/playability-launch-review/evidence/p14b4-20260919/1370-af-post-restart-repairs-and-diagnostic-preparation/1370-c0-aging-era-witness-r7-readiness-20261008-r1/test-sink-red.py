#!/usr/bin/env python3
"""UNRUN source-only RED checks. No game/sandbox/outer-recorder launch."""
import importlib.util
import os
import time
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location('proposed_sink', Path(__file__).with_name('bounded-sink.py'))
sink = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sink)


class SinkRed(unittest.TestCase):
    def test_eof_returns_exact_bytes(self):
        rd, wr = os.pipe()
        os.write(wr, b'candidate\n')
        os.close(wr)
        try:
            self.assertEqual(sink.read_bounded(rd, time.monotonic() + 1), b'candidate\n')
        finally:
            os.close(rd)

    def test_cap_rejects_and_does_not_forward(self):
        rd, wr = os.pipe()
        os.write(wr, b'123456')
        os.close(wr)
        try:
            with self.assertRaisesRegex(RuntimeError, 'STOP_SINK_FRAME_CAP'):
                sink.read_bounded(rd, time.monotonic() + 1, cap=5)
        finally:
            os.close(rd)

    def test_waiting_writer_is_unknown_clearance_stop(self):
        rd, wr = os.pipe()
        try:
            with self.assertRaisesRegex(RuntimeError, 'CLEARANCE_UNKNOWN'):
                sink.read_bounded(rd, time.monotonic() + 0.02)
        finally:
            os.close(rd)
            os.close(wr)

    def test_already_expired_forward_refuses(self):
        rd, wr = os.pipe()
        try:
            with self.assertRaisesRegex(RuntimeError, 'STOP_SINK_FORWARD_DEADLINE'):
                sink.forward_bounded(b'candidate', wr, time.monotonic() - 1)
        finally:
            os.close(rd)
            os.close(wr)

    def test_exact_forward(self):
        rd, wr = os.pipe()
        try:
            sink.forward_bounded(b'candidate\n', wr, time.monotonic() + 1)
            self.assertEqual(os.read(rd, 100), b'candidate\n')
        finally:
            os.close(rd)
            os.close(wr)


if __name__ == '__main__':
    unittest.main()
