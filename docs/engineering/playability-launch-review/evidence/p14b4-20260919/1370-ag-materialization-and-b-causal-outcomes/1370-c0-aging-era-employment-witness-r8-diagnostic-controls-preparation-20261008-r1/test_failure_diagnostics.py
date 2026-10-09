"""UNRUN focused synthetic controls. Args --source exact observer package.
Never load fixture/engine/Node or execute the witness/sandbox. Tests use Python-only
children with tiny deadlines; supervisor Popen is replaced solely in the test.
Run old r7 once for RED and proposed r8 once for GREEN only after parent review.
"""
import argparse,base64,hashlib,importlib.util,json,os,pathlib,subprocess,sys,tempfile,time,unittest
from unittest import mock
parser=argparse.ArgumentParser();parser.add_argument('--source',required=True)
args,remaining=parser.parse_known_args();sys.argv=[sys.argv[0],*remaining]
SOURCE=pathlib.Path(args.source);HERE=pathlib.Path(__file__).resolve().parent
def import_source(name,file):
 sp=importlib.util.spec_from_file_location(name,SOURCE/file);m=importlib.util.module_from_spec(sp);sp.loader.exec_module(m);return m
outer=import_source('synthetic_outer','outer-recorder.py');supervisor=import_source('synthetic_supervisor','supervise.py')
def sha(b):return hashlib.sha256(b).hexdigest()
def render(mod,exc):
 return mod.failure_line(exc) if hasattr(mod,'failure_line') else (json.dumps({'status':str(exc)})+'\n').encode()

