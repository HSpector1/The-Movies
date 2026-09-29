import sys
src=open(sys.argv[1]).read()
old="  return JSON.stringify({ ...rest, promises, talentMarket })\n}"
assert src.count(old)==1
new='''  const { firstTakeSubjects: _fts, ...rest2 } = rest as Record<string, unknown>
  const cf = JSON.parse(JSON.stringify({ ...rest2, promises, talentMarket })) as any
  let nonZero = 0
  for (const b of cf.hollywood?.businesses ?? []) for (const p of b.account.periods) { if (p.movements.termination !== 0) nonZero++; delete p.movements.termination }
  console.log('CF firstTakeSubjects', JSON.stringify(_fts), 'nonZeroTermination', nonZero)
  return JSON.stringify(cf)
}'''
src=src.replace(old,new)
open(sys.argv[2],'w').write(src)
