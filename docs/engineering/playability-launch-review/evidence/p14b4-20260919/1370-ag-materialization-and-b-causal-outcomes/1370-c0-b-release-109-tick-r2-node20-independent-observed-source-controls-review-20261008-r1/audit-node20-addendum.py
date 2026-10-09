"""Bounded recorded-control audit and streaming binary hash; executes no controls/game."""
from pathlib import Path
import hashlib
import json
import os
import re
import stat

SCRATCH=Path('/Users/zacheryspector/studio-scratch')
SOURCE=SCRATCH/'1370-c0-b-release-109-tick-source-proposal-20261008-r2'
RECORDED=SCRATCH/'1370-c0-b-release-109-tick-r2-node20-controls-recorded-20261008-r1'
OUT=Path(__file__).parent
pins={}
def metadata(s):return (s.st_dev,s.st_ino,s.st_mode,s.st_nlink,s.st_size,s.st_mtime_ns,s.st_ctime_ns)
def read(p,expected=None):
    p=Path(p);a=p.lstat();assert stat.S_ISREG(a.st_mode) and a.st_nlink==1 and a.st_size<=16777216
    fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
    try:
        assert metadata(os.fstat(fd))==metadata(a);b=b''
        while True:
            chunk=os.read(fd,min(65536,16777217-len(b)))
            if not chunk:break
            b+=chunk;assert len(b)<=16777216
        assert metadata(os.fstat(fd))==metadata(a)==metadata(p.lstat())
    finally:os.close(fd)
    pin={'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
    if expected:
        assert pin['sha256']==expected['sha256']
        if 'bytes' in expected:assert pin['bytes']==expected['bytes']
    pins[str(p)]=pin;return b
manifest=json.loads(read(SOURCE/'MANIFEST.json',{'sha256':'67945d92e6a330f98482a893cb9a39005e7eed9fcc428b5c1d3a339cca116578'}))
files={n:read(SOURCE/n,pin) for n,pin in manifest['files'].items()}
parent=json.loads(read(RECORDED/'PARENT-TOOL-OUTCOME.json',{'sha256':'7004afcd98b81f72f5b046b5b3bc51588cc0957ff6cdb2a9b762367f656c5bc5'}))
assert parent['sourceManifestSha256']==pins[str(SOURCE/'MANIFEST.json')]['sha256'] and parent['gameRun'] is False
route=json.loads(read(manifest['externalPins']['routeManifest']['path'],manifest['externalPins']['routeManifest']))
runtime=route['runtime'];assert (parent['nodePath'],parent['nodeSha256'])==(runtime['nodePath'],runtime['nodeSha256'])
assert parent['nodeVersion']=='v20.20.2'
node=Path(runtime['nodePath']);a=node.lstat();assert node.resolve()==node and stat.S_ISREG(a.st_mode) and a.st_nlink==1
fd=os.open(node,os.O_RDONLY|os.O_NOFOLLOW);digest=hashlib.sha256()
try:
    assert metadata(os.fstat(fd))==metadata(a)
    while True:
        b=os.read(fd,1048576)
        if not b:break
        digest.update(b)
    assert metadata(os.fstat(fd))==metadata(a)==metadata(node.lstat())
finally:os.close(fd)
assert digest.hexdigest()==runtime['nodeSha256']
pins[str(node)]={'path':str(node),'bytes':a.st_size,'sha256':digest.hexdigest()}
interimPath=SCRATCH/'1370-c0-b-release-109-tick-r2-independent-observed-source-controls-review-20261008-r1/RECEIPT.json'
interim=json.loads(read(interimPath,{'sha256':'025d761f92850a39471e5e98d45e3834f057abbc7848a5139749d7a758a3505a'}))
assert interim['sourceManifestSha256']==parent['sourceManifestSha256'] and interim['observedPasses']==53
read(SCRATCH/'1370-c0-b-release-109-tick-independent-source-review-20261008-r2/RECEIPT.json',{'sha256':'36b8fb13854b10a17159d2f5bd59d80fbd3eff7c5184c7444ecd21917d641a9f'})
helper=manifest['externalPins']['acceptedLaneHelper'];read(helper['path'],helper)
expected={'test-retention-red.mjs':4,'test-streaming-red.mjs':21,'test-targeted-red.mjs':4}
assert [v['file'] for v in parent['records']]==list(expected)
outcomes=[]
for record in parent['records']:
    name=record['file'];path=RECORDED/(name+'.lane.log');argv=record['argv']
    assert argv==['/bin/bash',helper['path'],'0',str(path),runtime['nodePath'],str(SOURCE/name)]
    assert record['actualExit']==0 and record['helperGroupClear'] is True and 0<record['elapsedSeconds']<10
    log=read(path).decode();meta=read(str(path)+'.meta').decode()
    assert len(log.encode())<=1048576
    assert 'waiting for pid 0; then: '+' '.join(argv[4:])+'; ' in meta
    assert len(re.findall(r'^start; ',meta,re.M))==1 and len(re.findall(r'^end, exit 0; ',meta,re.M))==1
    if name=='test-retention-red.mjs':assert log=='retention helper 4/4\n'
    else:
        names=re.findall(r"^test\('([^']+)'",files[name].decode(),re.M)
        assert names==re.findall(r'^PASS (.+)$',log,re.M) and len(names)==expected[name]
        assert log.endswith(('streaming' if 'streaming' in name else 'targeted')+' controls '+str(expected[name])+'/'+str(expected[name])+'\n')
    try:os.killpg(record['helperPgid'],0)
    except ProcessLookupError:pass
    else:raise AssertionError('Recorded helper group present')
    outcomes.append({'file':name,'observedPassed':expected[name],'actualHelperExit':0,'metaExit':0,'freshHelperGroupAbsent':record['helperPgid']})
prefixes=('b-release-r2-red-','b-release-r3-json-red-','b109-stream-red-','b109-unfilled-')
assert not [p.name for p in os.scandir(SCRATCH) if p.name.startswith(prefixes)]
assert not [p.name for p in SOURCE.iterdir() if p.is_dir()]
result={'schema':'1370-b109-r2-node20-observed-addendum-audit-r1','sourceManifestSha256':parent['sourceManifestSha256'],
        'parentToolOutcomeSha256':'7004afcd98b81f72f5b046b5b3bc51588cc0957ff6cdb2a9b762367f656c5bc5',
        'priorInterimReceiptSha256':'025d761f92850a39471e5e98d45e3834f057abbc7848a5139749d7a758a3505a',
        'actualRuntimeNodeSha256FreshAuthenticated':digest.hexdigest(),'observedAdditionalNode20Passes':29,
        'qualifiedDistinctControls':53,'basis':'Existing24 Python passes plus these29 actual pinned Node20 passes; prior29 Node22 passes preserved separately.',
        'outcomes':outcomes,'fixturePrefixesAbsent':list(prefixes),'sourcePackageHasNoBytecodeDirectories':True,
        'parentReportedOuterTool':{'session':94556,'actualExit':0,'basis':'Parent message corroborated by all three recorded actual/meta exits.'},
        'reviewRepeatedControls':False,'gameRun':False,'gzipDecoded':False,'gitCommands':False,
        'productionOrCopiedRootReads':False,'pins':list(pins.values())}
b=(json.dumps(result,sort_keys=True,indent=2)+'\n').encode();fd=os.open(OUT/'AUDIT.json',os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
with os.fdopen(fd,'wb') as f:f.write(b);f.flush();os.fsync(f.fileno())
print(json.dumps({'auditSha256':hashlib.sha256(b).hexdigest(),'auditBytes':len(b),'additionalPasses':29,'qualifiedDistinct':53,'nodeBinaryBytes':a.st_size}))
