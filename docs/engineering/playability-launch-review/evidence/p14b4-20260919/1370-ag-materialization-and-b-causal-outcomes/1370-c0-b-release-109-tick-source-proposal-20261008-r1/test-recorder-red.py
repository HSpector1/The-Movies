#!/usr/bin/env python3
"""UNRUN tiny no-game RED cases; fork children are disposable unsandboxed Python."""
import importlib.util
import json
import os
import signal
import sys
import tempfile
import time
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT = Path('/Users/zacheryspector/studio-scratch/1370-c0-b-release-109-tick-source-proposal-20261008-r1')
spec = importlib.util.spec_from_file_location('b_release_r2', ROOT / 'run.py')
recorder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(recorder)


class RecorderRed(unittest.TestCase):
    def scratch(self):
        return tempfile.TemporaryDirectory(prefix='b-release-r2-red-', dir='/Users/zacheryspector/studio-scratch')

    def test_late_zero_exit_at_shared300_refuses(self):
        with self.assertRaisesRegex(AssertionError, 'COMBINED_TEST_CAP'):
            recorder.observed_exit_guard(0, 10, 0, clock=lambda: 310)

    def test_late_zero_exit_at_active375_refuses(self):
        with self.assertRaisesRegex(AssertionError, 'COMBINED_TEST_CAP'):
            recorder.observed_exit_guard(0, 100, 0, clock=lambda: 375)

    def test_immediate_exit_final_log_cap_refuses(self):
        with self.assertRaisesRegex(AssertionError, 'STOP_LOG_CAP'):
            recorder.observed_exit_guard(0, 0, 1024**2 + 1, clock=lambda: .01)

    def test_nested_mirror_label_is_counted(self):
        with self.scratch() as work:
            root = Path(work)
            direct = root / 'baseline-tree'; direct.mkdir()
            (direct / 'source').write_bytes(b'x' * 100)
            nested = root / 'cache' / 'baseline-tree'; nested.mkdir(parents=True)
            (nested / 'data').write_bytes(b'1234567')
            self.assertEqual(recorder.sizes(root), 7)

    def test_output_directory_symlink_refuses(self):
        with self.scratch() as work:
            root = Path(work)
            (root / 'real').mkdir(); (root / 'link').symlink_to(root / 'real', target_is_directory=True)
            with self.assertRaisesRegex(AssertionError, 'STOP_OUTPUT_SYMLINK'):
                recorder.sizes(root)

    def test_mirror_root_symlink_refuses(self):
        with self.scratch() as work:
            root = Path(work)
            (root / 'real').mkdir(); (root / 'baseline-tree').symlink_to(root / 'real', target_is_directory=True)
            with self.assertRaisesRegex(AssertionError, 'STOP_OUTPUT_SYMLINK'):
                recorder.sizes(root)

    def test_special_output_refuses(self):
        with self.scratch() as work:
            root = Path(work); os.mkfifo(root / 'fifo')
            with self.assertRaisesRegex(AssertionError, 'STOP_OUTPUT_SPECIAL'):
                recorder.sizes(root)

    def test_final_result_and_override_counted(self):
        with self.scratch() as work:
            root = Path(work)
            recorder.write(root / 'RESULT.json', {'status': 'candidate'})
            recorder.write(root / 'OVERRIDE-STOP.json', {'status': 'STOP'})
            self.assertEqual(recorder.sizes(root), sum(p.stat().st_size for p in root.iterdir()))

    def test_final_result_budget_refuses_candidate(self):
        with self.scratch() as work:
            root = Path(work); limit = recorder.FINAL_RESERVE + 1000
            (root / 'data').write_bytes(b'x' * (limit - 500))
            value = {'status': 'CONTINUATION_DIAGNOSTIC_CANDIDATE', 'payload': 'x' * 600}
            recorder.finalize_result(root, value, 1, clock=lambda: 0, limit=limit)
            self.assertEqual(value['status'], 'STOP')
            self.assertFalse((root / 'RESULT.json').exists())
            self.assertTrue((root / 'OVERRIDE-STOP.json').exists())
            self.assertLessEqual(recorder.sizes(root), limit)

    def test_final_fsync_crossing_deadline_has_override(self):
        with self.scratch() as work:
            root = Path(work); now = [0]
            def late_writer(path, value):
                recorder.write(path, value)
                if path.name == 'RESULT.json': now[0] = 2
            value = {'status': 'CONTINUATION_DIAGNOSTIC_CANDIDATE'}
            recorder.finalize_result(root, value, 1, clock=lambda: now[0], writer=late_writer)
            self.assertEqual(value['status'], 'STOP')
            self.assertTrue((root / 'RESULT.json').exists())
            self.assertTrue((root / 'OVERRIDE-STOP.json').exists())
            self.assertEqual(json.loads((root / 'OVERRIDE-STOP.json').read_bytes())['status'], 'STOP_FINALIZATION')

    def test_alarm_before_durable_candidate_has_override(self):
        with self.scratch() as work:
            root = Path(work)
            def fail_writer(path, value):
                if path.name == 'RESULT.json': raise TimeoutError('fixture alarm')
                recorder.write(path, value)
            value = {'status': 'CONTINUATION_DIAGNOSTIC_CANDIDATE'}
            recorder.finalize_result(root, value, 1, clock=lambda: 0, writer=fail_writer)
            self.assertEqual(value['status'], 'STOP')
            self.assertFalse((root / 'RESULT.json').exists())
            self.assertTrue((root / 'OVERRIDE-STOP.json').exists())

    def test_alarm_after_durable_candidate_has_override(self):
        with self.scratch() as work:
            root = Path(work)
            def fail_writer(path, value):
                recorder.write(path, value)
                if path.name == 'RESULT.json': raise TimeoutError('fixture alarm after fsync')
            value = {'status': 'CONTINUATION_DIAGNOSTIC_CANDIDATE'}
            recorder.finalize_result(root, value, 1, clock=lambda: 0, writer=fail_writer)
            self.assertEqual(value['status'], 'STOP')
            self.assertTrue((root / 'RESULT.json').exists())
            self.assertTrue((root / 'OVERRIDE-STOP.json').exists())

    def test_blocked_startup_owned_and_cleared(self):
        with self.scratch() as work:
            root = Path(work); owned = {'info': {'groupClear': False}}
            with (root / 'stdout').open('wb') as out, (root / 'stderr').open('wb') as err:
                try:
                    recorder.start_owned([sys.executable, '-I', '-B', '-c', 'pass'], str(root),
                                         dict(os.environ), out.fileno(), err.fileno(), owned,
                                         before_ready=lambda: time.sleep(2))
                    recorder.write(root / 'LAUNCH.json', owned['info'])
                    with self.assertRaisesRegex(AssertionError, 'STOP_STARTUP_DEADLINE'):
                        recorder.ready_go(owned, time.monotonic() + .02)
                finally:
                    recorder.close_startup_fds(owned)
                    if owned.get('child') is not None:
                        self.assertTrue(recorder.clear(owned['child'], time.monotonic() + 1))
                self.assertGreater(owned['info']['pid'], 1)
                self.assertTrue(owned['info']['startupOwnedBeforeExec'])
                self.assertFalse(recorder.process_alive(owned['child'].pid))
                recorder.write(root / 'STOP.json', {'status': 'STOP_STARTUP_DEADLINE',
                                                   'pid': owned['child'].pid, 'groupClear': True})
                self.assertEqual(json.loads((root / 'LAUNCH.json').read_bytes())['pid'], owned['child'].pid)

    def test_alarm_pending_during_fork_still_has_owned_pid(self):
        with self.scratch() as work:
            root = Path(work); owned = {'info': {}}
            original_fork = os.fork
            previous_handler = signal.getsignal(signal.SIGALRM)
            def throwing_alarm(*_): raise TimeoutError('fixture pending alarm')
            def injected_fork():
                pid = original_fork()
                if pid != 0: os.kill(os.getpid(), signal.SIGALRM)
                return pid
            signal.signal(signal.SIGALRM, throwing_alarm)
            try:
                with (root / 'stdout').open('wb') as out, (root / 'stderr').open('wb') as err:
                    with patch.object(recorder.os, 'fork', injected_fork):
                        with self.assertRaisesRegex(TimeoutError, 'fixture pending alarm'):
                            recorder.start_owned([sys.executable, '-I', '-B', '-c', 'pass'], str(root),
                                                 dict(os.environ), out.fileno(), err.fileno(), owned)
                self.assertIn('child', owned)
                self.assertEqual(owned['info']['pid'], owned['child'].pid)
            finally:
                signal.signal(signal.SIGALRM, previous_handler)
                recorder.close_startup_fds(owned)
                if owned.get('child') is not None:
                    self.assertTrue(recorder.clear(owned['child'], time.monotonic() + 1))

    def test_owned_survivor_is_not_clear(self):
        class FakeChild:
            pid = 123456789
            returncode = 0
            def poll(self): return 0
        now = [0]
        with patch.object(recorder, 'process_alive', return_value=True), \
             patch.object(recorder.os, 'killpg'), \
             patch.object(recorder.time, 'monotonic', side_effect=lambda: now[0]), \
             patch.object(recorder.time, 'sleep', side_effect=lambda _: now.__setitem__(0, now[0] + .02)):
            self.assertFalse(recorder.clear(FakeChild(), .05))


if __name__ == '__main__':
    unittest.main()
