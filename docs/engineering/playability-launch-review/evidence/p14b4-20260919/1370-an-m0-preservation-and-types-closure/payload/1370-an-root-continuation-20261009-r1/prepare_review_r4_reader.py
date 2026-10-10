import os
from pathlib import Path
A=Path(__file__).parent;b=(A/'review_fullfunction_r3_readback_source.py').read_text()
changes=[('1370-an-fullfunction-r3-root-readback-source-20261010-r1','1370-an-fullfunction-r4-root-readback-source-20261010-r1'),('da2b559914cda2cf97519a46ea52f8178adc2be6fce04ff99b04e1f6d298ffce','66b77f4029f90c14f919a82a6633d1d9c76030a3af6b068b6b49e9ed8434e34b'),('ACCEPT_STATIC_FINITE_R3_FULLFUNCTION_RETAINED_READBACK_ONLY','ACCEPT_STATIC_FINITE_R4_FULLFUNCTION_RETAINED_READBACK_ONLY'),('root; source authored by m0_types_source_review','root; source authored by b109_focused_route_review'),("f=A/'FULLFUNCTION-R3-READBACK-SOURCE-REVIEW.json'","f=A/'FULLFUNCTION-R4-READBACK-SOURCE-REVIEW.json'"),('FULLFUNCTION-RETRY-READBACK-SOURCE-REVIEW.json','FULLFUNCTION-R3-READBACK-SOURCE-REVIEW.json')]
for a,c in changes:assert b.count(a)==1;b=b.replace(a,c)
compile(b,'review_fullfunction_r4_readback_source.py','exec');p=A/'review_fullfunction_r4_readback_source.py'
with p.open('x') as f:f.write(b);f.flush();os.fsync(f.fileno())
p.chmod(0o444)
