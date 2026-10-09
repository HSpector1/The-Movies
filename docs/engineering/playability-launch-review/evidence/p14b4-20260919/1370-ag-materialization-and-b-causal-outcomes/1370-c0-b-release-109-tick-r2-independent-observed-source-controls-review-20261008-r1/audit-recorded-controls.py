"""Read recorded evidence only; no source-module imports, controls or game."""
from pathlib import Path
import hashlib
import json
import os
import re
import stat

SCRATCH=Path('/Users/zacheryspector/studio-scratch')
SOURCE=SCRATCH/'1370-c0-b-release-109-tick-source-proposal-20261008-r2'
RECORDED=SCRATCH/'1370-c0-b-release-109-tick-r2-source-controls-recorded-20261008-r1'
OUT=Path(__file__).parent
pins={}
def meta(s):return (s.st_dev,s.st_ino,s.st_mode,s.st_nlink,s.st_size,s.st_mtime_ns,s.st_ctime_ns)
def read(p,expected=None):
    p=Path(p);before=p.lstat()
    assert stat.S_ISREG(before.st_mode) and before.st_nlink==1 and before.st_size<=16777216
    fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
    try:
        assert meta(os.fstat(fd))==meta(before)
        b=b''
        while True:
            chunk=os.read(fd,min(65536,16777217-len(b)))
            if not chunk:break
            b+=chunk;assert len(b)<=16777216
        assert meta(os.fstat(fd))==meta(before)==meta(p.lstat())
    finally:os.close(fd)
    pin={'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
    if expected:
        assert pin['sha256']==expected['sha256']
        if 'bytes' in expected:assert pin['bytes']==expected['bytes']
    pins[str(p)]=pin;return b
record=json.loads(read(RECORDED/'PARENT-TOOL-OUTCOME.json',{'sha256':'f338304cdf88ef7b6cbedb2621654c5b6f191db6e6fc5a35f69d0428729e21d1'}))
manifest=json.loads(read(SOURCE/'MANIFEST.json',{'sha256':'67945d92e6a330f98482a893cb9a39005e7eed9fcc428b5c1d3a339cca116578'}))
assert record['sourceManifestSha256']==pins[str(SOURCE/'MANIFEST.json')]['sha256']
assert record['independentSourceReviewSha256']=='36b8fb13854b10a17159d2f5bd59d80fbd3eff7c5184c7444ecd21917d641a9f'
assert not record['gameRun'] and not record['actual109Run']
files={name:read(SOURCE/name,pin) for name,pin in manifest['files'].items()}
reviewpath=SCRATCH/'1370-c0-b-release-109-tick-independent-source-review-20261008-r2/RECEIPT.json'
review=json.loads(read(reviewpath,{'sha256':record['independentSourceReviewSha256']}))
assert review['manifestSha256']==record['sourceManifestSha256'] and review['observedControls'] is False
helperpin=manifest['externalPins']['acceptedLaneHelper'];read(helperpin['path'],helperpin)
route=json.loads(read(manifest['externalPins']['routeManifest']['path'],manifest['externalPins']['routeManifest']))
counts={'test-recorder-red.py':15,'test-json-cap-red.py':4,'test-retention-red.mjs':4,
        'test-streaming-red.mjs':21,'test-continuation-recorder-red.py':5,'test-targeted-red.mjs':4}
assert [r['file'] for r in record['records']]==list(counts)
outcomes=[]
for entry in record['records']:
    name=entry['file'];argv=entry['argv'];logpath=RECORDED/(name+'.lane.log')
    assert argv[:4]==['/bin/bash',helperpin['path'],'0',str(logpath)]
    assert argv[-1]==str(SOURCE/name)
    assert entry['sourceSha256']==manifest['files'][name]['sha256']
    assert entry['actualExit']==0 and entry['timedOut'] is False and entry['helperGroupClear'] is True
    assert 0<entry['elapsedSeconds']<10
    log=read(logpath);metadata=read(str(logpath)+'.meta').decode()
    assert len(log)<=1048576 and 'waiting for pid 0; then: '+' '.join(argv[4:])+'; ' in metadata
    assert len(re.findall(r'^start; ',metadata,re.M))==1 and len(re.findall(r'^end, exit 0; ',metadata,re.M))==1
    if name.endswith('.py'):
        assert argv[4:7]==['/usr/local/Cellar/python@3.14/3.14.4_1/Frameworks/Python.framework/Versions/3.14/bin/python3.14','-I','-B']
        assert re.search(rb'Ran '+str(counts[name]).encode()+rb' tests in [0-9.]+s\n\nOK\n\Z',log)
        assert log.splitlines()[0]==b'.'*counts[name]
    else:
        assert argv[4]=='/Users/zacheryspector/.nvm/versions/node/v22.23.2/bin/node'
        text=log.decode()
        if name=='test-retention-red.mjs':assert text=='retention helper 4/4\n'
        else:
            expected=re.findall(r"^test\('([^']+)'",files[name].decode(),re.M)
            actual=re.findall(r'^PASS (.+)$',text,re.M)
            assert expected==actual and len(actual)==counts[name]
            assert text.endswith(('streaming' if 'streaming' in name else 'targeted')+' controls '+str(counts[name])+'/'+str(counts[name])+'\n')
    try:os.killpg(entry['helperPgid'],0)
    except ProcessLookupError:pass
    else:raise AssertionError('Recorded helper group still present')
    outcomes.append({'file':name,'passed':counts[name],'actualHelperExit':0,'metaExit':0,
                     'recordedHelperPgid':entry['helperPgid'],'freshHelperGroupAbsent':True})
prefixes=('b-release-r2-red-','b-release-r3-json-red-','b109-stream-red-','b109-unfilled-')
leftovers=[entry.name for entry in os.scandir(SCRATCH) if entry.name.startswith(prefixes)]
assert not leftovers
assert not [p.name for p in SOURCE.iterdir() if p.is_dir()]
assert sum(counts.values())==53
result={'schema':'1370-b109-r2-observed-source-control-audit-r1','sourceManifestSha256':record['sourceManifestSha256'],
        'parentToolOutcomeSha256':'f338304cdf88ef7b6cbedb2621654c5b6f191db6e6fc5a35f69d0428729e21d1',
        'observedControlsPassed':53,'outcomes':outcomes,'fixturePrefixesAbsent':list(prefixes),
        'sourcePackageHasNoBytecodeDirectories':True,'actualNodeControlsPath':'/Users/zacheryspector/.nvm/versions/node/v22.23.2/bin/node',
        'requiredContinuationRuntime':route['runtime'],'qualificationGap':'Pure Node observations were Node22; actual continuation is pinned Node20. Parent-granted29 Node20-only controls remain pending.',
        'parentReportedOuterTool':{'session':13363,'actualExit':0,'basis':'Parent message; recorded six individual actual/meta exits independently corroborated.'},
        'pins':list(pins.values()),'repeatControlsRun':False,'gameRun':False,'gzipDecoded':False,'gitCommands':False,
        'productionOrCopiedRootReads':False}
b=(json.dumps(result,sort_keys=True,indent=2)+'\n').encode()
fd=os.open(OUT/'AUDIT.json',os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
with os.fdopen(fd,'wb') as f:f.write(b);f.flush();os.fsync(f.fileno())
print(json.dumps({'auditSha256':hashlib.sha256(b).hexdigest(),'auditBytes':len(b),'observedPasses':53}))
