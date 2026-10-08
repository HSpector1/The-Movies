#!/usr/bin/env python3
"""Disposable after-open REDs against frozen r2/r3 and current r4 source."""
import importlib.util,os,signal,sys
from pathlib import Path

variant,output_raw,stage_raw,protected_raw=sys.argv[1:]
HERE=Path(__file__).resolve().parent
source=(HERE.parent/'1370-c0-stage41-publisher-proposal-r2'/'publish_stage41.py') if variant=='r2' else (HERE.parent/'1370-c0-stage41-publisher-proposal-r3'/'publish_stage41.py') if variant.startswith('r3') else HERE/'publish_stage41.py'
spec=importlib.util.spec_from_file_location('race_publisher_'+variant,source)
p=importlib.util.module_from_spec(spec);spec.loader.exec_module(p)
output=Path(output_raw);stage=Path(stage_raw);protected=Path(protected_raw)
if variant=='r2':
 logs=p.RunLogs(output,[protected,stage],synthetic=True)
 original=os.write;paused=False
 def trapped(fd,data):
  global paused
  if not paused:
   paused=True
   print('READY_AFTER_R2_OPEN_BEFORE_WRITE',flush=True)
   os.kill(os.getpid(),signal.SIGSTOP)
  return original(fd,data)
 os.write=trapped
else:
 logs=p.RunLogs(output,[protected,stage],stage,synthetic=True)
 if variant in ('r3_stage','r4_stage'):
  original=os.write;paused=False
  def trapped(fd,data):
   global paused
   if not paused:
    paused=True
    print('READY_AFTER_STAGE_OPEN_BEFORE_WRITE',flush=True)
    os.kill(os.getpid(),signal.SIGSTOP)
   return original(fd,data)
  os.write=trapped
logs.write('CHILD-STDOUT.bin',b'bounded raw bytes after open\n',p.RAW_CAP)
try:logs.finish({'status':'RACE_SYNTHETIC_ONLY'})
finally:logs.close()
