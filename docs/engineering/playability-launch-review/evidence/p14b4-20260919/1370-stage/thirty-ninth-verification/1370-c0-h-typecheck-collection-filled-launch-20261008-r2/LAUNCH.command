/usr/local/bin/python3 -I -B -c 'import hashlib,json,os,pathlib,stat,sys,subprocess,shutil
s=pathlib.Path("/Users/zacheryspector/studio-scratch")
repo=pathlib.Path("/Users/zacheryspector/The-Movies-headless-program")
recorder=s/"1370-c0-h-typecheck-collection-runner-proposal-r5/recorder.py"
runner=s/"1370-c0-h-typecheck-collection-runner-proposal-r5/runner.py"
static_review=s/"1370-c0-h-typecheck-collection-runner-independent-static-review-r5/RECEIPT.json"
observed=s/"1370-c0-h-mirror-independent-observed-review-r1/RECEIPT.json"
materialized=s/"1370-c0-h-m0-observer-mirrors-r2/20261008-h-types-r1.MATERIALIZE-RESULT.json"
binding=s/"1370-c0-h-typecheck-collection-filled-launch-20261008-r2/BINDING.json"
pins={recorder:"f6bd69624720e32dfc3d512f02914fc12adaa38147ee5764bb872a18652390fa",runner:"0fe66879521909362fa746044485b58b8a61b411038d40343465042aa183b50b",static_review:"97eabe8071c4e74fa170fe82ed86811142f36739341b6f9fde3a5c0ec23f41f8",observed:"bb61794d874cdc80f1283459d9eca49c5174de441cde9dcbe971d36e2b9f226e",materialized:"b8c70f731fc730cea3ba7238674fb964fb973e6ffcf58fcb03e0dbbd139196b6",binding:"b7cc5620534abd4d7fb12abf9fe111d747334623aa3f114b572583b0f543d662"}
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
assert r["decision"]=="ACCEPT_STATIC_ONLY" and r["runnerSha256"]==pins[runner] and r["recorderSha256"]==pins[recorder] and r["observedMirrorDigest"]=="55fd1afb4437386867cdb23c5daf137e9613d41e51f31dafc619bedf37bc59a4"
assert o["decision"]=="ACCEPT_OBSERVED_H_MIRROR_SOURCE_ONLY" and o["materializerResultSha256"]==pins[materialized] and o["readbackChildExit"]==0
assert m["status"]=="MIRROR_MATERIALIZED_SOURCE_ONLY" and m["arm"]=="H" and m["runId"]=="20261008-h-types-r1"
assert b["status"]=="FILLED_INDEPENDENT_REVIEW_REQUIRED" and b["runId"]=="20261008-h-types-r3" and b["materializerResultSha256"]==pins[materialized] and b["observedHMirrorReceiptSha256"]==pins[observed] and b["runnerStaticReviewSha256"]==pins[static_review] and b["fullMirrorFileProofDigestSha256"]==r["observedMirrorDigest"] and b["expectedMirrorFiles"]==1344 and b["expectedMirrorBytes"]==98158847
assert not (s/"HEAVY-LANE-LOCK").exists()
assert not (s/"c0-h-types-20261008-h-types-r3.lane.log").exists()
assert not (s/"c0-h-types-20261008-h-types-r3.lane.log.meta").exists()
assert not (s/"1370-c0-h-typecheck-collection-results-r5/20261008-h-types-r3").exists()
assert not (s/"1370-c0-h-typecheck-collection-results-r5/20261008-h-types-r3.RECORDER.json").exists()
assert subprocess.check_output(["pmset","-g","batt"],text=True).splitlines()[:1]==["Now drawing from "+chr(39)+"AC Power"+chr(39)]
assert shutil.disk_usage(s).free>=3758096384
cmd=lambda *a:subprocess.check_output(a,cwd=repo,text=True).strip()
assert cmd("git","rev-parse","HEAD")=="f8c0628739227accfa446276b0613f47bc805a78"
assert cmd("git","rev-parse","HEAD:src")=="13880d9b0ba72aff5d4c5bcf5d12fe682c5de554"
assert cmd("git","status","--porcelain=v1")==""
assert cmd("git","ls-remote","origin","refs/heads/wip/headless-program-20260916-ts")=="f8c0628739227accfa446276b0613f47bc805a78\trefs/heads/wip/headless-program-20260916-ts"
sys.argv=[str(recorder),"--run-id","20261008-h-types-r3","--binding",str(binding),"--binding-sha",pins[binding]]
exec(compile(data[recorder],str(recorder),"exec"),{"__name__":"__main__","__file__":str(recorder)})
'