class FailureDiagnosticsControls(unittest.TestCase):
    def outer_failure(self,code,**kw):
        started=time.monotonic()
        with self.assertRaises(RuntimeError) as caught:
            outer.run_recorded([sys.executable,'-B','-c',code],started,outer_seconds=2.0,active_seconds=1.5,**kw)
        self.assertLess(time.monotonic()-started,3.0)
        return caught.exception

    def supervisor_failure(self,payload=b'INNER_SYNTHETIC_FAILURE\n',exitcode=7):
        original_popen=supervisor.subprocess.Popen
        code='import os,sys; os.write(2,'+repr(payload)+');sys.exit('+str(exitcode)+')'
        def synthetic_popen(argv,**kwargs):
            self.assertEqual(argv[0],'/usr/bin/sandbox-exec')
            self.assertEqual(argv[1],'-f')
            self.assertFalse(kwargs['start_new_session'])
            self.assertTrue(kwargs['close_fds'])
            return original_popen([sys.executable,'-B','-c',code],**kwargs)
        with tempfile.TemporaryDirectory(prefix='diag-synthetic-',dir=HERE) as temp:
            root=pathlib.Path(temp);runner=root/'node_modules/.bin/vite-node';runner.parent.mkdir(parents=True);runner.write_bytes(b'UNEXECUTED SYNTHETIC RUNNER')
            binding=root/'binding.json';binding.write_text(json.dumps({'status':'REVIEWED_FILLED_UNRUN','sourceSha':supervisor.SOURCE,'outputProtocol':supervisor.PROTOCOL,'repoRoot':str(root)}))
            with mock.patch.object(supervisor.sys,'argv',['synthetic-supervisor',str(binding)]),mock.patch.object(supervisor.stat,'S_ISFIFO',return_value=True),mock.patch.object(supervisor,'validate_source_review',return_value={}),mock.patch.object(supervisor,'validate_bounds_roles',return_value={}),mock.patch.object(supervisor.subprocess,'Popen',side_effect=synthetic_popen):
                with self.assertRaises(RuntimeError) as caught:supervisor.main()
            return caught.exception

    def test_actual_supervisor_child_failure_is_retained(self):
        payload=b'INNER_SYNTHETIC_FAILURE\n';exc=self.supervisor_failure(payload)
        self.assertEqual(str(exc),'STOP_CHILD_EXIT_7')
        d=json.loads(render(supervisor,exc)).get('failure');self.assertIsInstance(d,dict)
        self.assertEqual(d['childExit'],7);self.assertTrue(d['directChildReaped'])
        self.assertGreater(d['childPid'],1);self.assertEqual(d['ownedPgid'],os.getpgrp())
        self.assertEqual(d['stderrBytes'],len(payload));self.assertEqual(d['stderrSha256'],sha(payload))
        self.assertEqual(base64.b64decode(d['stderrPrefixBase64'],validate=True),payload)

    def test_nested_supervisor_error_survives_actual_outer_child(self):
        inner=render(supervisor,self.supervisor_failure())
        exc=self.outer_failure('import os,sys;os.write(2,'+repr(inner)+');sys.exit(2)')
        self.assertEqual(str(exc),'STOP_SUPERVISOR_EXIT_2')
        d=json.loads(render(outer,exc)).get('failure');self.assertIsInstance(d,dict)
        recovered=base64.b64decode(d['stderrPrefixBase64'],validate=True)
        self.assertEqual(recovered,inner);self.assertFalse(d['stderrTruncated'])
        self.assertEqual(json.loads(recovered)['failure']['childExit'],7)
        self.assertGreater(d['ownedPgid'],1);self.assertTrue(d['ownedGroupCleared']);self.assertFalse(outer.group_alive(d['ownedPgid']))

    def test_binary_stderr_prefix_and_full_capture_digest(self):
        payload=bytes(range(256))*2
        exc=self.outer_failure('import os,sys;os.write(2,'+repr(payload)+');sys.exit(9)')
        d=json.loads(render(outer,exc)).get('failure');self.assertIsInstance(d,dict)
        self.assertEqual(base64.b64decode(d['stderrPrefixBase64'],validate=True),payload)
        self.assertEqual(d['stderrSha256'],sha(payload));self.assertEqual(d['stderrBytes'],len(payload))

    def test_outer_stderr_truncates_excerpt_without_losing_full_hash(self):
        payload=b'x'*60000
        exc=self.outer_failure('import os,sys;os.write(2,'+repr(payload)+');sys.exit(9)')
        raw=render(outer,exc);d=json.loads(raw).get('failure');self.assertIsInstance(d,dict)
        self.assertLessEqual(len(raw),16384);self.assertLess(len(raw),outer.MAX_STDERR)
        self.assertEqual(d['stderrBytes'],len(payload));self.assertEqual(d['stderrSha256'],sha(payload))
        self.assertTrue(d['stderrTruncated']);self.assertEqual(d['stderrPrefixBytes'],8192)
        self.assertEqual(base64.b64decode(d['stderrPrefixBase64'],validate=True),payload[:8192])

    def test_inner_stderr_truncation_fits_complete_nested_record(self):
        payload=b'y'*60000
        inner=render(supervisor,self.supervisor_failure(payload))
        d=json.loads(inner).get('failure');self.assertIsInstance(d,dict)
        self.assertLessEqual(len(inner),8192);self.assertEqual(d['stderrPrefixBytes'],4096)
        self.assertEqual(d['stderrSha256'],sha(payload));self.assertTrue(d['stderrTruncated'])
        outer_exc=self.outer_failure('import os,sys;os.write(2,'+repr(inner)+');sys.exit(2)')
        record=json.loads(render(outer,outer_exc))['failure']
        self.assertEqual(base64.b64decode(record['stderrPrefixBase64'],validate=True),inner)
        self.assertFalse(record['stderrTruncated'])

    def test_stderr_cap_remains_stop_and_counts_only_retained_bytes(self):
        exc=self.outer_failure('import os;os.write(2,b"z"*70000)')
        self.assertEqual(str(exc),'STOP_STDERR_CAP')
        d=json.loads(render(outer,exc)).get('failure');self.assertIsInstance(d,dict)
        self.assertLessEqual(d['stderrBytes'],outer.MAX_STDERR)
        self.assertIn('cap-crossing read is excluded',d['byteCountsScope'])
        self.assertTrue(d['ownedGroupCleared'])

    def test_stdout_cap_remains_stop_not_a_success_frame(self):
        exc=self.outer_failure('import os;os.write(1,b"x"*600000)')
        self.assertEqual(str(exc),'STOP_STDOUT_CAP')
        r=json.loads(render(outer,exc));self.assertNotEqual(r['status'],'MATCHED_AGING_ERA_PREIMAGE_CANDIDATE')
        self.assertIsInstance(r.get('failure'),dict);self.assertLessEqual(r['failure']['stdoutBytes'],outer.MAX_STDOUT)

    def test_cleanup_refusal_has_precedence_over_original_child_exit(self):
        original_clear=outer.clear_group
        def refuse_after_real_cleanup(*a):
            child_exit,cleared=original_clear(*a);self.assertTrue(cleared);return child_exit,False
        with mock.patch.object(outer,'clear_group',side_effect=refuse_after_real_cleanup):
            exc=self.outer_failure('import os,sys;os.write(2,b"cleanup control");sys.exit(2)')
        self.assertEqual(str(exc),'STOP_SURVIVOR')
        d=json.loads(render(outer,exc)).get('failure');self.assertIsInstance(d,dict)
        self.assertFalse(d['ownedGroupCleared']);self.assertEqual(d['supervisorExit'],2)
        self.assertFalse(outer.group_alive(d['ownedPgid']))

    def test_deadline_refusal_has_precedence_over_original_child_exit(self):
        original_clear=outer.clear_group;real_monotonic=time.monotonic;expired=[False]
        def expire_after_real_cleanup(*a):
            result=original_clear(*a);expired[0]=True;return result
        def monotonic():return real_monotonic()+(10 if expired[0] else 0)
        started=real_monotonic()
        with mock.patch.object(outer,'clear_group',side_effect=expire_after_real_cleanup),mock.patch.object(outer.time,'monotonic',side_effect=monotonic):
            with self.assertRaises(RuntimeError) as caught:
                outer.run_recorded([sys.executable,'-B','-c','import os,sys;os.write(2,b"deadline control");sys.exit(2)'],started,outer_seconds=2,active_seconds=1.5)
        self.assertEqual(str(caught.exception),'STOP_OUTER_DEADLINE')
        d=json.loads(render(outer,caught.exception)).get('failure');self.assertIsInstance(d,dict);self.assertTrue(d['ownedGroupCleared'])

    def test_failure_serializer_caps_arbitrary_status_and_metadata(self):
        exc=RuntimeError('\0\u2603'*100000);raw=render(supervisor,exc)
        self.assertLessEqual(len(raw),8192);record=json.loads(raw)
        status=str(exc).encode('utf8');self.assertEqual(record['statusSha256'],sha(status));self.assertTrue(record['statusTruncated'])
        forged=supervisor.FailureStop('STOP_SYNTHETIC',{'untrusted':'x'*1000000});raw=render(supervisor,forged)
        self.assertLessEqual(len(raw),8192);self.assertEqual(json.loads(raw)['status'],'STOP_SYNTHETIC');self.assertTrue(json.loads(raw)['failureMetadataOmittedForCap'])

    def test_valid_success_bytes_remain_exact_with_synthetic_validator(self):
        payload=b'{"synthetic_success":true}\n'
        with mock.patch.object(outer,'validate_outer_frame',return_value={}):
            raw,end=outer.run_recorded([sys.executable,'-B','-c','import os;os.write(1,'+repr(payload)+')'],time.monotonic(),outer_seconds=2,active_seconds=1.5)
        self.assertEqual(raw,payload);self.assertGreater(end,time.monotonic())

if __name__=='__main__':unittest.main()
