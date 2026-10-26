import pathlib,json,collections
root=pathlib.Path(__file__).resolve().parent.parent/'profile'
for path in sorted(root.glob('*.cpuprofile')):
 p=json.loads(path.read_text());nodes={n['id']:n for n in p['nodes']};parents={c:n['id'] for n in p['nodes'] for c in n.get('children',[])};own=collections.Counter();inc=collections.Counter();sections=collections.Counter()
 for i,dt in zip(p.get('samples',[]),p.get('timeDeltas',[])):
  f=nodes[i]['callFrame'];own[(f['functionName'],f['url'])]+=dt;chain=[]
  while i in nodes:
   chain.append(nodes[i]['callFrame']);i=parents.get(i)
  seen={(f['functionName'],f['url']) for f in chain}
  for k in seen:inc[k]+=dt
  section='sound' if any(f['functionName']=='s6SoundReady' for f in chain) else 'lighting' if any(f['functionName']=='s6LightingReady' for f in chain) else 'other/collect'
  for k in seen:
   if '/src/core/' in k[1]:sections[(section,k[0])]+=dt
 print('\nPROFILE',path.name,'sampled seconds',round(sum(own.values())/1e6,3))
 for label,counts in [('SELF',own),('INCLUSIVE',inc)]:
  print(label)
  for (name,url),us in counts.most_common(35):print(round(us/1e6,3),name or '(anonymous)',url)
 print('CORE BY FIXTURE SECTION')
 for (sec,name),us in sections.most_common(30):print(sec,round(us/1e6,3),name or '(anonymous)')
