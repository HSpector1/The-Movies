#!/usr/bin/env python3
"""599-A: enumerate every `work.calc(k).<method>(...)` / `this.calc(k).<method>(...)`
site in promiseCapacityOwnerReplay.ts and count the scalar operand-read/operator nodes
of the argument tree AS WRITTEN (both ternary arms; nested calc chains own their own trees
and count 1 node for the passed result; every other call counts its callee chain + 1 call
node + its argument nodes in the outer tree).

Two conventions are emitted:
  A (precedent):    each .member access is a node; a bare local/base is one node only when it
                    is itself the operand (the module's own 'five property reads' comment :1503).
  B (scalar):       an identifier/member chain is ONE scalar read.
  Module helper calls (sortBill, smallTransitionBill, workflowUpdate, ...): one node for the
  passed result; their argument evaluation is reserved by their entry pay / the caller's
  adjacent block pay (e.g. :1573 'both five-argument transition-helper calls').
Proposed k = smallest of {8,16,32,64} with k/2 >= nodes; '>64' if 2*nodes > 64.
Read-only over the source; writes only the TSV given as argv[2].
"""
import re, sys, bisect, os
STRICT = os.environ.get('STRICT') == '1'  # helper-call argument nodes counted in the outer tree; base identifiers counted

SRC = sys.argv[1]
OUT = sys.argv[2]
text = open(SRC, encoding='utf-8').read()
lines = text.split('\n')
line_starts = [0]
for ln in lines[:-1]:
    line_starts.append(line_starts[-1] + len(ln) + 1)

def line_of(pos):
    return bisect.bisect_right(line_starts, pos)  # 1-based

# ---- enclosing definitions (top-level functions, class, Work methods)
defs = []
for i, ln in enumerate(lines, 1):
    m = re.match(r'^(?:export )?function (\w+)', ln)
    if m: defs.append((i, m.group(1))); continue
    m = re.match(r'^class (\w+)', ln)
    if m: defs.append((i, m.group(1))); continue
    m = re.match(r'^  (\w+)\((?:[^)]*)\)(?::[^{]*)?\{', ln)  # Work methods
    if m and 'Work' == (defs[-1][1] if defs else '') or (m and defs and defs[-1][1].startswith('Work.')):
        defs.append((i, 'Work.' + m.group(1)))
def_lines = [d[0] for d in defs]
def enclosing(line):
    k = bisect.bisect_right(def_lines, line) - 1
    return defs[k][1] if k >= 0 else '?'

# ---- balanced scan helpers
def skip_string(s, i):
    q = s[i]; i += 1
    while i < len(s):
        if s[i] == '\\': i += 2; continue
        if s[i] == q: return i + 1
        i += 1
    return i

def balanced_end(s, i):
    """i points at '('; return index just past the matching ')'."""
    depth = 0
    while i < len(s):
        c = s[i]
        if c in '\'"`': i = skip_string(s, i); continue
        if c == '(':
            depth += 1
        elif c == ')':
            depth -= 1
            if depth == 0: return i + 1
        i += 1
    raise ValueError('unbalanced')

CALC_RE = re.compile(r'\b(work|this)\.calc\((\d+)\)\.(\w+)\(')
IDENT = re.compile(r'[A-Za-z_$][\w$]*')
NUM = re.compile(r'\d+(?:\.\d+)?')
OPS3 = ['===', '!==', '...']
OPS2 = ['<=', '>=', '==', '!=', '&&', '||', '??', '=>', '?.']
OPS1 = '+-*/%<>!?'

