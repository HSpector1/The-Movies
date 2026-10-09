#!/usr/bin/env python3
"""Source-only proposal: exclusive sparse materialization lane recorder.

M0 role adaptation: additive owned READY/GO external child180, retained existing mirror, whole210. Requires separately reviewed exact binding.
"""

import hashlib
import json
import os
from pathlib import Path
import shutil
import signal
import select
import sys
import time

import importlib.util
import stat
_GUARD=Path("/Users/zacheryspector/studio-scratch/1370-c0-aging-era-sparse-materializer-source-r6/materialize.py")
require_guard_sha="2d63876297bc85a1ab5192491f4255d2cce7d17de048bfec65c21b479d1f0896"
if _GUARD.resolve(strict=True)!=_GUARD or not stat.S_ISREG(_GUARD.lstat().st_mode) or _GUARD.is_symlink() or hashlib.sha256(_GUARD.read_bytes()).hexdigest()!=require_guard_sha:
    raise RuntimeError("accepted read-only r6 helper source drift")
_module_spec=importlib.util.spec_from_file_location("accepted_r6_readonly_helpers",_GUARD)
_g=importlib.util.module_from_spec(_module_spec);_module_spec.loader.exec_module(_g)
FLOOR,Stop,canonical_json,file_sha,require,safe_parent=_g.FLOOR,_g.Stop,_g.canonical_json,_g.file_sha,_g.require,_g.safe_parent

POLL_SECONDS = 0.25
MAX_WHOLE_SECONDS = 210
CHILD_DEADLINE = None
LANE_DEADLINE = None
FAILED_CHILD = None


def update_free_minimum(status, free):
    previous = status.get("freeMinimum")
    status["freeMinimum"] = free if previous is None else min(previous, free)
    return status["freeMinimum"]


def write_once(path, payload):
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600)
    with os.fdopen(fd, "wb") as stream:
        stream.write(payload)
        stream.flush()
        os.fsync(stream.fileno())


def still_alive(group):
    try:
        os.killpg(group, 0)
        return True
    except ProcessLookupError:
        return False
    except PermissionError:
        # The group may exist but be inaccessible in this launch context.
        # Unknown clearance must be a STOP, never a successful cleanup claim.
        return True


def terminate(group, child_pid):
    if still_alive(group):
        try:
            os.killpg(group, signal.SIGTERM)
        except (ProcessLookupError, PermissionError):
            pass
        time.sleep(0.25)
    if still_alive(group):
        try:
            os.killpg(group, signal.SIGKILL)
        except (ProcessLookupError, PermissionError):
            pass
    deadline = time.monotonic() + 5
    while time.monotonic() < deadline:
        try:
            waited, _ = os.waitpid(child_pid, os.WNOHANG)
        except ChildProcessError:
            break
        if waited == child_pid:
            break
        time.sleep(0.05)
    else:
        raise Stop("owned child survived KILL")
    require(not still_alive(group), "owned group survived KILL")


def reap_failed_child(pid,deadline,clock=time.monotonic,sleeper=time.sleep,waiter=None):
    """Bounded WNOHANG failure reap; False retains unresolved ownership."""
    waiter=waiter or os.waitpid
    while clock()<deadline:
        try:got,_=waiter(pid,os.WNOHANG)
        except ChildProcessError:return True
        if got==pid:return True
        left=deadline-clock()
        if left<=0:break
        sleeper(min(.05,left))
    return False


