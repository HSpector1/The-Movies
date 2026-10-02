#!/usr/bin/env python3
"""For each validateSaveV43 call at base, find the argument and its nearest definition above. Prints a triage list."""
import re, os, sys
T='/Users/zacheryspector/studio-scratch/1358-n/tree'; os.chdir(T)
rows=[l.rstrip('\n').split('\t') for l in open('/Users/zacheryspector/studio-scratch/1358-n/v43-lines.txt')]
LIVE=re.compile(r'makeSave\(|migrateToLive\(|LIVE_SAVE_VERSION|exportSave\(|importSave\(|loadSave\(|saveJson|currentSaveJson|exportCurrentState')
V43=re.compile(r'convertV42ToV43\(|migrateToV43\(|genuine|GENUINE|v43\b|V43_')
cache={}
def lines(f):
    if f not in cache: cache[f]=open(f,encoding='utf-8',errors='replace').read().split('\n')
    return cache[f]
for loc,key,text in rows:
    f,n=loc.rsplit(':',1); n=int(n)
    L=lines(f)
    line=L[n-1]
    m=re.search(r"validateSaveV43'?\)?\(([^()]*(?:\([^()]*(?:\([^()]*\))*[^()]*\))*[^()]*)\)",line)
    arg=m.group(1).strip() if m else '?'
    verdict=''
    if LIVE.search(arg): verdict='LIVE-arg'
    elif V43.search(arg): verdict='V43-arg'
    else:
        ident=re.match(r'[A-Za-z_$][\w$]*',arg)
        d=''
        if ident:
            idn=ident.group(0)
            for k in range(n-1,max(0,n-120),-1):
                if re.search(r'\b(const|let|var)\s+(\{[^}]*\b'+re.escape(idn)+r'\b[^}]*\}|\[[^\]]*\b'+re.escape(idn)+r'\b[^\]]*\]|'+re.escape(idn)+r')\b',L[k-1]) or re.search(r'(^|[^.\w])'+re.escape(idn)+r'\s*=[^=>]',L[k-1]) or re.search(r'\(\s*'+re.escape(idn)+r'\b[^)]*\)\s*=>|function\s+\w+\([^)]*\b'+re.escape(idn)+r'\b',L[k-1]) or re.search(r'for \(const '+re.escape(idn)+r' of',L[k-1]) :
                    d=f'{k}: {L[k-1].strip()[:140]}'; break
        if LIVE.search(d): verdict='LIVE-def'
        elif V43.search(d): verdict='V43-def'
        else: verdict='READ'
        arg=arg+'   <= '+d
    print(f'{verdict}\t{loc}\t{key}\t{arg[:260]}')
