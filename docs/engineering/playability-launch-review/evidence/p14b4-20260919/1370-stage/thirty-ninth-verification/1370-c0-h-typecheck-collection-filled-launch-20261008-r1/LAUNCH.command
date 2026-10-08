/usr/local/bin/python3 -I -B -c 'import hashlib,json,os,pathlib,stat,sys,subprocess,shutil
s=pathlib.Path("/Users/zacheryspector/studio-scratch")
repo=pathlib.Path("/Users/zacheryspector/The-Movies-headless-program")
recorder=s/"1370-c0-h-typecheck-collection-runner-proposal-r4/recorder.py"
runner=s/"1370-c0-h-typecheck-collection-runner-proposal-r4/runner.py"
static_review=s/"1370-c0-h-typecheck-collection-runner-independent-static-review-r4/RECEIPT.json"
observed=s/"1370-c0-h-mirror-independent-observed-review-r1/RECEIPT.json"
materialized=s/"1370-c0-h-m0-observer-mirrors-r2/20261008-h-types-r1.MATERIALIZE-RESULT.json"
binding=s/"1370-c0-h-typecheck-collection-filled-launch-20261008-r1/BINDING.json"
pins={recorder:"2411ed35bd744041d7a4a23f0069c4e26fc65ab6330b6cb7cfb20a157d08d254",runner:"d185c14018dd5ef7b3b56c1a80d237a086e8999bc0a11a945f973b7d63255697",static_review:"49695bd0834b12188d4d82c6a3c2db8ae9de44666e0db5fff3f2a22450ccee95",observed:"bb61794d874cdc80f1283459d9eca49c5174de441cde9dcbe971d36e2b9f226e",materialized:"b8c70f731fc730cea3ba7238674fb964fb973e6ffcf58fcb03e0dbbd139196b6",binding:"f0c2aeae1d0c9ae0aa2b23ad38c452414eabed0f9a1bf9ff2cb18cec2c7e4546"}
def read(file,pin):
 for parent in file.parents: assert stat.S_ISDIR(parent.lstat().st_mode)
 before=file.lstat();assert stat.S_ISREG(before.st_mode) and before.st_nlink==1 and before.st_size<1048576
 fd=os.open(file,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  chunks=[]
  while part:=os.read(fd,65536):chunks.append(part)
  raw=b"".join(chunks);during=os.fstat(fd);after=file.lstat()
  fields=lambda v:(v.st_dev,v.st_ino,v.st_mode,v.st_nlink,v.st_size,v.st_mtime_ns,v.st_ctime_ns)
  assert fields(before)==fields(during)==fields(after) and len(raw)==before.st_size
 finally:os.close(fd)
 assert hashlib.sha256(raw).hexdigest()==pin
 return raw
data={file:read(file,pin) for file,pin in pins.items()}
r=json.loads(data[static_review]);o=json.loads(data[observed]);m=json.loads(data[materialized]);b=json.loads(data[binding])
assert r["decision"]=="ACCEPT_STATIC_ONLY" and r["runnerSha256"]==pins[runner] and r["recorderSha256"]==pins[recorder]
assert o["decision"]=="ACCEPT_OBSERVED_H_MIRROR_SOURCE_ONLY" and o["materializerResultSha256"]==pins[materialized] and o["readbackChildExit"]==0
assert m["status"]=="MIRROR_MATERIALIZED_SOURCE_ONLY" and m["arm"]=="H" and m["runId"]=="20261008-h-types-r1"
assert b["status"]=="FILLED_INDEPENDENT_REVIEW_REQUIRED" and b["runId"]=="20261008-h-types-r2" and b["materializerResultSha256"]==pins[materialized] and b["observedHMirrorReceiptSha256"]==pins[observed] and b["runnerStaticReviewSha256"]==pins[static_review]
assert not (s/"HEAVY-LANE-LOCK").exists()
assert not (s/"c0-h-types-20261008-h-types-r2.lane.log").exists()
assert not (s/"c0-h-types-20261008-h-types-r2.lane.log.meta").exists()
assert not (s/"1370-c0-h-typecheck-collection-results-r3/20261008-h-types-r2").exists()
assert not (s/"1370-c0-h-typecheck-collection-results-r3/20261008-h-types-r2.RECORDER.json").exists()
assert subprocess.check_output(["pmset","-g","batt"],text=True).splitlines()[:1]==["Now drawing from "+chr(39)+"AC Power"+chr(39)]
assert shutil.disk_usage(s).free>=3758096384
cmd=lambda *a:subprocess.check_output(a,cwd=repo,text=True).strip()
assert cmd("git","rev-parse","HEAD")=="f8c0628739227accfa446276b0613f47bc805a78"
assert cmd("git","rev-parse","HEAD:src")=="13880d9b0ba72aff5d4c5bcf5d12fe682c5de554"
assert cmd("git","status","--porcelain=v1")==""
assert cmd("git","ls-remote","origin","refs/heads/wip/headless-program-20260916-ts")=="f8c0628739227accfa446276b0613f47bc805a78\trefs/heads/wip/headless-program-20260916-ts"
sys.argv=[str(recorder),"--run-id","20261008-h-types-r2","--binding",str(binding),"--binding-sha",pins[binding]]
exec(compile(data[recorder],str(recorder),"exec"),{"__name__":"__main__","__file__":str(recorder)})
'
