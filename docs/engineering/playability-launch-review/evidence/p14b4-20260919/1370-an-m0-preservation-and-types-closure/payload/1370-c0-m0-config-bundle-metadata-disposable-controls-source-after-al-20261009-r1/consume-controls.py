"""Source-only retained-evidence consumer; never launches, probes, imports application source, or grants."""
import hashlib,json,math,os,pathlib,stat,sys
HERE=pathlib.Path(__file__).resolve().parent
CONFIG_SHA='90331fd97252bca6ce83c6704e8e9740f120026f14a1a6e44198d0eb15dcdb9e'
CAP=1048576;LEDGER=65536
def need(v,m):
 if not v:raise RuntimeError('STOP_'+m)
def pairs(rows):
 result={}
 for k,v in rows:
  need(k not in result,'DUPLICATE_JSON_KEY');result[k]=v
 return result
def parse(raw):
 return json.loads(raw.decode('utf-8'),object_pairs_hook=pairs,parse_constant=lambda x:(_ for _ in ()).throw(RuntimeError('STOP_JSON_CONSTANT')))
def digest(raw):return hashlib.sha256(raw).hexdigest()
def meta(st):return (st.st_dev,st.st_ino,st.st_mode,st.st_nlink,st.st_size,st.st_mtime_ns,st.st_ctime_ns)
def read(p,cap):
 p=pathlib.Path(p);need(p.is_absolute() and p.resolve(strict=True)==p and not p.is_symlink(),'PHYSICAL_ARTIFACT')
 before=p.lstat();need(stat.S_ISREG(before.st_mode) and before.st_nlink==1 and before.st_size<=cap,'ARTIFACT_KIND_CAP')
 fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  need(meta(os.fstat(fd))==meta(before),'OPEN_RACE')
  with os.fdopen(fd,'rb',closefd=False) as f:raw=f.read(cap+1)
  need(len(raw)<=cap and meta(os.fstat(fd))==meta(before)==meta(p.lstat()),'READ_RACE');return raw
 finally:os.close(fd)
def role(r,cap=CAP,exact_path=None):
 need(type(r) is dict and set(r)=={'path','bytes','sha256'},'ROLE_KEYS')
 need(type(r['bytes']) is int and 0<=r['bytes']<=cap and type(r['path']) is str and type(r['sha256']) is str and len(r['sha256'])==64,'ROLE_TYPES')
 if exact_path is not None:need(r['path']==str(exact_path),'ROLE_PATH')
 raw=read(r['path'],cap);need(len(raw)==r['bytes'] and digest(raw)==r['sha256'],'ROLE_AUTH');return raw
