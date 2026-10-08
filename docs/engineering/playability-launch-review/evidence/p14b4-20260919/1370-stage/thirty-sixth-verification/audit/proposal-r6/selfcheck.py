#!/usr/bin/env python3
"""Synthetic checks only; never reads comparator output or archived captures."""
import importlib.util,os,pathlib,tempfile

spec=importlib.util.spec_from_file_location('proposed_audit',pathlib.Path(__file__).with_name('audit.py'))
a=importlib.util.module_from_spec(spec);spec.loader.exec_module(a)

def rejects(fn):
 try:fn()
 except (AssertionError,OSError):return
 raise AssertionError('expected rejection')

# Python equality accepts these; the auditor must reject each.
assert {'a':1,'b':2}=={'b':2,'a':1}
assert -0.0==0.0
assert not a.strict_equal({'a':1,'b':2},{'b':2,'a':1})
assert not a.strict_equal([0.0],[-0.0])
assert not a.strict_equal(0,False)
assert a.strict_equal({'a':[0.0,1]},{'a':[0.0,1]})
source={'z':{'b':1,'a':0.0},'a':[{'y':2,'x':3}]}
stored=a.parse_json(b'{"a":[{"x":3,"y":2}],"z":{"a":0.0,"b":1}}')
assert not a.strict_equal(source,stored),'source order must remain protected'
assert a.material_equal(source,stored),'sorted RESULT materialization must compare equal'
assert not a.material_equal(source,{'a':[{'x':3,'y':2}],'z':{'a':-0.0,'b':1}})
assert not a.material_equal(source,{'a':[{'x':3,'y':2}],'z':{'a':0.0,'b':True}})
assert not a.strict_equal({'save':{'z':1,'a':2}},{'save':{'a':2,'z':1}}),'Save46 source drift must fail'
assert a.positive_zero(0) and a.positive_zero(0.0)
assert not a.positive_zero(-0.0) and not a.positive_zero(False)
assert not a.positive_zero(a.parse_json(b'-0'))

# The embedded command text can contain a fake end marker.
meta=b'waiting; command says end, exit 0; embedded\nstart; t0\nend, exit 7; t1\n'
assert a.parse_lane_meta(meta)==7
assert a.parse_lane_meta(b'start; t0\nend, exit 0; t1\n')==0
rejects(lambda:a.parse_lane_meta(b'start; t0\nend, exit 0; t1\nend, exit 7; t2\n'))
rejects(lambda:a.parse_lane_meta(b'start; t0\ncommand end, exit 0; t1\n'))
rejects(lambda:a.parse_lane_meta(b'start; t0\nstart; t0b\nend, exit 0; t1\n'))

# The r5 one-millisecond floor could extend a near-expired bootstrap timer.
assert a.remaining_budget(100.0,100.0)==600.0
assert a.remaining_budget(100.0,115.0)==585.0
assert 0<a.remaining_budget(100.0,699.9999)<0.001
rejects(lambda:a.remaining_budget(100.0,700.0))
rejects(lambda:a.remaining_budget(100.0,99.0))
rejects(lambda:a.remaining_budget(None,100.0))

with tempfile.TemporaryDirectory(dir=a.S) as td:
 root=pathlib.Path(td);regular=root/'regular';regular.write_bytes(b'abc')
 assert a.read_regular(regular,3,a.sha(b'abc'))==b'abc'
 rejects(lambda:a.read_regular(regular,2))
 rejects(lambda:a.read_regular(regular,3,'0'*64))
 link=root/'link';link.symlink_to(regular);rejects(lambda:a.read_regular(link,3))
 hard=root/'hard';os.link(regular,hard);rejects(lambda:a.read_regular(regular,3))
 hard.unlink()
 linked_dir=root/'linked-dir';linked_dir.symlink_to(root,target_is_directory=True)
 rejects(lambda:a.read_regular(linked_dir/'regular',3))
 out=root/'new'/'AUDIT.json';a.prepare_output(out)
 assert out.parent.is_dir() and not out.exists()
 rejects(lambda:a.prepare_output(out))
print('SYNTHETIC_PASS: identity, order, signed zero, lane chronology, output creation')
