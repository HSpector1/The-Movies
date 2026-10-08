#!/usr/bin/env python3
"""Static r4 bootstrap and inherited-runner checks; no heavy execution."""
import ast,hashlib,importlib.util,pathlib,shlex,subprocess,tempfile,json,sys
sys.dont_write_bytecode=True
P=pathlib.Path('/Users/zacheryspector/studio-scratch/1370-c0-h-typecheck-collection-runner-proposal-r5')
R4=pathlib.Path('/Users/zacheryspector/studio-scratch/1370-c0-h-typecheck-collection-runner-proposal-r4')
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
assert sha(P/'runner.py')=='0fe66879521909362fa746044485b58b8a61b411038d40343465042aa183b50b'
assert sha(P/'runner.py')!=sha(R4/'runner.py')
for name in ['runner.py','recorder.py']:ast.parse((P/name).read_text())
spec=importlib.util.spec_from_file_location('r4_recorder_static',P/'recorder.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
assert m.RUNNER_SHA==sha(P/'runner.py') and m.ROOT.name=='1370-c0-h-typecheck-collection-results-r5'
compile(m.RUNNER_BOOTSTRAP,'<runner-bootstrap>','exec')
b=P/'BINDING-UNFILLED.json';bh=sha(b)
ok=subprocess.run(['/usr/local/bin/python3','-I','-B','-c',m.RUNNER_BOOTSTRAP,str(P/'runner.py'),'--binding',str(b),'--binding-sha',bh],capture_output=True,text=True,timeout=10)
assert ok.returncode==1 and 'unfilled binding' in ok.stderr
with tempfile.TemporaryDirectory(dir=P.parent,prefix='r4-bootstrap-red-') as d:
 q=pathlib.Path(d)/'runner.py';q.write_bytes((P/'runner.py').read_bytes()+b'\n# drift\n')
 bad=subprocess.run(['/usr/local/bin/python3','-I','-B','-c',m.RUNNER_BOOTSTRAP,str(q),'--binding',str(b),'--binding-sha',bh],capture_output=True,text=True,timeout=10)
 assert bad.returncode!=0 and 'AssertionError' in bad.stderr
command=(P/'EXACT-LAUNCH-TEMPLATE.txt').read_text().split('\n',1)[1]
argv=shlex.split(command)
assert argv[:4]==['/usr/local/bin/python3','-I','-B','-c'] and len(argv)==5
compile(argv[4],'<recorder-bootstrap-template>','exec')
assert sha(P/'recorder.py') in argv[4]
assert 'OBSERVED_MIRROR_DIGEST' in (P/'runner.py').read_text() and 'full_source_check(mirror,manifest,False)' in (P/'runner.py').read_text() and 'full_source_check(mirror,manifest,True)' in (P/'runner.py').read_text()
print('R5_STATIC_FULL_MIRROR_BOOTSTRAPS_AND_UNFILLED_DRIFT_REDS_PASS')
