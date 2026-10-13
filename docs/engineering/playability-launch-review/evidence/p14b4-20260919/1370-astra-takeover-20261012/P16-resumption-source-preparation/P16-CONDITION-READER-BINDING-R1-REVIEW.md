# P16 default condition reader binding r1 — REFINE, superseded by r2 review

Source-only review of four-path PATCHf2c3740807e3281927a0ae87660659fad63b0aa534856f4f2ac6c44745242388. The actual default reader binding is semantically appropriate; existing same-suite entry leaf still assumes an UNBOUND default full tick, which becomes stale after actual evaluation. Parent/author already identified this defect. R2 is reviewed separately below; no r1 bytes or results changed and no execution occurred.
