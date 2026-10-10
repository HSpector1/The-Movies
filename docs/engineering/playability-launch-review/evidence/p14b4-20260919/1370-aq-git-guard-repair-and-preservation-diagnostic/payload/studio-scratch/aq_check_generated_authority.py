import hashlib,json,re,sys
from pathlib import Path
F=Path(sys.argv[1]);c=json.loads((F/'CONFIG.json').read_bytes())
rows=[]
for name in ('CORE-TEST-TEMPLATE.ts','CONFIG-TEMPLATE.mts'):
 p=F/name;t=p.read_text()
 for line,text in enumerate(t.splitlines(),1):
  if 'assert.' in text:rows.append({'source':name,'line':line,'assertion':text.strip()})
core=(F/'CORE-TEST-TEMPLATE.ts').read_text()
def literal(field):
 found=re.findall(r"assert\.equal\(binding\."+field+r",'([a-f0-9]{40})'\)",core);assert len(found)==1;return found[0]
head=literal('operationalHead');source=literal('productionSourceTree')
assert source==c['productionSourceTree']
print(json.dumps({'source':str(F),'headAssertion':head,'configuredHead':c['operationalHead'],'headMatches':head==c['operationalHead'],'sourceTreeMatches':True,'evaluatedTemplateAssertions':rows,'candidateExecuted':False}))
assert head==c['operationalHead'],'STALE_EVALUATED_TEMPLATE_HEAD'
