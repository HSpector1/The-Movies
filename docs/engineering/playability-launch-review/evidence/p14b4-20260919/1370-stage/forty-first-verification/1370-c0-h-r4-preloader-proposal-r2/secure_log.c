#define _DARWIN_C_SOURCE 1
#include <node_api.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>
#include <errno.h>
#include <limits.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/* Open each directory from a held parent FD. No pathname containing a symlink
 * is ever followed. This addon is a scratch proposal, not an H launch. */
typedef struct { dev_t dev; ino_t ino; } identity;
typedef struct { int fd; identity parts[128]; size_t count; } walk_result;

static int same(identity a, identity b) { return a.dev == b.dev && a.ino == b.ino; }
static int getid(int fd, identity *out) {
  struct stat st;
  if (fstat(fd, &st) || !S_ISDIR(st.st_mode)) return -1;
  out->dev = st.st_dev; out->ino = st.st_ino; return 0;
}
static int walk(const char *absolute, walk_result *out) {
  memset(out, 0, sizeof(*out)); out->fd = -1;
  if (!absolute || absolute[0] != '/' || strlen(absolute) >= PATH_MAX) { errno = EINVAL; return -1; }
  int fd = open("/", O_RDONLY | O_DIRECTORY | O_NOFOLLOW | O_CLOEXEC);
  if (fd < 0) return -1;
  out->fd = fd;
  if (getid(fd, &out->parts[out->count++])) return -1;
  const char *p = absolute + 1;
  while (*p) {
    const char *end = strchr(p, '/');
    size_t len = end ? (size_t)(end - p) : strlen(p);
    if (!len || len > NAME_MAX || (len == 1 && p[0] == '.') ||
        (len == 2 && p[0] == '.' && p[1] == '.') || out->count >= 128) {
      errno = EINVAL; return -1;
    }
    char component[NAME_MAX + 1];
    memcpy(component, p, len); component[len] = 0;
    int next = openat(fd, component, O_RDONLY | O_DIRECTORY | O_NOFOLLOW | O_CLOEXEC);
    if (next < 0) return -1;
    close(fd); fd = next; out->fd = fd;
    if (getid(fd, &out->parts[out->count++])) return -1;
    if (!end) break;
    p = end + 1;
    if (!*p) { errno = EINVAL; return -1; }
  }
  return 0;
}
static void closewalk(walk_result *r) { if (r->fd >= 0) { close(r->fd); r->fd = -1; } }
static int getstring(napi_env env, napi_value v, char **out) {
  size_t n = 0;
  if (napi_get_value_string_utf8(env, v, NULL, 0, &n) != napi_ok || n >= PATH_MAX) return -1;
  char *s = calloc(n + 1, 1); if (!s) return -1;
  if (napi_get_value_string_utf8(env, v, s, n + 1, &n) != napi_ok) { free(s); return -1; }
  if (strlen(s) != n) { free(s); return -1; }
  *out = s; return 0;
}
static napi_value fail(napi_env env, const char *where, int err) {
  char message[256]; snprintf(message, sizeof(message), "%s: errno %d (%s)", where, err, strerror(err));
  napi_throw_error(env, "H_SECURE_LOG", message); return NULL;
}
static napi_value secure_open(napi_env env, napi_callback_info info) {
  napi_value argv[2]; size_t argc = 2;
  if (napi_get_cb_info(env, info, &argc, argv, NULL, NULL) != napi_ok || argc != 2)
    return fail(env, "expected log path and protected paths", EINVAL);
  char *logpath = NULL; char *protected[16] = {0}; uint32_t nprotected = 0;
  walk_result roots[16], parent, again;
  memset(roots, 0, sizeof roots); for (int i = 0; i < 16; i++) roots[i].fd = -1;
  parent.fd = -1; again.fd = -1;
  int logfd = -1, err = EINVAL, created = 0;
  char *slash = NULL;
  if (getstring(env, argv[0], &logpath)) goto out;
  bool array = false;
  if (napi_is_array(env, argv[1], &array) != napi_ok || !array ||
      napi_get_array_length(env, argv[1], &nprotected) != napi_ok || nprotected < 4 || nprotected > 16) goto out;
  for (uint32_t i = 0; i < nprotected; i++) {
    napi_value item;
    if (napi_get_element(env, argv[1], i, &item) != napi_ok || getstring(env, item, &protected[i])) goto out;
    if (walk(protected[i], &roots[i])) { err = errno; goto out; }
  }
  slash = strrchr(logpath, '/');
  if (!slash || !slash[1] || slash == logpath || strlen(slash + 1) > NAME_MAX) goto out;
  *slash = 0;
  if (walk(logpath, &parent)) { err = errno; goto out; }
  for (uint32_t i = 0; i < nprotected; i++)
    for (size_t j = 0; j < parent.count; j++)
      if (same(parent.parts[j], roots[i].parts[roots[i].count - 1])) { err = EPERM; goto out; }
  logfd = openat(parent.fd, slash + 1, O_WRONLY | O_APPEND | O_CREAT | O_EXCL |
               O_NOFOLLOW | O_CLOEXEC, 0600);
  if (logfd < 0) { err = errno; goto out; }
  created = 1;
  struct stat st;
  if (fstat(logfd, &st) || !S_ISREG(st.st_mode) || st.st_nlink != 1) { err = EINVAL; goto out; }
  if (walk(logpath, &again)) { err = errno; goto out; }
  if (!same(again.parts[again.count - 1], parent.parts[parent.count - 1])) { err = EAGAIN; goto out; }
  for (uint32_t i = 0; i < nprotected; i++) {
    walk_result recheck; recheck.fd = -1;
    if (walk(protected[i], &recheck)) { err = errno; closewalk(&recheck); goto out; }
    int stable = same(recheck.parts[recheck.count - 1], roots[i].parts[roots[i].count - 1]);
    closewalk(&recheck);
    if (!stable) { err = EAGAIN; goto out; }
  }
  napi_value result;
  if (napi_create_int32(env, logfd, &result) != napi_ok) { err = EINVAL; goto out; }
  logfd = -1;
  for (uint32_t i = 0; i < nprotected; i++) { closewalk(&roots[i]); free(protected[i]); }
  closewalk(&parent); closewalk(&again); free(logpath);
  return result;
out:
  if (logfd >= 0) close(logfd);
  /* On a detected path race, retaining the created file avoids a second
   * mutation through a possibly moved parent FD. The caller must STOP. */
  (void)created;
  for (uint32_t i = 0; i < 16; i++) { closewalk(&roots[i]); free(protected[i]); }
  closewalk(&parent); closewalk(&again); free(logpath);
  return fail(env, "secure log open refused", err);
}
static napi_value init(napi_env env, napi_value exports) {
  napi_value fn;
  if (napi_create_function(env, "secureOpen", NAPI_AUTO_LENGTH, secure_open, NULL, &fn) != napi_ok ||
      napi_set_named_property(env, exports, "secureOpen", fn) != napi_ok) return NULL;
  return exports;
}
NAPI_MODULE(NODE_GYP_MODULE_NAME, init)
