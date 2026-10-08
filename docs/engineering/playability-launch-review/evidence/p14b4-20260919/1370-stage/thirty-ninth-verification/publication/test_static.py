"""Pure map and guard REDs. This never stages, commits, pushes or scans captures."""
import copy
import hashlib
import json
import os
import sys
import time
import tempfile
import signal
from pathlib import Path
from unittest import TestCase, main, mock
from publish_stage39 import (MAP, MAP_SHA, PREFIX, clean_env, parse_power_status,
                             require_ac, validate_map, child_command)

class StaticTests(TestCase):
    @classmethod
    def setUpClass(cls):
        raw = MAP.read_bytes()
        assert hashlib.sha256(raw).hexdigest() == MAP_SHA
        cls.good = json.loads(raw)

    def refused(self, change):
        bad = copy.deepcopy(self.good)
        change(bad)
        with self.assertRaises(RuntimeError):
            validate_map(bad)

    def test_real_map_deterministic(self):
        rows = validate_map(self.good)
        self.assertEqual(len(rows), 318)
        self.assertEqual([r['target'] for r in rows], sorted(r['target'] for r in rows))
        self.assertTrue(all(r['target'].startswith(PREFIX) for r in rows))

    def test_wrong_schema(self):
        self.refused(lambda d: d.__setitem__('schema', '1370-c0-stage39-source-map-draft-r3'))

    def test_wrong_base(self):
        self.refused(lambda d: d.__setitem__('baseEvidenceCommit', '0' * 40))

    def test_wrong_production(self):
        self.refused(lambda d: d.__setitem__('productionSrcTree', '0' * 40))

    def test_wrong_prefix(self):
        self.refused(lambda d: d.__setitem__('targetPrefix', PREFIX.rstrip('/')))

    def test_duplicate_destination(self):
        self.refused(lambda d: d['rows'][1].__setitem__('target', d['rows'][0]['target']))

    def test_traversal(self):
        self.refused(lambda d: d['rows'][0].__setitem__('target', PREFIX + '../outside'))

    def test_outside_source(self):
        self.refused(lambda d: d['rows'][0].__setitem__('source', '/tmp/x'))

    def test_oversize(self):
        self.refused(lambda d: d['rows'][0].__setitem__('bytes', 100000000))

    def test_bad_oid(self):
        self.refused(lambda d: d['rows'][0].__setitem__('gitBlobOid', 'z' * 40))

    def test_missing_row(self):
        self.refused(lambda d: d['rows'].pop())

    def test_missing_stage38_remote_proof(self):
        self.refused(lambda d: d['authority'].__setitem__('stage38RemoteObservedSha256', '0' * 64))

    def test_r9_stop_relabel_refused(self):
        self.refused(lambda d: next(r for r in d['rows'] if r['target'].endswith('1370-c0-h-typecheck-collection-independent-observed-stop-review-r9/RECEIPT.json')).__setitem__('classification', 'ACCEPTED'))

    def test_r8_refine_relabel_refused(self):
        self.refused(lambda d: next(r for r in d['rows'] if r['target'].endswith('1370-c0-h-typecheck-collection-runner-independent-static-review-r8/RECEIPT.json')).__setitem__('classification', 'ACCEPTED'))

    def test_current_baseline_relabel_refused(self):
        self.refused(lambda d: next(r for r in d['rows'] if r['target'].endswith('1370-c0-h-mirror-post-r9-baseline-independent-observed-review-r1/RECEIPT.json')).__setitem__('classification', 'ACCEPTED_TYPES'))

    def test_clean_env_scrubs_ambient_git(self):
        with mock.patch.dict(os.environ, {'GIT_DIR': '/tmp/spoof', 'GIT_INDEX_FILE': '/tmp/spoof-index', 'PATH': '/bin'}):
            value = clean_env()
            self.assertNotIn('GIT_DIR', value)
            self.assertNotIn('GIT_INDEX_FILE', value)
            self.assertEqual(value['PATH'], '/bin')
            self.assertEqual(clean_env({'GIT_INDEX_FILE': '/safe/private'})['GIT_INDEX_FILE'], '/safe/private')

    def test_hanging_child_and_grandchild_group_are_killed(self):
        with tempfile.TemporaryDirectory(prefix='stage39-red-') as tmp:
            marker = os.path.join(tmp, 'group.json')
            code = ("import json,os,subprocess,time; "
                    'child=subprocess.Popen(["sleep","30"]); '
                    f'open({marker!r},"w").write(json.dumps([os.getpgrp(),child.pid])); '
                    "time.sleep(30)")
            with mock.patch('publish_stage39.ACTIVE_SECONDS', 0.5), \
                 mock.patch('publish_stage39.START', time.monotonic()):
                started = time.monotonic()
                with self.assertRaisesRegex(RuntimeError, 'child command STOP'):
                    child_command(sys.executable, '-c', code)
                self.assertLess(time.monotonic() - started, 5)
            group, grandchild = json.loads(Path(marker).read_text())
            with self.assertRaises(ProcessLookupError):
                os.killpg(group, 0)
            self.assertGreater(grandchild, 0)

    def test_output_cap_rejects_noisy_child(self):
        with mock.patch('publish_stage39.START', time.monotonic()):
            with self.assertRaises(RuntimeError):
                child_command(sys.executable, '-c', 'import os; [os.write(1,b"x"*65536) for _ in range(50)]')

    def test_large_legitimate_child_file_write_with_tiny_stdout(self):
        with tempfile.TemporaryDirectory(prefix='stage39-file-red-', dir='/Users/zacheryspector/studio-scratch') as tmp:
            path = os.path.join(tmp, 'legitimate-index-like-file')
            code = f'open({path!r},"wb").write(b"x"*(3*1024*1024)); print("ok")'
            with mock.patch('publish_stage39.START', time.monotonic()):
                self.assertEqual(child_command(sys.executable, '-c', code), 'ok')
            self.assertEqual(os.stat(path).st_size, 3 * 1024 * 1024)

    def test_bounded_stdin_roundtrip(self):
        with mock.patch('publish_stage39.START', time.monotonic()):
            self.assertEqual(child_command(sys.executable, '-c',
                                           'import sys; print(len(sys.stdin.buffer.read()))',
                                           input_bytes=b'x' * 100000), '100000')

    def test_simultaneous_stdin_and_stdout_do_not_deadlock(self):
        code = ('import os,sys; os.write(1,b"y"*900000); '
                'assert len(sys.stdin.buffer.read())==900000')
        with mock.patch('publish_stage39.START', time.monotonic()):
            self.assertEqual(len(child_command(sys.executable, '-c', code,
                                               input_bytes=b'x' * 900000)), 900000)

    def test_input_cap(self):
        with mock.patch('publish_stage39.START', time.monotonic()):
            with self.assertRaisesRegex(RuntimeError, 'input exceeds'):
                child_command(sys.executable, '-c', 'pass', input_bytes=b'x' * (1024 * 1024 + 1))

    def test_ac_parser(self):
        self.assertTrue(parse_power_status("Now drawing from 'AC Power'\n"))
        self.assertFalse(parse_power_status("Now drawing from 'Battery Power'\n"))
        self.assertFalse(parse_power_status(''))

    @mock.patch('publish_stage39.child_command')
    def test_battery_refused(self, run):
        run.return_value = "Now drawing from 'Battery Power'\n"
        with self.assertRaisesRegex(RuntimeError, 'AC power'):
            require_ac()

    @mock.patch('publish_stage39.child_command')
    def test_pmset_failure_refused(self, run):
        run.side_effect = FileNotFoundError('pmset')
        with self.assertRaisesRegex(RuntimeError, 'AC power'):
            require_ac()

if __name__ == '__main__':
    main()
