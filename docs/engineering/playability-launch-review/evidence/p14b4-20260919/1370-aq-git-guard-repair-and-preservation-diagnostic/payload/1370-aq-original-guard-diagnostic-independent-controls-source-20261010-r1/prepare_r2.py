"""Lossless data-only refinement of unrun controls after exact frame-code binding repair."""
from pathlib import Path
import difflib,hashlib,json
S=Path('/Users/zacheryspector/studio-scratch');OLD=Path(__file__).resolve().parent
NEW=S/'1370-aq-original-guard-diagnostic-independent-controls-source-20261010-r2'
assert not NEW.exists();NEW.mkdir()
text=(OLD/'run_guard_diagnostic_controls.py').read_text();prior=text
text=text.replace("ns={'__file__':fileValue,'_actual':actual,'_old':old,'_E':E}","ns={'__file__':fileValue,'__name__':'wrong' if variant=='wrong_name_global' else '__main__','_actual':actual,'_old':old,'_E':E}")
text=text.replace("if variant=='bad_locals':actual=[]", "if variant=='bad_locals':actual=[]\n  if variant=='bad_baseline_immutable':old=[]")
text=text.replace("exec(compile('\\n'.join(body)+'\\n',filename,'exec'),ns)","exec(compile('\\n'.join(body)+'\\n',filename,'exec'),ns)\n  expectedCode=ns[function].__code__\n  if variant=='impostor_main_code':\n   other=dict(ns);modified=list(body);modified[1]=' immutable=dict(_actual)'\n   exec(compile('\\n'.join(modified)+'\\n',filename,'exec'),other);ns=other\n   assert ns[function].__code__!=expectedCode")
text=text.replace("writer=writer,authenticate=authenticate)","writer=writer,authenticate=authenticate,expected_main_code=expectedCode)")
text=text.replace("('bad_locals','equal_maps','wrong_source_role')", "('bad_locals','bad_baseline_immutable','equal_maps','wrong_source_role')")
text=text.replace("'wrong_file_global','duplicate_target_frames'", "'wrong_file_global','wrong_name_global','duplicate_target_frames','impostor_main_code'")
text=text.replace("ns={'__file__':scanner['path'],'_E':E}","ns={'__file__':scanner['path'],'__name__':'__main__','_E':E}")
text=text.replace("authenticate=lambda p:scanner)","authenticate=lambda p:scanner,expected_main_code=ns['main'].__code__)")
# Later-return has no synthetic exception frame; use an explicit known callable code.
text=text.replace("writer=lambda p,v,c:writes.append((p.name,v,c)),authenticate=lambda p:scanner,expected_main_code=ns['main'].__code__)","writer=lambda p,v,c:writes.append((p.name,v,c)),authenticate=lambda p:scanner,expected_main_code=later_return.__code__)")
(NEW/'run_guard_diagnostic_controls.py').write_text(text)
(NEW/'seal_controls.py').write_text((OLD/'seal_controls.py').read_text())
delta=list(difflib.ndiff(prior.splitlines(True),text.splitlines(True)))
assert ''.join(difflib.restore(delta,1))==prior and ''.join(difflib.restore(delta,2))==text
def role(p):
 b=p.read_bytes();return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
proof={'schema':'1370-original-guard-diagnostic-controls-r2-correction/v1','executionAuthorization':False,'previousLibrary':role(OLD/'run_guard_diagnostic_controls.py'),'losslessNdiff':delta,'bothApplicationsVerified':True,'reason':'Same-coordinate impostor frame must fail authenticated main CodeType equality; __name__ and typed baseline premises are explicit. Original unrun source retained.'}
(NEW/'R1-TO-R2-WHOLE-INVERSE.json').write_text(json.dumps(proof,indent=2)+'\n')
for p in OLD.iterdir():
 if p.is_file():p.chmod(0o444)
OLD.chmod(0o555)
print(str(NEW))
