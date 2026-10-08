"""Bounded E0G→EBG adoption full Save46 diagnostic. Scratch proposal; independent review required."""
from __future__ import annotations
import collections, hashlib, io, json, math, os, pathlib, re, signal, stat, subprocess, sys, tarfile, time, zlib

ROOT=pathlib.Path('/Users/zacheryspector/The-Movies-headless-program')
PKG=pathlib.Path('/Users/zacheryspector/studio-scratch/1370-e0g-ebg-b-only-adoption-comparator-proposal-r2')
OUT=pathlib.Path('/Users/zacheryspector/studio-scratch/1370-e0g-ebg-b-only-adoption-comparator-runs-r2')
DESIGN=pathlib.Path('/Users/zacheryspector/studio-scratch/1370-e0g-ebg-b-only-residual-design-r1')
INPUT_SHA='f767f13f3212776f0b857b2ad146ca571b6a5c4813a8bcb2585f4536df01a93c'
DESIGN_RECEIPT=pathlib.Path('/Users/zacheryspector/studio-scratch/1370-e0g-ebg-b-only-residual-design-independent-review-r1/RECEIPT.json')
DESIGN_RECEIPT_SHA='4244d3eefc004307a1e8f0552deda79b40acf0dfad70725fc0d5b9d4c51d2ecb'
HEAD='b97129610a07d3529fc482daeddc0cd9bf798713'
PREDECESSOR='b995a83e5363a3843f9b902e08c2df4dd95840cb'
TREE='13880d9b0ba72aff5d4c5bcf5d12fe682c5de554'
BASE_TIP='3504c5ef5e8abbe471c8d4fae8db82c04dd57ec7'
TIP='d8cb45ee094bd8647e19ebed7b63ce2d773dacd4'
SEED='p13-public-commercial-adoption'
ROW_CAP=16<<20; LOGICAL_CAP=1536<<20; COMPRESSED_CAP=160<<20; OUTPUT_CAP=256<<20
DEADLINE=900; FLOOR=3<<30
START=None

class Stop(Exception):pass
def require(value,reason):
    if not value:raise Stop(reason)
def sha(data):return hashlib.sha256(data).hexdigest()
def command(*args):return subprocess.check_output(args,cwd=ROOT,text=True,timeout=30).strip()
def no_symlink_parents(path):
    path=pathlib.Path(path);require(path.is_absolute() and '..' not in path.parts,'unsafe path')
    for parent in path.parents:
        st=parent.lstat();require(stat.S_ISDIR(st.st_mode),'symlink/non-directory parent '+str(parent))
def safe_read(path,pin,cap=2<<20):
    path=pathlib.Path(path);no_symlink_parents(path);s=path.lstat()
    require(stat.S_ISREG(s.st_mode) and s.st_nlink==1 and 0<=s.st_size<=cap,'unsafe file '+str(path))
    fd=os.open(path,os.O_RDONLY|os.O_NOFOLLOW)
    try:
        s2=os.fstat(fd);require((s.st_dev,s.st_ino,s.st_size,s.st_mtime_ns)==(s2.st_dev,s2.st_ino,s2.st_size,s2.st_mtime_ns),'file changed '+str(path))
        data=os.read(fd,cap+1);require(len(data)==s.st_size and len(data)<=cap,'size changed '+str(path))
    finally:os.close(fd)
    require(sha(data)==pin['sha256'] and len(data)==pin['bytes'],'pin mismatch '+str(path))
    return data
def json_pin(pin,cap=2<<20):return json.loads(safe_read(pin['path'],pin,cap),parse_constant=lambda x:(_ for _ in ()).throw(Stop('nonfinite JSON')))
def ac_power():
    try:
        p=subprocess.run(['pmset','-g','batt'],cwd=ROOT,text=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=10)
    except (OSError,subprocess.TimeoutExpired) as exc:
        raise Stop('AC power unavailable or uncheckable') from exc
    first=p.stdout.splitlines()[0].strip() if p.stdout.splitlines() else ''
    require(p.returncode==0 and first=="Now drawing from 'AC Power'",'AC power unavailable or uncheckable')
def free():
    ac_power()
    fs=os.statvfs(OUT.parent);n=fs.f_bavail*fs.f_frsize
    require(n>=FLOOR+OUTPUT_CAP+(256<<20),'insufficient output/headroom');return n
def guard_repository():
    require(command('git','rev-parse','HEAD')==HEAD,'HEAD drift')
    require(command('git','status','--porcelain=v1')=='','dirty production')
    require(command('git','rev-parse','HEAD:src')==TREE,'source tree drift')
    require(command('git','merge-base',PREDECESSOR,HEAD)==PREDECESSOR,'predecessor not ancestor')
    require(command('git','ls-remote','origin','refs/heads/wip/headless-program-20260916-ts').split()[0]==HEAD,'remote production drift')
    require(command('git','ls-remote','origin','refs/heads/evidence/1370-r10-clean-captures').split()[0]==TIP,'remote evidence drift')
    require(command('git','merge-base',BASE_TIP,TIP)==BASE_TIP,'evidence baseline not ancestor')
