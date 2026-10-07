# Archive segment publication

These ordered parts reconstruct the exact reviewed failed-capture archive. The original capture remains failed.

Run from this directory after downloading all parts:

```sh
cat EVIDENCE.tar.xz.part-0001-of-0003 EVIDENCE.tar.xz.part-0002-of-0003 EVIDENCE.tar.xz.part-0003-of-0003 > EVIDENCE.reassembled.tar.xz
shasum -a 256 EVIDENCE.reassembled.tar.xz
```

Expected SHA-256: `1d065ca4f946269a464c526a80e8d34b932cf56c06bf04fc812fc96590d567df`; expected bytes: `113296808`. Check each part against `SEGMENTS.json` before using the archive.
