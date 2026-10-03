import json, re, collections, sys
S='/private/tmp/claude-501/-Users-zacheryspector-Downloads-project-studio-p13-owner-direction-inputs-01/60db833c-4cf7-4685-b2ec-8aac42c6dac1/scratchpad'
E='/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919'
blocks=[]; cur={'headers':[],'frames':[]}
for line in open(S+'/core-frames.txt',encoding='utf8',errors='replace'):
    n,_,text=line.partition(':')
    text=text.rstrip('\n')
    m=re.search(r'⎯\[(\d+)/939\]⎯',text)
    if m:
        cur['marker']=int(m.group(1)); blocks.append(cur); cur={'headers':[],'frames':[]}; continue
    if text.startswith(' FAIL |core|'):
        if cur['frames'] and cur['headers']:
            pass
        cur['headers'].append(re.sub(r'^ FAIL \|core\|\s+','',text).strip())
    elif text.startswith(' ❯ '):
        cur['frames'].append(text[3:].strip())
print(len(blocks), 'trailing', cur['headers'][:1])
d=json.load(open(E+'/1361-stage/m2/m2-core-vs1358I.json'))
byid=collections.defaultdict(list)
for b in blocks:
    for h in b['headers']:
        byid[h].append(b)
missing=0; out=[]
for r in d['rows']:
    bs=byid.get(r['identity'])
    if not bs: missing+=1; continue
    b=bs[0]
    r2=dict(r); r2['frames']=b['frames']; r2['marker']=b['marker']; r2['group']=len(b['headers'])
    out.append(r2)
print('rows',len(d['rows']),'joined',len(out),'missing',missing)
json.dump(out,open(S+'/rows-frames.json','w'),indent=1)
