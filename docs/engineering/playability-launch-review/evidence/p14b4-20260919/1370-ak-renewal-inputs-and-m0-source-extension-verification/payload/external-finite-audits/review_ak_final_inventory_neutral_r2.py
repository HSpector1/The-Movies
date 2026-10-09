import pathlib,json,hashlib,stat,os,datetime
S=pathlib.Path('/Users/zacheryspector/studio-scratch')
I=S/'1370-ak-checkpoint-pre-review-inventory-preparation-20261009-r2/INVENTORY-FINAL-PRE-REVIEW.json'
D=S/'1370-ak-complete-pre-review-inventory-independent-review-20261009-r1'
def stamp(st):return (st.st_dev,st.st_ino,st.st_mode,st.st_nlink,st.st_size,st.st_mtime_ns,st.st_ctime_ns)
def read_role(p,keep=False):
    p=pathlib.Path(p);st=p.lstat()
    assert p.resolve(strict=True)==p and stat.S_ISREG(st.st_mode) and st.st_nlink==1 and st.st_size<=16*1024**2,str(p)
    fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW);h=hashlib.sha256();chunks=[];n=0
    try:
        assert stamp(os.fstat(fd))==stamp(st)
        while True:
            b=os.read(fd,65536)
            if not b:break
            n+=len(b);assert n<=16*1024**2;h.update(b)
            if keep:chunks.append(b)
        assert n==st.st_size and stamp(os.fstat(fd))==stamp(st)==stamp(p.lstat())
    finally:os.close(fd)
    return {'path':str(p),'bytes':n,'sha256':h.hexdigest(),'mode':format(stat.S_IMODE(st.st_mode),'04o'),'nlink':st.st_nlink},b''.join(chunks)
ir,raw=read_role(I,True);assert ir['sha256']=='b24ecd8aa02ee4f1e2102dea81b95e4e74bf6a830794fb1845458a63e2850bea';inv=json.loads(raw)
rows=inv['files'];assert len(rows)==655 and len({r['sourcePath'] for r in rows})==655 and len({(r['package'],r['relativePath']) for r in rows})==655
by={r['sourcePath']:r for r in rows};jsons={};rawPrefixes=[];rawHashes=set();verified=[]
for r in rows:
    assert r['preservationAction'] in ('COPY_FINITE_PAYLOAD','LOCAL_HASH_SIZE_ONLY')
    rel=pathlib.PurePosixPath(r['relativePath']);assert not rel.is_absolute() and '..' not in rel.parts
    assert '/' not in r['package'] and r['package'] not in ('','.', '..')
    p=pathlib.Path(r['sourcePath']);isRaw=p.name.endswith(('.txt','.bin')) and ('LSOF' in p.name or '-PS' in p.name)
    keep=(p.suffix=='.json' and r['preservationAction']=='COPY_FINITE_PAYLOAD') or isRaw
    actual,b=read_role(p,keep)
    assert all(actual[k]==r[k] for k in ('bytes','sha256','mode','nlink')),r['sourcePath']
    assert not isRaw or r['preservationAction']=='LOCAL_HASH_SIZE_ONLY'
    verified.append({k:actual[k] for k in ('path','bytes','sha256','mode','nlink')})
    if isRaw:rawHashes.add(actual['sha256']);rawPrefixes.append(b[:512].decode('utf8',errors='ignore'))
    if p.suffix=='.json' and r['preservationAction']=='COPY_FINITE_PAYLOAD':jsons[str(p)]=json.loads(b)
