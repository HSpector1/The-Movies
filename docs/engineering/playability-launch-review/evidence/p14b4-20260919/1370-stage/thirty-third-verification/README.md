# Stage33: F1 raw diagnostic backup

This directory preserves the independently reviewed F1 original-cap film-hold control and the AG→E0G neutral diagnostic. It does not close the four protected C0 digest differences or the 1363 acceptance gate.

`f1-raw-evidence.tar.gz` contains exactly 17 files: the F1 clean preimages, types and clean results, two-stage route result and binding, the audit result and lane record, and the independent observed receipt. Its uncompressed member total is 21,914,853 bytes. The compressed archive is 1,050,870 bytes with SHA-256 `196ee273dfb29b5f0d16aafa01608b68d1f47711257b63ae387c70b360707549`. `f1-raw-manifest.json` pins every member and source SHA-256. An independent recorded readback checked gzip CRC, the exact tar roster and every member, and rebuilt identical archive bytes; see `f1-archive-local-review.json`. Remote GitHub byte verification follows the push.

The standalone F1 audit result, F1 observed receipt, AG→E0G comparator result, observed receipt, and exact temporary-copy cleanup receipt are also copied here so a reviewer can inspect the decisions without unpacking the archive. Their original evidence and failure labels remain in scratch; the 1370-Q checkpoint document records the interpretation and remaining gates.
