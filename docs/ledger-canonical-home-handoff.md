# Ledger's short address is the actual page

2026-10-16 — Filmanthropy Ledger / Codex

Bret requested making `/filmanthropyledger` the live address instead of
`Filmanthropy_Ledger_v2.html`, and clarified that older links need not work.
The request authorizes publication of this bounded routing change. Base main:
`4a1a0c7318f675e494cdb2e9526edfea631cad33` (published PR #12).

## Implementation

**Edit `filmanthropyledger/index.html` for future Ledger page changes.** It now
contains the complete, existing page. It was previously only a redirect to the
long filename. GitHub Pages serves a directory address with its normal trailing
slash: `/filmanthropyledger/`. Opening the short address stays there during
menu, essay, AI, feed and entry navigation.

Root-relative asset/company links and the feed request allow the page to work
inside this directory. The router's content-derived version was updated for its
root-relative feed request. CSS, entry data, images, company homepage, approved
introductory wording, card order, menu labels and article prose are preserved.
Canonical metadata and sharing destinations already use the requested address.

The former long filename is a small bridge using the former alias's metadata;
it is not another editable copy of the page. A private migration query marker
bypasses a browser's cached former short-address redirect, and is immediately
removed from the new page's displayed URL while preserving other query values
and hashes. This avoids a cached alias → old filename → cached alias loop. No
larger legacy-link migration is required. Existing entry aliases already point
to the short address and continue to work without edits.

## Verification

Full normal-motion regression passed at 1440×1000 and 390×844: direct canonical
page, no refresh redirect, page/menu order and exact approved copy, assets/feed,
all 16 entry pages/hashes, featured Eva/Vinati, Case Studies/Forerunners and return
links, AI/note/menu keyboard behavior, feed-only Happening Now, submission link,
lazy 16:9 playlists and NJ-priority fixtures. A focused rerun after the cache
bridge passed, including a simulated cached former alias that preserves query
and hash and finishes at the clean short address without looping. No failed
same-site asset/feed responses or site JavaScript errors.

Metadata/footer verification passed for all 22 metadata pages and at
360/390/1440px; cached-router note tests passed at 1440/390px. Sharing checks
exercise canonical page/entry destinations and copy/composer controls without
sending posts. The PR records the final sharing results and exact deployment.
External fonts/icons/players are substituted in browser tests; actual external
delivery and physical-phone behavior are not asserted. Source migration is
compared exactly against PR #12, allowing only path/version changes and the
documented cache bridge. Whitespace checks pass.

Changed: canonical page, old filename bridge, `assets/ledger-v2.js`, all four
existing browser tests (their live-page locations/expectations), this handoff.
Historical handoffs refer to their then-current file paths. The new canonical
source above supersedes those paths for future work. Company root migration and
the separate company rewrite remain pending. No private business copy is added.