def guard_lane(run_id):
    lane=pathlib.Path('/Users/zacheryspector/studio-scratch/heavy-queue/1370-e0g-ebg-b-only-adoption-'+run_id+'.lane.log')
    lock=pathlib.Path('/Users/zacheryspector/studio-scratch/HEAVY-LANE-LOCK')
    require(lock.is_file() and not lock.is_symlink() and lock.read_text().startswith('lane-run '+lane.name+', started '),'heavy lane lock')
    parent=subprocess.check_output(['ps','-ww','-p',str(os.getppid()),'-o','command='],text=True,timeout=10).strip()
    require('lane-run.sh' in parent and str(lane) in parent and 'launch.py' in parent,'heavy lane parent')
def source_map(data):
    m=json_pin({'path':data['roleSourceMap']['path'],'sha256':data['roleSourceMap']['sha256'],'bytes':pathlib.Path(data['roleSourceMap']['path']).stat().st_size},1<<20)
    changed=m['changedProductionPaths'];require(m['productionFiles']==188 and len(changed)==8 and len(m['inheritedProductionPaths'])==180,'8/180 source cardinality')
    require(changed==['src/core/employment.ts','src/core/hollywoodPolicy.ts','src/core/hollywoodTick.ts','src/core/hollywoodValidation.ts','src/core/rivalResearch.ts','src/core/save.ts','src/core/talentMarket.ts','src/core/technologyRival.ts'],'unexpected B overlay')
    e=m['e0g'];b=m['ebg'];require(len(e)==len(b)==188 and set(e)==set(b) and set(changed)=={p for p in e if e[p]!=b[p]},'source map mismatch')
    require(all(e[p]==b[p] for p in m['inheritedProductionPaths']),'inherited drift')
    for label,inventory in (('e0g',e),('ebg',b)):
        base=pathlib.Path(m[label+'ProductionSource'])
        for rel,pin in inventory.items():
            require(rel.startswith('src/') and '..' not in rel.split('/') and re.fullmatch('[0-9a-f]{64}',pin),'unsafe source roster')
            path=base/rel;st=path.lstat()
            no_symlink_parents(path)
            require(stat.S_ISREG(st.st_mode) and st.st_nlink==1 and st.st_size<=4<<20,'unsafe source file '+rel)
            fd=os.open(path,os.O_RDONLY|os.O_NOFOLLOW)
            try:
                h=hashlib.sha256()
                while chunk:=os.read(fd,1<<16):h.update(chunk)
                st2=os.fstat(fd);require((st.st_dev,st.st_ino,st.st_size,st.st_mtime_ns)==(st2.st_dev,st2.st_ino,st2.st_size,st2.st_mtime_ns),'source changed '+rel)
            finally:os.close(fd)
            require(h.hexdigest()==pin,'source byte drift '+rel)
    return {'mapSha256':data['roleSourceMap']['sha256'],'changed':changed,'inherited':180}
