"""Exact dependency/entrypoint byte inventory, checked at execution boundaries."""
import hashlib
import json
import os
import stat
from pathlib import Path


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def verify_runtime(root, manifest):
    runtime = manifest['runtime']
    dep_file = Path(root) / 'DEPENDENCIES.json'
    assert sha(dep_file) == runtime['dependencyManifestSha256'], 'STOP: dependency manifest differs'
    expected = json.loads(dep_file.read_bytes())
    assert expected['schema'] == '1369-save46-dependencies-r2'
    assert expected['excludedCache'] == '.vite'
    dep_root = Path(expected['root'])
    assert dep_root.is_absolute() and dep_root.is_dir() and not dep_root.is_symlink()
    cache = dep_root / '.vite'
    assert not cache.is_symlink() and (not cache.exists() or cache.is_dir()), 'STOP: dependency cache path' 
    files = {}; dirs = []; links = {}
    for base, names, fnames in os.walk(dep_root, followlinks=False):
        here = Path(base)
        for name in list(names):
            if here == dep_root and name == '.vite':
                names.remove(name); continue
            p = here / name; rel = p.relative_to(dep_root).as_posix(); mode = p.lstat().st_mode
            if stat.S_ISLNK(mode): links[rel] = os.readlink(p); names.remove(name)
            else:
                assert stat.S_ISDIR(mode), 'STOP: dependency directory object'
                dirs.append(rel)
        for name in fnames:
            assert not (here == dep_root and name == '.vite'), 'STOP: dependency cache object'
            p = here / name; rel = p.relative_to(dep_root).as_posix(); mode = p.lstat().st_mode
            if stat.S_ISLNK(mode): links[rel] = os.readlink(p)
            else:
                assert stat.S_ISREG(mode), 'STOP: dependency file object'
                files[rel] = sha(p)
    assert files == expected['files'] and sorted(dirs) == expected['directories'] and links == expected['links'], 'STOP: dependency snapshot differs'
    node = Path(runtime['nodePath'])
    assert node.is_absolute() and node.is_file() and not node.is_symlink() and sha(node) == runtime['nodeSha256'], 'STOP: Node entrypoint differs'
    for key, digest_key in [('typescriptPath','typescriptSha256'), ('vitestPath','vitestSha256')]:
        path = Path(runtime[key]); resolved = path.resolve(strict=True)
        assert path.is_absolute() and resolved.is_file() and resolved.is_relative_to(dep_root), 'STOP: resolved tool path'
        assert sha(resolved) == runtime[digest_key], 'STOP: tool entrypoint differs'
    return hashlib.sha256(json.dumps({'dependencies': runtime['dependencyManifestSha256'], 'node': runtime['nodeSha256'], 'typescript': runtime['typescriptSha256'], 'vitest': runtime['vitestSha256']}, sort_keys=True).encode()).hexdigest()
