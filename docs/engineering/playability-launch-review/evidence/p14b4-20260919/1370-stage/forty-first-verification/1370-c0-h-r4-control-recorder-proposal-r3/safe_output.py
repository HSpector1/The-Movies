"""Held nofollow directory-FD output placement for an unrun scratch recorder."""
import os
from pathlib import Path
import stat

SCRATCH = Path('/Users/zacheryspector/studio-scratch')
FLAGS = os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW

def walk(path):
    p = Path(path)
    if not p.is_absolute() or str(p) != str(Path(os.path.normpath(str(p)))):
        raise RuntimeError('path must be canonical absolute')
    parts = p.parts[1:]
    fd = os.open('/', FLAGS)
    ancestors = []
    try:
        s = os.fstat(fd); ancestors.append((s.st_dev, s.st_ino))
        for part in parts:
            if part in ('', '.', '..'):
                raise RuntimeError('invalid path component')
            nxt = os.open(part, FLAGS, dir_fd=fd)
            os.close(fd); fd = nxt
            s = os.fstat(fd)
            if not stat.S_ISDIR(s.st_mode): raise RuntimeError('not a directory')
            ancestors.append((s.st_dev, s.st_ino))
        return fd, ancestors
    except Exception:
        os.close(fd)
        raise

def validate_parent(path, protected):
    fd, chain = walk(path)
    try:
        scratch_fd, _ = walk(SCRATCH)
        try: scratch_id = (os.fstat(scratch_fd).st_dev, os.fstat(scratch_fd).st_ino)
        finally: os.close(scratch_fd)
        if scratch_id not in chain or chain[-1] == scratch_id:
            raise RuntimeError('output parent must be a distinct studio-scratch child')
        for root in protected:
            protected_fd, protected_chain = walk(root)
            try: identity = (os.fstat(protected_fd).st_dev, os.fstat(protected_fd).st_ino)
            finally: os.close(protected_fd)
            if identity in chain or chain[-1] in protected_chain:
                raise RuntimeError('output parent overlaps protected root')
        return fd, chain[-1]
    except Exception:
        os.close(fd); raise

def recheck(path, held_fd, identity):
    current = os.fstat(held_fd)
    if (current.st_dev, current.st_ino) != identity: raise RuntimeError('held output parent changed')
    fd, chain = walk(path)
    try:
        if chain[-1] != identity: raise RuntimeError('output parent path changed')
    finally: os.close(fd)

def create_child(parent_fd, basename):
    if not basename or basename in ('.', '..') or '/' in basename:
        raise RuntimeError('unsafe child basename')
    os.mkdir(basename, 0o700, dir_fd=parent_fd)
    return os.open(basename, FLAGS, dir_fd=parent_fd)

def write_once(dir_fd, basename, payload):
    if not basename or basename in ('.', '..') or '/' in basename:
        raise RuntimeError('unsafe output basename')
    fd = os.open(basename, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW,
                 0o600, dir_fd=dir_fd)
    try:
        view = memoryview(payload)
        while view: view = view[os.write(fd, view):]
        os.fsync(fd)
    finally: os.close(fd)
    os.fsync(dir_fd)