def authenticate(pins,data):
    require(pins['schema']=='1370-e0g-ebg-b-only-adoption-inputs-r2' and pins['classification']=='PINNED_DIAGNOSTIC_INPUTS_NO_COMPARISON','adoption input version')
    require(data['schema']=='1370-e0g-ebg-b-only-residual-inputs-design-r1' and data['ebgAdoption']=='PENDING_FRESH_OBSERVED_CLEAN_AND_VERSIONED_PIN_SET','original design version')
    require((data['publishedProductionHead'],data['capturePredecessor'],data['sourceTree'],data['evidenceTip'])==(HEAD,PREDECESSOR,TREE,BASE_TIP),'original design source pins')
    require((pins['sourceHead'],pins['capturePredecessor'],pins['sourceTree'],pins['baselineEvidenceTip'],pins['currentEvidenceTip'],pins['seed'],pins['horizonTicks'],pins['boundaries'],pins['e0gStage'])==(HEAD,PREDECESSOR,TREE,BASE_TIP,TIP,SEED,416,417,32),'new input roles/horizon')
    require(pins['e0gProofKeys']==['businesses','cuttingNull','periods','positiveZeroRefund'] and pins['ebgProofKeys']==['businesses','cuttingActive','cuttingNull','periods','positiveZeroRefund'],'era proof schema')
    require(pins['designInputs']=={'path':str(DESIGN/'INPUTS.json'),'sha256':'bc29a5e796656fbc8fa5640ebadb1995b1c3a9fcd7ed8f01af98d9bca8264f90'},'design pointer')
    receipt=json.loads(safe_read(DESIGN_RECEIPT,{'sha256':DESIGN_RECEIPT_SHA,'bytes':DESIGN_RECEIPT.stat().st_size}))
    require(receipt.get('decision')=='ACCEPT_DESIGN_ONLY' and pins['designReceipt']['sha256']==DESIGN_RECEIPT_SHA,'design not accepted')
    stage=data['stages']['32'];ebg=pins['ebg']
    require(stage['role']=='E0G' and stage['seed']==SEED and stage['archive']['type']=='uncompressed-tar' and stage['archive']['sha256']==pins['e0gArchiveSha256'],'wrong archived arm')
    for v in stage['authority'].values():
        r=json_pin(v);require(r.get('decision')==v['decision'],'stage32 authority')
    observed=json_pin(stage['authority']['OBSERVED-RECEIPT.json'])
    require(observed['arm']=='E0G' and observed['seed']==SEED and observed['members']==417 and observed['boundariesSha256']==stage['members']['target/boundaries.ndjson.gz']['sha256'] and observed['targetResultSha256']==stage['members']['target/RESULT.json']['sha256'] and observed['outerResultSha256']==stage['members']['outer/RESULT.json']['sha256'] and observed['summarySha256']==stage['members']['target/summary.json']['sha256'],'stage32 observed linkage')
    remote=json_pin(stage['authority']['REMOTE-AUDIT-RECEIPT.json'])
    require(remote['remoteCommit']==BASE_TIP and remote['sourceHead']==PREDECESSOR and remote['sourceTree']==TREE,'stage32 remote receipt linkage')
    require(subprocess.run(['git','merge-base','--is-ancestor',remote['remoteCommit'],TIP],cwd=ROOT,timeout=30).returncode==0,'stage32 publication ancestry')
    report_path=pathlib.Path(stage['authority']['REMOTE-AUDIT-RECEIPT.json']['path']).with_name('REMOTE-AUDIT-REPORT.json')
    report=json_pin({'path':str(report_path),'sha256':remote['auditReportSha256'],'bytes':report_path.stat().st_size})
    require(report['decision']=='ACCEPT_REMOTE_E0G_ADOPTION_ARCHIVE_BYTE_PRESERVATION_ONLY' and report['remoteCommit']==remote['remoteCommit'] and report['manifestSha256']==stage['packageManifestSha256'] and report['archiveSha256']==stage['archive']['sha256'] and report['sourceRetained'] is True,'stage32 remote report linkage')
    roster=json_pin({'path':pins['adoptionRoster']['path'],'sha256':pins['adoptionRoster']['sha256'],'bytes':pathlib.Path(pins['adoptionRoster']['path']).stat().st_size})
    require(roster['schema']=='1370-ebg-adoption-github-backup-source-roster-r1' and roster['productionHead']==HEAD and roster['sourceTree']==TREE,'EBG roster role')
    files={v['member']:v for v in roster['adoption']['files']}
    required={'outerResult':'adoption/outer/RESULT.json','outerSidecar':'adoption/outer/RESULT.sha256.json','targetResult':'adoption/target/RESULT.json','targetSidecar':'adoption/target/RESULT.sha256.json','summary':'adoption/target/summary.json','readback':'adoption/target/readback-audit.json','progress':'adoption/target/progress.ndjson','vitest':'adoption/target/vitest.json','boundaries':'adoption/target/boundaries.ndjson.gz','observedReceipt':'adoption/observed/RECEIPT.json','routeManifest':'adoption/route/MANIFEST.json'}
    require(set(ebg)==set(required),'EBG input roster')
    for role,name in required.items():
        row=files[name];require(ebg[role]=={'path':row['sourcePath'],'sha256':row['sha256'],'bytes':row['bytes']},'EBG source pin '+role)
    er=json_pin(ebg['observedReceipt'])
    require(er['decision']=='ACCEPT_OBSERVED_EBG_ADOPTION_CLEAN_EXPLORATORY_ONLY' and er['targetResultSha256']==ebg['targetResult']['sha256'] and er['outerResultSha256']==ebg['outerResult']['sha256'] and er['manifestSha256']==ebg['routeManifest']['sha256'],'EBG observed linkage')
    stage35=json_pin({'path':pins['stage35RemoteObserved']['path'],'sha256':pins['stage35RemoteObserved']['sha256'],'bytes':pathlib.Path(pins['stage35RemoteObserved']['path']).stat().st_size})
    raw_remote=json_pin({'path':pins['stage35RemoteRaw']['path'],'sha256':pins['stage35RemoteRaw']['sha256'],'bytes':pathlib.Path(pins['stage35RemoteRaw']['path']).stat().st_size})
    require(stage35['decision']=='ACCEPT_OBSERVED_REMOTE_EVIDENCE_BYTES_ONLY' and stage35['remoteCommit']==TIP and stage35['directParent']=='15bda3eefedb2d00f74b65b143199f5f8be77d15' and stage35['remoteReceiptSha256']==pins['stage35RemoteRaw']['sha256'],'stage35 observed remote')
    require(raw_remote['status']=='ACCEPT_REMOTE_STAGE35_EVIDENCE_BYTES_ONLY' and raw_remote['remoteCommit']==TIP and raw_remote['archiveSha256']=='8070202a82fd9cb23474eee632ab44798dbe4bcbb636d58f0e97d59a0e24b3f5' and raw_remote['fileCount']==41 and raw_remote['archiveMemberCount']==30,'stage35 raw remote')
    require(any(x['path'].endswith('/source/OBSERVED-RECEIPT.json') and x['sha256']==ebg['observedReceipt']['sha256'] for x in raw_remote['files']),'remote EBG receipt byte linkage')
    require(any(x['member']=='adoption/target/boundaries.ndjson.gz' and x['sha256']==ebg['boundaries']['sha256'] for x in raw_remote['archiveMembers']),'remote EBG boundary byte linkage')
    s=source_map(data)
    manifest_bytes=safe_read(stage['packageManifest'],{'sha256':stage['packageManifestSha256'],'bytes':pathlib.Path(stage['packageManifest']).stat().st_size},4<<20)
    manifest=json.loads(manifest_bytes)
    require(manifest['archive']['sha256']==stage['archive']['sha256'] and manifest['pin']['arm']=='E0G' and manifest['pin']['seed']==SEED and manifest['pin']['head']==PREDECESSOR and manifest['pin']['sourceTree']==TREE,'stage32 manifest linkage')
    member_map={x['path']:x for x in manifest['members']}
    require(all(member_map[k]['sha256']==v['sha256'] and member_map[k]['bytes']==v['bytes'] for k,v in stage['members'].items()),'stage32 selected member pins')
    require(command('git','cat-file','-e',TIP+'^{commit}')=='','evidence tip missing')
    manifest_remote=stage['parts'][0]['remotePath'].rsplit('/',1)[0]+'/MANIFEST.json'
    require(sha(subprocess.check_output(['git','show',TIP+':'+manifest_remote],cwd=ROOT,timeout=30))==stage['packageManifestSha256'],'remote E0G archive manifest drift')
    for p in stage['parts']:
        remote_part=command('git','ls-tree',TIP,p['remotePath']).split()
        require(len(remote_part)>=3 and remote_part[0]=='100644' and remote_part[1]=='blob' and remote_part[2]==p['gitOid'],'remote E0G part OID drift')
    return stage,ebg,manifest,s

