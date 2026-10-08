# H bridge full readback outer recorder r2 — static proposal, unrun

Versioned retry from accepted r1 recorder. R4 readback STOP is preserved (independent observed receipt SHA 8d7c904eefdaacc5e8905c2a3166d80907768cb7c97c75d46be1c26de98beec6). R5 runner source SHA fd241c6d3de7ae9779c9f8f9b0d5efc41c8dfd1ae85c0066b91e270198ece40a and independent static receipt SHA c540f11967aac7d0fc30f4452a24ad47441ea45ff3377cb10e8bec94988196f0 are bound.

The source child is bounded at 600 seconds; the recorder active/whole limits remain 620/630 seconds. The exact launch template starts its clock and arms 630−elapsed before authenticating source/review/binding bytes. Recorder requires clean production HEAD 9651546a..., source tree 13880..., evidence tip fe9e8a..., AC, disk, sole recorded lane, one-shot output and no survivors. R5 child independently pins the r4 STOP receipt and actual accepted addendum review routes. Wrapper exit alone is not acceptance.

Synthetic invalid-start, wrong-SHA, symlink-parent, collision and timeout/group-cleanup checks pass. This package has not run the mirror. Separate independent recorder static review, filled binding and independent exact launch review remain required.
