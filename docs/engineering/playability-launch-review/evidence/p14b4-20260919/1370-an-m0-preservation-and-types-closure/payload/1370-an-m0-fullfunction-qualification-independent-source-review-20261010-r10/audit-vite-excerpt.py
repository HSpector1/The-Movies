import os,stat,hashlib,json
from pathlib import Path
B=Path(__file__).parent
i=json.loads((B/'VITE-EXCERPT-INPUT.json').read_bytes());raw={}
for k,r in i['roles'].items():
 p=Path(r['path']);assert p.resolve(strict=True)==p and str(p).startswith('/Users/zacheryspector/studio-scratch/')
 fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  a=os.fstat(fd);assert stat.S_ISREG(a.st_mode) and a.st_nlink==1 and a.st_size<16384
  b=os.read(fd,16384);z=os.fstat(fd);assert (a.st_dev,a.st_ino,a.st_size,a.st_mtime_ns,a.st_ctime_ns)==(z.st_dev,z.st_ino,z.st_size,z.st_mtime_ns,z.st_ctime_ns)
  assert len(b)==r['bytes'] and hashlib.sha256(b).hexdigest()==r['sha256'];raw[k]=b
 finally:os.close(fd)
pins=json.loads(raw['excerptSourcePins']);assert pins['excerpt']==i['roles']['excerpt'] and pins['source']==i['implementation'] and pins['noRuntimeOrReproduction'] is True
checks={'ordinaryCreateFilterRejectsNulIds':True,'originalLoaderUsesPhysicalExtension':True,'originalApiUsesPhysicalFilenameForTsconfigLookup':True,'helperResolvedEsbuildOptionsAndOverridesMatchOriginalPlugin':True,'supportedDynamicImportAndImportMetaDefaultsMatch':True,'existingCanonicalResolverAndRawSourceHashesPreserved':True,'helperReturnsOriginalApiCodeAndSourceMap':True,'warningsRetainedViaPluginWarn':True,'jsxInjectExplicitlyExcludedByPinnedNonJsxGraph':True,'exactFailedVirtualTokenCaptured':False}
encoded=(json.dumps({'schema':'1370-independent-r10-vite-source-excerpt-audit/v1','roles':i['roles'],'implementationRecordedSource':pins['source'],'allRoleBytesMatched':True,'manualSourceComparison':checks,'reviewerPrivateSourceRead':False,'reviewerRuntimeOrReproduction':False},sort_keys=True,indent=2)+'\n').encode()
p=B/'VITE-EXCERPT-READBACK.json';fd=os.open(p,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
with os.fdopen(fd,'wb') as f:f.write(encoded);f.flush();os.fsync(f.fileno())
print(json.dumps({'path':str(p),'bytes':len(encoded),'sha256':hashlib.sha256(encoded).hexdigest()}))

