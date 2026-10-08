# H full-readback outer recorder r1 static review — ACCEPT, unrun

The frozen implementation matches the design-only 600/620/630 route. The launch template begins a finite clock and arms the positive 630-second remainder before pinned reads. The supervisor validates elapsed, owns a 620-second active timer, retains the 630-second hard alarm through group cleanup and result write, and starts the authenticated r4 child bootstrap in a new session. That child starts its own 600-second timer before reading pins.

The recorder requires one lane, AC, 3.5 GiB preflight/3 GiB continuous floor, clean production HEAD 9651546a/src13880, exact origin and local/remote production/evidence refs. It records real child exit and group absence. Its one-shot result uses nofollow dirfds, bounded partial write, fsync, O_EXCL final link and SHA/path/root reread. The synthetic suite passes invalid starts, wrong SHA, symlink parent, output collision and a long-child timeout with STOP and no survivor.

This is static-only. The template still contains placeholders and requires independent exact review of the filled command and binding. Hard timeout may leave partial/missing result; that is STOP, as is a nonzero lane child exit. No mirror bytes or typechecks were run here.