def fork_ready(spec, spec_path, stdout_fd, stderr_fd):
    global CHILD_DEADLINE,FAILED_CHILD
    FAILED_CHILD=None
    CHILD_DEADLINE = time.monotonic()+180  # External original clock BEFORE fork/imports/execution.
    """Parent owns PID before child can exec; child waits for GO after setsid."""
    ack_read, ack_write = os.pipe()
    go_read, go_write = os.pipe()
    owner_read,owner_write=os.pipe()
    child_pid = os.fork()
    if child_pid == 0:
        try:
            os.close(ack_read)
            os.close(go_write)
            os.close(owner_write)
            if os.read(owner_read,1)!=b"O":os._exit(125)
            os.close(owner_read)
            os.setsid()
            os.write(ack_write, b"R")
            os.close(ack_write)
            if os.read(go_read, 1) != b"G":
                os._exit(125)
            os.close(go_read)
            os.dup2(stdout_fd, 1)
            os.dup2(stderr_fd, 2)
            os.chdir(spec["launchCwd"])
            os.execve(spec["pythonPath"], spec["materializerArgv"],
                      dict(os.environ, **spec["launchEnvironment"], ADDITIVE_ORIGINAL_DEADLINE=str(CHILD_DEADLINE), ADDITIVE_BINDING_SHA=file_sha(spec_path)))
        except BaseException:
            os._exit(126)
    os.close(owner_read)
    os.close(ack_write)
    os.close(go_read)
    try:
        report_fd = int(os.environ["SPARSE_1370_SUPERVISOR_FD"])
        os.write(report_fd, f"{child_pid}\n".encode("ascii"))
        write_once(Path(spec["outputRoot"])/"CHILD-OWNED.json",canonical_json({"workerPid":os.getpid(),"childPid":child_pid,"originalDeadline":CHILD_DEADLINE})+b"\n")
        os.write(owner_write,b"O") # External supervisor has numeric PID before child leaves worker group.
        os.close(owner_write);owner_write=None
        readable, _, _ = select.select([ack_read], [], [], 5)
        require(readable and os.read(ack_read, 1) == b"R", "child group readiness absent")
        require(os.getpgid(child_pid) == child_pid, "child did not own new group")
        os.write(go_write, b"G")
        return child_pid
    except BaseException:
        FAILED_CHILD={'pid':child_pid,'reaped':False,'deadline':min(CHILD_DEADLINE,LANE_DEADLINE if LANE_DEADLINE is not None else CHILD_DEADLINE,time.monotonic()+5)}
        try:
            os.kill(child_pid, signal.SIGKILL)
        except ProcessLookupError:
            pass
        FAILED_CHILD['reaped']=reap_failed_child(child_pid,FAILED_CHILD['deadline'])
        if not FAILED_CHILD['reaped']:
            raise Stop("fork readiness failure; owned PID "+str(child_pid)+" unresolved at original cleanup deadline")
        raise
    finally:
        if owner_write is not None:os.close(owner_write)
        os.close(ack_read)
        os.close(go_write)


