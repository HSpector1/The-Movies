# H bridge outer recorder r4 static review — ACCEPT, unrun

R4 closes the future-start defect: it requires an exact finite int/float `LAUNCH_START`, rejects bool/NaN/Inf/future values and elapsed outside `[0,200)`, and repeats the validation before timer calculations. Its focused synthetic tests pass all invalid-start REDs and a two-second long-child timeout with nonzero exit and cleared process group.

The embedded bootstrap remains pinned to the accepted r3 addendum source/static receipt and production HEAD. The recorder retains a 200-second active limit and 210-second hard envelope through cleanup and one-shot receipt write. Result writing uses stable nofollow dirfds, fsync, O_EXCL final link, and SHA/path/root readback. If hard timeout leaves a partial/missing result, that is STOP; a complete result cannot override a nonzero recorded child exit.

This is static source acceptance only. An exact loader must start the clock and hard timer before reading the recorder source. The real addendum and 1,402-file mirror readback remain unrun.
