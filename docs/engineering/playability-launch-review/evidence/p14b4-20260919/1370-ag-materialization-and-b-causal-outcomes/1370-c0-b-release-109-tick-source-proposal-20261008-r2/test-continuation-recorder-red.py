#!/usr/bin/env python3
"""UNRUN changed bounds and actual unfilled refusal; no game/assembler imports."""
import hashlib
import importlib.util
import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
ROOT=Path('/Users/zacheryspector/studio-scratch/1370-c0-b-release-109-tick-source-proposal-20261008-r2')
spec=importlib.util.spec_from_file_location('b109_source',ROOT/'run.py')
recorder=importlib.util.module_from_spec(spec);spec.loader.exec_module(recorder)
class ChangedRecorder(unittest.TestCase):
    def test_adopted_caps_exact(self):
        self.assertEqual((recorder.COMBINED,recorder.ACTIVE,recorder.WHOLE),(300,375,390))
        self.assertEqual((recorder.MAX_OUTPUT,recorder.MAX_JSON,recorder.FINAL_RESERVE),(268435456,16777216,131072))
        self.assertEqual(recorder.PRE_FREE,3657433088)
    def test_just_inside_and_exact_deadline(self):
        recorder.observed_exit_guard(0,10,0,clock=lambda:309.999)
        with self.assertRaisesRegex(AssertionError,'COMBINED_TEST_CAP'):
            recorder.observed_exit_guard(0,10,0,clock=lambda:310)
    def test_postflight_candidate_late_active_but_whole_open_refuses(self):
        recorder.active_guard(0,clock=lambda:374.999)
        for elapsed in (375,380):
            self.assertLess(elapsed,recorder.WHOLE)
            with self.assertRaisesRegex(AssertionError,'STOP_ACTIVE_375_SECONDS'):
                recorder.active_guard(0,clock=lambda:elapsed)
    def test_whole_alarm_names_actual_bound(self):
        with self.assertRaisesRegex(TimeoutError,'STOP_WHOLE_390_SECONDS'):recorder.alarm()
    def test_unfilled_actual_process_refuses_before_output_or_assembly(self):
        with tempfile.TemporaryDirectory(prefix='b109-unfilled-',dir='/Users/zacheryspector/studio-scratch') as work:
            root=Path(work);output=root/'forbidden-output';binding=root/'binding.json'
            raw=(json.dumps({'status':'UNFILLED','executionAuthorization':False,'outputRoot':str(output)})+'\n').encode();binding.write_bytes(raw)
            result=subprocess.run([sys.executable,'-I','-B',str(ROOT/'run.py'),str(binding),hashlib.sha256(raw).hexdigest()],cwd='/Users/zacheryspector/The-Movies-headless-program',capture_output=True,timeout=5,env={**os.environ,'PYTHONDONTWRITEBYTECODE':'1'})
            self.assertEqual(result.returncode,2);self.assertFalse(output.exists());self.assertEqual(sorted(p.name for p in root.iterdir()),['binding.json'])
            self.assertEqual(json.loads(result.stderr)['status'],'STOP')
if __name__=='__main__':unittest.main()
