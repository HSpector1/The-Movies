# R7 pipe integration r2 — focused tests prepared, UNRUN

R1 is preserved unchanged. R2 adds `test-launch-refusals.py` and this test plan only; it does not introduce new wrapper/runtime code or rebind launch paths. The proposed launch script and sink remain at their original r1 paths and exact bytes:

- `launch-pipeline.sh`: `38f8bddc4aef317b4e83fe6e19e547b338bd3cd4fe0d86856f6a11e2b03fda50`.
- `bounded-sink.py`: `6a7a91d482ddaf80c8ecb6fd0d1912da7add50917102178845a6fa37db675b9e`.

Parent review found missing pipeline exit and validator refusal coverage in r1's five I/O cases. R2 adds ten source-only cases:

1. Original real shell pipeline with the original **unfilled** template: no frame, shell exit2, actual outer/sink exits2/2 and exact marker. Frozen supervisor checks status before resolving null repoRoot or sandbox Popen; the outer reports failed supervisor exit2 and suppresses its buffered stderr.
2. Direct original supervisor unfilled refusal (stdout pipe): observes `STOP_UNFILLED` before any root access/game import/sandbox Popen. This is a refusal fixture, not an alternative witness launch entry.
3. Mock producer exit17 plus passing sink: valid mock bytes cannot erase outer failure.
4. Passing mock producer plus sink exit23: sink failure cannot become success.
5. Both mock exits0: exact stdout bytes, immediate PIPESTATUS capture and exact final marker.
6–9. Actual proposed sink alone rejects malformed JSON, missing frame identity, two frames and truncated frame. A synthetic profile supplies real accepted r7 observer/source-review roles but leaves repoRoot/runtime/worktree null; it is **never passed to outer**. The sink imports only authenticated supervisor validator bytes; no game loader or sandbox runs.
10. Actual sink alone rejects wrong exact binding byte SHA before validation or forwarding.

Mock cases change only the original pipeline producer/consumer command line, retaining the exact original shell PIPESTATUS capture/marker/refusal suffix. Every test authenticates both r1 source hashes before proceeding. Scratch fixture files are private new temporary children under studio-scratch and removed by TemporaryDirectory. Every child has explicit live repo cwd; `-B` prevents bytecode cache. No source/Git/accepted package changes occur.

An honest positive frame followed by **late** exact binding drift needs the missing authentic4cff preimage. No fixture can produce that authenticated frame without the historical output; r2 covers initial binding mismatch and keeps source's late reread inspection as unmeasured. It does not replace validator results with a fake successful hash. Once the authentic frame exists, a sink-only late-drift case can be added without game replay.

No tests were executed because the materializer owns the lane. After parent source review and lane clearance, the focused commands are:

```sh
/usr/local/Cellar/python@3.14/3.14.4_1/Frameworks/Python.framework/Versions/3.14/bin/python3.14 -B /Users/zacheryspector/studio-scratch/1370-c0-aging-era-witness-r7-readiness-20261008-r1/test-sink-red.py
/usr/local/Cellar/python@3.14/3.14.4_1/Frameworks/Python.framework/Versions/3.14/bin/python3.14 -B /Users/zacheryspector/studio-scratch/1370-c0-aging-era-witness-r7-readiness-20261008-r2/test-launch-refusals.py
```

Run with cwd `/Users/zacheryspector/The-Movies-headless-program`, ordinary unsandboxed Python, and record actual output/exits. Expected15 tests total is a design expectation, not a measured pass. Retain r1's exact fill/observed materialization/launch/clock/group/frame boundaries. This preparation confers no execution authority for a filled witness.