copyRows=[r for r in rows if r['preservationAction']=='COPY_FINITE_PAYLOAD'];local=[r for r in rows if r['preservationAction']=='LOCAL_HASH_SIZE_ONLY']
assert len(copyRows)==637 and sum(r['bytes'] for r in copyRows)==31638530
assert len(local)==18 and sum(r['bytes'] for r in local)==7619304 and len(rawHashes)==17
padding=[r for r in local if 'LOCAL_PADDING' in r['reason']];assert len(padding)==1 and padding[0]['relativePath']=='37857.outer.stdout' and padding[0]['bytes']==524288
assert padding[0]['sha256']=='ec8bb338811bbf800a8b5e507d06e08a1d9d05bde74294f6f7388f3bbfba82e5'
assert len(inv['selectedDirectoryNames'])==106 and len(set(inv['selectedDirectoryNames']))==106
assert inv['summary']['completeInventory'] is True and inv['summary']['closedWorkArtifactCoverageComplete'] is True and inv['missingActualArtifacts']==[] and inv['pendingAdditions']==[] and inv['rootFinalization'] is None
transport=inv['priorArchiveRoleTransport'];assert len(transport)==65 and len({r['sourcePath'] for r in transport})==60
transportDistinct={}
for t in transport:
    p=t['sourcePath']
    if p in transportDistinct:assert t==transportDistinct[p],p
    else:transportDistinct[p]=t
assert len(transport)-len(transportDistinct)==5
assert set(r['sourcePath'] for r in transport).isdisjoint(by)
for t in transport:
    assert t['action']=='ALREADY_ARCHIVED_AJ_EXACT_ROLE_TRANSPORT_ONLY';r=t['priorAJManifestEntry'];actual,_=read_role(t['sourcePath'])
    assert t['sourcePath']==r['sourcePath'] and t['sha256']==r['sha256']==actual['sha256']
    assert all(actual[k]==r[k] for k in ('bytes','mode','nlink')) and r['preservationAction']=='COPY_FINITE_PAYLOAD'
correction=jsons[inv['rawPolicyCorrection']['correctionsPath']]
assert inv['rawPolicyCorrection']['correctionsSha256']==by[inv['rawPolicyCorrection']['correctionsPath']]['sha256']=='0078aef4da54ca6f9eab2472def5fb47c6dec3bee51f1557f75329552c9f6d6c'
for x in correction['rawRoleCorrections']:
    p=x['actualRole']['sourcePath'];assert by[p]['preservationAction']=='LOCAL_HASH_SIZE_ONLY';assert by[p]['sha256']==x['actualRole']['sha256']
audit=correction['missingFiniteAuditAddition'];assert by[audit['sourcePath']]['preservationAction']=='COPY_FINITE_PAYLOAD' and by[audit['sourcePath']]['sha256']==audit['sha256']
def strings(x,path=()):
    if isinstance(x,str):yield path,x
    elif isinstance(x,dict):
        for k,v in x.items():yield from strings(v,path+(str(k),))
    elif isinstance(x,list):
        for n,v in enumerate(x):yield from strings(v,path+(str(n),))
factFiles=[]
for p,o in jsons.items():
    if 'FACTS' not in pathlib.Path(p).name.upper():continue
    factFiles.append(p)
    for keypath,value in strings(o):
        if len(value)>500:
            assert hashlib.sha256(value.encode()).hexdigest() not in rawHashes
            assert not any(prefix and prefix in value for prefix in rawPrefixes)
            assert not (len(value)>50000 and any(('ps' in key.lower() or 'lsof' in key.lower() or 'rawfd' in key.lower()) for key in keypath)),(p,keypath)
