# Filmanthropy Ledger Round 2 handoff

Author: Filmanthropy Ledger Round 2 / Codex
Date: 2026-10-15
Scope: attached Round 2 brief, tweaks 1–4, including its second-playlist update.
Base: `main` at `67dd537a31f91ff0fcb994f3de5654f41f953d7d`.
Branch: `codex/ledger-round-2`.

The site is static HTML/CSS/JavaScript. GitHub Pages was checked directly:
it publishes repository root on `main` to `socialeffectsnj.com`. Only Bret
reviews and merges this PR. No deployment, main push or merge is part of this work.

## Result

- Existing desktop, mobile, footer and companion Ledger links use `/filmanthropyledger`.
- `#case-studies` and `#forerunners` land on the Forerunners heading, followed by
  its unchanged subtitle and four cards. The existing `forerunners` ID now lives
  on that heading. Fixed-menu clearance uses the actual menu height; initial
  and web-font loading alignment prevent the introduction from shifting it away.
- All 16 `entry-*.html` share pages retain their metadata and URLs. Their refresh,
  JavaScript and visible fallback links target `/filmanthropyledger#<matching-entry>`.
  `/eva` targets `#fbr`; `/vinati` targets `#skater-girl` on the same new route.
- `/ledger` still leads to the original `Filmanthropy_Ledger.html`. The original
  page and its `#fbr` and `#skater-girl` behavior remain available.
- Happening Now includes a Watch section with two clearly labeled,
  responsive 16:9, lazy YouTube privacy-enhanced players. They sit side by side
  above 700px and stack at smaller widths. Each has a direct YouTube fallback link.
- Optional tweak 4 is deferred: existing `social-share.jpg` remains on both
  `/filmanthropyledger` and v2. Core work does not depend on a new image.
- Canonical essay, case cards, full entry data and authorship copy are unchanged.
  `Filmanthropy by Design and Regenerative Filmmaking` is preserved exactly.

## Review previews

- [Hub](https://raw.githack.com/PreposterousHQ/social-effects-inc/codex/ledger-round-2/Filmanthropy_Ledger_v2.html)
- [Forerunners](https://raw.githack.com/PreposterousHQ/social-effects-inc/codex/ledger-round-2/Filmanthropy_Ledger_v2.html#case-studies)
- [Watch](https://raw.githack.com/PreposterousHQ/social-effects-inc/codex/ledger-round-2/Filmanthropy_Ledger_v2.html#watch)

Raw.githack puts the repository under a path prefix. Production-root links
such as `/filmanthropyledger` cannot be followed within that preview host.
Use the direct previews for visual review; same-origin route chains are checked
on a local server with the production folder layout. Preview availability must
be checked after the branch is pushed.

## Verification

Passed on 2026-10-15 in headless Chrome at both viewport sizes. Desktop and
mobile screenshots were visually inspected: the heading clears the menu,
the subtitle and four cards remain present, and Watch cards stack without
horizontal overflow on mobile. JavaScript syntax and `git diff --check` pass.

Run `node tests/ledger-round-2.cjs` with Playwright available on Node's module
path and its Chromium installed. Alternatively set `LEDGER_BROWSER=chrome` to
use installed Chrome. Set `LEDGER_SCREENSHOTS` to an output directory to save
the desktop/mobile Watch and Forerunners captures. `LEDGER_BASE` can select
another baseline for the exact wording comparisons.

The regression check covers HTTP availability of every required entry point,
all existing Ledger navigation links, exact protected text and entry-data
comparisons, canonical redirect query/hash retention, Case Studies/Forerunners
landings, keyboard opening and return, all 16 entry redirect chains, `/eva`,
`/vinati`, original-page hashes, responsive player dimensions and overflow,
and site JavaScript errors at 1440×1000 and 390×844.

The deterministic regression substitutes inert content inside external players.
Separate live checks on 2026-10-15 resolved both supplied public playlists and
initialized both privacy-enhanced players inside a page, showing their first
video thumbnails and video elements. Full uninterrupted playback and physical
phone testing are not claimed. Directly opening a bare embed URL returned
YouTube Error 153 without a page referrer; the same players initialized normally
inside a page using the supplied referrer policy.

## Deferred decisions and maintenance

Tweaks 5–6 are untouched. Bret must choose the submission service and receiving
inbox, and supply the foundation/business decks, mission copy and password.
No form, submission storage, password gate or new mission copy was added.

The README's old undeployed-status text is stale against the verified Pages
configuration; its private-repository label is also stale (GitHub reports this
repository public). This handoff records the current mapping without rewriting the
README's unrelated project history.

Future work starts from fresh `main` and this PR's reviewed outcome. Read the
current file before editing; preserve unrelated branch work. GitHub's PR diff
and merge checks resolve concurrent code changes. Keep the legacy original and
share-page metadata, and rerun the browser check after routing changes. Do not
merge, push to main or deploy without Bret's explicit direction.

## Changed files

```text
Filmanthropy_Ledger.html
Filmanthropy_Ledger_v2.html
assets/ledger-v2.css
assets/ledger-v2.js
docs/ledger-round-2-handoff.md
entry-black-panther.html
entry-braddock.html
entry-earth-angel.html
entry-ecoset.html
entry-fbr.html
entry-field-of-dreams.html
entry-hobbiton.html
entry-interstellar.html
entry-mptf.html
entry-patch-adams.html
entry-rawk.html
entry-schindlers-list.html
entry-sing-sing.html
entry-skater-girl.html
entry-slumdog.html
entry-wicked.html
eva/index.html
filmanthropy-history.html
index.html
moonshot.html
test/index.html
tests/ledger-round-2.cjs
vinati/index.html
why-filmmaking-is-civic.html
```

The fresh PR branch is the newest site-code copy for this work. Drive startup
sources were read directly; no synchronization with the private vault, installed
SynTony runtime or other local copies is claimed.
