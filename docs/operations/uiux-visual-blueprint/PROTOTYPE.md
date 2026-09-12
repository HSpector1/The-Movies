# Open and explore the standalone prototype

**PROPOSED DESIGN / MOCK DATA — NOT IMPLEMENTED.** Unzip the complete package, then double-click **index.html**. Keep `styles.css`, `prototype.js` and `lot.svg` beside it. No packages, server, account, network or game installation is needed. GitHub displays the source rather than executing HTML; use the actual ZIP for clicking through locally. [Visual index](README.md).

All behavior is fictional, in-memory and resettable. There is no localStorage, cookie, network call, real bridge, file write, campaign load or financial transaction. The prototype’s CSP blocks network connections; local vector/styles/script are bundled. It uses an original schematic lot and silhouettes. Reset Demo clears its navigation and staged results.

1. **J1 — Production:** from the mature lot open The Glass Harbor. Scroll its detail, open Mara Vale’s Profile and Back to the same film/position. Inspect the facility and return. Schedule the take: see pending then a simulated receipt. Use the clearly marked **Prototype response fixture** to choose refusal before submitting. The waiting branch has no immediate remedy; missing-target fixture never substitutes another film.
2. **J2 — Casting:** open Casting → Compare 2 candidates → Review this candidate → Use in lead draft / Back. Unavailable Leon is inspection-only. Review greenlight exposes the $700,000 mock commitment and ongoing cost basis. Stage the request; pending blocks duplicates, then the response fixture supplies a simulated receipt/refusal. No actual contract or production is created.
3. **J3 — Campaigns:** Menu → Load selected → Save As → name → consequence review. Choosing an existing fixture name opens overwrite review. Select unresolved response → Stage Save As → Retry same operation → simulated receipt → Review original leave task → explicit continuation. Closing pending/unresolved views does not cancel a submitted request. Its status remains beside the active campaign and can be reopened. Other campaign changes stay disabled until the outcome resolves; a closed view does not reopen itself. No file is saved or app quit.

The View selector reaches eight families plus component/direction boards. Other controls either navigate within the design or open a **Static design example** that states the limit. Time and Locate are presentation examples; no clock or camera simulation runs. Keyboard Tab/Shift-Tab, Escape, campaign-name Enter and panel scrolling operate locally. Physical controller support and native input are not demonstrated.

Editable screens can be opened directly using query parameters, for example `index.html?screen=casting&state=compare`, `?screen=production&state=waiting`, `?screen=campaigns&state=name&text=200`. `&annotated` adds the 300px design-note rail.

| Additional fixture | Local query |
| --- | --- |
| Early / mature lot | `?screen=home&state=early` / `mature` |
| Missing production | `?screen=production&state=missing` |
| No candidates / large list and long title | `?screen=casting&state=empty` / `long` |
| Unavailable person | `?screen=person&state=unavailable` |
| Valid / invalid placement | `?screen=building&state=valid` / `invalid` |
| Construction / operational / Laboratory entry | `?screen=building&state=construction` / `operational` / `lab` |
| Industry drill-down | `?screen=finance&state=drill` |
| Name / overwrite / pending / unresolved / receipt / continuation | `?screen=campaigns&state=name` (replace state as listed) |
| Reading scale | Add `&text=200`; choose text size in Menu for session-wide workspace scaling |

Reference images were rendered from this same HTML/CSS. Browser geometry/focus checks apply only to this prototype. Author and checker observations, repairs and remaining limitations are in [REVIEW.md](REVIEW.md).
