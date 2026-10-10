exec((__import__('pathlib').Path(__file__).parent/'audit-post-evidence.py').read_text().split("output=BASE/")[0])
before=post['currentBefore'];after=post['currentAfter']
for current in (before,after):
 for key in ('oldNumericPidsAbsent','relevantWorkersAbsent','ownedGroupClearanceClaim','fdOriginalAndEphemeralAndRetainedHPassed','fdOriginalM0ParentPassed'):
  need(current[key] is True,'current check '+key)
 need(current['ownedGroupIdsChecked']==[35444,35699,35700],'original owned group roster')
 need(current['freeBytes']>=parse(raw['guardConfig'])['requiredFreeBytes'],'disk floor')
 need('AC Power' in current['power'],'AC')
need(before['bootSessionUuid']==after['bootSessionUuid']==parse(raw['guardConfig'])['bootSessionUuid'],'boot')
strict=lambda roots:{k:v for k,v in roots.items() if k!='scratchParent'}
need(exact(strict(post['rootsBefore']),strict(post['rootsAfter'])) and exact(strict(post['rootsAfter']),post['immutable']['strictRoots']),'during snapshot roots')
classification=report['classification']
need(classification['classification']=='LOCAL_HASH_SIZE_ONLY' and classification['rawBytesIncluded'] is False and len(classification['roles'])==4,'raw local-only')
for role in classification['roles']:
 read({k:role[k] for k in ('path','bytes','sha256')})
need(classification['roles'][0]['sha256']==before['psRawSha256'] and classification['roles'][1]['sha256']==before['lsofRawSha256'] and classification['roles'][2]['sha256']==after['psRawSha256'] and classification['roles'][3]['sha256']==after['lsofRawSha256'],'raw facts binding')
stdout=parse(raw['stdout']);need(stdout['snapshotSha256']==input_data['roles']['fullPostflightSnapshot']['sha256'] and stdout['pinsSha256']==input_data['roles']['snapshotPins']['sha256'],'actual stdout bound')
need(stdout['elapsedSeconds']==post['elapsedSeconds']==rb['guardSeconds'] and stdout['inventoryElapsedSeconds']==post['inventoryElapsedSeconds']==rb['inventorySeconds'],'times')
report.pop('postFactsBefore');report.pop('postFactsAfter')
report.update({'currentBefore':before,'currentAfter':after,'rawLocalOnlyFourRolesAuthenticated':True,'duringSnapshotStrictRootsTypedEqual':True,'originalOwnedGroupRoster':[35444,35699,35700],'scannerRecordedAbsenceFromRootReadback':37856})
output=BASE/'FINAL-POST-EVIDENCE-AUDIT.json';encoded=(json.dumps(report,sort_keys=True,indent=2)+'\n').encode()
fd=os.open(output,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
with os.fdopen(fd,'wb') as f:f.write(encoded);f.flush();os.fsync(f.fileno())
print(json.dumps({'path':str(output),'bytes':len(encoded),'sha256':hashlib.sha256(encoded).hexdigest(),'allChecksPassed':True}))
