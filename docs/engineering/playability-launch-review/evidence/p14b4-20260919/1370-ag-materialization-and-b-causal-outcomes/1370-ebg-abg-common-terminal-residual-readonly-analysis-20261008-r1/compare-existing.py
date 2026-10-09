#!/usr/bin/env python3
"""Existing pinned JSON/source comparison only. No imports of game code, subprocesses,
Git, captures, tests or gzip decoding. Stdout is a deterministic diagnostic RESULT.
Usage: python3 compare-existing.py INPUT-PINS.json > fresh-result.json
"""
import collections, hashlib, json, os, pathlib, stat, sys

def require(v, detail):
    if not v: raise ValueError(detail)

def read_pin(pin, cap, materialize=True):
    p=pathlib.Path(pin['path']); fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
    try:
        before=os.fstat(fd)
        require(stat.S_ISREG(before.st_mode) and before.st_size==pin['bytes'] and before.st_size<=cap,'size/type '+str(p))
        h=hashlib.sha256(); chunks=[]; size=0
        while True:
            block=os.read(fd,1024*1024)
            if not block: break
            size+=len(block);require(size<=cap,'read growth '+str(p));h.update(block)
            if materialize:chunks.append(block)
        after=os.fstat(fd)
        require((before.st_dev,before.st_ino,before.st_size,before.st_mtime_ns)==(after.st_dev,after.st_ino,after.st_size,after.st_mtime_ns),'changed '+str(p))
        require(size==pin['bytes'] and h.hexdigest()==pin['sha256'],'pin '+str(p))
        return b''.join(chunks) if materialize else None
    finally:os.close(fd)

def key_json(v):return json.dumps(v,sort_keys=True,separators=(',',':'),ensure_ascii=False)
def join(rows, key):
    seen=collections.Counter(); result={}; order=[]
    for ordinal,row in enumerate(rows):
        base=key(row); encoded=key_json(base);occ=seen[encoded];seen[encoded]+=1
        identity=base+[occ];k=key_json(identity);result[k]={'identity':identity,'ordinal':ordinal,'value':row};order.append(k)
    return result,order

def compare(a,b,key):
    left,lo=join(a,key);right,ro=join(b,key); shared=sorted(set(left)&set(right))
    diffs=[{'identity':left[k]['identity'],'ebgOrdinal':left[k]['ordinal'],'abgOrdinal':right[k]['ordinal'],'ebg':left[k]['value'],'abg':right[k]['value']} for k in shared if left[k]['value']!=right[k]['value']]
    return {'ebgRows':len(a),'abgRows':len(b),'paired':len(shared),'changed':len(diffs),
            'ebgOnly':[left[k] for k in sorted(set(left)-set(right))],'abgOnly':[right[k] for k in sorted(set(right)-set(left))],
            'valuesAndOrderEqual':a==b,'identityOrderEqual':lo==ro,'differences':diffs,
            'joinedLocators':[{'identity':left[k]['identity'],'ebgOrdinal':left[k]['ordinal'],'abgOrdinal':right[k]['ordinal']} for k in lo if k in right]}

def terminal(c,family):
    f=c['terminal'][family];r=[(x['rightOrder'],x['right']) for x in f['rows'] if x['right'] is not None];r.sort(key=lambda x:x[0])
    require([i for i,_ in r]==list(range(len(r))) and len(r)==len(f['rightOrder']),'terminal ordinal coverage '+family)
    return [v for _,v in r]

cfg_raw=pathlib.Path(sys.argv[1]).read_bytes();require(len(cfg_raw)<1024*1024,'config size');cfg=json.loads(cfg_raw)
loaded={}; verified=[]
for name,pin in sorted(cfg['pins'].items()):
    capture=name.endswith('.capture');raw=read_pin(pin,cfg['compressedHashOnlyCapBytes'] if capture else cfg['jsonCapBytes'],not capture)
    verified.append({'name':name,**pin,'readMode':'COMPRESSED_BYTES_HASH_ONLY_NO_DECODE' if capture else 'BOUNDED_READ'})
    if raw is not None and pin['path'].endswith('.json'):loaded[name]=json.loads(raw)