class Parts(io.RawIOBase):
    def __init__(self,pins):self.pins=pins;self.index=0;self.fd=None
    def readable(self):return True
    def read(self,n=-1):
        require(n>=0,'unbounded archive read');out=bytearray()
        while len(out)<n and self.index<len(self.pins):
            if self.fd is None:self.fd=os.open(self.pins[self.index]['path'],os.O_RDONLY|os.O_NOFOLLOW)
            chunk=os.read(self.fd,min(n-len(out),1<<20))
            if chunk:out+=chunk
            else:os.close(self.fd);self.fd=None;self.index+=1
        return bytes(out)
    def close(self):
        if self.fd is not None:os.close(self.fd);self.fd=None
        super().close()
def check_parts(stage):
    whole=hashlib.sha256();total=0
    for pin in stage['parts']:
        ac_power()
        path=pathlib.Path(pin['path']);st=path.lstat()
        no_symlink_parents(path)
        require(stat.S_ISREG(st.st_mode) and st.st_nlink==1 and st.st_size==pin['bytes'],'unsafe archive part')
        h=hashlib.sha256();git=hashlib.sha1();git.update(('blob '+str(st.st_size)+'\0').encode())
        fd=os.open(path,os.O_RDONLY|os.O_NOFOLLOW)
        try:
            while c:=os.read(fd,1<<20):
                h.update(c);git.update(c);whole.update(c);total+=len(c)
                if total%(8<<20)<len(c):ac_power()
            after=os.fstat(fd);require((after.st_dev,after.st_ino,after.st_size,after.st_mtime_ns)==(st.st_dev,st.st_ino,st.st_size,st.st_mtime_ns),'part changed')
        finally:os.close(fd)
        require(h.hexdigest()==pin['sha256'] and git.hexdigest()==pin['gitOid'],'archive part digest/OID')
    require(total==stage['archive']['bytes'] and whole.hexdigest()==stage['archive']['sha256'],'whole archive digest')
def archive_selected(stage):
    selected=set(stage['members']);found={};bounds=None
    with Parts(stage['parts']) as parts,tarfile.open(fileobj=parts,mode='r|') as tar:
        for member in tar:
            ac_power()
            name=member.name
            require(not name.startswith('/') and '\\' not in name and '..' not in name.split('/'),'tar traversal')
            if name not in selected:continue
            require(name not in found and member.isfile() and not member.issym() and not member.islnk(),'duplicate/unsafe selected member')
            pin=stage['members'][name];require(member.size==pin['bytes'] and member.size<=COMPRESSED_CAP,'selected member size')
            f=tar.extractfile(member);require(f is not None,'tar selected member unreadable')
            raw=f.read(member.size+1);require(len(raw)==member.size and sha(raw)==pin['sha256'],'selected member digest')
            if name=='target/boundaries.ndjson.gz':bounds=raw
            else:found[name]=raw
    require(set(found)==selected-{'target/boundaries.ndjson.gz'} and bounds is not None,'missing selected members')
    return found,bounds
