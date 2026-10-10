"""Root-granted pure mechanism checks; imports only two authenticated public modules."""
from pathlib import Path
import hashlib,importlib.util,json,os,stat,sys,time
HERE=Path(__file__).resolve().parent
def role(p,cap=16777216):
 p=Path(p);s=p.lstat();assert p.is_absolute() and p.resolve(strict=True)==p and stat.S_ISREG(s.st_mode) and s.st_nlink==1 and s.st_size<=cap
 b=p.read_bytes();after=p.lstat();assert (s.st_dev,s.st_ino,s.st_mode,s.st_size,s.st_mtime_ns,s.st_ctime_ns)==(after.st_dev,after.st_ino,after.st_mode,after.st_size,after.st_mtime_ns,after.st_ctime_ns)
 return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def read(r):assert role(r['path'])==r;return json.loads(Path(r['path']).read_bytes())
def imported(r,name):
 assert role(r['path'])==r
 spec=importlib.util.spec_from_file_location(name,r['path']);module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
 assert role(r['path'])==r;return module
def main():
 assert sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize and len(sys.argv)==3
 started=time.monotonic();gr=role(sys.argv[1],131072);assert gr['sha256']==sys.argv[2];g=read(gr);c=json.loads((HERE/'CONFIG.json').read_bytes())
 assert g['schema']=='1370-root-original-guard-diagnostic-pure-controls-once-grant/v1' and g['executionAuthorization'] is True and g['oneAggregateRun'] is True and g['automaticRetry'] is False
 assert g['config']==role(HERE/'CONFIG.json') and g['bounds']==c['bounds'] and g['outputPath']==c['outputPath'] and g['python']==c['python']
 assert Path(sys.executable).resolve(strict=True)==Path(c['python']['path']) and role(c['python']['path'])==c['python']
 source=read(g['sourceManifest']);sr=read(g['sourceReview']);assert sr['schema']=='1370-original-guard-diagnostic-pure-runner-independent-source-review/v1' and sr['decision']=='ACCEPT_STATIC_ORIGINAL_GUARD_DIAGNOSTIC_PURE_RECORDED_RUNNER_SOURCE_ONLY' and sr['sourceManifest']==g['sourceManifest'] and sr['concreteFindings']==[] and sr['executionAuthorization'] is False
 for r in source['files'].values():assert role(r['path'])==r
 for name in ['run_pure_controls.py','record_pure_controls.py','CONFIG.json']:assert sr['sourcePins'][name]==sr['routeSourcePins'][name]==source['files'][name]
 assert source['files']['run_pure_controls.py']==role(__file__)
 for prefix,schema,decision in [('diagnostic','1370-original-shared-postflight-diagnostic-independent-source-review/v1','ACCEPT_STATIC_ORIGINAL_SHARED_POSTFLIGHT_EXCEPTION_DIAGNOSTIC_SOURCE_ONLY'),('controls','1370-original-guard-diagnostic-controls-independent-source-review/v1','ACCEPT_STATIC_ORIGINAL_GUARD_DIAGNOSTIC_CONTROLS_SOURCE_ONLY')]:
  mr=c[prefix+'SourceManifest'];rv=c[prefix+'SourceReview'];manifest=read(mr);review=read(rv)
  assert review['schema']==schema and review['decision']==decision and review['sourceManifest']==mr and review['concreteFindings']==[] and review['executionAuthorization'] is False
  for name,r in manifest['files'].items():assert role(r['path'])==r
  for name in c[prefix+'Aliases']:assert review['sourcePins'][name]==review['routeSourcePins'][name]==manifest['files'][name]
  assert g[prefix+'SourceManifest']==mr and g[prefix+'SourceReview']==rv
 dm=read(c['diagnosticSourceManifest']);cm=read(c['controlsSourceManifest']);matrix=read(cm['files']['MATRIX.json'])
 assert matrix['caseCount']==32 and matrix['positiveCount']==9 and matrix['specificNegativeCount']==23
 out=Path(c['outputPath']);assert out.parent==HERE.parent and not os.path.lexists(out);out.mkdir(mode=0o700)
 diagnostic=imported(dm['files']['diagnose_shared_post.py'],'authenticated_pure_diagnostic_module')
 controls=imported(cm['files']['run_guard_diagnostic_controls.py'],'authenticated_pure_diagnostic_controls')
 api={n:getattr(diagnostic,n) for n in ['differences','run_original','emit','MAP_CAP','SUMMARY_CAP']}
 report=controls.runGuardDiagnosticControls(api,out)
 assert report['schema']=='1370-original-shared-postflight-diagnostic-independent-controls-result/v1' and report['status']=='PURE_SHARED_POSTFLIGHT_EXCEPTION_DIAGNOSTIC_CONTROLS_COMPLETE_UNADOPTED'
 assert report['caseCount']==32 and report['positiveCount']==9 and report['specificNegativeCount']==23
 assert report['results']==[{**r,'verdict':'ACCEPT_POSITIVE' if r['expected']=='GREEN' else 'ACCEPT_SPECIFIC_REFUSAL'} for r in matrix['cases']]
 for key in ['originalGuardExecuted','protectedTreesReadOrWritten','game','executionAuthorization']:assert report[key] is False
 for manifest in [dm,cm,source]:
  for r in manifest['files'].values():assert role(r['path'])==r
 artifacts=[role(p) for p in sorted(out.iterdir())];assert len(artifacts)<=32 and sum(r['bytes'] for r in artifacts)<=c['bounds']['syntheticArtifactBytes']
 report.update({'grant':gr,'sourceManifest':g['sourceManifest'],'sourceReview':g['sourceReview'],'diagnosticSourceManifest':c['diagnosticSourceManifest'],'diagnosticSourceReview':c['diagnosticSourceReview'],'controlsSourceManifest':c['controlsSourceManifest'],'controlsSourceReview':c['controlsSourceReview'],'syntheticArtifactsLocalOnly':artifacts,'syntheticArtifactDisposition':'LOCAL_HASH_SIZE_ONLY_REBUILDABLE_SYNTHETIC_EMITTER_EVIDENCE','elapsedSeconds':time.monotonic()-started,'workerPid':os.getpid(),'workerPgid':os.getpgrp(),'workerSid':os.getsid(0)})
 raw=(json.dumps(report,sort_keys=True,indent=2)+'\n').encode();assert len(raw)<=131072
 p=out/'RESULT.json';fd=os.open(p,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
 with os.fdopen(fd,'wb') as f:f.write(raw);f.flush();os.fsync(f.fileno())
 print(json.dumps({'status':report['status'],'result':role(p,131072),'caseCount':32},separators=(',',':')))
if __name__=='__main__':main()
