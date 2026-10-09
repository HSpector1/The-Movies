from pathlib import Path
import ast,datetime,difflib,hashlib,json,os,shutil
S=Path('/Users/zacheryspector/studio-scratch')
OLD=S/'1370-c0-renewal208-pure16-pricing-verifier-proposal-after-aj-20261009-r1'
NEW=S/'1370-c0-renewal208-pure16-pricing-verifier-proposal-after-aj-20261009-r2'
REVIEW=S/'1370-c0-renewal208-pure16-pricing-verifier-independent-source-review-after-aj-20261009-r1/RECEIPT.json'
def role(p):
 b=Path(p).read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
assert role(REVIEW)['sha256']=='d51edfa6966489365bea950568f21dcf979e61803cc923aaf4ee5ac7230fce31'
pins=json.loads((OLD/'SOURCE-PINS.json').read_text());assert role(OLD/'SOURCE-PINS.json')['sha256']=='27634566f669e1bf9d93e7b797181ce21a6e7a8f7165ab526a6bb0c98bc0b4c7'
for r in pins['files'].values():assert role(r['path'])==r
oldconfig=json.loads((OLD/'CONFIG.json').read_text());config=json.loads((OLD/'CONFIG.json').read_text())
for r in config['roles'].values():
 if r['path'].startswith(str(OLD)+'/'):r['path']=str(NEW)+r['path'][len(str(OLD)):]
configraw=(json.dumps(config,indent=2,sort_keys=True)+'\n').encode();configsha=hashlib.sha256(configraw).hexdigest()
base=(OLD/'record-pure-node.py').read_text();rec=base
subs=[('CONFIG_SHA=\''+role(OLD/'CONFIG.json')['sha256']+'\'','CONFIG_SHA=\''+configsha+'\''),("'1370-c0-renewal208-pure16-pricing-'+mode+'-output-20261009-r1'","'1370-c0-renewal208-pure16-pricing-'+mode+'-output-20261009-r2'"),("expected='PURE_RENEWAL208_PURE16_PRICING_PAIRS_AGREE'","expected='PURE_RENEWAL208_PRICING_PAIRS_AGREE'"),("last.get('selectedRows')==23","last.get('selectedRows')==16"),("last.get('renewalAttribution') is False","last.get('renewalCauseAdmission') is False")]
for a,b in subs:assert rec.count(a)==1;rec=rec.replace(a,b)
normalized=rec
for a,b in reversed(subs):assert normalized.count(b)==1;normalized=normalized.replace(b,a)
assert normalized==base
recipe=json.loads((OLD/'RECIPE.json').read_text());recipe['cwd']=str(NEW);recipe['argv']=[str(NEW)+v[len(str(OLD)):] if v.startswith(str(OLD)+'/') else v.replace('1370-c0-renewal208-pure16-pricing-verification-lane-20261009-r1','1370-c0-renewal208-pure16-pricing-verification-lane-20261009-r2') for v in recipe['argv']]
fresh=[S/'1370-c0-renewal208-pure16-pricing-verification-output-20261009-r2',S/'1370-c0-renewal208-pure16-pricing-verification-lane-20261009-r2']
for p in fresh:assert not os.path.lexists(p)
NEW.mkdir(mode=0o700)
for n in pins['files']:
 if n in ('CONFIG.json','record-pure-node.py','RECIPE.json','RECORDER-REUSE.json','RECORDER-REUSE.diff'):continue
 shutil.copyfile(OLD/n,NEW/n);os.chmod(NEW/n,0o600)
