# Ledger introduction, navigation and AI handoff

Author: Filmanthropy Ledger / Codex
Date: 2026-10-15, New York time
Base: main `4131839f2e65e4a8cdb64f0069564afef86e2741` (merged PR #7).
Branch: `codex/ledger-welcome-ai`.

## Result

The Ledger now leads with its own identity, “The Filmanthropy Ledger” and a
visible “by Social Effects” credit. Its new introduction opens “How far can the
gift of a film reach?” and preserves Bret's complete closing sentence naming
Filmanthropy, Filmanthropy by Design and Regenerative Filmmaking, and the Social
Effects work and offerings. The Social Effects text links to `/socialeffects`.
The former main-hub How giving rises strip and separate information box are
replaced by this introduction. The canonical Case Studies explanation of How
giving rises remains intact.

The six main choices form two columns and three rows on wider screens:

| Left | Right |
| --- | --- |
| The Essay | Filmanthropy and AI |
| The Case Studies | Stories from the Field |
| Happening Now | Submit Your Story |

They stack in the same reading order on phones. AI is in the first row and
submission is directly below Stories from the Field. Case Studies introduces
the pioneers/Forerunners, then briefly features Eva Radke / Film Biz Recycling
and Vinati Makijany / Skater Girl, with direct `/eva` and `/vinati` links.
It uses separate valid links inside an article rather than nested anchors.

The Ledger menu links to its essay, AI view, case studies, news and firsthand
stories, then the separate Social Effects company destination. Submit a Story
is a distinct action. Both the desktop brand and mobile-menu title return to
the opening, including repeated clicks when `#hub` is already current. The
mobile menu supports Escape, focus containment and return to its opener.
Back links say “Back to the Ledger.” `#paths` opens the main choices.

Happening Now clearly describes news reports, preserves NJ-first ordering and
remains feed-only. Stories from the Field describes personal, firsthand
accounts, with an honest collection-in-progress state. Submit Your Story has
its own view with review/publication instructions and the already approved
interim email link to Bret. No firsthand submissions were invented.

## Existing AI source reused

After Bret identified a possible existing AI page, inspection found
`why-filmmaking-is-civic.html`, “Why Filmmaking's Future Is Human and Civic.”
The `#filmanthropy-and-ai` view transfers its title, introduction and all ten
article paragraphs verbatim. Section headings only change HTML level to fit
the embedded document. No replacement AI opinion or invented new article was
published. The original standalone page and URL are unchanged. A link also
opens the existing “Why now” chapter in the Ledger essay.

When editing this AI copy later, read both embodiments first and deliberately
update or distinguish them. The regression compares their paragraphs and keeps
the standalone source unchanged for this transfer. Neither copy silently
synchronizes itself with the other.

## Verification and review

Focused new-interaction checks passed at 1440×1000 and 390×844, including the
AI article link, direct Eva/Vinati links, title return, submission path, menu
keyboard behavior, card arrangement, NJ ordering and responsive playlists.
Opening, card and AI-view screenshots were inspected with fallback fonts.
The full regression subsequently passed at both sizes with normal motion
enabled, including all 16 browser redirect chains, `/ledger`, `/eva`, `/vinati`,
the original `Filmanthropy_Ledger.html`, `#fbr`, `#skater-girl`, canonical
query/hash preservation, Forerunners landings, keyboard return, new-view
interactions, NJ-priority fixtures and both lazy 16:9 players. No site
JavaScript errors occurred. JavaScript syntax and diff-whitespace checks pass.

Review PR: https://github.com/PreposterousHQ/social-effects-inc/pull/8

Verified implementation preview (HTML, CSS and JavaScript returned HTTP 200):
https://raw.githack.com/PreposterousHQ/social-effects-inc/df513008f2178a49ca845318ce6d6bec3e5f11e3/Filmanthropy_Ledger_v2.html#hub

Run `tests/ledger-round-2.cjs` with Playwright available on `NODE_PATH` and
`LEDGER_BROWSER=chrome` for installed Chrome. `LEDGER_SCREENSHOTS` optionally
saves local captures. The regression checks the existing required routes,
canonical prose, original AI text, new views, six-card layout, desktop/mobile
menu, repeated title return, direct profile links, submission path, protected
entry data, NJ-priority fixtures and responsive lazy playlists.

The regression substitutes third-party player/font/icon responses. This keeps
CDN timing outside the deterministic navigation checks; screenshots use the
page's local font fallbacks. Default motion is reduced; set
`LEDGER_MOTION=no-preference` to exercise normal scrolling. `LEDGER_WIDTH` can
select one viewport, and `LEDGER_FOCUS_NEW=1` isolates new interactions while
diagnosing a failure. The full acceptance run leaves those filters unset.
Live YouTube playback, font-CDN delivery and physical-phone QA are not asserted
by this regression. No new production dependency was introduced to fix a test.

Review preview:
`https://raw.githack.com/PreposterousHQ/social-effects-inc/codex/ledger-welcome-ai/Filmanthropy_Ledger_v2.html`

Use `#paths`, `#filmanthropy-and-ai`, `#case-studies`,
`#stories-from-the-field`, `#submit-your-story`, `#happening-now` or `#watch`
to inspect individual destinations. Raw.githack retains a repository-path
prefix, so production-root company/profile links lead outside that preview.
The production-layout local browser check exercises their complete route chains.

## Deferred work and publication boundary

This pass prepares the Ledger at its current routes. The root homepage remains
the current Social Effects site; `/socialeffects` continues its existing alias
to `/index.html`. Before any later root swap, preserve the old company site as
actual content at `/socialeffects` and replace that alias. The company-site
redesign and root-homepage migration remain separate review steps.

The potential Filmanthropy/history menu item is still undecided. The form,
alert to Bret, explicit approval and automatic approved-story publication
workflow remains planned. No backend, automatic ingestion, submission service,
password gate, mission copy or foundation/business decks were introduced.

Canonical essay, case-study/full-entry wording and authorship are preserved,
including the exact phrase “Filmanthropy by Design and Regenerative Filmmaking.”
Both playlists retain their titles, IDs, responsive sizing and lazy loading.
Legacy `/ledger`, the original `Filmanthropy_Ledger.html`, all `entry-*.html`
pages and old hashes remain available.

This is a fresh branch and normal PR. No main push, merge or production
publication is authorized by earlier approvals specific to PRs #5, #6 or #7.
Bret reviews this result before a new merge/publication instruction.

## Changed files

- `Filmanthropy_Ledger_v2.html`
- `assets/ledger-v2.css`
- `assets/ledger-v2.js`
- `tests/ledger-round-2.cjs`
- `docs/ledger-homepage-redesign-handoff.md`
- `docs/ledger-content-and-navigation-plan.md`

The PR branch is the freshest implementation copy. Shared TODO carries the
planning history and receives the review checkpoint. No private vault or
installed runtime synchronization is inferred from that save.
