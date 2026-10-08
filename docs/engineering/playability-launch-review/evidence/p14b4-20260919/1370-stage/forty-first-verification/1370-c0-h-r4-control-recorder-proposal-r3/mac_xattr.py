"""Bounded macOS xattrs without a subprocess per entry (Python lacks os.listxattr here)."""
import ctypes
import hashlib
import os

libc = ctypes.CDLL(None, use_errno=True)
NOFOLLOW = 0x0001
MAX_NAMES = 64 * 1024
MAX_VALUE = 1024 * 1024
libc.listxattr.argtypes = [ctypes.c_char_p, ctypes.c_void_p, ctypes.c_size_t, ctypes.c_int]
libc.listxattr.restype = ctypes.c_ssize_t
libc.getxattr.argtypes = [ctypes.c_char_p, ctypes.c_char_p, ctypes.c_void_p,
                         ctypes.c_size_t, ctypes.c_uint32, ctypes.c_int]
libc.getxattr.restype = ctypes.c_ssize_t
libc.setxattr.argtypes = [ctypes.c_char_p, ctypes.c_char_p, ctypes.c_void_p,
                         ctypes.c_size_t, ctypes.c_uint32, ctypes.c_int]
libc.setxattr.restype = ctypes.c_int

def _error(action):
    err = ctypes.get_errno()
    raise OSError(err, f'{action}: {os.strerror(err)}')

def rows(path):
    raw_path = os.fsencode(path)
    n = libc.listxattr(raw_path, None, 0, NOFOLLOW)
    if n < 0: _error('listxattr size')
    if n > MAX_NAMES: raise ValueError('xattr names over cap')
    buf = ctypes.create_string_buffer(max(n, 1))
    got = libc.listxattr(raw_path, buf, n, NOFOLLOW)
    if got < 0: _error('listxattr data')
    if got != n: raise ValueError('xattr names changed during read')
    names = [x for x in buf.raw[:got].split(b'\0') if x]
    result = []
    for name in sorted(names):
        size = libc.getxattr(raw_path, name, None, 0, 0, NOFOLLOW)
        if size < 0: _error('getxattr size')
        if size > MAX_VALUE: raise ValueError('xattr value over cap')
        value = ctypes.create_string_buffer(max(size, 1))
        used = libc.getxattr(raw_path, name, value, size, 0, NOFOLLOW)
        if used < 0: _error('getxattr data')
        if used != size: raise ValueError('xattr value changed during read')
        result.append([os.fsdecode(name), hashlib.sha256(value.raw[:used]).hexdigest()])
    return result

def set_fixture(path, name, value):
    raw = ctypes.create_string_buffer(value)
    rc = libc.setxattr(os.fsencode(path), os.fsencode(name), raw, len(value), 0, NOFOLLOW)
    if rc: _error('setxattr fixture')