(NEW/'CONFIG.json').write_bytes(configraw);(NEW/'record-pure-node.py').write_text(rec);(NEW/'RECIPE.json').write_text(json.dumps(recipe,indent=2,sort_keys=True)+'\n')
recsha=role(NEW/'record-pure-node.py')['sha256']
# Authored only. This tiny test parses the exact frozen report gate; it never imports a recorder or pricing source.
protocol="""import ast,hashlib,json,pathlib,unittest
HERE=pathlib.Path(__file__).resolve().parent
OLD=pathlib.Path(OLDPATH)
OLD_SHA=OLDSHA
NEW_SHA=NEWSHA
def gate(path,sha):
 raw=path.read_bytes();assert hashlib.sha256(raw).hexdigest()==sha
 tree=ast.parse(raw);main=next(n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name=='main')
 status=[n.value.value for n in ast.walk(main) if isinstance(n,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='expected' for t in n.targets) and isinstance(n.value,ast.Constant)]
 report=[n for n in ast.walk(main) if isinstance(n,ast.Call) and isinstance(n.func,ast.Name) and n.func.id=='require' and len(n.args)==2 and isinstance(n.args[1],ast.Constant) and n.args[1].value=='REPORT_ROLE']
 assert len(status)==len(report)==1
 code=compile(ast.Expression(report[0].args[0]),'<frozen REPORT_ROLE predicate>','eval')
 return lambda row,stderr=b'':bool(eval(code,{'__builtins__':{}},{'last':row,'buffers':{'stderr':stderr},'expected':status[0]}))
class SyntheticProtocol(unittest.TestCase):
 def test_exact16_protocol_red_green_and_refusals(self):
  old=gate(OLD,OLD_SHA);new=gate(HERE/'record-pure-node.py',NEW_SHA)
  row={'status':'PURE_RENEWAL208_PRICING_PAIRS_AGREE','selectedRows':16,'immutablePairs':44,'mismatches':0,'originalOfferLocalCapture':False,'renewalCauseAdmission':False}
  self.assertFalse(old(row));self.assertTrue(new(row))
  for key,value in [('status','PURE_RENEWAL208_PURE16_PRICING_PAIRS_AGREE'),('selectedRows',23),('renewalCauseAdmission',True),('immutablePairs',43),('mismatches',1),('originalOfferLocalCapture',True)]:
   with self.subTest(key=key):self.assertFalse(new(dict(row,**{key:value})))
  missing=dict(row);del missing['renewalCauseAdmission'];self.assertFalse(new(missing));self.assertFalse(new(row,b'unexpected stderr'))
if __name__=='__main__':unittest.main()
""".replace('OLDPATH',repr(str(OLD/'record-pure-node.py'))).replace('OLDSHA',repr(role(OLD/'record-pure-node.py')['sha256'])).replace('NEWSHA',repr(recsha))
(NEW/'test-report-protocol.py').write_text(protocol)
# This is a separate prospective parent-controlled test recipe, not a launch grant.
controlrecipe={'status':'AUTHORED_ONLY_UNRUN_SYNTHETIC_PROTOCOL','executionAuthorization':False,'argv':['/usr/local/Cellar/python@3.14/3.14.4_1/Frameworks/Python.framework/Versions/3.14/bin/python3.14','-I','-B',str(NEW/'test-report-protocol.py')],'cwd':str(NEW),'fixtureKind':'explicitly synthetic report only; AST-extracted frozen recorder predicate; no recorder/pricing import, child, Node, engine, RNG or pay computation','expectedGroups':1,'checks':'old RED/intended16 GREEN; six wrong field values, missing cause flag and nonempty stderr refuse','separateParentBoundedGrantRequired':True,'actualRun':False}
(NEW/'PROTOCOL-CHECK-RECIPE.json').write_text(json.dumps(controlrecipe,indent=2,sort_keys=True)+'\n')
reuse={'baseline':role(OLD/'record-pure-node.py'),'candidate':role(NEW/'record-pure-node.py'),'changes':subs,'inverseFullTextByteExact':True,'sourceOnly':True,'successInterfaceOnly':True,'mechanismsUnchanged':'60/75/90; owned fork/READY/GO; stream caps; sticky failures/override; cleanup and finalization','syntheticProtocolAuthoredOnly':True}
(NEW/'RECORDER-REUSE.json').write_text(json.dumps(reuse,indent=2,sort_keys=True)+'\n')
(NEW/'RECORDER-REUSE.diff').write_text(''.join(difflib.unified_diff(base.splitlines(True),rec.splitlines(True),fromfile=str(OLD/'record-pure-node.py'),tofile=str(NEW/'record-pure-node.py'))))
(NEW/'CONFIG-DIFF.patch').write_text(''.join(difflib.unified_diff((OLD/'CONFIG.json').read_text().splitlines(True),configraw.decode().splitlines(True),fromfile=str(OLD/'CONFIG.json'),tofile=str(NEW/'CONFIG.json'))))
unchanged=[n for n in pins['files'] if n not in ('CONFIG.json','record-pure-node.py','RECIPE.json','RECORDER-REUSE.json','RECORDER-REUSE.diff')]
for n in unchanged:assert (NEW/n).read_bytes()==(OLD/n).read_bytes()
proof={'schema':'1370-pure16-three-predicate-repair-proof-r2','predecessorSourcePins':role(OLD/'SOURCE-PINS.json'),'refineReceipt':role(REVIEW),'recorderInverseSubstitutions':subs,'recorderInverseFullTextByteExact':True,'unchangedFiles':{n:{'old':role(OLD/n),'new':role(NEW/n)} for n in unchanged},'allExternalRolesBytePreserved':pins['externalRoles'],'localConfigRoleOnlyRepoints':True,'futureA208':config['futureA208'],'arithmeticOrNodeOrTestsExecuted':False,'freshAbsentBeforeAuthoring':list(map(str,fresh))}
(NEW/'REPAIR-PROOF.json').write_text(json.dumps(proof,indent=2,sort_keys=True)+'\n')
(NEW/'REPAIR-REPORT.md').write_text('Fresh r2, SOURCE ONLY UNRUN. Repairs the exact three positive-report predicates from REFINE d51edfa6: status PURE_RENEWAL208_PRICING_PAIRS_AGREE, selectedRows16, renewalCauseAdmission:false. Local package-role pointers/config hash and unused output/lane version are rebound only. All arithmetic, comparator, input, authentication, original source proof and held futureA208 mechanisms are byte-identical; external roles unchanged. Original REPORT.md and preparation material remain verbatim historical r1 documents; this repair report is authoritative for r2 preparation. The synthetic protocol check is AUTHORED ONLY UNRUN; it evaluates the exact AST-extracted frozen REPORT_ROLE predicate on explicitly synthetic dictionaries. It demonstrates intended RED/GREEN and refusal expectations only after a separate root grant/run. It does not evaluate pricing, draw RNG, import a recorder, launch a child or certify future A208 data. All actual grants remain held; observed A208 fill plus fresh source/exact reviews and root authority remain required.\n')
files={n:role(NEW/n) for n in sorted(p.name for p in NEW.iterdir() if p.is_file())}
newpins={'schema':'1370-renewal208-pure16-pricing-source-pins-r2','files':files,'externalRoles':pins['externalRoles'],'predecessorSourcePinsSha256':role(OLD/'SOURCE-PINS.json')['sha256'],'refineReceiptSha256':role(REVIEW)['sha256'],'status':'READY_SOURCE_ONLY_HELD_A208_UNFILLED_REPAIR_PENDING_REVIEW','futureA208':None,'numericPricesEvaluated':False,'renewalPricingCausesClosed':0,'sourceExecution':False,'executionAuthorization':False,'syntheticProtocolAuthored':True,'syntheticProtocolExecuted':False}
(NEW/'SOURCE-PINS.json').write_text(json.dumps(newpins,indent=2,sort_keys=True)+'\n')
r={'decision':'READY_SOURCE_ONLY_THREE_PREDICATE_PURE16_REPAIR_UNRUN','sourcePins':role(NEW/'SOURCE-PINS.json'),'sourcePinsSha256':role(NEW/'SOURCE-PINS.json')['sha256'],'config':role(NEW/'CONFIG.json'),'recorder':role(NEW/'record-pure-node.py'),'syntheticProtocol':role(NEW/'test-report-protocol.py'),'repairProof':role(NEW/'REPAIR-PROOF.json'),'executionAuthorization':False,'futureA208':None,'pricingNodeRngGameOrTestsExecuted':False,'utc':datetime.datetime.now(datetime.timezone.utc).isoformat()}
(NEW/'RECEIPT.json').write_text(json.dumps(r,indent=2,sort_keys=True)+'\n')
print(json.dumps({'package':str(NEW),'pins':role(NEW/'SOURCE-PINS.json'),'receipt':role(NEW/'RECEIPT.json'),'config':role(NEW/'CONFIG.json'),'recorder':role(NEW/'record-pure-node.py'),'protocol':role(NEW/'test-report-protocol.py')}))
