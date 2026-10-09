from pathlib import Path
s=Path('/Users/zacheryspector/studio-scratch');p=s/'1370-c0-m0-additive-recorded-route-proposal-20261009-r4'
for n in ['record.py','supervise.py']:
 ls=(p/n).read_text().splitlines();print(n)
 for i,l in enumerate(ls,1):
  if (n=='record.py' and (121<=i<=154 or 310<=i<=370)) or(n=='supervise.py' and (150<=i<=210 or 280<=i<=304)):print(i,l)
