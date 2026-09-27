# 1134-A — First P3 root-type correction

1134 closed on `ea237c2015386bf8551216c86d0d747bea7a4bdb` with empty consumed
diff and `fixedSource:true`: 2026-09-27 11:28:36.500–11:29:09.927 UTC,
33.427 seconds, child exit 2. Its sole diagnostic was:

```text
tests/p14p3-directing-promises.test.ts(337,49): error TS2353: Object literal may only specify known properties, and 'hollywood' does not exist in type 'GameStateV18'.
```

The heterogeneous old-builder list accepts its shared older structural shape;
an inline fresh object received that narrower excess-property check. The only
repair binds the exact same cloned state plus `hollywood: null` to a named
`GameState` local before passing it to the builder. No cast, field removal,
assertion, exception pattern, timeout, declaration, route or expected behavior
changed. The malformed-current general-refusal control and separate precise
retained-P3 refusal remain intact. No runtime has been executed.

`tests/p14p3-directing-promises.test.ts`:

- Before: 27,772 bytes / `acacfbba2c0b72ab2df369b485d27e23b4a9059425adb4a0eb956c189d68f9f9`.
- After: 27,813 bytes / `f76990d20a0b7eeef223e2638be98509aaa3e4adbcc08dc3f60bb9153cdc96b1`.

`1134-p3-first-slice-type-correction.patch`: 870 bytes /
`242d728152ec6ac8b578fcc1cc8f8f9e4278c8aa20911e82986f41314bd07022`. The helper remains 23,664 bytes /
`c46c50b8940787a7e76b9f7522f98dec8caa96dedbb4e29cc5c1c5e373eb4f7a`.
Original 1133 artifacts and the failed 1134 raw record remain unchanged.
The exact eight-leaf argv and 208-call/60,000ms bounds remain frozen.

**SOURCE RE-FROZEN.** Parent alone integrates/checkpoints and runs the required
1134b root type retry, then the first unfiltered 1135 behavioral record. This
handback reports the typing correction only, not a successful compiler or P3
behavior result. No staging, commit, test, project evaluation or probe occurred
in the author lane.
