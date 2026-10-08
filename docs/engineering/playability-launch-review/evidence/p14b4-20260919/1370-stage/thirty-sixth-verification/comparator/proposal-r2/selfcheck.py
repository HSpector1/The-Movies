"""Fast synthetic positive/RED checks; never opens production archives."""
import copy, gzip, hashlib, importlib.util, io, json, pathlib, tarfile, tempfile

P=pathlib.Path(__file__).parent
spec=importlib.util.spec_from_file_location('candidate',P/'compare.py')
c=importlib.util.module_from_spec(spec);spec.loader.exec_module(c)
def red(name,fn):
    try:fn()
    except (c.Stop,ValueError,KeyError,TypeError):return name
    raise AssertionError('RED did not refuse: '+name)
def fake(role='E0G'):
    s={'market':{'tick':0},'rngState':[1,2,3,4],
       'hollywood':{'businesses':[{'studioId':'studio','costCutting':{'version':1,'since':None},'productions':[],'runs':[],'account':{'periods':[{'movements':{'facilityDemolitionRefund':0}}]}}],
                    'receipts':[],'employment':[]},
       'talentMarket':{'receipts':[],'cases':[],'proposals':[]},'firstTakes':[]}
    proof={'businesses':1,'periods':1,'cuttingNull':1,'positiveZeroRefund':1}
    if role=='EBG':proof['cuttingActive']=0
    return {'boundary':0,'week':0,'role':role,'seed':c.SEED,'originalState':s,'save':{'saveVersion':46,'state':copy.deepcopy(s)},'owner':None,'rng':[1,2,3,4],
            'emptyProof':proof}
def stream(row):
    line=(json.dumps(row,separators=(',',':'))+'\n').encode();raw=gzip.compress(line,mtime=0)
    return raw,{'boundaryCompressedSha256':hashlib.sha256(raw).hexdigest(),'boundaryCompressedBytes':len(raw),'boundarySha256':hashlib.sha256(line).hexdigest(),'boundaryBytes':len(line)}
