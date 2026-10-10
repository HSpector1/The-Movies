import ast,hashlib,json,pathlib,unittest
HERE=pathlib.Path(__file__).resolve().parent
OLD=pathlib.Path('/Users/zacheryspector/studio-scratch/1370-c0-renewal208-pure16-pricing-verifier-proposal-after-aj-20261009-r1/record-pure-node.py')
OLD_SHA='be323be957cbe53f01d6b650182a18feb0fd5cb1306a412627bd32c9d6eea670'
NEW_SHA='dd76ceec50be94b50a4ff52c8a070ec9a691b9bbe781fabc1ac0914543bf0346'
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
