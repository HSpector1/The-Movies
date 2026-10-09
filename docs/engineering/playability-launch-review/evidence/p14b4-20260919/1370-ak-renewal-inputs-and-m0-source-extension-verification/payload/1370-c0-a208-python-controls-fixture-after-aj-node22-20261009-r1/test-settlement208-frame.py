import base64,hashlib,importlib.util,json,unittest
from pathlib import Path
HERE=Path(__file__).resolve().parent
modules=[]
for name in ('supervise','outer-recorder'):
 spec=importlib.util.spec_from_file_location(name,HERE/(name+'.py'));module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module);modules.append(module)
class Settlement208TransportTests(unittest.TestCase):
 def frame(self):
  value={'schema':'1370-a208-selected16-snapshot-r1','phase':'after-natural-tick208-return','week':208,'seed':'p13a-core-causal-01','rows':[{} for _ in range(16)],'pricingHelpersCalled':0,'extraRngCalls':0,'premiumAttribution':False,'floorAttribution':False}
  raw=(json.dumps(value,separators=(',',':'))+'\n').encode()
  return dict(settlement208Base64=base64.b64encode(raw).decode(),settlement208Bytes=len(raw),settlement208Rows=16,settlement208Sha256=hashlib.sha256(raw).hexdigest())
 def test_transport_role_and_byte_integrity(self):
  for m in modules:
   f=self.frame();self.assertEqual(len(m.validate_settlement208_payload(f)['rows']),16)
   for k,v in [('settlement208Sha256','0'*64),('settlement208Bytes',1),('settlement208Rows',15),('settlement208Base64','!')]:
    with self.assertRaises((ValueError,KeyError)):m.validate_settlement208_payload(dict(f,**{k:v}))
   with self.assertRaises(KeyError):m.validate_settlement208_payload({})
 def test_wrong_phase_and_cap(self):
  for m in modules:
   f=self.frame();value=json.loads(base64.b64decode(f['settlement208Base64']));value['week']=207;raw=json.dumps(value).encode();f.update(settlement208Base64=base64.b64encode(raw).decode(),settlement208Bytes=len(raw),settlement208Sha256=hashlib.sha256(raw).hexdigest())
   with self.assertRaises(ValueError):m.validate_settlement208_payload(f)
   raw=b' '*65537;f.update(settlement208Base64=base64.b64encode(raw).decode(),settlement208Bytes=len(raw),settlement208Sha256=hashlib.sha256(raw).hexdigest())
   with self.assertRaises(ValueError):m.validate_settlement208_payload(f)
if __name__=='__main__':unittest.main()