def validated_spec(path):
    require(path.is_absolute() and path.is_file() and not path.is_symlink(),
            "exact spec absent")
    require(path.stat().st_size<=128*1024,"binding cap")
    try:
        spec = json.loads(path.read_text(encoding="utf-8"))
    except (ValueError, UnicodeError) as exc:
        raise Stop("invalid exact spec") from exc
    require(isinstance(spec, dict) and spec.get("status") == "REVIEWED_FILLED_UNRUN" and
            spec.get("executionAuthorization") is True, "unreviewed exact spec")
    for key in ("outputParent", "outputRoot", "scratchParent", "scratchRoot",
                "recorderLockPath"):
        require(isinstance(spec.get(key), str) and Path(spec[key]).is_absolute(),
                "missing absolute " + key)
    require(spec.get("noExternalSameUidRenamer") is True,
            "no-renamer operational scope missing")
    require(Path(spec["outputRoot"]).parent == Path(spec["outputParent"]),
            "output root not one direct child")
    require(Path(spec["recorderLockPath"]).parent == Path(spec["outputParent"]),
            "exclusive lock parent wrong")
    require(Path(spec["scratchRoot"]).parent == Path(spec["scratchParent"]),
            "scratch target parent wrong")
    for key in ("materializerPath", "materializerSha256", "recorderPath",
                "recorderSha256", "supervisorPath", "supervisorSha256", "sourceSha"):
        require(isinstance(spec.get(key), str) and bool(spec[key]),
                "missing exact " + key)
    require(Path(spec["materializerPath"]) == Path("/Users/zacheryspector/studio-scratch/1370-c0-m0-additive-recorded-route-proposal-20261009-r2/add_inputs.py") and
            file_sha(Path(spec["materializerPath"])) == spec["materializerSha256"],
            "materializer source drift")
    require(Path(spec["recorderPath"]) == Path(__file__) and
            file_sha(Path(__file__)) == spec["recorderSha256"],
            "recorder source drift")
    supervisor = Path(__file__).parent / "supervise.py"
    require(Path(spec["supervisorPath"]) == supervisor and
            file_sha(supervisor) == spec["supervisorSha256"],
            "outer supervisor source drift")
    safe_parent(Path(spec["outputRoot"]), Path(spec["outputParent"]))
    require(Path(spec["scratchRoot"]).parent==Path(spec["scratchParent"]) and Path(spec["scratchRoot"]).resolve(strict=True)==Path(spec["scratchRoot"]) and Path(spec["scratchRoot"]).is_dir(),"existing admitted M0 parent physical role")
    require(shutil.disk_usage(spec["scratchParent"]).free >= FLOOR + 64 * 1024**2,
            "source phase projection crosses floor")
    require(sys.dont_write_bytecode and not sys.flags.optimize and
            Path(sys.executable).resolve(strict=True)==Path(spec["pythonPath"]),
            "exact isolated no-bytecode Python required")
    require(spec.get("sourceSha")=="292d6fd3b5293fe2a520b681ae4c1dde997dc113" and
            spec.get("productionHead")=="282f8477e61a33bd5ec4a571b934829490adef73" and
            spec.get("productionSourceTree")=="13880d9b0ba72aff5d4c5bcf5d12fe682c5de554",
            "M0 source/new docs guard mismatch")
    require(spec["scratchRoot"]=="/Users/zacheryspector/studio-scratch/1370-c0-m0-observer-mirrors-20261009-r2" and
            spec["mirrorPath"]==spec["scratchRoot"]+"/20261009-m0-types-r2" and
            Path(spec["additiveReceiptPath"]).parent==Path(spec["outputRoot"]) and
            spec["additiveReceiptPath"]==spec["outputRoot"]+"/ADDITIVE-RESULT.json" and
            spec["phaseReceiptPath"]==spec["outputRoot"]+"/FIRST-WRITE-PHASE.json","additive existing mirror/output roles")
    require(Path(spec["mirrorPath"]).is_dir() and not Path(spec["mirrorPath"]).is_symlink(),"admitted existing mirror missing")
    proposal=json.loads(Path(spec["materializerArgvRolePath"]).read_bytes())
    require(file_sha(Path(spec["materializerArgvRolePath"]))==spec["materializerArgvRoleSha256"] and
            spec["materializerArgv"]==proposal["materializerArgv"] and
            spec["launchEnvironment"]==proposal["requiredEnvironment"] and
            spec["launchCwd"]==proposal["cwd"], "accepted materializer argv/env drift")
    materializer_review=_g.receipt(spec["materializerSourceReviewPath"],spec["materializerSourceReviewSha256"],
        "ACCEPT_SOURCE_ONLY_UNRUN_ADDITIVE_RECORDED_ROUTE")
    require(materializer_review.get("sourceSha256")==spec["materializerSha256"],"materializer source review role")
    route_review=_g.receipt(spec["routeSourceReviewPath"],spec["routeSourceReviewSha256"],spec["routeSourceReviewDecision"])
    require(spec["routeSourceReviewDecision"].startswith("ACCEPT_SOURCE_ONLY_UNRUN") and
            route_review.get("recorderSha256")==spec["recorderSha256"] and
            route_review.get("supervisorSha256")==spec["supervisorSha256"],"recorded route source not accepted")
    excluded={"status","executionAuthorization","exactBindingReviewPath","exactBindingReviewSha256","exactBindingReviewDecision"}
    semantic_sha=hashlib.sha256(canonical_json({k:v for k,v in spec.items() if k not in excluded})).hexdigest()
    exact=_g.receipt(spec["exactBindingReviewPath"],spec["exactBindingReviewSha256"],"ACCEPT_EXACT_FILLED_UNRUN")
    require(spec.get("exactBindingReviewDecision")=="ACCEPT_EXACT_FILLED_UNRUN" and
            exact.get("bindingSemanticSha256")==semantic_sha,"exact review semantic binding mismatch")
    preflight=_g.receipt(spec["preflightReviewPath"],spec["preflightReviewSha256"],"ACCEPT_M0_ADDITIVE_PREFLIGHT")
    guard_core_sha=hashlib.sha256(canonical_json({k:v for k,v in spec.items() if k not in excluded | {"preflightReviewPath","preflightReviewSha256"}})).hexdigest()
    require(preflight.get("guardCoreSha256")==guard_core_sha and
            preflight.get("productionHead")==spec["productionHead"] and
            preflight.get("freshProductionCommonFullProofAccepted") is True and
            preflight.get("r9PrivateRootReuseExplicitlyAccepted") is True,
            "fresh docs-only production/common transition/current protection admission missing")
    require(spec.get("bounds")=={"childSeconds":180,"wholeSeconds":210,"combinedChildLogsBytes":33554432,"bodyResultBytes":100000},"additive finite bounds mismatch")
    quick_guards(spec)
    return spec


def check_root_transition(expected,actual,transitioned,root_after):
    require(actual==expected if not transitioned else actual==root_after and actual[:3]==expected[:3],"unadmitted M0 root transition")

