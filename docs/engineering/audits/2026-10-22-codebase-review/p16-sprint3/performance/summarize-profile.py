import json, pathlib, collections
root = pathlib.Path(__file__).resolve().parent.parent / 'profile'
for path in sorted(root.glob('*.cpuprofile')):
    p=json.loads(path.read_text()); nodes={n['id']:n for n in p['nodes']}; parents={c:n['id'] for n in p['nodes'] for c in n.get('children',[])}
    own=collections.Counter(); inclusive=collections.Counter(); edges=collections.Counter()
    for ident,dt in zip(p.get('samples',[]),p.get('timeDeltas',[])):
        own[ident]+=dt
        lineage=[]
        while ident in nodes:
            inclusive[ident]+=dt; lineage.append(ident)
            if ident not in parents: break
            ident=parents[ident]
        for i in lineage:
            name=nodes[i]['callFrame']['functionName']
            if name=='subjectValueV1':
                par=parents.get(i)
                edges[nodes[par]['callFrame']['functionName'] if par else 'ROOT']+=dt
    total=sum(own.values())
    print('\nPROFILE',path.name,'sampled seconds',round(total/1e6,3),'nodes',len(nodes))
    for title,count in [('SELF',own),('INCLUSIVE',inclusive)]:
        print(title)
        for ident,us in count.most_common(35):
            f=nodes[ident]['callFrame']; print(f'{us/1e6:8.3f}s {us/max(total,1):6.1%} {f["functionName"] or "(anonymous)"} {f["url"]}:{f["lineNumber"]+1}')
    print('subjectValueV1 caller sampled seconds', {k:round(v/1e6,3) for k,v in edges.most_common()})
