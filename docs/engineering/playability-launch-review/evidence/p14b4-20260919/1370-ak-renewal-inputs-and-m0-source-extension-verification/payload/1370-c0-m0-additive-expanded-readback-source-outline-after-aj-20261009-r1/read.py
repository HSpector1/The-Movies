from pathlib import Path
import ast
s=Path('/Users/zacheryspector/studio-scratch');p=s/'1370-c0-m0-observed-copy-independent-review-20261009-r1/readback.py'
x=p.read_text();print('FUNCTIONS',[(n.name,n.lineno,n.end_lineno) for n in ast.parse(x).body if isinstance(n,ast.FunctionDef)])
print(x)
