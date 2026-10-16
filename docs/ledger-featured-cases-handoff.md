# Clear case-study entry point and shared conversation note

2026-10-16 — Filmanthropy Ledger / Codex

Base main: `9f8f8fb66090dc016432d39d334623edc42bdb66` (published PR #14).
Bret requested a clearer all-cases action immediately after “something lasting”
in the home Case Studies box, slightly more room before Eva's feature, and a
shared conversation-source box below both Eva and Vinati.

The gold **Read all 16 entries →** button now follows that sentence, flowing
beside its final words when room permits and wrapping normally on narrow views.
It replaces the old bottom action and uses the existing `#case-studies` route,
which lands at the beginning of the full Forerunners/case-study section. The
featured Eva and Vinati links remain unchanged. Their group starts 4px lower.

Below both features, an **In their own words** box reads:

> These two entries are based on Bret Warshawsky’s conversations with Eva Radke and Vinati Makijany in 2026.

This is scoped to the two featured entries, not all sixteen cases. Existing
public entry data supports the year: Eva's provenance says July 2026 and
Vinati's says August 2026 (`assets/ledger-entries.js`). Their individual detailed
provenance, source wording, narrative, quotes and dates remain unchanged. No
new quotation or correspondence claim was inferred.

Validation: existing normal-motion focused regression passed at 1440×1000 and
390×844, including new button click/Forerunners landing, note scope/placement,
both featured-entry links, current canonical route, exact introduction/order,
menu/keyboard behavior, AI/note, footer company link, feed/submissions/playlists
and NJ fixtures. Existing aliases/16 entry URLs return HTTP 200; protected
canonical article prose and entry data unchanged; no site JavaScript errors.
Broad navigation uses substituted external fonts/icons/players. Separate
1440/390px component QA loaded actual Playfair Display/DM Sans/DM Mono: 44px
button target and note below both features, content bounds and viewport fit
passed; screenshots visually reviewed. The existing clipped decorative ring is
excluded from content-overflow measurements. Whitespace passes.

Changed: `filmanthropyledger/index.html`, `assets/ledger-v2.css`, the existing
navigation regression and this handoff. CSS version follows final bytes.
No router, entry data, canonical essay/AI/case narrative, company-page, image,
metadata or share-destination change. Review PR has the tested commit; production
remains PR #14 until Bret authorizes merging this new adjustment.
