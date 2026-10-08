import importlib.util
import os
import sys
import time
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('witness_outer', HERE / 'outer-recorder.py')
outer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(outer)


class OuterRecorderSyntheticTests(unittest.TestCase):
    def run_stall(self, code):
        started = time.monotonic()
        with self.assertRaisesRegex(RuntimeError, 'STOP_'):
            outer.run_recorded([sys.executable, '-B', '-c', code], started,
                               outer_seconds=0.65, active_seconds=0.20)
        self.assertLess(time.monotonic() - started, 1.4)

    def test_blocked_preflight_is_hard_stopped(self):
        self.run_stall('import time; time.sleep(30)')

    def test_blocked_launch_with_inherited_child_group_is_hard_stopped(self):
        self.run_stall('import subprocess,sys,time; '
                       'subprocess.Popen([sys.executable,"-B","-c","import time; time.sleep(30)"]); '
                       'time.sleep(30)')

    def test_term_ignored_still_stops_by_hard_deadline(self):
        self.run_stall('import signal,time; signal.signal(signal.SIGTERM,signal.SIG_IGN); time.sleep(30)')

    def test_zero_exit_with_live_group_member_stops(self):
        with self.assertRaisesRegex(RuntimeError, 'STOP_'):
            outer.run_recorded([sys.executable, '-B', '-c',
                                'import subprocess,sys; '
                                'subprocess.Popen([sys.executable,"-B","-c","import time; time.sleep(30)"])'],
                               time.monotonic(), outer_seconds=0.75, active_seconds=0.25)

    def test_zero_exit_with_malformed_or_multiple_frames_stops(self):
        for payload in ('{}\n', '{}\n{}\n'):
            code = f'import sys; sys.stdout.write({payload!r})'
            with self.assertRaisesRegex(RuntimeError, 'STOP_OUTER_FRAME'):
                outer.run_recorded([sys.executable, '-B', '-c', code], time.monotonic(),
                                   outer_seconds=1.5, active_seconds=1.0)

    def test_cap_and_prelaunch_deadline_stop(self):
        with self.assertRaisesRegex(RuntimeError, 'STOP_STDOUT_CAP'):
            outer.run_recorded([sys.executable, '-B', '-c',
                                'import sys; sys.stdout.write("x" * 600000)'],
                               time.monotonic(), outer_seconds=1.5, active_seconds=1.0)
        with self.assertRaisesRegex(RuntimeError, 'STOP_BEFORE_LAUNCH_DEADLINE'):
            outer.run_recorded([sys.executable, '-B', '-c', 'pass'], 0,
                               outer_seconds=1.5, active_seconds=1.0)

    def test_blocked_parent_pipe_forwarding_stops(self):
        read_fd, write_fd = os.pipe()
        try:
            os.set_blocking(write_fd, False)
            while True:
                try:
                    os.write(write_fd, b'x' * 4096)
                except BlockingIOError:
                    break
            with self.assertRaisesRegex(RuntimeError, 'STOP_OUTER_FORWARD_DEADLINE'):
                outer.forward_frame(b'frame\n', time.monotonic() + 0.10, write_fd)
        finally:
            os.close(read_fd)
            os.close(write_fd)


if __name__ == '__main__':
    unittest.main()
