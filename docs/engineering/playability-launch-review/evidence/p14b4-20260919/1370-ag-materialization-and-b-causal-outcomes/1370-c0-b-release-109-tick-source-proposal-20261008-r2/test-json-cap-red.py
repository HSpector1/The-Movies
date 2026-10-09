#!/usr/bin/env python3
"""UNRUN focused no-game JSON read/budget refusals, scoped to private scratch."""
import importlib.util
import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT = Path('/Users/zacheryspector/studio-scratch/1370-c0-b-release-109-tick-source-proposal-20261008-r2')
spec = importlib.util.spec_from_file_location('b_release_r3', ROOT / 'run.py')
recorder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(recorder)


class JsonCapRed(unittest.TestCase):
    def scratch(self):
        return tempfile.TemporaryDirectory(prefix='b-release-r3-json-red-', dir='/Users/zacheryspector/studio-scratch')

    def test_17_mib_reporter_under_256_mib_refuses_before_parse(self):
        with self.scratch() as work:
            root = Path(work); reporter = root / 'EBG.vitest.json'
            # Sparse regular file makes this a tiny allocated fixture. Logical
            #17MiB is below aggregate256MiB, yet exceeds the singleJSON16MiB cap.
            with reporter.open('wb') as stream:
                stream.truncate(17 * 1024**2)
            self.assertLess(reporter.stat().st_size, recorder.MAX_OUTPUT)
            with patch.object(recorder.json, 'loads', side_effect=RuntimeError('parser must not run')):
                with self.assertRaisesRegex(AssertionError, 'STOP_SINGLE_JSON_CAP'):
                    recorder.read_json(reporter)
            with self.assertRaisesRegex(AssertionError, 'STOP_SINGLE_JSON_CAP'):
                recorder.sizes(root)

    def test_valid_regular_json_read(self):
        with self.scratch() as work:
            path = Path(work) / 'small.json'; path.write_bytes(b'{"n":1}\n')
            self.assertEqual(recorder.read_json(path), {'n': 1})

    def test_json_symlink_refuses(self):
        with self.scratch() as work:
            root = Path(work); (root / 'original.json').write_bytes(b'{}')
            path = root / 'link.json'; path.symlink_to(root / 'original.json')
            with self.assertRaisesRegex(AssertionError, 'STOP_JSON_KIND'):
                recorder.read_json(path)

    def test_json_hardlink_refuses(self):
        with self.scratch() as work:
            root = Path(work); original = root / 'original.json'; original.write_bytes(b'{}')
            path = root / 'link.json'; os.link(original, path)
            with self.assertRaisesRegex(AssertionError, 'STOP_JSON_KIND'):
                recorder.read_json(path)


if __name__ == '__main__':
    unittest.main()