def linked_controls(raws,role):
    def get(name):return json.loads(raws[name],parse_constant=lambda x:(_ for _ in ()).throw(Stop('nonfinite control')))
    t=get('target/RESULT.json');o=get('outer/RESULT.json');su=get('target/summary.json');rb=get('target/readback-audit.json')
    require(t['status']==o['status']=='STAGE_PASS' and t['stagePassed'] and o['stagePassed'],'failed route')
    require(t['seed']==o['seed']==su['seed']==SEED and t['arm']==o['arm']==su['role']==role,'control role/seed')
    require(su['boundaries']==417 and su['ticks']==416 and su['version']==46 and rb['rows']==417,'control horizon/save')
    require(rb['rawSha256']==su['boundarySha256'] and rb['rawBytes']==su['boundaryBytes'],'readback linkage')
    require(get('target/RESULT.sha256.json')['sha256']==sha(raws['target/RESULT.json']) and get('outer/RESULT.sha256.json')['sha256']==sha(raws['outer/RESULT.json']),'result sidecar')
    require(t['cleanArtifacts']['summarySha256']==sha(raws['target/summary.json']) and t['cleanArtifacts']['boundariesSha256']==su['boundaryCompressedSha256'],'target artifact linkage')
    require(t['cleanArtifacts']['readbackAuditSha256']==sha(raws['target/readback-audit.json']) and t['cleanArtifacts']['progressSha256']==sha(raws['target/progress.ndjson']) and t['cleanArtifacts']['vitestSha256']==sha(raws['target/vitest.json']),'target side evidence linkage')
    vi=get('target/vitest.json');require(vi['success'] is True and vi['numFailedTests']==0 and vi['numPassedTests']==2,'capture Vitest failed')
    require(o['targetResultSha256']==sha(raws['target/RESULT.json']),'outer-target linkage')
    require(t['child']['exit']==o['childExit']==0 and t['child']['timedOut'] is False and o['ownershipErrors']==o['survivors']==[] and all(o['cleanup'].values()),'child/cleanup')
    require(t['child']['elapsedCapSeconds']==720 and o['deadlineSeconds']==750,'approved exploratory cap')
    return su
def ebg_controls(pins):
    raws={'target/'+k:pins[v] for k,v in [('RESULT.json','targetResult'),('RESULT.sha256.json','targetSidecar'),('summary.json','summary'),('readback-audit.json','readback'),('progress.ndjson','progress'),('vitest.json','vitest')]}
    raws['outer/RESULT.json']=pins['outerResult'];raws['outer/RESULT.sha256.json']=pins['outerSidecar']
    return {k:safe_read(v['path'],v,COMPRESSED_CAP if k.endswith('boundaries.ndjson.gz') else 2<<20) for k,v in raws.items()}
def primitive(a,b):
    if type(a)!=type(b):return False
    if type(a)==float and a==0 and b==0:return math.copysign(1,a)==math.copysign(1,b)
    return a==b
def first(a,b,p='$'):
    if type(a)!=type(b):return {'path':p,'leftType':type(a).__name__,'rightType':type(b).__name__}
    if isinstance(a,dict):
        if list(a)!=list(b):return {'path':p+'.<keys>','left':list(a),'right':list(b)}
        for k in a:
            x=first(a[k],b[k],p+'.'+k)
            if x:return x
    elif isinstance(a,list):
        if len(a)!=len(b):return {'path':p+'.<length>','left':len(a),'right':len(b)}
        for i,(x,y) in enumerate(zip(a,b)):
            hit=first(x,y,p+'['+str(i)+']')
            if hit:return hit
    elif not primitive(a,b):return {'path':p,'left':a,'right':b}
    return None
def differences(a,b,p='$'):
    if type(a)!=type(b):yield p;return
    if isinstance(a,dict):
        if list(a)!=list(b):yield p+'.<keys>'
        for k in a:
            if k in b:yield from differences(a[k],b[k],p+'.'+k)
    elif isinstance(a,list):
        if len(a)!=len(b):yield p+'.<length>'
        for i,(x,y) in enumerate(zip(a,b)):yield from differences(x,y,p+'['+str(i)+']')
    elif not primitive(a,b):yield p
PAYLOAD=('originalState','save','owner','rng')
def payload_differences(a,b):
    require(all(k in a and k in b for k in PAYLOAD),'missing full-state payload')
    first_hit=None;paths=[]
    for key in PAYLOAD:
        hit=first(a[key],b[key],'$.'+key)
        if first_hit is None and hit is not None:first_hit=hit
        paths.extend(differences(a[key],b[key],'$.'+key))
    return first_hit,paths
