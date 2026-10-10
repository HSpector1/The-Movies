import hashlib,json,os,stat,sys
from pathlib import Path
S=Path('/Users/zacheryspector/studio-scratch');A=Path(__file__).parent
def role(p):
 p=Path(p);st=p.lstat();assert p.resolve()==p and stat.S_ISREG(st.st_mode) and st.st_nlink==1
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def put(p,b):
 with p.open('xb') as f:f.write(b);f.flush();os.fsync(f.fileno())
 p.chmod(0o444);return role(p)
assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize
base=S/'1370-an-root-continuation-20261009-r1/read_lossless_controls.py';old=base.read_bytes();new=old
changes=[
 ('1370-an-lossless-trace-pure-controls-parent-recorded-20261010-r1','1370-ao-observer-row-diagnostic-pure-controls-parent-recorded-20261010-r1'),
 ("'rootDesignAdoption','implementationControlsSourceAdoption')","'rootDesignAdoption','implementationControlsSourceAdoption','api')"),
 ('LOSSLESS_TRACE_PURE_CONTROLS_COMPLETE_UNADOPTED','OBSERVER_ROW_DIAGNOSTIC_PURE_CONTROLS_COMPLETE_UNADOPTED'),
 ('1370-lossless-trace-independent-controls-result/v1','1370-observer-row-independent-controls-result/v1'),
 ('PURE_LOSSLESS_CODEC_AND_AFFECTED_ORDERING_COMPLETED_UNADOPTED','PURE_OBSERVER_ROW_DIAGNOSTIC_CONTROLS_COMPLETED_UNADOPTED'),
 ("v['positiveCount']==c['positiveCount']==9 and v['specificNegativeCount']==c['specificNegativeCount']==40","v['positiveCount']==c['positiveCount']==6 and v['specificNegativeCount']==c['specificNegativeCount']==42"),
 ("assert v['originalOrderingCases']==18 and v['originalParserCasesReplayed']==0 and len(v['results'])==c['caseCount']==49","assert v['caseCount']==len(v['results'])==c['caseCount']==48"),
 ("len(set(x['id'] for x in v['results']))==49","len(set(x['id'] for x in v['results']))==48"),
 ("emitted={'m0TraceCodec.mjs':'m0TraceCodec.mjs','traceSequences.mjs':'traceSequences.mjs','run-lossless-controls.mjs':'run-lossless-controls.mjs','m0WiringProbe.ts':'m0WiringProbe.mjs','ordering.ts':'ordering.mjs','ordering-source-controls.ts':'ordering-source-controls.mjs'}","emitted={'m0ObserverRowDiagnostic.mjs':'m0ObserverRowDiagnostic.mjs','run-observer-row-controls.mjs':'run-observer-row-controls.mjs','m0FeasibilityWitness.ts':'m0FeasibilityWitness.mjs'}"),
 ("('originalM0ReadOrWritten','game','executionAuthorization')","('privateM0ReadOrWritten','game','fullQualificationAccepted','executionAuthorization')"),
 ('1370-root-lossless-trace-controls-actual-readback/v1','1370-root-observer-row-diagnostic-controls-actual-readback/v1'),
 ('ACTUAL_PURE_49_CONTROLS_COMPLETE_PENDING_INDEPENDENT_REVIEW','ACTUAL_PURE_48_CONTROLS_COMPLETE_PENDING_INDEPENDENT_REVIEW'),
 ("'caseCount':49","'caseCount':48"),
 ("'positiveCount':9,'specificNegativeCount':40,'originalOrderingCases':18,'originalParserCasesReplayed':0,","'positiveCount':6,'specificNegativeCount':42,'historicalControlSetsReplayed':False,"),
]
for x,y in changes:
 assert new.count(x.encode())>=1 and y.encode() not in new
 new=new.replace(x.encode(),y.encode())
inverse=new
for x,y in reversed(changes):inverse=inverse.replace(y.encode(),x.encode())
assert inverse==old;compile(new,str(A/'read_observer_controls.py'),'exec')
out=put(A/'read_observer_controls.py',new)
proof=put(A/'CONTROLS-ROOT-READER-PROOF.json',(json.dumps({'schema':'1370-ao-observer-diagnostic-controls-root-reader-proof/v1','base':role(base),'new':out,'changes':[{'before':x,'after':y,'occurrences':old.count(x.encode())} for x,y in changes],'wholeInverseEqualsBase':True,'originalOwnershipStreamsBoundsAndExactRowChecksUnchanged':True,'executionAuthorization':False},sort_keys=True,indent=2)+'\n').encode())
print(json.dumps({'reader':out,'proof':proof}))
