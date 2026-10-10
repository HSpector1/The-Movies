import hashlib,json,os
from pathlib import Path
A=Path(__file__).parent;old=(A/'adopt_fullfunction_r3_protected_stop.py').read_text();new=old
changes=[('ACCEPT_OBSERVED_FULLFUNCTION_BASELINE_TRACE_OVERFLOW_STOP_WITH_REAL_GENERATION_AND_FULL_SHARED_POSTFLIGHT','ACCEPT_OBSERVED_FULLFUNCTION_HELPER_PROBE_TOTAL_BYTE_CAP_STOP_WITH_REAL_GENERATION_AND_FULL_SHARED_POSTFLIGHT'),('62802d2fff9906c2d8e90d7559b627af66f1d413d9d320b6c7b3a3a2da927e5a','568c92e332879885a53726cc359b296d4279c9f763236edeed019f7d92a06e28'),("b['toolSessionId']==40169","b['toolSessionId']==21948"),("f['toolSessionId']==71517","f['toolSessionId']==7509"),('ROOT_ADOPTED_FULLFUNCTION_BASELINE_TRACE_OVERFLOW_STOP_WITH_REAL_GENERATION_AND_FULL_SHARED_POSTFLIGHT','ROOT_ADOPTED_FULLFUNCTION_HELPER_PROBE_TOTAL_BYTE_CAP_STOP_WITH_REAL_GENERATION_AND_FULL_SHARED_POSTFLIGHT'),('FULLFUNCTION-R3-STOP-OBSERVED-ADOPTION.json','FULLFUNCTION-R4-STOP-OBSERVED-ADOPTION.json'),('Actual40169 generated the real natural boundary packet and then failed baseline complete-trace assertion at first off author196 arm. Preserve actual phase success separately from terminal null prefix and missing afterproofs; no complete qualification, intended mutant RED, neutrality or ledger acceptance. Exact overflowing resource predicate remains unmeasured.','Actual21948 reproduced the same real natural boundary packet then failed first off author196 baseline. Total-byte cap alone failed:2075516+32241=2107757 exceeds2097152 by10605. Preserve phase success and finite repeated-packet identity separately from aggregate STOP, terminal nulls and missing afterproofs. No full qualification, broad replay, intended mutant RED, neutrality or ledger acceptance.')]
for a,b in changes:assert new.count(a)==1;new=new.replace(a,b)
needle="assert not os.path.lexists(S/'HEAVY-LANE-LOCK')"
extra="""expected={'entryCap':False,'rowByteCap':False,'totalByteCap':True,'entries':1450,'calls':1298,'evaluations':152,'retainedBytes':2075516,'nextRowBytes':32241}
assert r['diagnosis']==expected and all(type(r['diagnosis'][k]) is type(v) for k,v in expected.items())
for k in ('priorGenerationFixture','currentGenerationFixture'):assert role(r[k]['path'])==r[k]
assert r['currentGenerationFixture']==r['fixture'] and all(r['priorGenerationFixture'][k]==r['fixture'][k] for k in ('bytes','sha256')) and r['repeatedFixtureBytesEqual'] is True and r['actualGenerationPhaseSucceeded'] is True
messages=bl['testResults'][0]['assertionResults'][0]['failureMessages'];assert len(messages)==1
tail=messages[0].split('firstOverflow=',1)[1];actual=json.JSONDecoder().raw_decode(tail)[0]
assert actual==expected and all(type(actual[k]) is type(v) for k,v in expected.items())
assert expected['entries']==expected['calls']+expected['evaluations'] and expected['entries']<16384 and expected['nextRowBytes']<=65536 and expected['retainedBytes']+expected['nextRowBytes']-2097152==10605
"""+needle
assert new.count(needle)==1;new=new.replace(needle,extra)
needle2="p=A/'FULLFUNCTION-R4-STOP-OBSERVED-ADOPTION.json'"
extra2="v.update({'diagnosis':expected,'priorGenerationFixture':r['priorGenerationFixture'],'currentGenerationFixture':r['currentGenerationFixture'],'repeatedFixtureBytesEqual':True,'broadReplayAccepted':False,'limitsChanged':False})\n"+needle2
assert new.count(needle2)==1;new=new.replace(needle2,extra2);compile(new,'adopt_fullfunction_r4_protected_stop.py','exec')
p=A/'adopt_fullfunction_r4_protected_stop.py'
with p.open('x') as f:f.write(new);f.flush();os.fsync(f.fileno())
p.chmod(0o444);print(json.dumps({'path':str(p),'bytes':len(new.encode()),'sha256':hashlib.sha256(new.encode()).hexdigest(),'sourceOnly':True,'executionAuthorization':False}))
