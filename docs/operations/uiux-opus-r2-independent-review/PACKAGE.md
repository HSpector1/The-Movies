# Package and immutable content identity — Opus independent R2 review

[Visual index](00-INDEX.md) · **[Download the actual complete ZIP](delivery/UIUX-OPUS-R2-INDEPENDENT-REVIEW.zip?raw=true)** · [File manifest](delivery/package-manifest.json) · [SHA-256 list](delivery/MANIFEST.sha256) · [Handoff](00-HANDOFF.md)

Review content commit: **`ce9f515e8fe0ff78ab7156b2234ba5d1db79bb1c`** on
`docs/uiux-opus-r2-independent-review-01` (documentation parent `234a36ef` on
`docs/uiux-playability-priority-01`; brief `05e9902e`, addendum `234a36ef`).
[Exact content tree](https://github.com/HSpector1/The-Movies/tree/ce9f515e8fe0ff78ab7156b2234ba5d1db79bb1c/docs/operations/uiux-opus-r2-independent-review).
Reviewed Codex R2: **`e564d236407cb3616ebc597713d5b9fa7d60b38a`** (design content
`1fab1a3a`; ZIP 21,736,950 B, SHA-256 `2096b670eaae8fc82efc7f73b6c51fc2c8a8351149eb9e3af945c8ce778bf784`,
verified from the git object before review). R2 was not modified.

The ZIP contains **135 review payload files** (documents, evidence crops, research
excerpts, editable prototype source, **100 PNGs**) plus the two generated metadata files
= **137 files**. Extract it and open `00-INDEX.md` for the review, `assets/design/index.html`
for the prototype and `assets/design/components.html` for the sheet. No install, server,
account, game, network or campaign data is needed; the prototype's CSP is
`connect-src 'none'` and it keeps fictional state in memory only.

| Verification identity | Value |
| --- | --- |
| ZIP bytes | 45,451,046 |
| ZIP SHA-256 | `44103a10c01f6b99a8d5c51a59c358967687c852016901a21a5c2e5e0939de01` |
| Payload bytes | 46,098,555 |
| Manifest SHA-256 | `ce3135335b6ee0885c43aeffe0bdc9b849fbeb893246bbcc88350df07eae8a40` |

The manifest records each payload path, byte count and SHA-256 at the content commit.
`MANIFEST.sha256` covers those files and the manifest. The whole-ZIP checksum covers the
archive; no recursive self-checksum is claimed. This publication commit adds only
`delivery/` and this file; it does not change the reviewed content. The final publication
commit SHA is pinned in the delivery message, not embedded here.

History note: commit `068276bd` (a content commit) accidentally carried a `delivery/`
folder built against the earlier content commit `35748e8e`; `ce9f515e` removed it before
this package was built, so no ZIP in this branch's tip is stale.

Local checks performed before publication: ZIP integrity (`unzip -t`), every member
checksum (`shasum -c`), the archive's prototype extracted to a scratch folder and rendered
in a fresh headless Chromium with network blocked (byte-identical `K1-overview.png`), and
all 49 relative links in the package documents resolved. Remote checks after the push
(head SHA, raw ZIP bytes/SHA-256) are recorded below.

## Remote verification (2026-09-12, after the publication push)

Publication commit **`a9fe0d8b4989b67ec6fcb839c515e99cd597943d`** (branch head confirmed by
`git ls-remote` and the GitHub refs API). The ZIP was downloaded back from
`raw.githubusercontent.com` at that commit: **45,451,046 bytes, SHA-256
`44103a10c01f6b99a8d5c51a59c358967687c852016901a21a5c2e5e0939de01`** — identical to the
table above. `00-INDEX.md` and a sample render (`CMP-01-overview-3up.png`, 713,863 B)
were served from the same commit. This note is added in a small follow-up commit that
changes no payload or delivery byte.
