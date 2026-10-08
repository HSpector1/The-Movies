#!/usr/bin/env python3
"""Bounded macOS nofollow xattr/ACL capture; no per-file subprocess."""

import ctypes
import errno
import hashlib
import os
import stat

LIB = ctypes.CDLL("/usr/lib/libSystem.B.dylib", use_errno=True)
NOFOLLOW = 0x0001
ACL_EXTENDED = 0x00000100
NAME_CAP = 65536
VALUE_CAP = 1024 * 1024
ACL_CAP = 65536

LIB.flistxattr.argtypes = [ctypes.c_int, ctypes.c_void_p, ctypes.c_size_t, ctypes.c_int]
LIB.flistxattr.restype = ctypes.c_ssize_t
LIB.listxattr.argtypes = [ctypes.c_char_p, ctypes.c_void_p, ctypes.c_size_t, ctypes.c_int]
LIB.listxattr.restype = ctypes.c_ssize_t
LIB.fgetxattr.argtypes = [ctypes.c_int, ctypes.c_char_p, ctypes.c_void_p,
                          ctypes.c_size_t, ctypes.c_uint32, ctypes.c_int]
LIB.fgetxattr.restype = ctypes.c_ssize_t
LIB.getxattr.argtypes = [ctypes.c_char_p, ctypes.c_char_p, ctypes.c_void_p,
                         ctypes.c_size_t, ctypes.c_uint32, ctypes.c_int]
LIB.getxattr.restype = ctypes.c_ssize_t
LIB.acl_get_fd_np.argtypes = [ctypes.c_int, ctypes.c_int]
LIB.acl_get_fd_np.restype = ctypes.c_void_p
LIB.acl_get_link_np.argtypes = [ctypes.c_char_p, ctypes.c_int]
LIB.acl_get_link_np.restype = ctypes.c_void_p
LIB.acl_to_text.argtypes = [ctypes.c_void_p, ctypes.POINTER(ctypes.c_ssize_t)]
LIB.acl_to_text.restype = ctypes.c_void_p
LIB.acl_free.argtypes = [ctypes.c_void_p]
LIB.acl_free.restype = ctypes.c_int


def checked_size(value, cap, label):
    if value < 0:
        code = ctypes.get_errno()
        raise OSError(code, os.strerror(code), label)
    if value > cap:
        raise RuntimeError(f"STOP_METADATA_CAP {label}: {value}")
    return value


def capture(path):
    path = os.fspath(path)
    st = os.lstat(path)
    is_link = stat.S_ISLNK(st.st_mode)
    fd = None
    if not is_link:
        flags = os.O_RDONLY | os.O_NOFOLLOW
        if stat.S_ISDIR(st.st_mode):
            flags |= os.O_DIRECTORY
        fd = os.open(path, flags)
        now = os.fstat(fd)
        if (st.st_dev, st.st_ino, st.st_mode) != (now.st_dev, now.st_ino, now.st_mode):
            os.close(fd)
            raise RuntimeError("metadata source identity changed")
    encoded = os.fsencode(path)
    try:
        if is_link:
            size = checked_size(LIB.listxattr(encoded, None, 0, NOFOLLOW), NAME_CAP, "link names")
            names_buffer = ctypes.create_string_buffer(max(size, 1))
            actual = checked_size(LIB.listxattr(encoded, names_buffer, size, NOFOLLOW), NAME_CAP, "link names")
        else:
            size = checked_size(LIB.flistxattr(fd, None, 0, 0), NAME_CAP, "fd names")
            names_buffer = ctypes.create_string_buffer(max(size, 1))
            actual = checked_size(LIB.flistxattr(fd, names_buffer, size, 0), NAME_CAP, "fd names")
        if actual != size:
            raise RuntimeError("xattr names changed during capture")
        names = [value.decode("utf-8", "strict") for value in
                 bytes(names_buffer.raw[:actual]).split(b"\0") if value]
        xattrs = []
        for name in sorted(names):
            key = name.encode("utf-8")
            if is_link:
                value_size = checked_size(LIB.getxattr(encoded, key, None, 0, 0, NOFOLLOW), VALUE_CAP, name)
                buf = ctypes.create_string_buffer(max(value_size, 1))
                got = checked_size(LIB.getxattr(encoded, key, buf, value_size, 0, NOFOLLOW), VALUE_CAP, name)
            else:
                value_size = checked_size(LIB.fgetxattr(fd, key, None, 0, 0, 0), VALUE_CAP, name)
                buf = ctypes.create_string_buffer(max(value_size, 1))
                got = checked_size(LIB.fgetxattr(fd, key, buf, value_size, 0, 0), VALUE_CAP, name)
            if got != value_size:
                raise RuntimeError("xattr value changed during capture")
            xattrs.append([name, hashlib.sha256(buf.raw[:got]).hexdigest()])
        ctypes.set_errno(0)
        acl = LIB.acl_get_link_np(encoded, ACL_EXTENDED) if is_link else LIB.acl_get_fd_np(fd, ACL_EXTENDED)
        if not acl:
            code = ctypes.get_errno()
            if code != errno.ENOENT:
                raise OSError(code, os.strerror(code), path)
            acl_text = ""
        else:
            try:
                length = ctypes.c_ssize_t()
                text_pointer = LIB.acl_to_text(acl, ctypes.byref(length))
                if not text_pointer:
                    code = ctypes.get_errno()
                    raise OSError(code, os.strerror(code), path)
                try:
                    checked_size(length.value, ACL_CAP, "ACL")
                    acl_text = ctypes.string_at(text_pointer, length.value).decode("utf-8", "strict")
                finally:
                    LIB.acl_free(text_pointer)
            finally:
                LIB.acl_free(acl)
        after = os.lstat(path)
        if (st.st_dev, st.st_ino, st.st_mode) != (after.st_dev, after.st_ino, after.st_mode):
            raise RuntimeError("metadata path identity changed")
        return {"acl": acl_text, "xattrs": xattrs}
    finally:
        if fd is not None:
            os.close(fd)