current=S/'1370-c0-m0-additive-exact-final-candidate-after-aj-20261009-r1';archive=S/'1370-c0-m0-additive-exact-pre-adoption-archive-after-aj-20261009-r1'
assert by[str(current/'BINDING-DRAFT.json')]['sha256']=='35e596a0ee6d5119fd2a84f03f3fc0a7398be1208a8f65e4c4824ca67e269a50'
assert by[str(archive/'BINDING-DRAFT.json')]['sha256']=='afb63886674e50034d802af42bafacd5e9d119b96dfadc256e5b29668e4d30a7'
assert by[str(current/'PINS.json')]['sha256']==by[str(archive/'PINS.json')]['sha256']=='1674f56bedabf9cca674eaece2884a285efdaec70e91e1bd5125d8a45c8467f8'
pins=jsons[str(current/'PINS.json')];v=pins['files']['BINDING-DRAFT.json'];assert (v['sha256'] if isinstance(v,dict) else v)==by[str(archive/'BINDING-DRAFT.json')]['sha256']
def selected(pkg,name):return jsons[str(S/pkg/name)]
m0=selected('1370-c0-m0-additive-complete-chain-independent-observed-review-after-aj-20261009-r1','RECEIPT.json')
assert m0['decision']=='ACCEPT_OBSERVED_M0_ADDITIVE_COMPLETE_WITH_FULL_PROTECTED_POSTFLIGHT' and m0['protectedPostflightAccepted'] is True and m0['physicalExpandedReadbackAccepted'] is True and m0['typesReady'] is False and m0['gameAccepted'] is False
mc=selected('1370-c0-m0-additive-complete-parent-adoption-after-aj-20261009-r1','ADOPTION.json');assert mc['protectedPostflightAccepted'] is True and mc['newExecutionAuthorized'] is False
a=selected('1370-c0-a208-controls-observed-parent-adoption-after-aj-20261009-r1','ADOPTION.json');assert a['js13Accepted'] is True and a['pythonControlsAccepted'] is False and a['pythonDriverCleanupFailed'] is True and a['a208GameGranted'] is False
st=selected('1370-c0-a208-python-controls-stop-independent-observed-review-after-aj-20261009-r1','RECEIPT.json');assert st['actualToolExit']==st['actualHelperExit']==st['actualRecorderExit']==2 and st['actualDriverExit']==-14 and st['exactEPERMTargetCaptured'] is False and st['EPERMCauseEstablished'] is False and st['alarmCausalRelationEstablished'] is False
di=selected('1370-c0-a208-owned-cleanup-diagnostics-parent-design-adoption-after-aj-20261009-r1','ADOPTION.json');assert di['sourcePreparationAuthorized'] is True and di['actualRetryAuthorized'] is False and di['executionAuthorization'] is False
oldWarning='Inventory incomplete: qualified finalizer must refuse it.'
assert inv['semanticRoleWarnings'].count(oldWarning)==1
newWarning='Earlier preserved draft inventories are incomplete and remain ineligible for finalization; this finalized inventory covers the explicitly selected closed work.'
assert not D.exists();D.mkdir(mode=0o700)
def write(name,obj):
    b=obj.encode() if isinstance(obj,str) else (json.dumps(obj,indent=2,sort_keys=True)+'\n').encode();fd=os.open(D/name,os.O_CREAT|os.O_EXCL|os.O_WRONLY|os.O_NOFOLLOW,0o600)
    with os.fdopen(fd,'wb') as f:os.fchmod(f.fileno(),0o600);f.write(b);f.flush();os.fsync(f.fileno())
    r,_=read_role(D/name);return {k:r[k] for k in ('path','bytes','sha256')}
