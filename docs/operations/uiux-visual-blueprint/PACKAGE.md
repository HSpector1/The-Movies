# Complete package and immutable content identity

[Visual index](README.md) · [Download the actual complete ZIP](delivery/UIUX-VISUAL-BLUEPRINT.zip?raw=true) · [File manifest / byte counts](delivery/package-manifest.json) · [SHA-256 list](delivery/MANIFEST.sha256)

Reviewed design-content commit: **`56151dcaf31992faa417375286fdb33a903501c1`** on `docs/uiux-whole-game-review-01`, following original audit `72f04f95bb00ba601d511142b9db8b231e86526b`. [Immutable content tree](https://github.com/HSpector1/The-Movies/tree/56151dcaf31992faa417375286fdb33a903501c1/docs/operations/uiux-visual-blueprint).

The ZIP contains all **73 design payload files**, including **64 PNG previews**, plus `package-manifest.json` and `MANIFEST.sha256`: **75 actual files**. Its payload exactly matches that content commit. Extract it and open `index.html`; no installation or network is needed. The visual review index, specifications, routing, checker disposition, prototype source and original SVG are all included.

- ZIP bytes: **13,535,700**.
- ZIP SHA-256: **`1b090fccaaa6ea542d038f2b167db9af641c5a0e8afde1d7551da93c19320f38`**.
- Uncompressed design payload bytes: **13,904,498**.
- Manifest SHA-256: **`05c05cb22c73ca321455c475fc4d8f5fa1f3be78c2266a94850e9e70dfe06e61`**.

`package-manifest.json` records each payload path, byte count and SHA-256, plus the exact reviewed content commit. `MANIFEST.sha256` covers those files and the manifest. A checksum list cannot contain its own checksum; the external whole-ZIP checksum above covers the complete archive. There are no absolute machine paths or personal campaign data in the package.

The later publication commit adds this receipt, the ZIP/manifest/checksum files, and download links to the index. It does not change the reviewed prototype or previews. The ZIP’s index is the complete content-commit index; it does not link recursively to a copy of its containing archive. The publication commit is pinned in the delivery message and GitHub URL, not embedded in itself.

Local verification: ZIP integrity and all member bytes matched the content commit; all image files had valid PNG signatures/dimensions; document links resolved; the extracted local prototype opened in an isolated browser. Remote verification is performed after publication and reported in the delivery message. These checks do not validate native gameplay, input, finances or persistence.