def parse_int(raw):return -0.0 if raw=='-0' else int(raw)
def member_rows(raw,summary,role,expected=417):
    require(len(raw)<=COMPRESSED_CAP and sha(raw)==summary['boundaryCompressedSha256'] and len(raw)==summary['boundaryCompressedBytes'],'compressed stream pin')
    pos=0;logical=hashlib.sha256();logical_n=0
    for week in range(expected):
        require(pos<len(raw),'missing gzip member')
        start=pos
        d=zlib.decompressobj(16+zlib.MAX_WBITS);parts=[];n=0
        while not d.eof:
            before=pos;out=d.decompress(raw[pos:pos+(1<<16)],min(1<<20,ROW_CAP+1-n));n+=len(out)
            require(n<=ROW_CAP,'row cap')
            parts.append(out);consumed=min(1<<16,len(raw)-pos)-len(d.unconsumed_tail)-len(d.unused_data);pos+=consumed
            require(pos>before or out,'truncated/no progress gzip')
        line=b''.join(parts);require(line.endswith(b'\n') and line.count(b'\n')==1,'row framing')
        logical.update(line);logical_n+=len(line);require(logical_n<=LOGICAL_CAP,'logical cap')
        row=json.loads(line,parse_int=parse_int,parse_constant=lambda x:(_ for _ in ()).throw(Stop('nonfinite boundary')))
        require(row['boundary']==row['week']==week and row['role']==role and row['seed']==SEED,'boundary identity')
        require(row['save']['saveVersion']==46 and first(row['save']['state'],row['originalState']) is None and first(row['rng'],row['originalState']['rngState']) is None,'Save46/rng')
        yield row,{'sha256':sha(line),'bytes':len(line),'gzipOffsetStart':start,'gzipOffsetEnd':pos,'member':week}
    require(pos==len(raw),'extra gzip members')
    require(logical_n==summary['boundaryBytes'] and logical.hexdigest()==summary['boundarySha256'],'logical stream digest')
def b_proof(row,week,role):
    h=row['originalState']['hollywood'];businesses=h['businesses'];active=[];periods=0
    for b in businesses:
        cc=b['costCutting'];require(type(cc)==dict and list(cc)==['version','since'] and type(cc['version'])==int and cc['version']==1,'B leaf shape')
        since=cc['since']
        require(since is None if role=='E0G' else since is None or type(since)==int and 0<=since<=week,'illegal B state')
        if since is not None:
            require(not b.get('productions') and not b.get('runs'),'active B retains work')
            active.append((b['studioId'],since))
        for p in b['account']['periods']:
            refund=p['movements']['facilityDemolitionRefund'];require(type(refund) in (int,float) and refund==0 and math.copysign(1,refund)==1,'non-positive-zero refund')
            periods+=1
    require(all(r.get('kind')!='facilityDisposed' for r in h['receipts']),'facility disposal receipt')
    ep=row['emptyProof']
    expected={'businesses','periods','cuttingNull','positiveZeroRefund'}
    if role=='EBG':expected.add('cuttingActive')
    require(type(ep)==dict and set(ep)==expected,'recorder B proof schema mismatch')
    claimed_active=ep['cuttingActive'] if role=='EBG' else 0
    require(ep['businesses']==len(businesses) and ep['periods']==periods and ep['cuttingNull']==len(businesses)-len(active) and claimed_active==len(active) and ep['positiveZeroRefund']==periods,'recorded B proof mismatch')
    return {'businesses':len(businesses),'periods':periods,'active':active}
def b_episodes(left,right):
    def keyed(row):
        counts=collections.Counter();out=[]
        for order,b in enumerate(row['originalState']['hollywood']['businesses']):
            studio=b['studioId'];occ=counts[studio];counts[studio]+=1
            out.append({'identity':(studio,occ),'order':order,'since':b['costCutting']['since']})
        return out
    a=keyed(left);b=keyed(right);am={tuple(x['identity']):x for x in a};bm={tuple(x['identity']):x for x in b}
    return [{'identity':key,'left':am.get(key),'right':bm.get(key),'transition':('MISSING_LEFT' if key not in am else 'MISSING_RIGHT' if key not in bm else 'NULL_TO_ACTIVE' if am[key]['since'] is None and bm[key]['since'] is not None else 'ACTIVE_TO_NULL' if am[key]['since'] is not None and bm[key]['since'] is None else 'ACTIVE_CHANGE' if am[key]['since']!=bm[key]['since'] else 'SAME')} for key in list(am)+[x for x in bm if x not in am]]
def identity_stream(rows,kind):
    counts=collections.Counter();out=[]
    for i,r in enumerate(rows):
        require(type(r)==dict,'family row not object')
        if kind=='market':base=(r.get('week'),r.get('talentId'))
        elif kind=='industry':base=(r.get('week'),r.get('studioId'),r.get('kind'),r.get('subjectId',r.get('subject',r.get('productionId',r.get('talentId')))))
        elif kind=='employment':base=(r.get('talentId'),)
        elif kind=='takes':base=(r.get('productionId'),r.get('studioId'))
        elif kind=='datedTakes':base=(r.get('week'),r.get('productionId'),r.get('studioId'))
        elif kind=='cases':base=(r.get('talentId'),r.get('subjectStudioId'))
        else:base=(r.get('talentId'),r.get('issuerStudioId'))
        occ=counts[base];counts[base]+=1;out.append({'identity':base+(occ,),'sourceOrder':i,'row':r})
    return out
