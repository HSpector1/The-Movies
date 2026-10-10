from pathlib import Path
import ast
D=Path(__file__).parent
s=(D/'verify_index_and_whitespace.py').read_text()
s=s.replace("D/'DIFF-CHECK-ORIGINAL.stdout'", "D/'DIFF-CHECK-COMPLETE.stdout'").replace("D/'DIFF-CHECK-ORIGINAL.stderr'", "D/'DIFF-CHECK-COMPLETE.stderr'")
s=s.replace("assert len(paths)==460", "manifest=json.loads((R/A/'ARCHIVE-MANIFEST.json').read_bytes())\nexpected={A+item['archiveRelativePath'] for item in manifest['files'] if item['archiveDisposition']=='COPIED_FINITE_PAYLOAD'}\nexpected.update({A+'ARCHIVE-MANIFEST.json',A+'INVENTORY-FINAL.json',A+'ROOT-FINAL-CLAIM.txt','HANDOFF.md',E+'1370-AO-observer-row-diagnostic-closure.md'})\nassert set(paths)==expected and len(paths)==463, sorted(expected-set(paths))")
s=s.replace("'1370-ao-index-verification/v1'", "'1370-ao-index-verification/v2'")
s=s.replace("'stagedFiles':len(paths),'allIndexedBytesEqualWorkingFiles'", "'stagedFiles':len(paths),'manifestCoverageComplete':True,'supersedesIncompleteIndexVerification':'51fff22f4053ab4ca0585b0e5838c97841161d513fc06605f23be0252c3fffd3','allIndexedBytesEqualWorkingFiles'")
s=s.replace("D/'INDEX-VERIFICATION.json'", "D/'INDEX-VERIFICATION-COMPLETE.json'")
ast.parse(s)
with (D/'verify_index_complete.py').open('x') as f:f.write(s)
