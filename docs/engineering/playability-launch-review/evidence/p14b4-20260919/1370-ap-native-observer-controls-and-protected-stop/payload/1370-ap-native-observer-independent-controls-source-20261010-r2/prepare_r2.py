from pathlib import Path
import hashlib,json,os
D=Path(__file__).resolve().parent
B=D.parent/'1370-ap-native-observer-independent-controls-source-20261010-r1'
def role(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
old=(B/'run-native-observer-controls.mjs').read_text()
before="const q=setup();capture(q).record('inputTuple',ordinary());assert.equal(json(rows),old);"
after="const E=rowRefusal(p);assert.equal(p.latch.first().error,E);exactThrown(()=>p.sink.rows(),E);const q=setup();capture(q).record('inputTuple',ordinary());assert.equal(json(rows),old);"
assert old.count(before)==1
new=old.replace(before,after)
assert new.replace(after,before)==old
with (D/'run-native-observer-controls.mjs').open('x') as f:f.write(new)
builder=(B/'seal_controls.py').read_text()
builder=builder.replace("'LESSONS.md','seal_controls.py']","'LESSONS.md','seal_controls.py','SOURCE-CORRECTION.json','prepare_r2.py']")
builder=builder.replace("'payloadFiles':5","'payloadFiles':7")
with (D/'seal_controls.py').open('x') as f:f.write(builder)
proof={'schema':'1370-native-observer-controls-r2-source-correction/v1','predecessorSourceManifest':role(B/'SOURCE-PINS.json'),'predecessorLibrary':role(B/'run-native-observer-controls.mjs'),'successorLibrary':role(D/'run-native-observer-controls.mjs'),
 'change':'The retained old snapshot arm now actually suffers original row-byte refusal before the fresh new arm is created; public old rows must refuse same E while new arm succeeds and old retained snapshot stays unchanged.',
 'wholeForward':{'before':before,'after':after,'count':1},'wholeInverseActuallyEqual':True,
 'caseRosterUnchanged':True,'caseCount':72,'positiveCount':13,'specificNegativeCount':59,'runtimeExecuted':False,'executionAuthorization':False}
with (D/'SOURCE-CORRECTION.json').open('x') as f:json.dump(proof,f,indent=2);f.write('\n');f.flush();os.fsync(f.fileno())
print(json.dumps(role(D/'run-native-observer-controls.mjs')))