def family_rows(state,kind):
    if kind=='market':return state['talentMarket']['receipts']
    if kind=='cases':return state['talentMarket']['cases']
    if kind=='proposals':return state['talentMarket']['proposals']
    if kind=='industry':return state['hollywood']['receipts']
    if kind=='employment':return state['hollywood']['employment']
    return state['firstTakes']
def compare_family(a,b,kind):
    left=identity_stream(family_rows(a,kind),kind);right=identity_stream(family_rows(b,kind),kind)
    lm={tuple(x['identity']):x for x in left};rm={tuple(x['identity']):x for x in right}
    require(len(lm)==len(left) and len(rm)==len(right),'identity collision')
    changes=[];keys=list(lm)+[k for k in rm if k not in lm]
    for k in keys:
        x=lm.get(k);y=rm.get(k)
        status='MISSING_LEFT' if x is None else 'MISSING_RIGHT' if y is None else 'MATCHED' if first(x['row'],y['row']) is None else 'CHANGED'
        changes.append({'identity':k,'status':status,'leftOrder':None if x is None else x['sourceOrder'],'rightOrder':None if y is None else y['sourceOrder'],'left':None if x is None else x['row'],'right':None if y is None else y['row'],'eventIdShift':bool(x and y and x['row'].get('eventId')!=y['row'].get('eventId'))})
    return {'leftOrder':[x['identity'] for x in left],'rightOrder':[x['identity'] for x in right],'rows':changes}
def protected(state,summary):
    market=state['talentMarket']['receipts'];industry=state['hollywood']['receipts'];employment=state['hollywood']['employment'];takes=state['firstTakes']
    settled=[[r.get('eventId'),r.get('kind'),r.get('week'),r.get('talentId'),r.get('studioId'),r.get('reasons'),r.get('dropped')] for r in market if r.get('kind') in ('settled','declined','expired')]
    pre={'settlement':settled,'receipts':market,'employment':employment,'takes':takes}
    script="const fs=require('fs'),crypto=require('crypto');let x=JSON.parse(fs.readFileSync(0,'utf8'));let o={};for(let [k,v] of Object.entries(x))o[k]=crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');process.stdout.write(JSON.stringify(o));"
    p=subprocess.run(['node','-e',script],input=json.dumps(pre,ensure_ascii=False,separators=(',',':')),text=True,capture_output=True,timeout=30,check=True)
    actual=json.loads(p.stdout);expected=summary['terminal']
    require(all(actual[k]==expected[k] for k in pre),'protected JS digest mismatch')
    require((len(market),len(industry),len(employment),len(takes))==(expected['marketReceiptRows'],expected['industryReceiptRows'],expected['employmentRows'],expected['firstTakeRows']),'terminal preimage count')
    return {'preimages':pre,'digests':actual}
def compare(e0,ebg,sa,sb):
    index=[];firsts={};families=collections.Counter();terminal={}
    for week,((a,ai),(b,bi)) in enumerate(zip(member_rows(e0,sa,'E0G'),member_rows(ebg,sb,'EBG'),strict=True)):
        require(time.monotonic()-START<DEADLINE,'whole comparator timeout')
        ap=b_proof(a,week,'E0G');bp=b_proof(b,week,'EBG')
        x,paths=payload_differences(a,b)
        metadata_a={k:v for k,v in a.items() if k not in PAYLOAD}
        metadata_b={k:v for k,v in b.items() if k not in PAYLOAD}
        metadata_first=first(metadata_a,metadata_b)
        metadata_paths=list(differences(metadata_a,metadata_b))
        require(len(paths)<1_000_000,'difference count cap')
        for p in paths:families[p.split('[')[0]]+=1
        for label,pred in [('state',lambda p:p.startswith('$.originalState')),('B',lambda p:'costCutting' in p),('cash',lambda p:'cash' in p.lower()),('market',lambda p:'talentMarket.receipts' in p),('industry',lambda p:'hollywood.receipts' in p),('employment',lambda p:'hollywood.employment' in p),('takes',lambda p:'firstTakes' in p),('rng',lambda p:'rng' in p.lower())]:
            if label not in firsts:
                found=next((p for p in paths if pred(p)),None)
                if found:firsts[label]={'week':week,'path':found}
        index.append({'week':week,'e0g':ai,'ebg':bi,'firstPayloadDifference':x,'payloadDifferentPaths':paths,'firstObserverMetadataDifference':metadata_first,'observerMetadataDifferentPaths':metadata_paths,'e0gB':ap,'ebgB':bp,'bEpisodes':b_episodes(a,b)})
        if week==416:
            for kind in ('market','cases','proposals','industry','employment','takes','datedTakes'):
                terminal[kind]=compare_family(a['originalState'],b['originalState'],kind)
            terminal['protected']={'E0G':protected(a['originalState'],sa),'EBG':protected(b['originalState'],sb)}
        if week%52==0:free()
    return {'schema':'1370-e0g-ebg-b-bundle-adoption-full-save46-r2','classification':'DIAGNOSTIC_ONLY_NOT_1363_ACCEPTANCE','seed':SEED,'boundaries':417,'equalPayloadBoundaries':sum(x['firstPayloadDifference'] is None for x in index),'equalCompleteRows':sum(x['firstPayloadDifference'] is None and x['firstObserverMetadataDifference'] is None for x in index),'firstObserved':{k:firsts.get(k,'NO_OBSERVED_DIFFERENCE') for k in ('state','B','cash','market','industry','employment','takes','rng')},'unobservedInternalPredicates':'UNOBSERVED','pathFamilies':dict(families),'boundaryIndex':index,'terminal':terminal}