def quick_guards(spec, transitioned=False, root_after=None):
    """No inventories: freshly bound root/ancestry/tool/FD/ref/power/space checks."""
    retained_h=Path(spec["retainedHLeafPath"])
    require(retained_h.is_absolute() and retained_h.parent==Path("/Users/zacheryspector/studio-scratch/1370-c0-h-m0-observer-mirrors-r2"),"retained actual H leaf binding absent/unsafe")
    mandatory_roots={spec["productionRoot"],spec["commonGitRoot"],spec["commonGitRoot"]+"/objects",
        spec["productionRoot"]+"/node_modules","/Users/zacheryspector/studio-scratch/1370-c0-aging-era-sparse-materialized-r6-20261008-r1","/Users/zacheryspector/studio-scratch/1370-c0-aging-era-sparse-materialized-r6-20261008-r1/.git","/Users/zacheryspector/studio-scratch/1370-c0-aging-era-sparse-materialized-r6-20261008-r1/node_modules","/Users/zacheryspector/studio-scratch/1370-c0-h-m0-observer-mirrors-r2",str(retained_h),spec["scratchRoot"]}
    require(set(spec["strictRootMetadata"])==mandatory_roots,"strict protected root role set incomplete")
    require(spec["productionRoot"]=="/Users/zacheryspector/The-Movies-headless-program" and
        spec["additionalFdScopes"]==[{"productionRoot":"/Users/zacheryspector/studio-scratch/1370-c0-aging-era-sparse-materialized-r6-20261008-r1","commonGitRoot":"/Users/zacheryspector/studio-scratch/1370-c0-aging-era-sparse-materialized-r6-20261008-r1/.git"},
        {"productionRoot":"/Users/zacheryspector/studio-scratch/1370-c0-h-m0-observer-mirrors-r2","commonGitRoot":"/Users/zacheryspector/studio-scratch/1370-c0-h-m0-observer-mirrors-r2"},
        {"productionRoot":spec["scratchRoot"],"commonGitRoot":spec["scratchRoot"]}],"protected FD scopes incomplete")
    require(spec["gitPath"]=="/usr/bin/git" and spec["lsofPath"]=="/usr/sbin/lsof" and spec["pythonPath"]=="/usr/local/Cellar/python@3.14/3.14.4_1/Frameworks/Python.framework/Versions/3.14/bin/python3.14" and spec["commonGitRoot"]=="/Users/zacheryspector/The Movies - Unity Production Convergence 80H/.git", "exact current tool/common roles required")
    require(set(spec["toolRoles"])=={spec["pythonPath"],spec["gitPath"],spec["lsofPath"],"/usr/bin/pmset","/usr/sbin/sysctl"},"current tool roles incomplete")
    for path,expected in spec["strictRootMetadata"].items():
        root=Path(path);st=root.lstat()
        require(root.resolve(strict=True)==root and stat.S_ISDIR(st.st_mode) and
                [st.st_dev,st.st_ino,stat.S_IMODE(st.st_mode),st.st_mtime_ns,st.st_ctime_ns]==expected,
                "protected root metadata drift")
    for path,expected in spec["ancestryIdentity"].items():
        root=Path(path);st=root.lstat()
        require(root.resolve(strict=True)==root and stat.S_ISDIR(st.st_mode) and
                [st.st_dev,st.st_ino,stat.S_IMODE(st.st_mode)]==expected,"ancestry identity drift")
    leaf=Path(spec["mirrorPath"]);st=leaf.lstat()
    require(leaf.resolve(strict=True)==leaf and stat.S_ISDIR(st.st_mode),"M0 leaf physical identity")
    expected=spec["originalM0RootMetadata"]
    actual=[st.st_dev,st.st_ino,st.st_mode,st.st_nlink,st.st_size,st.st_mtime_ns,st.st_ctime_ns]
    check_root_transition(expected,actual,transitioned,root_after)
    required_ancestry=set()
    for path in mandatory_roots | {spec["mirrorPath"]}:
        p=Path(path);required_ancestry.update(str(x) for x in [p,*p.parents])
    require(set(spec["ancestryIdentity"])==required_ancestry,"unfilled/extra ancestry admission")
    for path,role in spec["toolRoles"].items():
        tool=Path(path);st=tool.lstat()
        require(tool.resolve(strict=True)==tool and stat.S_ISREG(st.st_mode) and
                [st.st_dev,st.st_ino,stat.S_IMODE(st.st_mode),st.st_nlink]==role["identity"] and
                os.access(tool,os.X_OK) and file_sha(tool)==role["sha256"],"current tool identity drift")
    for args,wanted in [([spec["gitPath"],"-c","gc.auto=0","-c","maintenance.auto=0","rev-parse","HEAD"],spec["productionHead"]),
                        ([spec["gitPath"],"rev-parse","HEAD:src"],spec["productionSourceTree"]),
                        (["/usr/sbin/sysctl","-n","kern.bootsessionuuid"],spec["bootSessionUuid"])]:
        got=_g.command(args,cwd=spec["productionRoot"],env=dict(os.environ,**spec["launchEnvironment"]))
        require(got.decode().strip()==wanted,"current HEAD/src/UUID drift")
    env=dict(os.environ,**spec["launchEnvironment"])
    require(_g.command([spec["gitPath"],"status","--porcelain=v1","-z","--untracked-files=all"],cwd=spec["productionRoot"],env=env)==b"","dirty production")
    require(_g.command([spec["gitPath"],"ls-remote","origin","refs/heads/wip/headless-program-20260916-ts"],cwd=spec["productionRoot"],env=env).decode()==spec["productionHead"]+"\trefs/heads/wip/headless-program-20260916-ts\n","remote guard drift")
    require(b"AC Power" in _g.command(["/usr/bin/pmset","-g","batt"],env=env),"AC unavailable")
    require(shutil.disk_usage(spec["scratchParent"]).free>=FLOOR,"current disk floor")
    _g.assert_no_protected_writable_fds(spec)
    for scope in spec["additionalFdScopes"]:_g.assert_no_protected_writable_fds(dict(spec,**scope))


