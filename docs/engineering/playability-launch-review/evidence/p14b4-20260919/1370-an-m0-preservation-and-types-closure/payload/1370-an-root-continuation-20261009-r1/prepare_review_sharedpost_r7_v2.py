import json,os
from pathlib import Path
A=Path(__file__).parent;b=(A/'review_sharedpost_r7.py').read_text()
for old,new in [('predecessorSourcePins','predecessorSourceManifest'),('predecessorIndependentSourceReview','predecessorAcceptedRootReviewRole'),('originalSource','predecessorSource'),('updatedSource','freshSource'),("assert {c['from']:c['to'] for c in pair['exactLiteralChanges']}==allowed","assert dict(proof['exactLiteralChanges'])==allowed")]:
 assert old in b;b=b.replace(old,new)
compile(b,'review_sharedpost_r7_v2.py','exec');p=A/'review_sharedpost_r7_v2.py'
with p.open('x') as f:f.write(b);f.flush();os.fsync(f.fileno())
p.chmod(0o444)
p=A/'SHAREDPOST-R7-REVIEWER-SCHEMA-CORRECTION.json'
with p.open('x') as f:json.dump({'sourceOnly':True,'executionAuthorization':False,'actualCheckerChunk':'111f02','actualCheckerExit':1,'error':"KeyError: predecessorSourcePins",'cause':'Review reuse assumed earlier documentary proof key names. Exact sealed R7 proof uses predecessorSourceManifest/predecessorAcceptedRootReviewRole and predecessorSource/freshSource; same complete source checks retained with actual shape. No candidate change or execution.'},f,sort_keys=True,indent=2);f.write('\n')
p.chmod(0o444)