invRole={k:ir[k] for k in ('path','bytes','sha256')}
checks=write('CHECKS.json',{'inventory':invRole,'actualVerifiedFileRoleCanonicalSha256':hashlib.sha256(json.dumps(verified,sort_keys=True,separators=(',',':')).encode()).hexdigest(),'explicitCurrentRolesVerified':655,'priorAJTransportReferencesVerified':65,'priorAJTransportDistinctSourceRolesVerified':60,'exactDuplicateTransportReferences':5,'priorGitObjectsFreshlyQueried':False,'finalizerMustAuthenticatePriorRealGitHead':True,'payloadFiles':637,'payloadBytes':31638530,'localOnlyFiles':18,'localOnlyBytes':7619304,'wholeMachineRawRoles':17,'syntheticPaddingRoles':1,'localOnlyRoleList':local,'factsJsonFilesCheckedForEmbeddedWholeMachineBuffers':factFiles,'noEmbeddedRawDetected':True,'rawContentsCopiedOrPrinted':False,'fiveRawPolicyCorrectionsAuthenticated':True,'externalPreflightAuditIncluded':True,'sourcePathAndArchivePathUnique':True,'originalAfbBindingAndCurrent35eBindingRolesSeparated':True,'M0CompleteJS13AcceptedPythonCleanupStopPreserved':True,'futureDesignOnlyAndNoGameGrantPreserved':True,'mutableFinalizationDirectoryExcluded':True,'missingActualArtifacts':[],'inventoryMutated':False,'documentaryWarningCorrectionPermitted':{'old':oldWarning,'new':newWarning},'reviewerRanArchiveGitTestsNodeGameScansOrProtectedWrites':False,'audit':{k:v for k,v in read_role(pathlib.Path(__file__))[0].items() if k in ('path','bytes','sha256')}})
report=write('REPORT.md','''# Complete pre-review AK inventory and raw policy\n\nACCEPT_COMPLETE_PRE_REVIEW_FINITE_CHECKPOINT_INVENTORY_RAW_POLICY. All655 explicit regular physical source roles independently hash/size/mode/singlelink authenticated; sourcePath and package/relativePath are unique and safe. Counts match637 finite payloads/31,638,530 bytes and18 local-only/7,619,304 bytes. All17 genuine whole-machine PS/FD captures, including five corrected CURRENT captures, are LOCAL_HASH_SIZE_ONLY; only the separately identified524288-byte synthetic cap stimulus is the18th local-only role. No raw bytes copied/printed; selected FACTS JSON retains raw roles as metadata and no embedded whole-machine buffers detected.\n\nThe65 AJ transport references name60 distinct source roles with five exact duplicate references; payload rows remain unique. These references separately match current finite bytes/metadata and preserved predecessor manifest entries; no fresh Git object verification was run. Finalizer must authenticate real prior Git HEAD/blob transport. Originalafb binding/archivePINS and actual35e adopted binding roles remain separate and pinned; current old PINS continues to describe archived original bytes. Closed M0 readback/full-postflight admission, JS13 success, Python tool/helper/recorder2 and driver-14 cleanupSTOP, unknown target/alarm cause and future source-only diagnostic scope remain distinct. No future A208 game/pure16/repair run is inferred or needed for this closed-work coverage.\n\nOne carried documentary warning says current inventory is incomplete. Preserve immutableb24ecd and permit only its exact replacement with the historical-draft qualification in CHECKS. Root may make the final noncircular finite increment for independent claims review, this review/audit, root adoptions, report/HANDOFF and final claim/inventory/finalizer role bookkeeping including bounded staged-verification source; no new scientific evidence, raw capture intake, authority widening or source/observation-status relabeling. Those added roles still require regular finite identity/hash verification. No archive/repository/Git mutation, Node/tests/game/scans or protected writes ran. No other blocking findings.\n''')
receipt=write('RECEIPT.json',{'schema':'1370-ak-complete-pre-review-inventory-independent-review-v1','decision':'ACCEPT_COMPLETE_PRE_REVIEW_FINITE_CHECKPOINT_INVENTORY_RAW_POLICY','inventory':invRole,'checks':checks,'report':report,'findings':[],'actualClosedWorkCoverageAccepted':True,'rawPublicationPermitted':False,'permittedFinalFiniteIncrement':['independent checkpoint claims review roles','this inventory review and finite audit roles','root adoption roles','final report/HANDOFF/document roles','claim/inventory/finalizer role bookkeeping only'],'permittedDocumentaryCorrection':{'old':oldWarning,'new':newWarning},'forbiddenIncrement':['new scientific/runtime facts','additional raw artifacts','execution grants or observation-status relabeling'],'finalAddedRolesRequireFiniteHashAndMetadataVerification':True,'priorGitObjectVerificationDeferredToFinalizer':True,'executionAuthorization':False,'reviewerArchivedOrMutatedGitRepoProtectedRootsOrRanRuntime':False,'utc':datetime.datetime.now(datetime.timezone.utc).isoformat()})
print(json.dumps({'receipt':receipt,'factsFilesChecked':len(factFiles),'allExplicitRowsVerified':655},indent=2))