source_ebg=loaded['ebgSourceMap']; require(len(source_ebg)==188,'188 EBG source paths')
source_abg=None; cases={}
keys={'employment':lambda r:[r['contractId']], 'market':lambda r:[r['week'],r['talentId'],r['kind'],r.get('studioId')],
      'takes':lambda r:[r['productionId'],r['studioId']], 'cases':lambda r:[r['contractId'],r['variant']],
      'industry':lambda r:[r['week'],r['studioId'],r['kind'],r.get('talentId')],
      'proposals':lambda r:[r.get('talentId'),r.get('studioId'),r.get('contractId')]}
ledger_fields=['week','eventId','kind','talentId','subjectStudioId','winner','reasons','dropped']
for name,ref in sorted(cfg['seeds'].items()):
    d=loaded[ref['abgData']]; c=loaded[ref['comparator']]; er=loaded[ref['ebgResult']]; eo=loaded[ref['ebgObserved']]; co=loaded[ref['comparatorObserved']];ao=loaded[ref['abgObserved']];ar=loaded[ref['abgResult']];m=loaded[ref['ebgManifest']];summary=loaded[ref['summary']]
    require(d['arm']=='ABG' and er['arm']=='EBG' and m['arm']=='EBG','roles')
    require(d['seed']==c['seed']==er['seed']==summary['seed']==m['seed']==ref['seed'],'seed')
    require(d['completed'] and d['sourcePostflight'] and d['horizon']==416 and d['mode']=='clean','ABG complete identity')
    require(ar['actualChildExit']==ar['recorderChildExit']==0 and not ar['timedOut'] and ar['allGuardsExact'] and ar['livePostflightExact'],'ABG recorded guards')
    require(er['stagePassed'] and er['child']['exit']==0 and not er['child']['timedOut'],'EBG recorded status')
    require(c['boundaries']==417 and len(c['boundaryIndex'])==417 and [x['week'] for x in c['boundaryIndex']]==list(range(417)),'EBG boundary index')
    require(len(d['weekly'])==416 and [x['week'] for x in d['weekly']]==list(range(1,417)),'ABG weekly index')
    require(co['comparatorResultSha256']==cfg['pins'][ref['comparator']]['sha256'],'comparator observed linkage')
    require(c['ebgObservedReceiptSha256']==cfg['pins'][ref['ebgObserved']]['sha256'],'comparator EBG observed linkage')
    require(eo['targetResultSha256']==cfg['pins'][ref['ebgResult']]['sha256'] and eo['manifestSha256']==cfg['pins'][ref['ebgManifest']]['sha256']==er['manifestSha256'],'EBG manifest/result linkage')
    ao=ao['ABG'] if name=='p13a' else ao
    require(ao['dataSha256']==cfg['pins'][ref['abgData']]['sha256'] and ao['resultSha256']==cfg['pins'][ref['abgResult']]['sha256'],'ABG observed linkage')
    require(ar['artifacts'][cfg['pins'][ref['abgData']]['path']]['sha256']==cfg['pins'][ref['abgData']]['sha256'],'ABG artifact linkage')
    for k,field in [('capture','boundariesSha256'),('summary','summarySha256'),('readback','readbackAuditSha256')]:require(cfg['pins'][ref[k]]['sha256']==er['cleanArtifacts'][field],'EBG artifact linkage '+k)
    sm={k:v for k,v in d['sourcePins'].items() if k.startswith('src/')};require(len(sm)==188 and set(sm)==set(source_ebg),'same 188 source path set')
    if source_abg is None:source_abg=sm
    require(sm==source_abg,'identical ABG sources across seeds')
    require({k:v for k,v in m['assembledInventory']['files'].items() if k.startswith('src/')}==source_ebg,'EBG assembly source map')
    ebg={k:terminal(c,k) for k in keys};abg={'employment':d['finalEmployment'],'market':d['finalMarket']['receipts'],'takes':[r for w in d['weekly'] for r in w['firstTakes']], 'cases':d['finalMarket']['cases'],'industry':d['finalIndustryReceipts'],'proposals':d['finalMarket']['proposals']}
    families={k:compare(ebg[k],abg[k],keys[k]) for k in keys}
    for k in ['employment','takes']:require(ebg[k]==c['terminal']['protected']['EBG']['preimages'][k],'protected raw preimage '+k)
    require(ebg['market']==c['terminal']['protected']['EBG']['preimages']['receipts'],'protected receipt preimage')
    digests={}
    for k in ['employment','receipts','settlement','takes']:
        a=c['terminal']['protected']['EBG']['digests'][k];b=d['actualPins'][k]
        require(a==er['cleanArtifacts']['terminal'][k]==summary['terminal'][k],'recorded EBG digest linkage')
        digests[k]={'EBG':a,'ABG':b,'equal':a==b,'algorithm':'RECORDED_SOURCE_JS_JSON_STRINGIFY_SHA256_NOT_RECOMPUTED_IN_PYTHON'}
    ledger=[]
    for r in ebg['market']:
        if r['kind'] not in ['settled','declined','expired']:continue
        hits=[x for x in ebg['cases'] if x['talentId']==r['talentId'] and x.get('closedWeek')==r['week'] and x.get('outcome')==r['kind']]
        require(hits,'case for ledger receipt '+r['eventId']); kase=hits[0]
        ledger.append({k:r[k] for k in ['week','eventId','kind','talentId','reasons','dropped']}|{'subjectStudioId':kase['subjectStudioId'],'winner':r.get('studioId') if r['kind']=='settled' else None})
    projection=[{k:r[k] for k in ledger_fields} for r in d['rows']]
    ledger_result=compare(ledger,projection,lambda r:[r['week'],r['talentId'],r['subjectStudioId']]);ledger_result['fields']=ledger_fields;ledger_result['EBG']='DERIVED_FROM_OBSERVED_TERMINAL_RECEIPTS_AND_CASES';ledger_result['uncomparedABGFields']=['survivors','churn','exposed','newSentences']
    weekly_b=[];weekly_streams={k:[] for k in ['market','industry','takes']}
    for w in d['weekly']:
        right=[r['right'] for r in c['boundaryIndex'][w['week']]['bEpisodes'] if r['right'] is not None];right.sort(key=lambda r:r['order'])
        require([r['order'] for r in right]==list(range(len(right))),'B order coverage')
        bp=[{'studioId':r['identity'][0],'since':r['since']} for r in right]
        for own in w['owners']:require(own['recovery']['present'] and own['recovery']['version']==1,'ABG B representation')
        ap=[{'studioId':r['studioId'],'since':r['recovery']['since']} for r in w['owners']]
        delta=compare(bp,ap,lambda r:[r['studioId']]);delta['week']=w['week'];weekly_b.append(delta)
        for k,field in [('market','newMarketReceipts'),('industry','newIndustryReceipts'),('takes','firstTakes')]:
            e=[r for r in ebg[k] if r['week']==w['week']];a=w[field]
            weekly_streams[k].append({'week':w['week'],**compare(e,a,keys[k])})
    rng=d['actualPins']['rng'];erng=summary['terminal']['rng'];require(erng==er['cleanArtifacts']['terminal']['rng'],'terminal RNG linkage')
    rngs=[w['rng'] for w in d['weekly']]
    cases[name]={'seed':ref['seed'],'routes':{'ABG':d['route'],'ABGClassification':d['classification'],'EBGClassification':er['classification']},
        'terminalFamilies':families,'recordedSourceJsDigests':digests,'ledgerReceiptProjection':ledger_result,
        'weeklyB':{'weeks':416,'studioObservations':sum(x['paired'] for x in weekly_b),'changedWeeks':[x for x in weekly_b if not x['valuesAndOrderEqual']], 'allValuesAndOrderEqual':all(x['valuesAndOrderEqual'] for x in weekly_b),'rows':weekly_b},
        'weeklyDatedAppendStreams':{k:{'weeks':416,'rowsCompared':sum(x['ebgRows'] for x in v),'allValuesAndOrderEqual':all(x['valuesAndOrderEqual'] for x in v),'changedWeeks':[x for x in v if not x['valuesAndOrderEqual']],'comparable':k!='industry','note':('INCOMPARABLE_TIMING_VIEW: EBG terminal receipt.week grouping versus ABG additions indexed by output boundary; receipt.week may name the input/event week. These locators are not evidence of changed industry row values or real append timing.' if k=='industry' else 'Full EBG terminal event-week grouping equals ABG existing weekly market/take additions on these recordings; no hidden full-state boundary comparison.')} for k,v in weekly_streams.items()},
        'RNG':{'EBGTerminal':erng,'ABGTerminal':rng,'terminalEqual':erng==rng,'ABGWeeklyCount':len(rngs),'ABGWeeklyUnique':sorted(set(rngs)),'ABGWeeklyAllEqualTerminal':all(x==rng for x in rngs),'EBGWeeklyRNGCompared':False},
        'weeklyFullStateHashes':{'comparable':False,'EBG':'JSON.stringify(originalState)','ABG':'typed sorted-key snap(state)','ABGFinalHash':d['finalStateDigest'],'reason':'Different serialization laws; no equality/difference conclusion or first weekly full-state mismatch inferred.'}}
