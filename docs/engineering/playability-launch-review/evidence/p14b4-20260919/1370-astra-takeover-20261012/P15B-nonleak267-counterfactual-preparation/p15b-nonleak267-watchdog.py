import os,signal,subprocess,sys,time,json
started=time.monotonic()
child=subprocess.Popen(sys.argv[1:],start_new_session=True)
try:
    code=child.wait(timeout=30)
except subprocess.TimeoutExpired:
    os.killpg(child.pid,signal.SIGTERM)
    try: child.wait(timeout=2)
    except subprocess.TimeoutExpired:
        os.killpg(child.pid,signal.SIGKILL)
        child.wait()
    print(json.dumps({'watchdog':'own process group stopped at30s','childPid':child.pid,'childExit':child.returncode,'seconds':time.monotonic()-started}),flush=True)
    sys.exit(124)
print(json.dumps({'watchdog':'completed within30s','childExit':code,'seconds':time.monotonic()-started}),flush=True)
sys.exit(code if code>=0 else 128-code)