def lane(spec_path):
    global LANE_DEADLINE,FAILED_CHILD
    start = time.monotonic()
    LANE_DEADLINE=start+MAX_WHOLE_SECONDS
    FAILED_CHILD=None
    require(os.environ.get("SPARSE_1370_SUPERVISOR_FD", "").isdigit(),
            "independent outer supervisor required")
    spec = validated_spec(spec_path)
    root = Path(spec["outputRoot"])
    scratch = Path(spec["scratchRoot"])
    lock_path = Path(spec["recorderLockPath"])
    lock_fd = os.open(lock_path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW,
                      0o600)
    lock_id = f"{os.getpid()}:{time.time_ns()}"
    with os.fdopen(lock_fd, "w") as stream:
        stream.write(lock_id + "\n")
        stream.flush()
        os.fsync(stream.fileno())
    child_pid = None
    child_exit = None
    group = None
    status = {"schema": "1370-c0-m0-additive-recorded-observed-r1",
              "status": "STOP", "specSha256": file_sha(spec_path),
              "scratchRoot": str(scratch), "outputRoot": str(root),
              "startMonotonic": start, "stopReason": None,
              "childExit": None, "groupClear": None, "scratchClear": None,
              "freeMinimum": None, "stdoutSha256": None, "stderrSha256": None}
    try:
        root.mkdir(mode=0o700)
        require(root.is_dir() and not root.is_symlink(), "output root changed")
        update_free_minimum(status, shutil.disk_usage(scratch.parent).free)
        out = root / "child.stdout"
        err = root / "child.stderr"
        with open(out, "xb") as stdout, open(err, "xb") as stderr:
            child_pid = fork_ready(spec, spec_path, stdout.fileno(), stderr.fileno())
            group = child_pid
            status["childPid"] = child_pid
            update_free_minimum(status, shutil.disk_usage(scratch.parent).free)
            while True:
                now = time.monotonic()
                free = shutil.disk_usage(scratch.parent).free
                update_free_minimum(status, free)
                if CHILD_DEADLINE is not None and now>=CHILD_DEADLINE:
                    raise Stop("external original180 child deadline")
                if now - start >= MAX_WHOLE_SECONDS:
                    raise Stop("whole materialization deadline")
                if out.stat().st_size + err.stat().st_size > 32 * 1024**2:
                    raise Stop("32 MiB combined child-log cap")
                if free < FLOOR:
                    raise Stop("space floor plus reserve breached during materialization")
                waited, wait_status = os.waitpid(child_pid, os.WNOHANG)
                if waited == child_pid:
                    child_exit = os.waitstatus_to_exitcode(wait_status)
                    break
                time.sleep(POLL_SECONDS)
            status["childExit"] = child_exit
        if child_exit != 0:
            raise Stop("materializer child exited " + str(child_exit))
        require(out.stat().st_size + err.stat().st_size <= 32 * 1024**2,"final child-log cap")
        try:
            payload = json.loads(out.read_text(encoding="utf-8"))
        except (ValueError, UnicodeError) as exc:
            raise Stop("invalid child result JSON") from exc
        require(isinstance(payload,dict) and payload.get("status")=="ADDITIVE_SOURCE_INPUTS_PENDING_INDEPENDENT_EXPANDED_READBACK","additive stdout role")
        receipt=Path(spec["additiveReceiptPath"])
        require(not receipt.is_symlink() and receipt.stat().st_size<=100000 and file_sha(receipt)==payload.get("receiptSha256"),"durable additive receipt mismatch")
        additive=json.loads(receipt.read_bytes());phase=Path(spec["phaseReceiptPath"])
        require(phase.is_file() and not phase.is_symlink() and phase.stat().st_size<=100000,"first-write marker absent/unsafe")
        marker=json.loads(phase.read_bytes())
        require(marker.get("status")=="ORIGINAL_PREFLIGHT_COMPLETE_FIRST_WRITE_ALLOWED" and marker.get("pid")==child_pid and marker.get("mirrorPath")==spec["mirrorPath"] and marker.get("rootBefore")==spec["originalM0RootMetadata"] and marker.get("originalFiles")==1677 and marker.get("originalBytes")==117875377 and marker.get("copyFactsSha256")==spec["copyFactsSha256"],"write phase authority mismatch")
        require(additive.get("status")==payload["status"] and additive.get("regularFiles")==1740 and additive.get("regularBytes")==119393120 and additive.get("bridgeFiles")==63 and additive.get("bridgeBytes")==1517743 and additive.get("originalFilesUnchanged")==1677 and additive.get("mirrorPath")==spec["mirrorPath"] and additive.get("sourceCommit")==spec["sourceSha"] and additive.get("sourceTree")==spec["productionSourceTree"],"additive success role mismatch")
        # attrs uses full st_mode; before root is exact accepted seven-field identity.
        require(additive.get("rootBefore")==marker["rootBefore"],"original root role mismatch")
        status.update(additiveReceiptSha256=payload["receiptSha256"],mirrorPath=spec["mirrorPath"],sourceCommit=spec["sourceSha"],rootBefore=marker["rootBefore"],rootAfter=additive["rootAfter"])
        quick_guards(spec,transitioned=True,root_after=additive["rootAfter"])
        require(shutil.disk_usage(scratch.parent).free >= FLOOR,
                "postflight space floor breached")
        require(scratch.is_dir() and not scratch.is_symlink(), "scratch checkout absent")
        require(not still_alive(group), "owned group survivor after child exit")
        status["status"] = "ADDITIVE_UNREVIEWED_UNRUN"
    except BaseException as exc:
        status["stopReason"] = f"{type(exc).__name__}:{exc}"
        if FAILED_CHILD is not None:
            child_pid=FAILED_CHILD["pid"];group=child_pid;status["childPid"]=child_pid;status["failureCleanup"]=dict(FAILED_CHILD)
        if group is not None and FAILED_CHILD is None:
            try:
                terminate(group, child_pid)
            except BaseException as cleanup_exc:
                status["stopReason"] += f";cleanup:{type(cleanup_exc).__name__}:{cleanup_exc}"
        # Preserve failed M0 partial mirror and its sibling receipt; no scratch/H deletion.
    finally:
        status["endMonotonic"] = time.monotonic()
        status["childExit"] = child_exit
        status["groupClear"] = (FAILED_CHILD is None or FAILED_CHILD["reaped"]) and (group is None or not still_alive(group))
        status["scratchClear"] = not scratch.exists() if status["status"] == "STOP" else False
        status["partialMirrorPreserved"] = status["status"] == "STOP" and scratch.exists()
        for key, name in (("stdoutSha256", "child.stdout"),
                          ("stderrSha256", "child.stderr")):
            file = root / name
            if file.is_file():
                status[key] = file_sha(file)
        try:
            if root.is_dir():
                write_once(root / "RESULT.json", canonical_json(status) + b"\n")
        finally:
            try:
                if lock_path.read_text(encoding="utf-8") == lock_id + "\n":
                    lock_path.unlink()
            except OSError:
                pass
    return status


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("one exact reviewed binding required")
    result = lane(Path(sys.argv[1]))
    print(json.dumps({"status": result["status"], "result": result["outputRoot"] +
                      "/RESULT.json"}, sort_keys=True))
    raise SystemExit(0 if result["status"] == "ADDITIVE_UNREVIEWED_UNRUN" else 2)