def intzero(v):return type(v) is int and v==0
def posint(v):return type(v) is int and v>1
def finite(v):return type(v) in (int,float) and math.isfinite(v)
def exactkeys(obj,names):need(type(obj) is dict and set(obj)==set(names),'EXACT_KEYS')
def main():
 need(sys.flags.isolated and sys.dont_write_bytecode and not sys.flags.optimize,'PYTHON_I_B')
 need(len(sys.argv)==3 and len(sys.argv[2])==64,'ARGV')
 raw=read(sys.argv[1],LEDGER);need(digest(raw)==sys.argv[2],'OUTCOME_HASH');outcome=parse(raw)
 exactkeys(outcome,['schema','status','sourcePins','sourceReview','grant','launchClaim','actualTool','recipe','config',
  'recorderResult','producerStdout','producerStderr','helperCombinedLog','laneMeta','actualExits',
  'helperPid','helperPgid','helperSid','actualOwnedPidsFreshlyAbsent','actualOwnedGroupsFreshlyAbsent',
  'laneReleased','overrideStopAbsent','oneAggregateRun','automaticRetry'])
 need(outcome['schema']=='1370-disposable-controls-completed-outcome/v1' and outcome['status']=='ACTUAL_DISPOSABLE_METADATA_CONTROLS_COMPLETED','OUTCOME')
 configraw=role(outcome['config'],LEDGER,HERE/'CONFIG.json');need(digest(configraw)==CONFIG_SHA,'CONFIG_PIN');config=parse(configraw)
 pins=parse(role(outcome['sourcePins'],LEDGER,HERE/'SOURCE-PINS.json'))
 need(pins['schema']=='1370-disposable-controls-source-pins/v1' and pins['executionAuthorization'] is False,'PINS_PROTOCOL')
 for name,r in pins['files'].items():role(r,16*CAP,HERE/name)
 need(pins['files']['CONFIG.json']==outcome['config'],'PINNED_CONFIG_ROLE')
 recipe=parse(role(outcome['recipe'],LEDGER,HERE/'RECIPE.json'));need(pins['files']['RECIPE.json']==outcome['recipe'],'RECIPE_PIN')
 review=parse(role(outcome['sourceReview'],LEDGER))
 need(review['schema']=='1370-disposable-controls-independent-source-review/v1'
  and review['decision']=='ACCEPT_SOURCE_ONLY_UNRUN_HELD'
  and review['routeSourcePins']==outcome['sourcePins'] and review['concreteFindings']==[]
  and review['executionAuthorization'] is False,'GENUINE_SOURCE_REVIEW')
 grant=parse(role(outcome['grant'],LEDGER))
 need(grant['schema']=='1370-disposable-controls-root-once-grant/v1'
  and grant['decision']=='GRANTED_ONCE_DISPOSABLE_METADATA_CONTROLS'
  and grant['sourcePins']==outcome['sourcePins'] and grant['sourceReview']==outcome['sourceReview']
  and grant['recipe']==outcome['recipe'] and grant['config']==outcome['config']
  and grant['argv']==recipe['argv'] and grant['cwd']==recipe['cwd']
  and grant['oneAggregateRun'] is True and grant['automaticRetry'] is False,'SEPARATE_ONCE_GRANT')
 claim=parse(role(outcome['launchClaim'],LEDGER))
 need(claim['schema']=='1370-disposable-controls-launch-claim/v1' and claim['grant']==outcome['grant']
  and claim['argv']==recipe['argv'] and claim['cwd']==recipe['cwd'],'LAUNCH_CLAIM')
 actual=parse(role(outcome['actualTool'],LEDGER))
 need(actual['schema']=='1370-disposable-controls-retained-tool/v1' and intzero(actual['actualExit'])
  and actual['launchClaim']==outcome['launchClaim'] and type(actual['toolResult']) is dict
  and intzero(actual['toolResult']['exit_code']),'ACTUAL_TOOL')
 need(outcome['actualExits']=={'tool':0,'helper':0,'recorder':0,'controller':0,'RED':0,'GREEN':0}
  and all(intzero(v) for v in outcome['actualExits'].values()),'SIX_ACTUAL_EXITS')
 for key in ['helperPid','helperPgid','helperSid']:
  need(posint(outcome[key]) and claim[key]==outcome[key] and type(claim[key]) is int,'ACTUAL_HELPER_IDENTITIES')
 need(outcome['helperPid']==outcome['helperPgid'] and claim['actualOwnGroupConfirmed'] is True,'HELPER_OWN_GROUP')
 result=parse(role(outcome['recorderResult'],LEDGER,pathlib.Path(recipe['recorderOutput'])/'RESULT.json'))
 need(result['schema']=='1370-b109-pure-encoder-recorder-r4' and result['status']=='M0_DISPOSABLE_METADATA_VERIFICATION_COMPLETE_UNADOPTED'
  and result['configSha256']==CONFIG_SHA and result['mode']=='verification' and intzero(result['actualChildExit'])
  and posint(result['childPid']) and type(result['ownedPgid']) is int and result['ownedPgid']==result['childPid']
  and result['startupOwnedBeforeExec'] is True and result['pgidConfirmed'] is True and result['groupClear'] is True
  and result['timedOut'] is False and finite(result['elapsedSeconds']) and 0<=result['elapsedSeconds']<75
  and result['boundsSeconds']=={'node':60,'active':75,'whole':90}
  and all(type(v) is int for v in result['boundsSeconds'].values()),'RECORDED_RESULT')
 need(outcome['actualOwnedPidsFreshlyAbsent']==[outcome['helperPid'],result['childPid']]
  and outcome['actualOwnedGroupsFreshlyAbsent']==[outcome['helperPgid'],result['ownedPgid']]
  and all(type(v) is int for v in outcome['actualOwnedPidsFreshlyAbsent']+outcome['actualOwnedGroupsFreshlyAbsent']),'FRESH_SCOPED_ABSENCE')
 for key in ['laneReleased','overrideStopAbsent','oneAggregateRun']:need(outcome[key] is True,key)
 need(outcome['automaticRetry'] is False,'NO_AUTOMATIC_RETRY')
 lane=role(outcome['laneMeta'],LEDGER,pathlib.Path(recipe['laneLog']+'.meta')).decode('utf-8').splitlines()
 need(sum(line.startswith('start; ') for line in lane)==1
  and sum(line.startswith('end, exit 0; ') for line in lane)==1
  and not any('STOP:' in line for line in lane),'ORIGINAL_LANE_META')
 # The retained helper log may include the byte-unchanged Python main outer-finally SyntaxWarning.
 helper=role(outcome['helperCombinedLog'],CAP,pathlib.Path(recipe['laneLog']))
 stdout=role(outcome['producerStdout'],CAP,pathlib.Path(recipe['recorderOutput'])/'stdout.bin')
 stderr=role(outcome['producerStderr'],CAP,pathlib.Path(recipe['recorderOutput'])/'stderr.bin')
 need(len(stderr)==0 and result['stderrBytes']==0 and result['stderrSha256']==digest(stderr)
  and type(result['stderrBytes']) is int and type(result['stdoutBytes']) is int
  and result['stdoutBytes']==len(stdout) and result['stdoutSha256']==digest(stdout),'PRODUCER_STREAMS')
 need(stdout.endswith(b'\n') and len(stdout.splitlines())==1,'ONE_JSON_FRAME')
 report=parse(stdout)
 need(report['schema']=='1370-disposable-config-metadata-controls-report/v1' and report['status']=='M0_CONFIG_METADATA_CONTROLS_AGREE'
  and report['configSha256']==CONFIG_SHA and report['artifactRoot']==config['artifactRoot']
  and report['fixtureRoot']==config['artifactRoot']+'/mirror'
  and report['versions']=={'node':'v22.23.2','vitest':'2.1.9','vite':'5.4.21'},'REPORT')
 need(type(report['collectedTests']) is int and report['collectedTests']==1
  and report['sameCollectedIdentity'] is True and report['redMetadataChanged'] is True
  and report['greenStrictMetadataStable'] is True and report['sourceLoaderBranchAuthenticated'] is True
  and report['transientFileEventEvidence'] is None and report['eventTracerInstalled'] is False
  and report['originalM0CauseAdmission'] is False and report['originalM0SourcePreservationAdmission'] is False
  and report['game'] is False and report['executionAuthorization'] is False
  and finite(report['aggregateElapsedSeconds']) and 0<=report['aggregateElapsedSeconds']<60,'SCOPE_AND_CLOCK')
 fixture=report['fixtureRoot'];external=config['artifactRoot']+'/external';streams=config['artifactRoot']+'/streams'
 need(type(report['arms']) is list and len(report['arms'])==2,'ARM_COUNT')
 collections=[]
 for arm,label,configdir in zip(report['arms'],['RED','GREEN'],[fixture,external]):
  need(arm['arm']==label and intzero(arm['actualExit']) and arm['actualSignal'] is None
   and posint(arm['cliPid']) and arm['runError'] is None and finite(arm['elapsedSeconds']) and 0<=arm['elapsedSeconds']<60,'ARM_EXIT')
  expected=[config['nodePath'],config['roles']['cli']['path'],'list','tests/meta-control.test.ts',
   '--config',configdir+'/vitest.config.mts','--workspace',configdir+'/vitest.workspace.mts',
   '--project','core','--json',streams+'/'+label+'-collection.json','--no-cache']
  need(arm['argv']==expected and arm['cwd']==fixture and arm['configDir']==configdir
   and arm['rootConfig']==configdir+'/vitest.config.mts' and arm['workspaceConfig']==configdir+'/vitest.workspace.mts'
   and arm['projectConfig']==configdir+'/core.config.mts','REAL_CONFIG_ROUTE')
  role(arm['stdout'],CAP,pathlib.Path(streams)/(label+'-stdout.bin'))
  role(arm['stderr'],CAP,pathlib.Path(streams)/(label+'-stderr.bin'))
  before=parse(role(arm['before'],LEDGER,pathlib.Path(streams)/(label+'-before.json')))
  after=parse(role(arm['after'],LEDGER,pathlib.Path(streams)/(label+'-after.json')))
  for value in [before,after]:
   need(value['schema']=='1370-disposable-strict-metadata-map/v1' and value['root']==fixture
    and value['metadataFields']==['dev','ino','mode','nlink','size','mtimeNs','ctimeNs']
    and type(value['entries']) is list and len(value['entries'])==8,'MAP_PROTOCOL')
   need([r['path'] for r in value['entries']]==['.','core.config.mts','node_modules','package.json','tests',
    'tests/meta-control.test.ts','vitest.config.mts','vitest.workspace.mts'],'MAP_ROSTER')
   for row in value['entries']:
    need(type(row['metadata']) is list and len(row['metadata'])==7
     and all(type(v) is str and v.isdecimal() for v in row['metadata']),'EXACT_NS_STRINGS')
  need(before['entries'][1:]==after['entries'][1:],'NONROOT_EXACT')
  b=before['entries'][0]['metadata'];a=after['entries'][0]['metadata']
  changed=[field for field,x,y in zip(before['metadataFields'],b,a) if x!=y]
  expectedmeta={'strictRootEqual':b==a,'completeMapEqual':before==after,'changedRootFields':changed,'nonrootEqual':True,'finalRosterEqual':True}
  need(arm['metadata']==expectedmeta and all(type(arm['metadata'][k]) is bool for k in ['strictRootEqual','completeMapEqual','nonrootEqual','finalRosterEqual']),'RECOMPUTED_MAP_RESULT')
  if label=='RED':need(b[:4]==a[:4] and b!=a and b[5]!=a[5] and b[6]!=a[6],'ACTUAL_RED_METADATA')
  else:need(before==after,'ACTUAL_GREEN_FULL_MAP')
  collection=role(arm['collection'],LEDGER,pathlib.Path(streams)/(label+'-collection.json'));rows=parse(collection)
  need(rows==[{'name':'metadata-collected-only','file':fixture+'/tests/meta-control.test.ts','projectName':'core'}]
   and arm['collected']==rows,'ACTUAL_ONE_SAME_TEST');collections.append(collection)
  validated=parse(read(streams+'/'+label+'-validated.json',LEDGER));need(validated==arm,'RETAINED_VALIDATED_ARM')
 need(collections[0]==collections[1],'SAME_RAW_COLLECTION')
 need(type(report['generatedConfigs']) is list and len(report['generatedConfigs'])==6,'CONFIG_ROSTER')
 generated={}
 for r in report['generatedConfigs']:
  need(r['path'] in [base+'/'+name for base in [fixture,external] for name in ['vitest.config.mts','core.config.mts','vitest.workspace.mts']]
   and r['path'] not in generated,'CONFIG_UNIQUE_PATH')
  generated[r['path']]=role(r,LEDGER)
 for base in [fixture,external]:
  root={'root':fixture,'cacheDir':external+'/cache','test':{'name':'root-unselected','workspace':base+'/vitest.workspace.mts','include':['tests/never-root.test.ts'],'watch':False,'cache':False}}
  project={'root':fixture,'cacheDir':external+'/cache','test':{'name':'core','include':['tests/meta-control.test.ts'],'environment':'node','globals':False,'watch':False,'cache':False,
   'pool':'forks','poolOptions':{'forks':{'singleFork':True}},'fileParallelism':False,'deps':{'optimizer':{'ssr':{'enabled':False},'web':{'enabled':False}}}}}
  for name,obj in [('vitest.config.mts',root),('core.config.mts',project)]:
   expected=('export default '+json.dumps(obj,separators=(',',':'))+';\n').encode();need(generated[base+'/'+name]==expected,'EXACT_CONFIG_OPTIONS')
  need(generated[base+'/vitest.workspace.mts']==b"export default [{ extends: './core.config.mts' }];\n",'EXTERNAL_EXTENDS_REBASE')
 need(parse(read(streams+'/generated-configs.json',LEDGER))==report['generatedConfigs'],'RETAINED_CONFIG_ROLES')
 need(parse(read(streams+'/REPORT.json',LEDGER))==report,'RETAINED_REPORT')
 summary={'schema':'1370-disposable-controls-consumption/v1','decision':'ACCEPT_ACTUAL_DISPOSABLE_PAIR_ONLY',
  'outcomePath':sys.argv[1],'outcomeSha256':sys.argv[2],'redMetadataChanged':True,'greenFullFixtureMetadataStable':True,
  'sameRawCollectedTestIdentity':True,'collectedTests':1,'helperCombinedLogBytes':len(helper),'producerStderrBytes':0,
  'originalM0CauseAdmission':False,'originalM0SourcePreservationAdmission':False,'game':False,'executionAuthorization':False}
 print(json.dumps(summary,sort_keys=True))
if __name__=='__main__':
 try:main()
 except BaseException as exc:
  print(json.dumps({'schema':'1370-disposable-controls-consumption/v1','decision':'STOP','error':repr(exc)}));sys.exit(2)