def audit():
    checks=[];base=fake();raw,s=stream(base)
    from unittest import mock
    with mock.patch.object(c.subprocess,'run') as pm:
        pm.return_value.returncode=0;pm.return_value.stdout="Now drawing from 'AC Power'\n";c.ac_power()
        pm.return_value.stdout="Now drawing from 'Battery Power'\n";checks.append(red('battery power',c.ac_power))
        pm.return_value.stdout="";checks.append(red('unavailable power',c.ac_power))
        pm.return_value.stdout="Now drawing from 'AC Power'\n";pm.return_value.returncode=1;checks.append(red('pmset nonzero',c.ac_power))
        pm.side_effect=FileNotFoundError('pmset');checks.append(red('pmset missing',c.ac_power))
    assert list(c.member_rows(raw,s,'E0G',1))[0][0]==base;assert c.b_proof(base,0,'E0G')['active']==[]
    ebg=fake('EBG');assert c.b_proof(ebg,0,'EBG')['active']==[]
    badproof=copy.deepcopy(base);badproof['emptyProof']['cuttingActive']=0
    checks.append(red('E0G unexpected active proof field',lambda:c.b_proof(badproof,0,'E0G')))
    badproof=copy.deepcopy(ebg);del badproof['emptyProof']['cuttingActive']
    checks.append(red('EBG missing active proof field',lambda:c.b_proof(badproof,0,'EBG')))
    badproof=copy.deepcopy(ebg);badproof['emptyProof']['cuttingActive']=1
    checks.append(red('EBG wrong active proof value',lambda:c.b_proof(badproof,0,'EBG')))
    assert c.first(base,copy.deepcopy(base)) is None
    role_only=copy.deepcopy(base);role_only['role']='EBG'
    assert c.first(base,role_only)['path']=='$.role' and c.payload_differences(base,role_only)==(None,[])
    payload_changed=copy.deepcopy(base);payload_changed['originalState']['hollywood']['businesses'][0]['costCutting']['since']=0
    assert c.payload_differences(base,payload_changed)[0]['path'].endswith('.costCutting.since')
    checks.append(red('wrong seed',lambda:list(c.member_rows(raw,s,'EBG',1))))
    checks.append(red('missing boundary',lambda:list(c.member_rows(raw,s,'E0G',2))))
    checks.append(red('extra boundary',lambda:list(c.member_rows(raw+raw,s,'E0G',1))))
    checks.append(red('truncated gzip',lambda:list(c.member_rows(raw[:-4],s,'E0G',1))))
    checks.append(red('compressed mutation',lambda:list(c.member_rows(raw[:-1]+b'X',s,'E0G',1))))
    bad=copy.deepcopy(base);bad['originalState']['hollywood']['businesses'][0]['costCutting']['since']=0
    checks.append(red('E0G active B',lambda:c.b_proof(bad,0,'E0G')))
    bad['role']='EBG';bad['originalState']['hollywood']['businesses'][0]['productions']=['p']
    checks.append(red('EBG active work',lambda:c.b_proof(bad,0,'EBG')))
    bad=copy.deepcopy(base);bad['originalState']['hollywood']['businesses'][0]['account']['periods'][0]['movements']['facilityDemolitionRefund']=-0.0
    checks.append(red('negative zero',lambda:c.b_proof(bad,0,'E0G')))
    bad=copy.deepcopy(base);bad['originalState']['hollywood']['receipts']=[{'kind':'facilityDisposed'}]
    checks.append(red('disposal receipt',lambda:c.b_proof(bad,0,'E0G')))
    bad=copy.deepcopy(base);bad['originalState']['hollywood']['businesses'][0]['costCutting']['version']=2
    checks.append(red('B version',lambda:c.b_proof(bad,0,'E0G')))
    a=[{'week':1,'talentId':'t','eventId':'a'},{'week':1,'talentId':'t','eventId':'b'}]
    b=[{'week':1,'talentId':'t','eventId':'b'},{'week':1,'talentId':'t','eventId':'a'}]
    assert [x['identity'] for x in c.identity_stream(a,'market')]==[(1,'t',0),(1,'t',1)]
    assert c.identity_stream(a,'market')!=c.identity_stream(b,'market')
    assert c.first(a[0],b[0]) is not None
    e=[{'talentId':'t','contractId':'dup'},{'talentId':'t','contractId':'dup'}]
    assert [x['identity'] for x in c.identity_stream(e,'employment')]==[('t',0),('t',1)]
    assert c.first({'eventId':'a'},{'eventId':'b'})['path']=='$.eventId'
    assert c.first({'x':-0.0},{'x':0}) is not None
    assert c.first({'x':False},{'x':0}) is not None
    assert c.first({'x':{'version':1,'since':None}},{'x':{'version':1,'since':0}})['path']=='$.x.since'
    live=copy.deepcopy(base);live['originalState']['hollywood']['businesses'][0]['costCutting']['since']=0
    assert c.b_episodes(base,live)[0]['transition']=='NULL_TO_ACTIVE'
    rc=copy.deepcopy(base);rc['originalState']['talentMarket']['receipts']=[{'week':0,'talentId':'t','kind':'settled','eventId':'e'}]
    sample=rc['originalState'];script={'settlement':[['e','settled',0,'t',None,None,None]],'receipts':sample['talentMarket']['receipts'],'employment':[],'takes':[]}
    import subprocess
    js="const fs=require('fs'),c=require('crypto'),x=JSON.parse(fs.readFileSync(0,'utf8'));let y={};for(let [k,v] of Object.entries(x))y[k]=c.createHash('sha256').update(JSON.stringify(v)).digest('hex');console.log(JSON.stringify(y))"
    dig=json.loads(subprocess.check_output(['node','-e',js],input=json.dumps(script).encode()))
    terminal={**dig,'marketReceiptRows':1,'industryReceiptRows':0,'employmentRows':0,'firstTakeRows':0}
    assert c.protected(sample,{'terminal':terminal})['digests']==dig
    terminal['receipts']='0'*64
    checks.append(red('protected JS digest',lambda:c.protected(sample,{'terminal':terminal})))
    with tempfile.TemporaryDirectory(dir=P) as td:
        path=pathlib.Path(td)/'result.json'
        checks.append(red('output cap',lambda:c.atomic_json(path,{'data':'x'*100},16)))
        assert not path.exists()
        part=pathlib.Path(td)/'part.tar'
        def tar_bytes(extra=None):
            buf=io.BytesIO()
            with tarfile.open(fileobj=buf,mode='w',format=tarfile.USTAR_FORMAT) as tar:
                for name,data in [('target/boundaries.ndjson.gz',b'gzip'),('target/RESULT.json',b'{}')]+(extra or []):
                    ti=tarfile.TarInfo(name);ti.size=len(data);tar.addfile(ti,io.BytesIO(data))
            return buf.getvalue()
        def stage_for(blob):
            part.write_bytes(blob)
            return {'parts':[{'path':str(part),'bytes':len(blob),'sha256':hashlib.sha256(blob).hexdigest(),'gitOid':hashlib.sha1(('blob '+str(len(blob))+'\0').encode()+blob).hexdigest()}],
                    'archive':{'bytes':len(blob),'sha256':hashlib.sha256(blob).hexdigest()},
                    'members':{'target/boundaries.ndjson.gz':{'bytes':4,'sha256':hashlib.sha256(b'gzip').hexdigest()},'target/RESULT.json':{'bytes':2,'sha256':hashlib.sha256(b'{}').hexdigest()}}}
        st=stage_for(tar_bytes());c.check_parts(st);assert c.archive_selected(st)[1]==b'gzip'
        st=stage_for(tar_bytes([('target/RESULT.json',b'{}')]))
        checks.append(red('duplicate selected tar member',lambda:c.archive_selected(st)))
        st=stage_for(tar_bytes([('../escape',b'x')]))
        checks.append(red('tar traversal',lambda:c.archive_selected(st)))
        st=stage_for(tar_bytes()[:-1024])
        checks.append(red('archive bytes/hash drift',lambda:c.check_parts({**st,'archive':{'bytes':len(tar_bytes()),'sha256':hashlib.sha256(tar_bytes()).hexdigest()}})))
    pins=json.loads((P/'INPUTS.json').read_bytes())
    assert pins['seed']==c.SEED and pins['horizonTicks']==416 and pins['boundaries']==417
    small=c.ebg_controls(pins['ebg'])
    summary=c.linked_controls(small,'EBG')
    assert (summary['terminal']['marketReceiptRows'],summary['terminal']['industryReceiptRows'],summary['terminal']['employmentRows'],summary['terminal']['firstTakeRows'])==(223,515,64,121)
    assert json.loads(small['target/RESULT.json'])['child']['elapsedCapSeconds']==720
    assert json.loads(small['outer/RESULT.json'])['deadlineSeconds']==750
    print(json.dumps({'status':'PASS_SYNTHETIC_AND_SMALL_PINNED_EBG_CONTROLS_ONLY','positive':8,'red':checks},sort_keys=True))
if __name__=='__main__':audit()