def atomic_json(path,obj,cap):
    no_symlink_parents(path)
    raw=(json.dumps(obj,ensure_ascii=False,sort_keys=True,separators=(',',':'))+'\n').encode();require(len(raw)<=cap,'output cap')
    tmp=path.with_name(path.name+'.tmp');fd=os.open(tmp,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
    try:
        offset=0
        while offset<len(raw):
            n=os.write(fd,raw[offset:]);require(n>0,'partial output write');offset+=n
        os.fsync(fd)
    except BaseException:
        os.close(fd);tmp.unlink(missing_ok=True);raise
    else:os.close(fd)
    os.replace(tmp,path);return sha(raw)
def main(run_id):
    global START
    START=globals().get('BOOTSTRAP_START');require(type(START)==float and START<=time.monotonic(),'no authenticated bootstrap clock')
    signal.signal(signal.SIGALRM,lambda *_:(_ for _ in ()).throw(Stop('whole comparator timeout')))
    signal.setitimer(signal.ITIMER_REAL,max(0.001,DEADLINE-(time.monotonic()-START)))
    require(re.fullmatch('[a-z0-9][a-z0-9-]{0,63}',run_id),'run id')
    leaf=None
    try:
        guard_lane(run_id);guard_repository();free()
        pins=json.loads(safe_read(PKG/'INPUTS.json',{'sha256':INPUT_SHA,'bytes':(PKG/'INPUTS.json').stat().st_size},1<<20))
        data=json.loads(safe_read(DESIGN/'INPUTS.json',{'sha256':pins['designInputs']['sha256'],'bytes':(DESIGN/'INPUTS.json').stat().st_size},1<<20))
        stage,ebg,manifest,source=authenticate(pins,data)
        no_symlink_parents(OUT)
        require(not os.path.lexists(OUT/run_id),'output collision')
        OUT.mkdir(mode=0o700,exist_ok=True);require(stat.S_ISDIR(OUT.lstat().st_mode),'unsafe output parent')
        leaf=OUT/run_id;leaf.mkdir(mode=0o700)
        check_parts(stage);archived,bounds=archive_selected(stage)
        sa=linked_controls(archived,'E0G');ebg_raw=ebg_controls(ebg)
        ebg_raw['target/boundaries.ndjson.gz']=safe_read(ebg['boundaries']['path'],ebg['boundaries'],COMPRESSED_CAP)
        sb=linked_controls(ebg_raw,'EBG')
        result=compare(bounds,ebg_raw['target/boundaries.ndjson.gz'],sa,sb)
        result['source']=source;result['inputsSha256']=INPUT_SHA;result['designInputsSha256']=pins['designInputs']['sha256'];result['stage32ArchiveSha256']=stage['archive']['sha256'];result['ebgObservedReceiptSha256']=ebg['observedReceipt']['sha256'];result['stage35RemoteObservedSha256']=pins['stage35RemoteObserved']['sha256'];result['elapsedSeconds']=time.monotonic()-START
        check_parts(stage);ebg_controls(ebg);safe_read(ebg['boundaries']['path'],ebg['boundaries'],COMPRESSED_CAP);source_map(data);guard_repository();free()
        result_sha=atomic_json(leaf/'RESULT.json',result,OUTPUT_CAP)
        atomic_json(leaf/'RECEIPT.json',{'status':'COMPLETED_DIAGNOSTIC_UNREVIEWED','resultSha256':result_sha,'runId':run_id,'elapsedSeconds':time.monotonic()-START},2<<20)
    except BaseException as exc:
        if leaf is not None and leaf.is_dir() and not (leaf/'RECEIPT.json').exists():
            try:atomic_json(leaf/'RECEIPT.json',{'status':'STOP','class':type(exc).__name__,'reason':str(exc)[:2000],'runId':run_id,'elapsedSeconds':time.monotonic()-START},2<<20)
            except BaseException:pass
        raise
    finally:signal.setitimer(signal.ITIMER_REAL,0)
