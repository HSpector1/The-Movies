import hashlib,json,pathlib,subprocess,sys,time
A=pathlib.Path('/Users/zacheryspector/studio-scratch/1370-astra-takeover-20261012')
R=pathlib.Path('/Users/zacheryspector/The-Movies-headless-program')
inputs={'p15b-nonleak267-watchdog-r3.py':'a11088d97560cd3938d26554535c25a1a7e3c448190b263424502e144b70d4c8','p15b-nonleak267-watchdog-r3-verify-r2.py':'bb092c0a9abe29301a68a2bcc68ad05441aff4dd0285e4e6a9ca77e36f541511'}
def freeze():return {f:hashlib.sha256((A/f).read_bytes()).hexdigest() for f in inputs}
def space():return int(subprocess.check_output(['df','-Pk',str(R)],text=True).splitlines()[1].split()[3])
assert freeze()==inputs
assert space()>=3670016,'disk launch floor'
assert (A.parent/'HEAVY-LANE-LOCK').is_file(),'missing lane'
before=space();start=time.monotonic()
r=subprocess.run([sys.executable,'-I','-B',str(A/'p15b-nonleak267-watchdog-r3-verify-r2.py')])
assert freeze()==inputs
assert space()>=3145728,'disk runtime floor'
print(json.dumps({'kind':'isolated watchdog verification','exit':r.returncode,'seconds':time.monotonic()-start,'beforeKiB':before,'afterKiB':space(),'inputs':inputs,'unchanged':True}),flush=True)
sys.exit(r.returncode)
