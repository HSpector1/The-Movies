"""Small-file static pin/context audit only; no source module execution or gzip decoding."""
from pathlib import Path
import ast
import hashlib
import json
import os
import re
import stat

ROOT=Path('/Users/zacheryspector/studio-scratch/1370-c0-b-release-109-tick-source-proposal-20261008-r2')
OUT=Path(__file__).parent
MAX=16777216
pins={}
def metadata(s):
    return (s.st_dev,s.st_ino,s.st_size,s.st_mode,s.st_nlink,s.st_mtime_ns,s.st_ctime_ns)
def read(path,pin=None):
    p=Path(path);a=p.lstat()
    assert stat.S_ISREG(a.st_mode) and a.st_nlink==1 and a.st_size<=MAX
    fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
    try:
        assert metadata(os.fstat(fd))==metadata(a)
        chunks=[];size=0
        while True:
            b=os.read(fd,min(65536,MAX+1-size))
            if not b:break
            size+=len(b);assert size<=MAX;chunks.append(b)
        assert metadata(os.fstat(fd))==metadata(a)==metadata(p.lstat())
    finally:os.close(fd)
    b=b''.join(chunks);actual={'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
    if pin:
        assert actual['sha256']==pin['sha256']
        if 'bytes' in pin:assert actual['bytes']==pin['bytes']
    pins[str(p)]=actual;return b
m=json.loads(read(ROOT/'MANIFEST.json',{'sha256':'67945d92e6a330f98482a893cb9a39005e7eed9fcc428b5c1d3a339cca116578'}))
files={n:read(ROOT/n,p) for n,p in m['files'].items()}
external={n:read(p['path'],p) for n,p in m['externalPins'].items()}
read(ROOT/'PREPARATION-RECEIPT.json',{'sha256':'059440ce88b5a02f5604bd979a439fd7a6d1a9a8512f3f334d38e5a850e9e82c'})
comparator=json.loads(external['comparatorResult']);context=json.loads(files['E0G-TARGET-CONTEXT.json'])
assert context['sourceComparator']['sha256']==m['externalPins']['comparatorResult']['sha256']
assert len(context['cases'])==6 and len(context['market'])==12
def key(row,family):
    if family=='cases':return [row['contractId'],row['variant']]
    return [row['week'],row['kind'],row['talentId'],['VALUE',row['studioId']] if 'studioId' in row else ['MISSING']]
canonical={}
for family in ('cases','market'):
    source=sorted((r for r in comparator['terminal'][family]['rows'] if r['left'] is not None),key=lambda r:r['leftOrder'])
    assert [r['leftOrder'] for r in source]==list(range(len(source)))
    occurrences={};identities={}
    for record in source:
        row=record['left'];base=key(row,family);encoded=json.dumps(base,separators=(',',':'))
        occurrence=occurrences.get(encoded,0);occurrences[encoded]=occurrence+1
        identities[record['leftOrder']]=base+[occurrence]
    for entry in context[family]:
        record=comparator['terminal'][family]['rows'][entry['sourceRecordIndex']]
        assert record==entry['comparatorRecord'] and entry['row']==record['left']
        assert entry['sourceOrdinal']==record['leftOrder']
        assert entry['identity']==identities[entry['sourceOrdinal']]
        assert entry['eventId']==entry['row'].get('eventId')
        assert entry['recordedAtTerminalBoundary']==416
    canonical[family]={'entries':len(context[family]),'identities': [e['identity'] for e in context[family]]}
assert all(e['row']['variant']=='expiry' and e['row']['openedWeek']==404 and e['row']['closedWeek']==416 for e in context['cases'])
assert sum(e['row']['kind']=='discovered' and e['row']['week']==404 for e in context['market'])==6
assert sum(e['row']['kind']=='declined' and e['row']['week']==416 for e in context['market'])==6
index=json.loads(files['DESIGN-MEMBER-INDEX-307-416.json'])
assert index['members']==[r['ebg'] for r in comparator['boundaryIndex'][307:417]]
assert m['members']=={str(r['member']):r for r in index['members']}
counts={}
for name in ('test-recorder-red.py','test-json-cap-red.py','test-continuation-recorder-red.py'):
    counts[name]=sum(isinstance(n,ast.FunctionDef) and n.name.startswith('test_') for n in ast.walk(ast.parse(files[name])))
for name in ('test-streaming-red.mjs','test-targeted-red.mjs'):
    counts[name]=len(re.findall(r'^test\(',files[name].decode(),re.M))
counts['test-retention-red.mjs']=4
assert sum(counts.values())==53
result={'schema':'1370-b109-r2-independent-static-audit-r1','allLocalAndExternalPinsMatch':True,
        'all110PublishedLocatorsEqual':True,'canonicalHistoricalContextRecomputedFromFullSourceOrder':canonical,
        'authoredControlsUnrun':counts,'totalAuthoredControlsUnrun':53,'pins':list(pins.values()),
        'sourceModulesExecuted':False,'testsRun':False,'gameRun':False,'gzipDecoded':False,
        'gitCommands':False,'productionOrCopiedRootReads':False}
b=(json.dumps(result,sort_keys=True,indent=2)+'\n').encode()
fd=os.open(OUT/'AUDIT.json',os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
with os.fdopen(fd,'wb') as f:f.write(b);f.flush();os.fsync(f.fileno())
print(json.dumps({'auditSha256':hashlib.sha256(b).hexdigest(),'auditBytes':len(b),'uniqueInputs':len(pins),'controlsAuthoredUnrun':53}))