source_verified=[]
for role,sm in [('EBG',source_ebg),('ABG',source_abg)]:
    root=pathlib.Path(cfg['sourceRoots'][role]);actual={str(p.relative_to(root)) for p in (root/'src').rglob('*') if p.is_file()};require(actual==set(sm),'frozen source path inventory '+role)
    for rel,sha in sorted(sm.items()):
        p=root/rel;read_pin({'path':str(p),'bytes':p.stat().st_size,'sha256':sha},cfg['jsonCapBytes']);source_verified.append({'role':role,'path':str(p),'sha256':sha,'bytes':p.stat().st_size})
source_diffs=[{'path':k,'EBG':source_ebg[k],'ABG':source_abg[k]} for k in sorted(source_ebg) if source_ebg[k]!=source_abg[k]]
require([x['path'] for x in source_diffs]==['src/core/hollywood.ts','src/core/hollywoodValidation.ts','src/core/index.ts','src/core/rivalResearch.ts','src/core/save.ts','src/core/types.ts'],'exact six source differences')
result={'schema':'1370-ebg-abg-existing-common-terminal-residual-analysis-r1','classification':cfg['classification'],'configSha256':hashlib.sha256(cfg_raw).hexdigest(),'analyzerSha256':hashlib.sha256(pathlib.Path(__file__).read_bytes()).hexdigest(),'verifiedInputPins':verified,'verifiedFrozenSourceFiles':source_verified,'sourceDifferenceCount':len(source_diffs),'sourceDifferences':source_diffs,'seeds':cases,'limits':['No game/test/capture rerun or gzip decoding. Existing comparator terminal arrays and B profiles reused.','Not whole-state, 417-boundary save/payload equality, general inertness, rich auxiliary ledger row equality, or 1363 acceptance.','Source-JS protected hashes recorded by authenticated original routes; not regenerated from Python-sorted comparator JSON.','ABG weekly typed snap hashes and EBG original-state JSON hashes are incomparable.']}
print(json.dumps(result,sort_keys=True,indent=2))
