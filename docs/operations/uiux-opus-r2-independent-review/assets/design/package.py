# Build package-manifest.json, MANIFEST.sha256 and the ZIP for the Opus review package.
import hashlib, json, os, sys, zipfile, subprocess
ROOT = sys.argv[1]  # package dir
CONTENT_COMMIT = sys.argv[2]
REPO_REL = 'docs/operations/uiux-opus-r2-independent-review'
EXCL = {'delivery', 'PACKAGE.md'}
def sha(p):
    h = hashlib.sha256()
    with open(p, 'rb') as f:
        for chunk in iter(lambda: f.read(1 << 20), b''): h.update(chunk)
    return h.hexdigest()
files = []
for dp, dn, fn in os.walk(ROOT):
    dn[:] = sorted(d for d in dn if d not in EXCL)
    for f in sorted(fn):
        rel = os.path.relpath(os.path.join(dp, f), ROOT)
        if rel.split('/')[0] in EXCL or f == '.DS_Store': continue
        files.append(rel)
recs = [{'path': p, 'bytes': os.path.getsize(os.path.join(ROOT, p)), 'sha256': sha(os.path.join(ROOT, p))} for p in files]
png = sum(1 for p in files if p.lower().endswith('.png'))
manifest = {
  'package': 'OPUS INDEPENDENT GAME UI/UX REVIEW — R2 (e564d236) findings, research, explorations and recommended direction',
  'status': 'PROPOSED DESIGN / MOCK DATA — NOT IMPLEMENTED · REVIEW PUBLISHED — OWNER DESIGN DECISION REQUIRED',
  'repository': 'HSpector1/The-Movies', 'branch': 'docs/uiux-opus-r2-independent-review-01',
  'reviewed_codex_r2_commit': 'e564d236407cb3616ebc597713d5b9fa7d60b38a',
  'reviewed_codex_r2_design_content_commit': '1fab1a3abc297b4533739e2ba7f95e8e13de08b5',
  'reviewed_r2_zip_sha256': '2096b670eaae8fc82efc7f73b6c51fc2c8a8351149eb9e3af945c8ce778bf784',
  'assignment_commit': '05e9902e43efa5a331b9cfed135eb33871d74128', 'assignment_addendum_commit': '234a36ef38bd08000dae38246a4d1bf292a0d347',
  'review_content_commit': CONTENT_COMMIT,
  'package_path': REPO_REL, 'entry_point': '00-INDEX.md', 'prototype_entry': 'assets/design/index.html', 'sheet_entry': 'assets/design/components.html',
  'content_file_count': len(files), 'content_bytes': sum(r['bytes'] for r in recs), 'PNG_files': png,
  'manifest_scope': 'files records every review payload byte at review_content_commit (everything under the package path except delivery/ and PACKAGE.md). package-manifest.json and MANIFEST.sha256 are generated packaging metadata excluded from their own records. MANIFEST.sha256 covers all payload files plus package-manifest.json. A later publication commit adds delivery/ and PACKAGE.md; no commit SHA claims to contain itself.',
  'files': recs,
}
os.makedirs(os.path.join(ROOT, 'delivery'), exist_ok=True)
mp = os.path.join(ROOT, 'delivery', 'package-manifest.json')
with open(mp, 'w') as f: json.dump(manifest, f, indent=2); f.write('\n')
lines = [f"{r['sha256']}  {r['path']}" for r in recs] + [f"{sha(mp)}  delivery/package-manifest.json"]
with open(os.path.join(ROOT, 'delivery', 'MANIFEST.sha256'), 'w') as f: f.write('\n'.join(lines) + '\n')
zp = os.path.join(ROOT, 'delivery', 'UIUX-OPUS-R2-INDEPENDENT-REVIEW.zip')
with zipfile.ZipFile(zp, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for p in files: z.write(os.path.join(ROOT, p), p)
    z.write(mp, 'delivery/package-manifest.json'); z.write(os.path.join(ROOT, 'delivery', 'MANIFEST.sha256'), 'delivery/MANIFEST.sha256')
print(json.dumps({'files': len(files), 'content_bytes': manifest['content_bytes'], 'png': png, 'zip_bytes': os.path.getsize(zp), 'zip_sha256': sha(zp), 'manifest_sha256': sha(mp)}, indent=1))