def count_nodes(s):
    """Return (A, B, nested_calc_count, notes) for argument text s."""
    A = 0; B = 0; nested = 0; notes = []
    i = 0; n = len(s)
    prev_tok = None  # for postfix '!' detection
    while i < n:
        c = s[i]
        if c.isspace() or c in ',()[]':
            if c == '[':
                A += 1; B += 1; prev_tok = 'op'
            elif c == ']':
                prev_tok = 'ident'
            elif c == ')':
                prev_tok = 'ident'
            else:
                pass
            i += 1; continue
        if c in '\'"`':
            j = skip_string(s, i); A += 1; B += 1; prev_tok = 'ident'; i = j; continue
        m = CALC_RE.match(s, i)
        if m:
            # nested calc chain: skip to end of its method call; 1 node for result
            j = m.end() - 1
            j = balanced_end(s, j)
            A += 1; B += 1; nested += 1; prev_tok = 'ident'; i = j; continue
        m = NUM.match(s, i)
        if m:
            A += 1; B += 1; prev_tok = 'ident'; i = m.end(); continue
        m = IDENT.match(s, i)
        if m:
            # identifier chain a.b.c (with optional ?. and !)
            j = m.end(); segs = 1; opt = 0
            while True:
                if s.startswith('?.', j) and j + 2 < n and IDENT.match(s, j + 2):
                    m2 = IDENT.match(s, j + 2); segs += 1; opt += 1; j = m2.end(); continue
                if s.startswith('!.', j) and IDENT.match(s, j + 2):
                    m2 = IDENT.match(s, j + 2); segs += 1; j = m2.end(); continue
                if s.startswith('.', j) and j + 1 < n and IDENT.match(s, j + 1):
                    m2 = IDENT.match(s, j + 1); segs += 1; j = m2.end(); continue
                break
            chain = s[i:j]
            if chain in ('typeof', 'null', 'true', 'false', 'undefined'):
                A += 1; B += 1
            else:
                A += (segs if STRICT else max(1, segs - 1)) + opt; B += 1 + opt
            # call?
            k = j
            if k < n and s[k] == '!': k += 1  # non-null assertion before call
            if k < n and s[k] == '(':
                if chain.split('.')[0] == 'Math':
                    A += 1; B += 1; notes.append('call:' + chain)
                    i = k + 1  # native call: its argument nodes belong to the outer tree
                    prev_tok = 'op'; continue
                # module helper: its entry pay / the caller's adjacent block pay reserve its
                # argument evaluation; the outer tree counts one node for the passed result
                notes.append('helper:' + chain)
                if STRICT:
                    A += 1; B += 1; i = k + 1; prev_tok = 'op'; continue   # call node + its argument nodes in the outer tree
                i = balanced_end(s, k); prev_tok = 'ident'; continue
            i = j; prev_tok = 'ident'; continue
        # operators
        matched = False
        for op in OPS3:
            if s.startswith(op, i):
                A += 1; B += 1; i += 3; matched = True; prev_tok = 'op'; break
        if matched: continue
        for op in OPS2:
            if s.startswith(op, i):
                A += 1; B += 1; i += 2; matched = True; prev_tok = 'op'; break
        if matched: continue
        if c == ':':
            i += 1; prev_tok = 'op'; continue   # ternary else-branch marker: counted with '?'
        if c == '!':
            # postfix non-null assertion vs prefix not
            if prev_tok == 'ident':
                i += 1; continue
            A += 1; B += 1; i += 1; prev_tok = 'op'; continue
        if c in OPS1:
            A += 1; B += 1; i += 1; prev_tok = 'op'; continue
        # anything else
        notes.append('?' + c); i += 1
    return A, B, nested, notes

def bucket(nodes):
    for k in (8, 16, 32, 64):
        if 2 * nodes <= k: return k
    return '>64'

rows = []
per_line_ordinal = {}
for m in CALC_RE.finditer(text):
    start = m.start(); k = int(m.group(2)); method = m.group(3)
    open_paren = m.end() - 1
    end = balanced_end(text, open_paren)
    args = text[open_paren + 1:end - 1]
    ln = line_of(start)
    per_line_ordinal[ln] = per_line_ordinal.get(ln, 0) + 1
    A, B, nested, notes = count_nodes(args)
    pa, pb = bucket(A), bucket(B)
    da = (k - pa) if isinstance(pa, int) else None
    db = (k - pb) if isinstance(pb, int) else None
    snippet = re.sub(r'\s+', ' ', text[start:end]).strip()
    rows.append(dict(line=ln, ord=per_line_ordinal[ln], fn=enclosing(ln), k=k, method=method,
                     A=A, B=B, pa=pa, pb=pb, da=da, db=db, nested=nested,
                     notes=';'.join(n for n in notes if n.startswith(('call:','helper:'))), snippet=snippet))

with open(OUT, 'w', encoding='utf-8') as f:
    f.write('\t'.join(['line', 'ord', 'function', 'method', 'current_k', 'nodes_A_precedent', 'nodes_B_scalar',
                       'proposed_k_A', 'proposed_k_B', 'delta_A', 'delta_B', 'nested_calc_results',
                       'non_calc_calls_in_tree', 'structurally_zero_subtree', 'site_text']) + '\n')
    for r in rows:
        f.write('\t'.join(str(x) for x in [r['line'], r['ord'], r['fn'], r['method'], r['k'], r['A'], r['B'],
                                             r['pa'], r['pb'], r['da'], r['db'], r['nested'], r['notes'], '', r['snippet']]) + '\n')

# summary to stdout
tot = len(rows)
chg_a = sum(1 for r in rows if r['da'] not in (None, 0))
chg_b = sum(1 for r in rows if r['db'] not in (None, 0))
save_a = sum(r['da'] for r in rows if r['da'] and r['da'] > 0)
save_b = sum(r['db'] for r in rows if r['db'] and r['db'] > 0)
under_a = [(r['line'], r['ord'], r['k'], r['A']) for r in rows if r['da'] is None or r['da'] < 0]
under_b = [(r['line'], r['ord'], r['k'], r['B']) for r in rows if r['db'] is None or r['db'] < 0]
print('sites', tot)
print('A: change', chg_a, 'sum saving (static, per single evaluation of every site)', save_a, 'under-reserved', under_a)
print('B: change', chg_b, 'sum saving', save_b, 'under-reserved', under_b)
from collections import Counter
print('current k histogram', Counter(r['k'] for r in rows))
print('proposed A histogram', Counter(r['pa'] for r in rows))
print('proposed B histogram', Counter(r['pb'] for r in rows))
byfn = {}
for r in rows:
    e = byfn.setdefault(r['fn'], [0, 0, 0, 0]); e[0] += 1
    if r['da'] and r['da'] > 0: e[1] += r['da']
    if r['db'] and r['db'] > 0: e[2] += r['db']
    if r['da'] not in (None, 0): e[3] += 1
for fn, e in sorted(byfn.items(), key=lambda x: -x[1][1]):
    print(f'{fn:28s} sites {e[0]:3d} changed_A {e[3]:3d} saveA {e[1]:5d} saveB {e[2]:5d}')
