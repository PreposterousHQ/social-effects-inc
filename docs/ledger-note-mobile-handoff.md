# Ledger note and mobile refinement handoff

Author: Filmanthropy Ledger / Codex
Date: 2026-10-16, New York time
Base: main `baeb532eaed6a2028630b12928970b6fc946785f` (merged PR #8).
Branch: `codex/ledger-note-mobile`.

## Result

The AI view ends after its article. The redundant links to the standalone
Social Effects note and the essay's “Why now” chapter are removed. The article
and original standalone page retain their wording and existing URL.

“Version One, Living Record” no longer follows every view in the current
Ledger. Both menus now offer “A Note on the Ledger,” opening
`#note-on-the-ledger`. Its version, authorship, research and correction notes
are preserved verbatim and have a readable, left-aligned column. Direct links,
browser Back and the note's return link are supported. The original archival
`Filmanthropy_Ledger.html` remains unchanged.

The mobile opening uses less top space, a modestly smaller title and tighter
paragraph spacing. “Explore the Ledger” is a clear gold button with a minimum
44-pixel touch target. The photo credit is hidden on phones, where its photo
was already hidden. No introduction wording was rewritten. The mobile menu
close button is at least 44 pixels; links retain their height on short screens
and the menu scrolls. Desktop menu spacing accommodates the new destination.

Browser verification caught a fixed-header overlap on the new note's return
link. All current Ledger views now reserve header space, keeping their mast
and “Back to the Ledger” link accessible.

## Verification

The full browser regression passes at 1440×1000 and 390×844 with normal motion:
all 16 entry redirect chains, `/ledger`, `/eva`, `/vinati`, the original Ledger,
`#fbr`, `#skater-girl`, canonical query/hash preservation, Case Studies and
Forerunners landings, keyboard return, NJ-priority fixtures and lazy 16:9
playlists. The new checks cover both note menus, direct note routing, browser
Back, the note's return link, header clearance, removed AI links and absence
of the repeated note below the AI, hub, submission and news views. No site
JavaScript errors occurred. JavaScript syntax and diff-whitespace checks pass.

Additional layout checks pass at 360×640, 390×844, 844×390, 1280×800 and
1440×1000: no horizontal overflow, menu targets remain at least 44 pixels on
short screens, desktop menu links fit and the note's back link clears the
header. In fallback-font checks the phone opening is 132 pixels shorter at
360 pixels wide and 135 pixels shorter at 390 pixels wide. Opening, note and
AI-ending screenshots were visually inspected.

Third-party fonts/icons and YouTube responses are substituted in deterministic
browser checks. Actual font delivery, live playback and physical-phone QA
remain unverified by this pass. The PR description carries the review URL
and verified commit-specific preview. Root-relative company/profile links in
raw.githack previews lead outside the preview's repository prefix; their
production-layout route chains are covered by the local tests.

## Changed files

- `Filmanthropy_Ledger_v2.html`: menu destination, dedicated note view, AI links.
- `assets/ledger-v2.css`: phone spacing, button, note typography, menu targets
  and fixed-header clearance.
- `assets/ledger-v2.js`: note route and modal background accessibility.
- `tests/ledger-round-2.cjs`: note routing, menu/history/return behavior,
  hidden repeated note, removed AI links and opening checks.
- `docs/ledger-note-mobile-handoff.md`: this checkpoint.
- `docs/ledger-homepage-redesign-handoff.md`: pointer to this newer pass.

## Boundaries and remaining work

The exact phrase “Filmanthropy by Design and Regenerative Filmmaking,” the
introduction, canonical essay, case studies, entry data, AI prose, playlists
and feed data are preserved. Root homepage migration, the Social Effects
redesign, a possible Filmanthropy/history menu item and the form → alert →
Bret's approval → publication workflow remain separate work.

This is a fresh branch and normal PR. Earlier merge instructions applied to
their specific PRs; a new instruction is required before merging this pass.
No production publication or main push is part of preparing this review.

The PR branch is the freshest implementation copy. Shared TODO receives the
review checkpoint; Drive/private-mirror synchronization is not inferred.
