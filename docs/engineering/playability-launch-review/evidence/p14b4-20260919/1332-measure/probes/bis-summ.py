import json,sys,glob,os
S=sys.argv[1]; pats=sys.argv[2:]
for f in sorted(glob.glob(S+'/bisU-out/*.json'), key=os.path.getmtime):
    try: d=json.load(open(f))
    except Exception as e: print(os.path.basename(f),'unreadable',e); continue
    print('==',os.path.basename(f),'pass',d['numPassedTests'],'fail',d['numFailedTests'],'suitesFailed',d['numFailedTestSuites'])
    for t in d['testResults']:
        if t.get('message'): print('   SUITE',t['name'].split('/')[-1],t['message'][:200])
        for a in t['assertionResults']:
            if a['status']=='failed' and any(p in a['fullName'] for p in pats):
                print('   F',a['fullName'][:120],'|',(a['failureMessages'] or [''])[0].split('\n')[0][:200])
