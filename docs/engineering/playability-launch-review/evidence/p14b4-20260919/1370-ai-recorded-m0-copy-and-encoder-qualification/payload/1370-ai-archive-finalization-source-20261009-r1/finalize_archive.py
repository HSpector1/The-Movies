#!/usr/bin/env python3
"""Root-only finite archive finalization. No staging, commit, push or launch."""
import argparse, hashlib, json, os, pathlib, stat, subprocess
P=pathlib.Path
sha=lambda b:hashlib.sha256(b).hexdigest()
def need(ok, message):
    if not ok: raise RuntimeError(message)
def signature(s):
    return (s.st_dev,s.st_ino,s.st_mode,s.st_nlink,s.st_size,s.st_mtime_ns,s.st_ctime_ns)
def source(row):
    p=P(row['sourcePath']); a=p.lstat()
    need(p.is_absolute() and p.resolve(strict=True)==p and stat.S_ISREG(a.st_mode), 'unsafe source')
    need(a.st_size==row['bytes'] and format(stat.S_IMODE(a.st_mode),'04o')==row['mode'] and a.st_nlink==row['nlink'], 'source metadata changed')
    digest=hashlib.sha256(); blob=hashlib.sha1(('blob '+str(a.st_size)+'\0').encode()); parts=[]
    fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW)
    try:
        need(signature(os.fstat(fd))==signature(a),'source opened changed')
        while True:
            b=os.read(fd,65536)
            if not b: break
            digest.update(b); blob.update(b)
            if row['preservationAction']=='COPY_FINITE_PAYLOAD': parts.append(b)
        need(signature(os.fstat(fd))==signature(a)==signature(p.lstat()),'source changed while reading')
    finally: os.close(fd)
    need(digest.hexdigest()==row['sha256'],'source hash changed')
    return b''.join(parts),blob.hexdigest()
def main():
    ap=argparse.ArgumentParser();ap.add_argument('--inventory',required=True);ap.add_argument('--inventory-sha256',required=True);ap.add_argument('--repo',required=True);ap.add_argument('--expected-head',required=True);ap.add_argument('--target',required=True);ap.add_argument('--claim-file',required=True);args=ap.parse_args()
    invpath=P(args.inventory);raw=invpath.read_bytes();need(sha(raw)==args.inventory_sha256,'inventory hash mismatch'); inv=json.loads(raw)
    need(inv.get('summary',{}).get('completeInventory') is True and not inv.get('pendingAdditions'),'root must supply finalized complete inventory')
    repo=P(args.repo).resolve(strict=True);target=P(args.target)
    need(target.is_absolute() and not target.exists() and not target.is_symlink(),'target must be new')
    parent=target.parent.resolve(strict=True);need(parent==target.parent and (parent==repo or repo in parent.parents),'target must be under explicit repository')
    claimpath=P(args.claim_file);claimraw=claimpath.read_bytes();claim=claimraw.decode();need(bool(claim.strip()),'empty root claim')
    env=dict(os.environ,GIT_OPTIONAL_LOCKS='0',GIT_CONFIG_NOSYSTEM='1')
    def git(*argv):
        return subprocess.run(['git','-c','gc.auto=0','-c','maintenance.auto=false',*argv],cwd=repo,env=env,check=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE).stdout
    head=git('rev-parse','HEAD').decode().strip();need(head==args.expected_head,'HEAD changed')
    need(git('rev-parse','--show-object-format').decode().strip()=='sha1','only explicitly supported SHA1 Git object format')
    tree={}
    for entry in git('ls-tree','-r','-z',head).split(b'\0'):
        if not entry: continue
        meta,path=entry.split(b'\t',1);mode,typ,oid=meta.decode().split()
        if typ=='blob':tree.setdefault(oid,[]).append({'path':os.fsdecode(path),'mode':mode,'oid':oid})
    rows=inv['files'];need(len({r['sourcePath'] for r in rows})==len(rows),'duplicate sources');need(len(rows)<10000,'finite role bound')
    prepared=[];authenticated={}
    for row in rows:
        action=row['preservationAction'];need(action in ['COPY_FINITE_PAYLOAD','LOCAL_HASH_SIZE_ONLY'],'unknown action')
        package=row['package'];rel=P(row['relativePath']);need('/' not in package and package not in ['.','..'] and not rel.is_absolute() and '..' not in rel.parts,'unsafe destination')
        need(not any(x in ['.git','node_modules'] for x in rel.parts),'dependency/private Git excluded')
        data,oid=source(row);entry=dict(row);entry['priorInventoryGitMapping']=row.get('priorGitBlob')
        # Local machine dumps/cap padding never acquire copied bytes or Git reuse claims.
        if action=='LOCAL_HASH_SIZE_ONLY':
            entry['archiveDisposition']='LOCAL_HASH_SIZE_ONLY';entry['priorGitBlob']=None;prepared.append((entry,None));continue
        matches=tree.get(oid,[])
        if matches:
            if oid not in authenticated:
                existing=git('cat-file','blob',oid);need(len(existing)==row['bytes'] and sha(existing)==row['sha256'] and existing==data,'HEAD blob mismatch');authenticated[oid]=True
            entry['archiveDisposition']='AUTHENTICATED_PRIOR_HEAD_BLOB';entry['priorGitBlob']={'head':head,'oid':oid,'sourceMappings':matches,'sourcePath':row['sourcePath'],'sourceMode':row['mode']};prepared.append((entry,None))
        else:
            dest=P('payload')/package/rel;entry['archiveDisposition']='COPIED_FINITE_PAYLOAD';entry['priorGitBlob']=None;entry['archiveRelativePath']=str(dest);prepared.append((entry,data))
    need(git('rev-parse','HEAD').decode().strip()==head,'HEAD changed during preparation')
    target.mkdir(mode=0o755)
    # All sources validated before the first archive write. Partial archive is retained on any write failure.
    for row,data in prepared:
        if data is None:continue
        dest=target/row['archiveRelativePath'];dest.parent.mkdir(parents=True,exist_ok=True)
        fd=os.open(dest,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,int(row['mode'],8))
        with os.fdopen(fd,'wb') as f:f.write(data)
        os.chmod(dest,int(row['mode'],8));need(sha(dest.read_bytes())==row['sha256'],'copied payload readback mismatch')
    (target/'INVENTORY-FINAL.json').write_bytes(raw);(target/'ROOT-FINAL-CLAIM.txt').write_bytes(claimraw)
    manifest={'schema':'1370-ai-finite-archive-manifest-r1','headAuthenticated':head,'inventorySourcePath':str(invpath),'inventorySha256':sha(raw),'rootClaim':claim,'rootClaimSourcePath':str(claimpath),'rootClaimSha256':sha(claimraw),'semanticRoleWarnings':inv.get('semanticRoleWarnings',[]),'files':[r for r,_ in prepared],'noGitMutation':True,'summary':{'roles':len(prepared),'copiedPayloadBytes':sum(r['bytes'] for r,data in prepared if data is not None),'priorGitBlobRoles':sum(r['archiveDisposition']=='AUTHENTICATED_PRIOR_HEAD_BLOB' for r,_ in prepared),'localHashSizeOnlyRoles':sum(r['archiveDisposition']=='LOCAL_HASH_SIZE_ONLY' for r,_ in prepared)}}
    (target/'ARCHIVE-MANIFEST.json').write_text(json.dumps(manifest,sort_keys=True,indent=2)+'\n')
    print(json.dumps(manifest['summary'],sort_keys=True))
if __name__=='__main__':main()
