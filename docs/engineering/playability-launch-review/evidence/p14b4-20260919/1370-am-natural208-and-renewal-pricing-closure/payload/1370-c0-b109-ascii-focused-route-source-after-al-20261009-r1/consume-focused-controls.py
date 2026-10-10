"""Held completed-run consumer; no producer execution. External tool outcome is mandatory."""
import hashlib,json,os,stat,sys
from pathlib import Path
from strict_contract import EXPECTED,exact,require,strict_json,validate_producer
HERE=Path(__file__).resolve().parent
OUTPUT=Path('/Users/zacheryspector/studio-scratch/1370-c0-b109-ascii-focused-controls-output-after-al-20261009-r1')
LANE=Path('/Users/zacheryspector/studio-scratch/1370-c0-b109-ascii-focused-controls-lane-after-al-20261009-r1')
GRANTDIR=Path('/Users/zacheryspector/studio-scratch/1370-c0-b109-ascii-focused-controls-parent-recorded-after-al-20261009-r1')
def metadata(st):return (st.st_dev,st.st_ino,st.st_size,st.st_mtime_ns,st.st_ctime_ns,st.st_mode,st.st_nlink)
def read_role(path,cap):
 p=Path(path);require(p.resolve(strict=True)==p and not p.is_symlink(),'PHYSICAL_ARTIFACT');before=p.lstat();require(stat.S_ISREG(before.st_mode) and before.st_nlink==1 and before.st_size<=cap,'ARTIFACT_CAP')
 fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
 try:
  require(metadata(os.fstat(fd))==metadata(before),'ARTIFACT_OPEN_RACE');data=bytearray()
  while True:
   b=os.read(fd,8192)
   if not b:break
   require(len(data)+len(b)<=cap,'ARTIFACT_READ_CAP');data.extend(b)
  require(metadata(os.fstat(fd))==metadata(before)==metadata(p.lstat()),'ARTIFACT_READ_RACE')
 finally:os.close(fd)
 raw=bytes(data);return raw,{'path':str(p),'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()}
def main():
 require(sys.dont_write_bytecode and not sys.flags.optimize and len(sys.argv)==3,'EXACT_PYTHON_B_OUTCOME_ARGS')
 outcome_path=Path(sys.argv[1]);require(outcome_path==GRANTDIR/'TOOL-OUTCOME.json','OUTCOME_PATH')
 raw,outcome_role=read_role(outcome_path,1048576);require(outcome_role['sha256']==sys.argv[2],'OUTCOME_HASH');o=strict_json(raw)
 require(o['schema']=='1370-root-b109-ascii-focused-controls-tool-outcome/v1' and o['status']=='ACTUAL_FOCUSED_CONTROLS_COMPLETE_AWAIT_INDEPENDENT_REVIEW','OUTCOME_SCHEMA')
 for field in ('actualToolExit','helperExit','helperMetaExit','recorderExit','nodeExit'):require(type(o[field]) is int and o[field]==0,'ALL_EXITS_ZERO_'+field.upper())
 require(type(o['helperPid']) is int and o['helperPid']>1,'HELPER_IDENTITY')
 grant_raw,grant_role=read_role(GRANTDIR/'GRANT.json',1048576);require(exact(o['grant'],grant_role),'OUTCOME_GRANT_ROLE');g=strict_json(grant_raw)
 claim_raw,claim_role=read_role(GRANTDIR/'LAUNCH-CLAIM.json',1048576);claim=strict_json(claim_raw);require(exact(o['launchClaim'],claim_role),'OUTCOME_LAUNCH_ROLE');require(claim['helperPid']==o['helperPid'] and exact(claim['grant'],grant_role),'CLAIM_HELPER_GRANT')
 sourcepins_raw,sourcepins_role=read_role(HERE/'SOURCE-PINS.json',1048576);require(exact(g['routeSourcePins'],sourcepins_role),'RUN_ROUTE_SOURCE_PINS')
 sourcepins=strict_json(sourcepins_raw)
 for wanted in sourcepins['files'].values():
  _,actual=read_role(wanted['path'],16777216);require(exact(actual,wanted),'CURRENT_ROUTE_SOURCE')
 result_raw,result_role=read_role(OUTPUT/'RESULT.json',1048576);result=strict_json(result_raw)
 stdout,stdout_role=read_role(OUTPUT/'stdout.bin',1048576);stderr,stderr_role=read_role(OUTPUT/'stderr.bin',1048576)
 producer=validate_producer(stdout,stderr)
 require(not os.path.lexists(OUTPUT/'OVERRIDE-STOP.json'),'NO_STOP_OVERRIDE')
 config_raw,_=read_role(HERE/'CONFIG.json',1048576);config_sha=hashlib.sha256(config_raw).hexdigest()
 require(result['schema']=='1370-b109-pure-encoder-recorder-r4' and result['status']=='PURE_ENCODER_CONTROLS_COMPLETE_UNADOPTED' and result['mode']=='controls' and result['configSha256']==config_sha,'RECORDER_RESULT')
 require(type(result['actualChildExit']) is int and result['actualChildExit']==0,'CHILD_EXIT_ZERO')
 require(type(result['childPid']) is int and result['childPid']>1 and type(result['ownedPgid']) is int and result['ownedPgid']==result['childPid'],'OWNED_IDENTITY')
 for name,wanted in (('startupOwnedBeforeExec',True),('pgidConfirmed',True),('groupClear',True),('timedOut',False),('game',False),('sourceOrGameplayAdoption',False),('executionAuthorization',False)):require(type(result[name]) is bool and result[name] is wanted,'RECORDER_FLAG_'+name.upper())
 require(exact(result['boundsSeconds'],{'node':60,'active':75,'whole':90}),'RECORDER_BOUNDS')
 require(type(result['elapsedSeconds']) in (int,float) and 0<=result['elapsedSeconds']<75,'RECORDER_ELAPSED')
 for name,r in (('stdout',stdout_role),('stderr',stderr_role)):
  require(type(result[name+'Bytes']) is int and result[name+'Bytes']==r['bytes'] and result[name+'Sha256']==r['sha256'],'RECORDED_STREAM_ROLE')
 lane_raw,lane_role=read_role(LANE/'controls.lane.log',1048576);meta_raw,meta_role=read_role(LANE/'controls.lane.log.meta',1048576)
 require(exact(o['laneLog'],lane_role) and exact(o['laneMeta'],meta_role),'HELPER_STREAM_ROLES')
 require(exact(o['actualOwnedGroupsFreshlyAbsent'],[o['helperPid'],result['ownedPgid']]) and o['heavyLaneLockAbsent'] is True,'RECORDED_OWNERSHIP_AND_LANE_CLEAR')
 meta=meta_raw.decode('utf-8',errors='strict');require(meta.count('start; ')==1 and meta.count('end, exit ')==1 and 'end, exit 0; ' in meta and 'STOP:' not in meta,'HELPER_META_EXIT_ZERO')
 summary_lines=[line for line in lane_raw.decode('utf-8',errors='strict').splitlines() if line.startswith('{')]
 require(len(summary_lines)==1,'RECORDER_SUMMARY_COUNT');summary=strict_json(summary_lines[0]);require(exact(summary,{'status':'PURE_ENCODER_CONTROLS_COMPLETE_UNADOPTED','output':str(OUTPUT),'actualChildExit':0,'groupClear':True}),'RECORDER_SUMMARY')
 print(json.dumps({'schema':'1370-b109-ascii-focused-controls-consumption/v1','status':'EXACT_COMPLETED_FOCUSED_CONTROLS_CONSUMED_UNADOPTED','outcome':outcome_role,'grant':grant_role,'launchClaim':claim_role,'result':result_role,'stdout':stdout_role,'stderr':stderr_role,'laneLog':lane_role,'laneMeta':meta_role,'producer':producer,'helperPid':o['helperPid'],'childPid':result['childPid'],'ownedPgid':result['ownedPgid'],'independentObservedReview':None,'performanceWin':False,'game':False},sort_keys=True))
if __name__=='__main__':main()
