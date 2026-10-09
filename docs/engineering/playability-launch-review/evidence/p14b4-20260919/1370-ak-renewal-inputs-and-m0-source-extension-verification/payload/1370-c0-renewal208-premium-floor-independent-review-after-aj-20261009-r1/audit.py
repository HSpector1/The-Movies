from pathlib import Path
import os, stat, hashlib, json

HERE = Path(__file__).resolve().parent
B = Path('/Users/zacheryspector/studio-scratch')
P = B/'1370-c0-renewal208-premium-floor-source-obligations-after-aj-20261009-r1'
roles = {}
def read(label, path, pin=None):
    path=Path(path); pre=path.lstat()
    assert stat.S_ISREG(pre.st_mode) and pre.st_size <= 8*1024*1024
    fd=os.open(path,os.O_RDONLY|os.O_NOFOLLOW)
    try:
        a=os.fstat(fd); pieces=[]; total=0
        while True:
            p=os.read(fd,65536)
            if not p: break
            total+=len(p); assert total<=8*1024*1024; pieces.append(p)
        z=os.fstat(fd)
    finally: os.close(fd)
    post=path.lstat()
    for field in ('st_dev','st_ino','st_mode','st_nlink','st_size','st_mtime_ns','st_ctime_ns'):
        assert getattr(pre,field)==getattr(a,field)==getattr(z,field)==getattr(post,field)
    raw=b''.join(pieces); digest=hashlib.sha256(raw).hexdigest()
    if pin:
        assert len(raw)==pin['bytes'] and digest==pin['sha256']
    roles[label]=dict(path=str(path),bytes=len(raw),sha256=digest)
    return raw

raw=read('proposalReceipt',P/'RECEIPT.json')
assert hashlib.sha256(raw).hexdigest()=='f51506bdfcc6f7dbd03284ff3cdde16eb8009c4b09fe69c3ff81027d51f6d0ee'
r=json.loads(raw)
package={k:read(k,v['path'],v) for k,v in r['roles'].items()}
inputs={k:json.loads(read(k,v['path'],v)) for k,v in r['inputRoles'].items()}
gap=inputs['acceptedGapFacts']; pins=inputs['acceptedGapPins']; source_map=json.loads(package['SOURCE-MAP.json'])
hm=json.loads(read('H_manifest',pins['H_manifest']['path'],pins['H_manifest']))
am=json.loads(read('A_copy_payload',pins['A_copy_payload']['path'],pins['A_copy_payload']))
assert hm['historicalSourceCommit']=='8708d6a98e6eb4ad53e3a54e431c4b40b974f79d'
assert am['sourceSha']=='3aaf55e0c06c4b745b0b722cc56913050b1ee229'
extractions=[]; overrun=[]; source_text={}
for e in source_map:
    role=e['sourceRole']; raw=read(e['arm']+':'+e['repositoryPath'],role['path'],role)
    blob=hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest()
    assert blob==e['gitBlobOid'] and e['mode']=='100644' and e['authenticatedTreeObjectOid'] is None
    if e['arm']=='H': assert hm['arms']['historical']['files'][e['repositoryPath']]==role['sha256']
    else:
        entry=am['sourceManifest'][e['repositoryPath']]
        assert all(entry[k]==v for k,v in [('sha256',role['sha256']),('bytes',len(raw)),('oid',blob),('mode',e['mode'])])
    text=raw.decode(); source_text[e['arm']+':'+e['repositoryPath']]=text
    lines=text.splitlines()
    for lo,hi in e['slices']:
        head=f"===== {e['arm']} {e['sourceCommit']}:{e['repositoryPath']} lines{lo}-{hi} SHA256{role['sha256']} blob{blob} ====="
        block=head+'\n'+'\n'.join(f'{i+1}: {lines[i]}' for i in range(lo-1,min(hi,len(lines))))+'\n\n'
        extractions.append(block)
        if hi>len(lines): overrun.append(dict(arm=e['arm'],path=e['repositoryPath'],requested=[lo,hi],actualEnd=len(lines)))
assert ''.join(extractions).encode()==package['SOURCE-SLICES.txt']
selected=json.loads(package['SELECTED16.json']); assert len(selected)==16
prior={tuple(x['identity']):x for x in gap['remainingRenewalRows']}; assert len(prior)==16
assert [x['identity'] for x in selected]==[x['identity'] for x in gap['remainingRenewalRows']]
for row in selected:
    old=prior[tuple(row['identity'])]
    for key in ['HOriginalContract','AOriginalContract','HSourceOrder','ASourceOrder','talentId']:
        assert row[key]==old[key]
    assert row['subjectStudioId']==old['H208Case']['subjectStudioId']
    assert row['winningStudioId']==old['H208WinnerReceipt']['studioId']
    assert row['HObservedWinningReserveWeeks']==old['H208WinningBusinessPolicy']['reserveWeeks']
    assert row['decisionWeek']==old['H208Case']['closedWeek']==old['HCommittedTerms']['startWeek']==old['ACommittedTerms']['startWeek']==208
    assert row['HOriginalContract']['terms']['endWeekExclusive']==row['AOriginalContract']['terms']['endWeekExclusive']==row['precommitOldTermEnds']==208
    assert row['premiumTier'] is None and row['releaseFloor'] is None
assert len({tuple(x['identity']) for x in selected})==16
need_ranges={'H:src/core/talentMarket.ts':[(889,915),(1119,1156),(1190,1249),(1298,1306)],'A:src/core/talentMarket.ts':[(1210,1289)],'H:src/core/hollywoodTick.ts':[(330,344)]}
facts=dict(roles=roles,sourceRows=12,selectedRows=16,selectedProjectionExact=True,rawSliceReconstructionExact=True,sourceAdmissionAnchorsMatch=True,derivedBlobOidsMatch=True,nullPremiumAndFloorAreUnadmittedPlaceholders=True,expiredOldTermsAt208RuleVerified=True,finiteSliceCoverageFinding=dict(id='F1',description='Identical H/A ranges miss cited local functions because source offsets differ; raw extracts reproduce their declared ranges but are incomplete.',minimumAdditionalRanges=need_ranges,requestedRangesBeyondEOF=overrun),remainingProofs=['Transitive no-policy-mutation/alias proof from fixed entry reserveWeeks through reached initialization, weekly helpers and action/harness seam to submission; proposal premium material fields preserved through authoring/revision/freeze/settlement.', 'Complete reached selected-person employment/receipt writers and exact contractId uniqueness: no term/endWeekExclusive rewrite or unseen termination memory surviving208.', 'Unique open subject case/precommit order: no prior same208 committed renewal or duplicate/overlapping qualifying record when proposalPriceAt reads the floor; selected H/A case/winner path proven from caller or separately observed precommit roles.', 'After-natural-tick208 observer phase must preserve actual A evolved pricing values through terminal pass; H full vectors/15 jitters remain reusable, one keyed draw absent.'],newRenewalCausesClosed=0,executionAuthorized=False)
with (HERE/'FACTS.json').open('x') as f:json.dump(facts,f,indent=2,sort_keys=True);f.write('\n')
print(json.dumps(dict(artifactRoles=len(roles),sourceRows=12,selectedRows=16,rawSliceReconstructionExact=True,finding='F1_INCOMPLETE_ARM_SPECIFIC_EXTRACTIONS')))
