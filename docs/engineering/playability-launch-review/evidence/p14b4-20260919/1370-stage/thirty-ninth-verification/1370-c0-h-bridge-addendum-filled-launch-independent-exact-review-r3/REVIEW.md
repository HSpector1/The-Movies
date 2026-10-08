# H bridge recorder filled launch r2 — exact REFINE, unrun

The command is syntactically valid, SHA pins match, and it begins the clock before authenticating the r4 supervisor. It then arms `ITIMER_REAL` for a literal 210 seconds. The timer therefore ends 210 seconds after arming, not at `LAUNCH_START+210`; the latter is the r4 recorder’s stated whole envelope. No tolerance is documented or reviewed.

Keep this filled command unrun. Version a new command that computes the exact positive remaining interval from `LAUNCH_START` immediately before pinned reads, rejects elapsed outside `[0,210)`, and arms the timer for that remainder. Preserve the accepted supervisor source and static receipt, then repeat independent exact review and live preflight.
